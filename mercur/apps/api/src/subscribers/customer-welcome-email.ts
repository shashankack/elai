import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { storefrontBaseUrl } from "../utils/app-urls"

type CustomerCreatedEvent = {
  id: string
}

export default async function customerWelcomeEmailHandler({
  event: { data },
  container,
}: SubscriberArgs<CustomerCreatedEvent>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const notification = container.resolve(Modules.NOTIFICATION)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "email", "first_name", "last_name"],
    filters: { id: data.id },
  })

  const customer = customers?.[0] as
    | {
        id: string
        email?: string | null
        first_name?: string | null
        last_name?: string | null
      }
    | undefined

  if (!customer?.email) {
    logger.warn(
      `customer.created ${data.id}: no email on customer   skip welcome email`,
    )
    return
  }

  const name = [customer.first_name, customer.last_name]
    .filter(Boolean)
    .join(" ")
  const shopUrl = `${storefrontBaseUrl()}/shop`

  await notification.createNotifications({
    to: customer.email,
    channel: "email",
    template: "customer-welcome",
    data: {
      email: customer.email,
      customer_name: name || undefined,
      shop_url: shopUrl,
      subject: "Welcome to Elai",
    },
  })
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
