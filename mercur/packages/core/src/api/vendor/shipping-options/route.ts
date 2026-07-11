import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { HttpTypes } from "@mercurjs/types"

import { createSellerShippingOptionsWorkflow } from "../../../workflows/shipping-option"
import { ensureServiceZoneFulfillmentProvider } from "../stock-locations/helpers"
import { refetchShippingOption } from "./helpers"
import { VendorCreateShippingOptionType } from "./validators"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<HttpTypes.VendorShippingOptionListResponse>
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: shipping_options, metadata } = await query.graph({
    entity: "shipping_option",
    fields: req.queryConfig.fields,
    filters: req.filterableFields,
    pagination: req.queryConfig.pagination,
  })

  res.json({
    shipping_options,
    count: metadata?.count ?? 0,
    offset: metadata?.skip ?? 0,
    limit: metadata?.take ?? 0,
  })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<VendorCreateShippingOptionType>,
  res: MedusaResponse<HttpTypes.VendorShippingOptionResponse>
) => {
  const sellerId = req.seller_context!.seller_id
  const body = req.validatedBody

  // Medusa requires the provider to be linked to the stock location first
  if (body.service_zone_id && body.provider_id) {
    await ensureServiceZoneFulfillmentProvider(
      req.scope,
      body.service_zone_id,
      body.provider_id
    )
  }

  const { result } = await createSellerShippingOptionsWorkflow(req.scope).run({
    input: {
      seller_id: sellerId,
      shipping_options: [body],
    },
  })

  const shippingOption = await refetchShippingOption(
    req.scope,
    result[0].id,
    req.queryConfig.fields
  )

  res.status(201).json({ shipping_option: shippingOption })
}
