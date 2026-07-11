import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { HttpTypes } from "@mercurjs/types"

import { validateSellerStockLocation } from "../../stock-locations/helpers"
import { optOutPlatformShippingWorkflow } from "../../../../workflows/platform-shipping"
import { VendorOptOutPlatformShippingType } from "../validators"

export const POST = async (
  req: AuthenticatedMedusaRequest<VendorOptOutPlatformShippingType>,
  res: MedusaResponse<HttpTypes.VendorPlatformShippingOptInResponse>
) => {
  const sellerId = req.seller_context!.seller_id
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { platform_shipping_option_id, stock_location_id } = req.validatedBody

  await validateSellerStockLocation(req.scope, sellerId, stock_location_id)

  const { result } = await optOutPlatformShippingWorkflow(req.scope).run({
    input: {
      seller_id: sellerId,
      stock_location_id,
      platform_shipping_option_id,
    },
  })

  const {
    data: [platform_shipping_opt_in],
  } = await query.graph({
    entity: "platform_shipping_opt_in",
    fields: [
      "id",
      "seller_id",
      "stock_location_id",
      "shipping_option_id",
      "is_enabled",
      "metadata",
      "platform_shipping_option.*",
      "created_at",
      "updated_at",
    ],
    filters: { id: result.id },
  })

  res.json({ platform_shipping_opt_in })
}
