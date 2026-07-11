import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { UpdatePlatformShippingOptionDTO } from "@mercurjs/types"

import { updatePlatformShippingOptionsStep } from "../steps"

export const updatePlatformShippingOptionsWorkflowId =
  "update-platform-shipping-options"

export const updatePlatformShippingOptionsWorkflow = createWorkflow(
  updatePlatformShippingOptionsWorkflowId,
  function (input: UpdatePlatformShippingOptionDTO[]) {
    const options = updatePlatformShippingOptionsStep(input)
    return new WorkflowResponse(options)
  }
)
