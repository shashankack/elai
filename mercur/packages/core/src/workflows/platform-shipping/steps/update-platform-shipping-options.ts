import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  MercurModules,
  UpdatePlatformShippingOptionDTO,
} from "@mercurjs/types"

import PlatformShippingModuleService from "../../../modules/platform-shipping/service"

export const updatePlatformShippingOptionsStepId =
  "update-platform-shipping-options-step"

export const updatePlatformShippingOptionsStep = createStep(
  updatePlatformShippingOptionsStepId,
  async (input: UpdatePlatformShippingOptionDTO[], { container }) => {
    const service = container.resolve<PlatformShippingModuleService>(
      MercurModules.PLATFORM_SHIPPING
    )

    const prev = await service.listPlatformShippingOptions({
      id: input.map((i) => i.id),
    })

    const options = await service.updatePlatformShippingOptions(
      input.map((item) => ({
        ...item,
        country_codes: Array.isArray(item.country_codes)
          ? { countries: item.country_codes }
          : item.country_codes,
      })) as any
    )

    return new StepResponse(options, prev)
  },
  async (prevData, { container }) => {
    if (!prevData?.length) return

    const service = container.resolve<PlatformShippingModuleService>(
      MercurModules.PLATFORM_SHIPPING
    )

    await service.updatePlatformShippingOptions(
      prevData.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        courier_label: p.courier_label,
        currency_code: p.currency_code,
        amount: Number(p.amount),
        country_codes: (p.country_codes || { countries: ["in"] }) as Record<
          string,
          unknown
        >,
        is_active: p.is_active,
        is_default: p.is_default,
        metadata: p.metadata as Record<string, unknown> | null,
      })) as any
    )
  }
)
