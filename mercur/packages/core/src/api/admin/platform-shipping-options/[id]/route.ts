import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { HttpTypes } from "@mercurjs/types"

import {
  deletePlatformShippingOptionsWorkflow,
  updatePlatformShippingOptionsWorkflow,
} from "../../../../workflows/platform-shipping"
import { AdminUpdatePlatformShippingOptionType } from "../validators"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<HttpTypes.AdminPlatformShippingOptionResponse>
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { id } = req.params

  const {
    data: [platform_shipping_option],
  } = await query.graph({
    entity: "platform_shipping_option",
    fields: req.queryConfig.fields,
    filters: { id },
  })

  res.json({ platform_shipping_option })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminUpdatePlatformShippingOptionType>,
  res: MedusaResponse<HttpTypes.AdminPlatformShippingOptionResponse>
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { id } = req.params

  await updatePlatformShippingOptionsWorkflow(req.scope).run({
    input: [{ id, ...req.validatedBody }],
  })

  const {
    data: [platform_shipping_option],
  } = await query.graph({
    entity: "platform_shipping_option",
    fields: req.queryConfig.fields,
    filters: { id },
  })

  res.json({ platform_shipping_option })
}

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<HttpTypes.AdminPlatformShippingOptionDeleteResponse>
) => {
  const { id } = req.params

  await deletePlatformShippingOptionsWorkflow(req.scope).run({
    input: [id],
  })

  res.json({
    id,
    object: "platform_shipping_option",
    deleted: true,
  })
}
