import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  CreatePlatformShippingOptionDTO,
  MercurModules,
} from "@mercurjs/types"

import PlatformShippingModuleService from "../../../modules/platform-shipping/service"

export const createPlatformShippingOptionsStepId =
  "create-platform-shipping-options-step"

export const createPlatformShippingOptionsStep = createStep(
  createPlatformShippingOptionsStepId,
  async (input: CreatePlatformShippingOptionDTO[], { container }) => {
    const service = container.resolve<PlatformShippingModuleService>(
      MercurModules.PLATFORM_SHIPPING
    )

    const created = await service.createPlatformShippingOptions(
      input.map((item) => ({
        ...item,
        country_codes: Array.isArray(item.country_codes)
          ? { countries: item.country_codes }
          : item.country_codes || { countries: ["in"] },
      })) as any
    )
    const options = (
      Array.isArray(created) ? created : [created]
    ) as { id: string }[]

    return new StepResponse(
      options,
      options.map((o) => o.id)
    )
  },
  async (ids, { container }) => {
    if (!ids?.length) return

    const service = container.resolve<PlatformShippingModuleService>(
      MercurModules.PLATFORM_SHIPPING
    )

    await service.deletePlatformShippingOptions(ids)
  }
)
