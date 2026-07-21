import {
  ctaButton,
  escapeHtml,
  mutedParagraph,
  primaryParagraph,
  renderEmailLayout,
  type RenderedEmail,
} from "./layout"

export type EmailVerificationData = {
  email?: string
  verify_url?: string
  customer_name?: string
}

export function renderEmailVerification(
  data: EmailVerificationData = {},
): RenderedEmail {
  const name = data.customer_name
    ? escapeHtml(data.customer_name)
    : "there"
  const verifyUrl = String(data.verify_url || "#")
  const email = data.email ? escapeHtml(data.email) : ""

  const bodyHtml = [
    primaryParagraph(`Hi ${name},`),
    primaryParagraph(
      email
        ? `Please confirm <strong>${email}</strong> is your email address for Elai.`
        : "Please confirm your email address for Elai.",
    ),
    mutedParagraph(
      "Verifying helps keep your account secure. This link will expire after a short time.",
    ),
    ctaButton(verifyUrl, "Verify email"),
    mutedParagraph(
      "If you did not create an Elai account, you can ignore this email.",
    ),
  ].join("")

  return {
    subject: "Verify your Elai email",
    html: renderEmailLayout({
      title: "Verify your email",
      preheader: "Confirm your email address to finish setting up Elai.",
      bodyHtml,
    }),
    text: [
      "Verify your Elai email",
      "",
      `Hi ${data.customer_name || "there"},`,
      "Please confirm your email address for Elai.",
      `Verify: ${verifyUrl}`,
      "",
      "If you did not create an account, you can ignore this email.",
    ].join("\n"),
  }
}
