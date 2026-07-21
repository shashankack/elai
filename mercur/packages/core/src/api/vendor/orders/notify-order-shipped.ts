import type { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"

type ShipmentLabel = {
  tracking_number?: string | null
  tracking_url?: string | null
}

/**
 * Email the customer that their seller order has shipped, with tracking URL.
 */
export async function notifyCustomerOrderShipped(
  container: MedusaContainer,
  input: {
    orderId: string
    labels?: ShipmentLabel[] | null
    skip?: boolean
  },
) {
  if (input.skip) return

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const notification = container.resolve(Modules.NOTIFICATION)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [order],
  } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "customer.id",
      "customer.email",
      "customer.first_name",
      "customer.last_name",
      "fulfillments.id",
      "fulfillments.shipped_at",
      "fulfillments.labels.tracking_number",
      "fulfillments.labels.tracking_url",
    ],
    filters: { id: input.orderId },
  })

  if (!order) {
    logger.warn(`order-shipped: order ${input.orderId} not found`)
    return
  }

  const email =
    (order.email as string | null | undefined) ||
    (order.customer?.email as string | null | undefined)

  if (!email) {
    logger.warn(`order-shipped: order ${input.orderId} has no customer email`)
    return
  }

  const customerName = [order.customer?.first_name, order.customer?.last_name]
    .filter(Boolean)
    .join(" ")

  const fromLabels =
    input.labels?.filter((l) => l?.tracking_url || l?.tracking_number) ?? []
  const fromFulfillments =
    (
      order.fulfillments as
        | {
            shipped_at?: string | null
            labels?: ShipmentLabel[] | null
          }[]
        | undefined
    )?.flatMap((f) => f.labels || []) ?? []

  const labels = (fromLabels.length ? fromLabels : fromFulfillments).filter(
    (l) => l?.tracking_url || l?.tracking_number,
  )

  const primary = labels[0]
  const trackingUrl =
    primary?.tracking_url &&
    primary.tracking_url !== "#" &&
    /^https?:\/\//i.test(primary.tracking_url)
      ? primary.tracking_url
      : undefined

  const storefront = (
    process.env.STOREFRONT_URL ||
    process.env.MERCUR_STOREFRONT_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "")

  const orderUrl = `${storefront}/account`

  await notification.createNotifications({
    to: email,
    channel: "email",
    template: "order-shipped",
    data: {
      display_id: order.display_id,
      order_id: order.id,
      customer_name: customerName || undefined,
      tracking_number: primary?.tracking_number || undefined,
      tracking_url: trackingUrl,
      order_url: orderUrl,
      subject: "Your Elai order is on the way",
    },
  })

  logger.info(`order-shipped: emailed ${email} for order ${order.id}`)
}
