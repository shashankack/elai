import {
  ctaButton,
  emailSiteUrl,
  escapeHtml,
  mutedParagraph,
  primaryParagraph,
  renderEmailLayout,
  type RenderedEmail,
} from "./layout"

export type OrderCanceledData = {
  display_id?: string | number
  order_id?: string
  customer_name?: string
  reason?: string
  order_url?: string
}

export function renderOrderCanceled(
  data: OrderCanceledData = {},
): RenderedEmail {
  const name = data.customer_name
    ? escapeHtml(data.customer_name)
    : "there"
  const orderRef = escapeHtml(
    data.display_id != null ? `#${data.display_id}` : "your order",
  )
  const reason = data.reason ? escapeHtml(data.reason) : null
  const url = data.order_url || `${emailSiteUrl()}/shop`

  const bodyHtml = [
    primaryParagraph(`Hi ${name},`),
    primaryParagraph(
      orderRef === "your order"
        ? "Your Elai order has been cancelled."
        : `Order <strong>${orderRef}</strong> has been cancelled.`,
    ),
    reason ? mutedParagraph(`Reason: ${reason}`) : "",
    mutedParagraph(
      "If a payment was captured, any refund will follow your original payment method according to your bank or wallet timelines.",
    ),
    ctaButton(url, "Browse Elai"),
  ].join("")

  return {
    subject: "Your Elai order was cancelled",
    html: renderEmailLayout({
      title: "Order cancelled",
      preheader: "An update about your Elai order.",
      bodyHtml,
    }),
    text: [
      "Order cancelled",
      "",
      `Hi ${data.customer_name || "there"},`,
      orderRef === "your order"
        ? "Your Elai order has been cancelled."
        : `Order ${orderRef} has been cancelled.`,
      reason ? `Reason: ${data.reason}` : "",
      "",
      `Browse Elai: ${url}`,
    ]
      .filter(Boolean)
      .join("\n"),
  }
}
