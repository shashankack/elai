import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { createOrderShipmentWorkflow } from "@medusajs/medusa/core-flows"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { HttpTypes } from "@mercurjs/types"

import { validateSellerOrder } from "../../../../helpers"
import { notifyCustomerOrderShipped } from "../../../../notify-order-shipped"
import { VendorCreateShipmentType } from "../../../../validators"

export const POST = async (
  req: AuthenticatedMedusaRequest<VendorCreateShipmentType>,
  res: MedusaResponse<HttpTypes.VendorOrderResponse>
) => {
  const { id, fulfillment_id } = req.params
  const sellerId = req.seller_context!.seller_id

  await validateSellerOrder(req.scope, sellerId, id)

  const { no_notification, ...body } = req.validatedBody

  await createOrderShipmentWorkflow(req.scope).run({
    input: {
      ...body,
      order_id: id,
      fulfillment_id,
      labels: body.labels ?? [],
      no_notification: no_notification ?? false,
    },
  })

  try {
    await notifyCustomerOrderShipped(req.scope, {
      orderId: id,
      labels: body.labels ?? [],
      skip: Boolean(no_notification),
    })
  } catch (error) {
    const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
    logger.error(
      `Failed to send order-shipped email for ${id}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [order],
  } = await query.graph({
    entity: "order",
    fields: req.queryConfig.fields,
    filters: { id },
  })

  res.json({ order })
}
