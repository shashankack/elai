import {
  ctaButton,
  emailSiteUrl,
  escapeHtml,
  mutedParagraph,
  primaryParagraph,
  renderEmailLayout,
  type RenderedEmail,
} from "./layout"

export type CustomerWelcomeData = {
  customer_name?: string
  email?: string
  shop_url?: string
}

export function renderCustomerWelcome(
  data: CustomerWelcomeData = {},
): RenderedEmail {
  const name = data.customer_name
    ? escapeHtml(data.customer_name)
    : "there"
  const shopUrl = data.shop_url || `${emailSiteUrl()}/shop`

  const bodyHtml = [
    primaryParagraph(`Hi ${name},`),
    primaryParagraph(
      "Welcome to Elai   India’s accessories marketplace for jewellery, fashion, hair, bags, beauty, tech, and lifestyle finds.",
    ),
    mutedParagraph(
      "Browse curated categories, discover new sellers, and build looks that feel like you.",
    ),
    ctaButton(shopUrl, "Start shopping"),
  ].join("")

  return {
    subject: "Welcome to Elai",
    html: renderEmailLayout({
      title: "Welcome to Elai",
      preheader: "Your accessories destination is ready.",
      bodyHtml,
      footerNote:
        "You are receiving this because an Elai account was created with this email address.",
    }),
    text: [
      "Welcome to Elai",
      "",
      `Hi ${data.customer_name || "there"},`,
      "Welcome to Elai   India’s accessories marketplace.",
      "",
      `Start shopping: ${shopUrl}`,
    ].join("\n"),
  }
}
