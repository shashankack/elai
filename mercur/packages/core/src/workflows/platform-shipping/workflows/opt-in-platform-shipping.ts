import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import { optInPlatformShippingStep } from "../steps"

type OptInPlatformShippingWorkflowInput = {
  seller_id: string
  stock_location_id: string
  platform_shipping_option_id: string
}

export const optInPlatformShippingWorkflowId = "opt-in-platform-shipping"

export const optInPlatformShippingWorkflow = createWorkflow(
  optInPlatformShippingWorkflowId,
  function (input: OptInPlatformShippingWorkflowInput) {
    const optIn = optInPlatformShippingStep(input)
    return new WorkflowResponse(optIn)
  }
)
