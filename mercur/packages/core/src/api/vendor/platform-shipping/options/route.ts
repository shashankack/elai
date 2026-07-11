import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { HttpTypes } from "@mercurjs/types"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<HttpTypes.VendorPlatformShippingOptionListResponse>
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: platform_shipping_options } = await query.graph({
    entity: "platform_shipping_option",
    fields: [
      "id",
      "name",
      "description",
      "courier_label",
      "currency_code",
      "amount",
      "country_codes",
      "is_active",
      "is_default",
      "metadata",
    ],
    filters: { is_active: true },
  })

  res.json({ platform_shipping_options })
}
