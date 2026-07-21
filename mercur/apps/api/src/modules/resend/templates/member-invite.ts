import {
  ctaButton,
  escapeHtml,
  mutedParagraph,
  primaryParagraph,
  renderEmailLayout,
  type RenderedEmail,
} from "./layout"

export type MemberInviteData = {
  email?: string
  invite_url?: string
  registration_url?: string
  store_name?: string
}

export function renderMemberInvite(
  data: MemberInviteData = {},
): RenderedEmail {
  const inviteUrl = String(data.invite_url || data.registration_url || "#")
  const email = data.email ? escapeHtml(data.email) : "you"
  const store = data.store_name ? escapeHtml(data.store_name) : "a store on Elai"

  const bodyHtml = [
    primaryParagraph(
      `You have been invited to join <strong>${store}</strong> as a team member.`,
    ),
    mutedParagraph(
      `This invitation was sent to <strong>${email}</strong>. Accept it to create your login and start helping manage the store.`,
    ),
    ctaButton(inviteUrl, "Accept invitation"),
    mutedParagraph(
      "If you were not expecting this invitation, you can ignore this email.",
    ),
  ].join("")

  return {
    subject: "You're invited to join a store on Elai",
    html: renderEmailLayout({
      title: "You're invited to Elai",
      preheader: "Accept your invitation to join a seller team on Elai.",
      bodyHtml,
    }),
    text: [
      "You're invited to Elai",
      "",
      `You have been invited to join ${data.store_name || "a store on Elai"}.`,
      `Accept the invitation: ${inviteUrl}`,
      "",
      "If you were not expecting this, you can ignore this email.",
    ].join("\n"),
  }
}
