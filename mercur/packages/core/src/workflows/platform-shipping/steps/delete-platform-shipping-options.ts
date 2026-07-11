import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MercurModules } from "@mercurjs/types"

import PlatformShippingModuleService from "../../../modules/platform-shipping/service"

export const deletePlatformShippingOptionsStepId =
  "delete-platform-shipping-options-step"

export const deletePlatformShippingOptionsStep = createStep(
  deletePlatformShippingOptionsStepId,
  async (ids: string[], { container }) => {
    const service = container.resolve<PlatformShippingModuleService>(
      MercurModules.PLATFORM_SHIPPING
    )

    await service.softDeletePlatformShippingOptions(ids)

    return new StepResponse(ids, ids)
  },
  async (ids, { container }) => {
    if (!ids?.length) return

    const service = container.resolve<PlatformShippingModuleService>(
      MercurModules.PLATFORM_SHIPPING
    )

    await service.restorePlatformShippingOptions(ids)
  }
)
