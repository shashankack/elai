import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { HttpTypes } from "@mercurjs/types"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<HttpTypes.VendorPlatformShippingOptInListResponse>
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const sellerId = req.seller_context!.seller_id
  const stockLocationId = req.query.stock_location_id as string | undefined

  const filters: Record<string, unknown> = {
    seller_id: sellerId,
  }

  if (stockLocationId) {
    filters.stock_location_id = stockLocationId
  }

  const { data: platform_shipping_opt_ins } = await query.graph({
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
    filters,
  })

  res.json({ platform_shipping_opt_ins })
}
