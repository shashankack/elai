import {
  createLocationFulfillmentSetWorkflow,
  createServiceZonesWorkflow,
  deleteShippingOptionsWorkflow,
} from "@medusajs/core-flows"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { MercurModules } from "@mercurjs/types"

import PlatformShippingModuleService from "../../../modules/platform-shipping/service"
import { createSellerShippingOptionsWorkflow } from "../../shipping-option"
import { createSellerShippingProfilesWorkflow } from "../../shipping-profile"

type OptInInput = {
  seller_id: string
  stock_location_id: string
  platform_shipping_option_id: string
}

export const optInPlatformShippingStepId = "opt-in-platform-shipping-step"

export const optInPlatformShippingStep = createStep(
  optInPlatformShippingStepId,
  async (input: OptInInput, { container }) => {
    const platformShipping = container.resolve<PlatformShippingModuleService>(
      MercurModules.PLATFORM_SHIPPING
    )
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const link = container.resolve(ContainerRegistrationKeys.LINK)

    const [template] = await platformShipping.listPlatformShippingOptions({
      id: input.platform_shipping_option_id,
      is_active: true,
    })

    if (!template) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "ELAI shipping option not found or inactive"
      )
    }

    const existingOptIns = await platformShipping.listPlatformShippingOptIns({
      seller_id: input.seller_id,
      stock_location_id: input.stock_location_id,
      platform_shipping_option_id: input.platform_shipping_option_id,
    })

    if (existingOptIns[0]?.is_enabled && existingOptIns[0]?.shipping_option_id) {
      return new StepResponse(existingOptIns[0], null)
    }

    const {
      data: [location],
    } = await query.graph({
      entity: "stock_location",
      fields: [
        "id",
        "name",
        "fulfillment_sets.*",
        "fulfillment_sets.service_zones.*",
        "fulfillment_sets.service_zones.geo_zones.*",
        "fulfillment_providers.*",
      ],
      filters: { id: input.stock_location_id },
    })

    if (!location) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Stock location not found"
      )
    }

    let shippingSet = (location.fulfillment_sets || []).find(
      (fs: { type?: string }) => fs?.type === "shipping"
    )

    if (!shippingSet) {
      await createLocationFulfillmentSetWorkflow(container).run({
        input: {
          location_id: input.stock_location_id,
          fulfillment_set_data: {
            name: `${location.name} shipping`,
            type: "shipping",
          },
        },
      })

      const {
        data: [refreshed],
      } = await query.graph({
        entity: "stock_location",
        fields: [
          "id",
          "name",
          "fulfillment_sets.*",
          "fulfillment_sets.service_zones.*",
          "fulfillment_sets.service_zones.geo_zones.*",
          "fulfillment_providers.*",
        ],
        filters: { id: input.stock_location_id },
      })

      shippingSet = (refreshed?.fulfillment_sets || []).find(
        (fs: { type?: string }) => fs?.type === "shipping"
      )
    }

    if (!shippingSet?.id) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Could not enable shipping for this location"
      )
    }

    const rawCountries = template.country_codes as
      | string[]
      | { countries?: string[] }
      | null
    const countryCodes = (
      Array.isArray(rawCountries)
        ? rawCountries
        : rawCountries?.countries || ["in"]
    ).map((code) => String(code).toLowerCase())

    let serviceZone = (shippingSet.service_zones || []).find(
      (zone: { geo_zones?: { country_code?: string }[] }) =>
        zone?.geo_zones?.some((gz) =>
          countryCodes.includes((gz.country_code || "").toLowerCase())
        )
    )

    if (!serviceZone) {
      await createServiceZonesWorkflow(container).run({
        input: {
          data: [
            {
              fulfillment_set_id: shippingSet.id,
              name: "ELAI delivery area",
              geo_zones: countryCodes.map((code) => ({
                type: "country" as const,
                country_code: code.toLowerCase(),
              })),
            },
          ],
        },
      })

      const {
        data: [refreshedSet],
      } = await query.graph({
        entity: "fulfillment_set",
        fields: ["id", "service_zones.*", "service_zones.geo_zones.*"],
        filters: { id: shippingSet.id },
      })

      serviceZone = (refreshedSet?.service_zones || []).find(
        (zone: { geo_zones?: { country_code?: string }[] }) =>
          zone?.geo_zones?.some((gz) =>
            countryCodes.includes((gz.country_code || "").toLowerCase())
          )
      ) || refreshedSet?.service_zones?.[0]
    }

    if (!serviceZone?.id) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Could not create delivery area for ELAI shipping"
      )
    }

    const providers = location.fulfillment_providers || []
    const hasManual = providers.some(
      (p: { id?: string }) => p?.id === "manual_manual"
    )

    if (!hasManual) {
      await link.create({
        [Modules.STOCK_LOCATION]: {
          stock_location_id: input.stock_location_id,
        },
        [Modules.FULFILLMENT]: {
          fulfillment_provider_id: "manual_manual",
        },
      })
    }

    const {
      data: sellerProfiles,
    } = await query.graph({
      entity: "shipping_profile_seller",
      fields: ["shipping_profile.id", "shipping_profile.name"],
      filters: { seller_id: input.seller_id },
    })

    let shippingProfileId = sellerProfiles?.[0]?.shipping_profile?.id

    if (!shippingProfileId) {
      const { result: profiles } = await createSellerShippingProfilesWorkflow(
        container
      ).run({
        input: {
          seller_id: input.seller_id,
          shipping_profiles: [
            {
              name: "Default",
              type: "default",
            },
          ],
        },
      })
      shippingProfileId = profiles[0].id
    }

    const amount = Number(template.amount)
    const currencyCode = (template.currency_code || "inr").toLowerCase()

    const { result: createdOptions } =
      await createSellerShippingOptionsWorkflow(container).run({
        input: {
          seller_id: input.seller_id,
          shipping_options: [
            {
              name: template.name,
              service_zone_id: serviceZone.id,
              shipping_profile_id: shippingProfileId,
              provider_id: "manual_manual",
              price_type: "flat",
              type: {
                label: "ELAI",
                description:
                  template.description ||
                  "Delivery arranged by ELAI (BlueDart / Shiprocket).",
                code: "elai_platform",
              },
              prices: [
                {
                  currency_code: currencyCode,
                  amount,
                },
              ],
              rules: [
                {
                  attribute: "enabled_in_store",
                  value: "true",
                  operator: "eq",
                },
                {
                  attribute: "is_return",
                  value: "false",
                  operator: "eq",
                },
              ],
              data: {
                elai_platform: true,
                platform_shipping_option_id: template.id,
                courier_label: template.courier_label,
              },
            },
          ],
        },
      })

    const shippingOptionId = createdOptions[0].id

    let optIn
    if (existingOptIns[0]) {
      ;[optIn] = await platformShipping.updatePlatformShippingOptIns([
        {
          id: existingOptIns[0].id,
          shipping_option_id: shippingOptionId,
          is_enabled: true,
        },
      ])
    } else {
      ;[optIn] = await platformShipping.createPlatformShippingOptIns([
        {
          seller_id: input.seller_id,
          stock_location_id: input.stock_location_id,
          platform_shipping_option_id: template.id,
          shipping_option_id: shippingOptionId,
          is_enabled: true,
        },
      ])
    }

    return new StepResponse(optIn, {
      opt_in_id: optIn.id,
      shipping_option_id: shippingOptionId,
      created_new: !existingOptIns[0],
    })
  },
  async (compensation, { container }) => {
    if (!compensation) return

    const platformShipping = container.resolve<PlatformShippingModuleService>(
      MercurModules.PLATFORM_SHIPPING
    )

    if (compensation.shipping_option_id) {
      await deleteShippingOptionsWorkflow(container).run({
        input: { ids: [compensation.shipping_option_id] },
      })
    }

    if (compensation.created_new && compensation.opt_in_id) {
      await platformShipping.deletePlatformShippingOptIns([
        compensation.opt_in_id,
      ])
    } else if (compensation.opt_in_id) {
      await platformShipping.updatePlatformShippingOptIns([
        {
          id: compensation.opt_in_id,
          is_enabled: false,
          shipping_option_id: null,
        },
      ])
    }
  }
)
