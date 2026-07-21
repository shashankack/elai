import {
  ctaButton,
  emailSiteUrl,
  escapeHtml,
  mutedParagraph,
  primaryParagraph,
  renderEmailLayout,
  type RenderedEmail,
} from "./layout"

export type OrderPlacedData = {
  order_id?: string
  display_id?: string | number
  email?: string
  customer_name?: string
  total?: string
  currency_code?: string
  order_url?: string
}

export function renderOrderPlaced(data: OrderPlacedData = {}): RenderedEmail {
  const name = data.customer_name
    ? escapeHtml(data.customer_name)
    : "there"
  const orderRef = escapeHtml(
    data.display_id != null
      ? `#${data.display_id}`
      : data.order_id
        ? data.order_id
        : "your order",
  )
  const total = data.total ? escapeHtml(data.total) : null
  const orderUrl =
    data.order_url || `${emailSiteUrl()}/shop`

  const bodyHtml = [
    primaryParagraph(`Hi ${name},`),
    primaryParagraph(
      `Thank you for shopping with Elai. We have received ${orderRef === "your order" ? "your order" : `order <strong>${orderRef}</strong>`}.`,
    ),
    total
      ? mutedParagraph(`Order total: <strong>${total}</strong>`)
      : "",
    mutedParagraph(
      "We will notify you when your order is on its way. You can browse more accessories anytime on Elai.",
    ),
    ctaButton(orderUrl, "Continue shopping"),
  ].join("")

  return {
    subject: "Your Elai order confirmation",
    html: renderEmailLayout({
      title: "Order confirmed",
      preheader: "Thanks for your order   we have received it.",
      bodyHtml,
      footerNote:
        "This confirmation is for your records. Keep this email if you need order support later.",
    }),
    text: [
      "Order confirmed",
      "",
      `Hi ${data.customer_name || "there"},`,
      `Thank you for shopping with Elai. We have received ${data.display_id != null ? `order #${data.display_id}` : "your order"}.`,
      total ? `Order total: ${data.total}` : "",
      "",
      `Continue shopping: ${orderUrl}`,
    ]
      .filter(Boolean)
      .join("\n"),
  }
}
