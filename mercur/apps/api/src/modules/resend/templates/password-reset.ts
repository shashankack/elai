import {
  ctaButton,
  escapeHtml,
  mutedParagraph,
  primaryParagraph,
  renderEmailLayout,
  type RenderedEmail,
} from "./layout"

export type PasswordResetData = {
  reset_url?: string
  email?: string
}

export function renderPasswordReset(
  data: PasswordResetData = {},
): RenderedEmail {
  const resetUrl = String(data.reset_url || "#")
  const email = data.email ? escapeHtml(data.email) : ""

  const bodyHtml = [
    primaryParagraph(
      email
        ? `We received a request to reset the password for <strong>${email}</strong>.`
        : "We received a request to reset your Elai account password.",
    ),
    mutedParagraph(
      "This link expires soon for your security. If you did not request a reset, you can ignore this email   your password will stay the same.",
    ),
    ctaButton(resetUrl, "Choose a new password"),
    mutedParagraph(
      `Or open this link:<br /><a href="${escapeHtml(resetUrl)}" style="color:#748956;word-break:break-all;">${escapeHtml(resetUrl)}</a>`,
    ),
  ].join("")

  return {
    subject: "Reset your Elai password",
    html: renderEmailLayout({
      title: "Reset your password",
      preheader: "Choose a new password for your Elai account.",
      bodyHtml,
      footerNote:
        "If you did not request this password reset, no action is needed.",
    }),
    text: [
      "Reset your Elai password",
      "",
      "We received a request to reset your Elai account password.",
      `Open this link to choose a new password: ${resetUrl}`,
      "",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
  }
}
