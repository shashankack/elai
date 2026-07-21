import {
  ctaButton,
  escapeHtml,
  mutedParagraph,
  primaryParagraph,
  renderEmailLayout,
  type RenderedEmail,
} from "./layout"

export type SellerInvitationData = {
  email?: string
  registration_url?: string
  invite_url?: string
}

export function renderSellerInvitation(
  data: SellerInvitationData = {},
): RenderedEmail {
  const url = String(data.registration_url || data.invite_url || "#")
  const email = data.email ? escapeHtml(data.email) : "you"

  const bodyHtml = [
    primaryParagraph(
      `You have been invited to sell on Elai. This invitation was sent to <strong>${email}</strong>.`,
    ),
    mutedParagraph(
      "Create your seller account to set up your store, list accessories, and reach shoppers across India.",
    ),
    url !== "#"
      ? ctaButton(url, "Create your seller account")
      : mutedParagraph(
          "Follow the registration link provided by the Elai team to continue.",
        ),
    mutedParagraph(
      "If you did not expect this invitation, you can ignore this email.",
    ),
  ].join("")

  return {
    subject: "You're invited to sell on Elai",
    html: renderEmailLayout({
      title: "Sell on Elai",
      preheader: "Create your seller account and start listing accessories.",
      bodyHtml,
    }),
    text: [
      "You're invited to sell on Elai",
      "",
      `This invitation was sent to ${data.email || "you"}.`,
      url !== "#" ? `Create your seller account: ${url}` : "",
      "",
      "If you did not expect this invitation, you can ignore this email.",
    ]
      .filter(Boolean)
      .join("\n"),
  }
}
