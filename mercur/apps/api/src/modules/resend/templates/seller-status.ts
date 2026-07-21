import {
  ctaButton,
  escapeHtml,
  mutedParagraph,
  primaryParagraph,
  renderEmailLayout,
  type RenderedEmail,
} from "./layout"

export type SellerStatusData = {
  email?: string
  store_name?: string
  seller_name?: string
  dashboard_url?: string
  reason?: string
}

export function renderSellerApproved(
  data: SellerStatusData = {},
): RenderedEmail {
  const name = data.seller_name
    ? escapeHtml(data.seller_name)
    : "there"
  const store = data.store_name
    ? escapeHtml(data.store_name)
    : "your store"
  const dashboardUrl =
    data.dashboard_url ||
    (process.env.MERCUR_VENDOR_URL || "https://vendor.elaai.co").replace(
      /\/$/,
      "",
    )

  const bodyHtml = [
    primaryParagraph(`Hi ${name},`),
    primaryParagraph(
      `Congratulations   <strong>${store}</strong> has been approved on Elai.`,
    ),
    mutedParagraph(
      "You can now finish onboarding, add products, and submit them for catalogue review.",
    ),
    ctaButton(dashboardUrl, "Open seller dashboard"),
  ].join("")

  return {
    subject: "Your Elai seller account is approved",
    html: renderEmailLayout({
      title: "Seller account approved",
      preheader: "You can start listing accessories on Elai.",
      bodyHtml,
    }),
    text: [
      "Seller account approved",
      "",
      `Hi ${data.seller_name || "there"},`,
      `${data.store_name || "Your store"} has been approved on Elai.`,
      "",
      `Open seller dashboard: ${dashboardUrl}`,
    ].join("\n"),
  }
}

export function renderSellerRejected(
  data: SellerStatusData = {},
): RenderedEmail {
  const name = data.seller_name
    ? escapeHtml(data.seller_name)
    : "there"
  const store = data.store_name
    ? escapeHtml(data.store_name)
    : "your application"
  const reason = data.reason ? escapeHtml(data.reason) : null

  const bodyHtml = [
    primaryParagraph(`Hi ${name},`),
    primaryParagraph(
      `Thank you for applying to sell on Elai. After review, we are unable to approve <strong>${store}</strong> at this time.`,
    ),
    reason ? mutedParagraph(`Notes from our team: ${reason}`) : "",
    mutedParagraph(
      "You may update your details and re-apply later, or reply to support if you believe this was a mistake.",
    ),
  ].join("")

  return {
    subject: "Update on your Elai seller application",
    html: renderEmailLayout({
      title: "Application update",
      preheader: "An update on your seller application.",
      bodyHtml,
      footerNote:
        "This message relates to your seller application on Elai.",
    }),
    text: [
      "Application update",
      "",
      `Hi ${data.seller_name || "there"},`,
      `We are unable to approve ${data.store_name || "your application"} at this time.`,
      reason ? `Notes: ${data.reason}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  }
}
