import {
  ctaButton,
  emailSiteUrl,
  escapeHtml,
  mutedParagraph,
  primaryParagraph,
  renderEmailLayout,
  type RenderedEmail,
} from "./layout"

export type OrderRefundedData = {
  display_id?: string | number
  order_id?: string
  customer_name?: string
  amount?: string
  order_url?: string
}

export function renderOrderRefunded(
  data: OrderRefundedData = {},
): RenderedEmail {
  const name = data.customer_name
    ? escapeHtml(data.customer_name)
    : "there"
  const orderRef = escapeHtml(
    data.display_id != null ? `#${data.display_id}` : "your order",
  )
  const amount = data.amount ? escapeHtml(data.amount) : null
  const url = data.order_url || emailSiteUrl()

  const bodyHtml = [
    primaryParagraph(`Hi ${name},`),
    primaryParagraph(
      orderRef === "your order"
        ? "A refund for your Elai order has been processed."
        : `A refund for order <strong>${orderRef}</strong> has been processed.`,
    ),
    amount
      ? mutedParagraph(`Refund amount: <strong>${amount}</strong>`)
      : "",
    mutedParagraph(
      "Refunds usually appear in 3–10 business days, depending on your bank or payment provider.",
    ),
    ctaButton(url, "Visit Elai"),
  ].join("")

  return {
    subject: "Your Elai refund has been processed",
    html: renderEmailLayout({
      title: "Refund processed",
      preheader: "Your refund is on the way to your original payment method.",
      bodyHtml,
    }),
    text: [
      "Refund processed",
      "",
      `Hi ${data.customer_name || "there"},`,
      "A refund for your Elai order has been processed.",
      amount ? `Refund amount: ${data.amount}` : "",
      "",
      "Refunds usually appear in 3–10 business days.",
    ]
      .filter(Boolean)
      .join("\n"),
  }
}
