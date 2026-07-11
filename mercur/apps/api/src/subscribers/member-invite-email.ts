import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

type MemberInviteCreatedPayload = {
  id: string
  token: string
  expires_at?: string
}

function vendorInviteUrl(token: string): string {
  const base = (
    process.env.MERCUR_VENDOR_URL || "http://localhost:7001"
  ).replace(/\/$/, "")
  return `${base}/invite?token=${encodeURIComponent(token)}`
}

export default async function memberInviteCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<MemberInviteCreatedPayload | MemberInviteCreatedPayload[]>) {
  const invites = Array.isArray(data) ? data : [data]
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notification = container.resolve(Modules.NOTIFICATION)

  for (const invite of invites) {
    if (!invite?.id || !invite?.token) continue

    const { data: rows } = await query.graph({
      entity: "member_invite",
      fields: ["id", "email", "token"],
      filters: { id: invite.id },
    })

    const row = rows?.[0] as { email?: string; token?: string } | undefined
    if (!row?.email) continue

    const inviteUrl = vendorInviteUrl(invite.token || row.token || "")

    await notification.createNotifications({
      to: row.email,
      channel: "email",
      template: "member-invite",
      data: {
        email: row.email,
        invite_url: inviteUrl,
        subject: "You're invited to join a store on Elai",
      },
    })
  }
}

export const config: SubscriberConfig = {
  event: "member_invite.created",
}
