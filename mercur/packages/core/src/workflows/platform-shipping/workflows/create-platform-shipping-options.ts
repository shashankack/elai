import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { CreatePlatformShippingOptionDTO } from "@mercurjs/types"

import { createPlatformShippingOptionsStep } from "../steps"

export const createPlatformShippingOptionsWorkflowId =
  "create-platform-shipping-options"

export const createPlatformShippingOptionsWorkflow = createWorkflow(
  createPlatformShippingOptionsWorkflowId,
  function (input: CreatePlatformShippingOptionDTO[]) {
    const options = createPlatformShippingOptionsStep(input)
    return new WorkflowResponse(options)
  }
)
