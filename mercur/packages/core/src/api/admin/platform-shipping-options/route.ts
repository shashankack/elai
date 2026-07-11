import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { HttpTypes } from "@mercurjs/types"

import { createPlatformShippingOptionsWorkflow } from "../../../workflows/platform-shipping"
import {
  AdminCreatePlatformShippingOptionType,
  AdminGetPlatformShippingOptionsParamsType,
} from "./validators"

export const GET = async (
  req: AuthenticatedMedusaRequest<AdminGetPlatformShippingOptionsParamsType>,
  res: MedusaResponse<HttpTypes.AdminPlatformShippingOptionListResponse>
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: platform_shipping_options, metadata } = await query.graph({
    entity: "platform_shipping_option",
    fields: req.queryConfig.fields,
    filters: req.filterableFields,
    pagination: req.queryConfig.pagination,
  })

  res.json({
    platform_shipping_options,
    count: metadata?.count ?? 0,
    offset: metadata?.skip ?? 0,
    limit: metadata?.take ?? 0,
  })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminCreatePlatformShippingOptionType>,
  res: MedusaResponse<HttpTypes.AdminPlatformShippingOptionResponse>
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { result } = await createPlatformShippingOptionsWorkflow(req.scope).run(
    {
      input: [req.validatedBody],
    }
  )

  const {
    data: [platform_shipping_option],
  } = await query.graph({
    entity: "platform_shipping_option",
    fields: req.queryConfig.fields,
    filters: { id: result[0].id },
  })

  res.status(201).json({ platform_shipping_option })
}
