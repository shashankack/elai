import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

type PasswordResetEvent = {
  entity_id: string
  actor_type: string
  token: string
}

function resetBaseUrl(actorType: string): string {
  switch (actorType) {
    case "user":
      return (
        process.env.MERCUR_ADMIN_URL ||
        process.env.ADMIN_URL ||
        "http://localhost:7000"
      ).replace(/\/$/, "")
    case "seller":
    case "member":
      return (
        process.env.MERCUR_VENDOR_URL ||
        "http://localhost:7001"
      ).replace(/\/$/, "")
    case "customer":
    default:
      return (
        process.env.STOREFRONT_URL ||
        process.env.MERCUR_STOREFRONT_URL ||
        "http://localhost:3000"
      ).replace(/\/$/, "")
  }
}

export default async function resetPasswordEmailHandler({
  event: { data },
  container,
}: SubscriberArgs<PasswordResetEvent>) {
  const notification = container.resolve(Modules.NOTIFICATION)
  const email = data.entity_id
  const base = resetBaseUrl(data.actor_type)
  const resetUrl = `${base}/reset-password?token=${encodeURIComponent(data.token)}&email=${encodeURIComponent(email)}`

  await notification.createNotifications({
    to: email,
    channel: "email",
    template: "password-reset",
    data: {
      email,
      actor_type: data.actor_type,
      reset_url: resetUrl,
      subject: "Reset your Elai password",
    },
  })
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}
