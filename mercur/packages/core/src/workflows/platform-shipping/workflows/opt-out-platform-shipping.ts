import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import { optOutPlatformShippingStep } from "../steps"

type OptOutPlatformShippingWorkflowInput = {
  seller_id: string
  stock_location_id: string
  platform_shipping_option_id: string
}

export const optOutPlatformShippingWorkflowId = "opt-out-platform-shipping"

export const optOutPlatformShippingWorkflow = createWorkflow(
  optOutPlatformShippingWorkflowId,
  function (input: OptOutPlatformShippingWorkflowInput) {
    const optIn = optOutPlatformShippingStep(input)
    return new WorkflowResponse(optIn)
  }
)
