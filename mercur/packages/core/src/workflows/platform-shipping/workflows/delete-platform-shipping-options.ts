import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import { deletePlatformShippingOptionsStep } from "../steps"

export const deletePlatformShippingOptionsWorkflowId =
  "delete-platform-shipping-options"

export const deletePlatformShippingOptionsWorkflow = createWorkflow(
  deletePlatformShippingOptionsWorkflowId,
  function (input: string[]) {
    const ids = deletePlatformShippingOptionsStep(input)
    return new WorkflowResponse(ids)
  }
)
