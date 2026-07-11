import { deleteShippingOptionsWorkflow } from "@medusajs/core-flows"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { MercurModules } from "@mercurjs/types"

import PlatformShippingModuleService from "../../../modules/platform-shipping/service"

type OptOutInput = {
  seller_id: string
  stock_location_id: string
  platform_shipping_option_id: string
}

export const optOutPlatformShippingStepId = "opt-out-platform-shipping-step"

export const optOutPlatformShippingStep = createStep(
  optOutPlatformShippingStepId,
  async (input: OptOutInput, { container }) => {
    const platformShipping = container.resolve<PlatformShippingModuleService>(
      MercurModules.PLATFORM_SHIPPING
    )

    const [optIn] = await platformShipping.listPlatformShippingOptIns({
      seller_id: input.seller_id,
      stock_location_id: input.stock_location_id,
      platform_shipping_option_id: input.platform_shipping_option_id,
    })

    if (!optIn) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "ELAI shipping is not enabled for this location"
      )
    }

    const shippingOptionId = optIn.shipping_option_id

    if (shippingOptionId) {
      await deleteShippingOptionsWorkflow(container).run({
        input: { ids: [shippingOptionId] },
      })
    }

    const [updated] = await platformShipping.updatePlatformShippingOptIns([
      {
        id: optIn.id,
        is_enabled: false,
        shipping_option_id: null,
      },
    ])

    return new StepResponse(updated, {
      opt_in: optIn,
      shipping_option_id: shippingOptionId,
    })
  },
  async (compensation, { container }) => {
    if (!compensation) return

    const platformShipping = container.resolve<PlatformShippingModuleService>(
      MercurModules.PLATFORM_SHIPPING
    )

    await platformShipping.updatePlatformShippingOptIns([
      {
        id: compensation.opt_in.id,
        is_enabled: compensation.opt_in.is_enabled,
        shipping_option_id: compensation.opt_in.shipping_option_id,
      },
    ])
  }
)
