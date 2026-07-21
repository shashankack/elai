import {
  ctaButton,
  emailSiteUrl,
  escapeHtml,
  mutedParagraph,
  primaryParagraph,
  renderEmailLayout,
  type RenderedEmail,
} from "./layout"

export type OrderShippedData = {
  display_id?: string | number
  order_id?: string
  customer_name?: string
  tracking_number?: string
  tracking_url?: string
  carrier?: string
  order_url?: string
}

export function renderOrderShipped(data: OrderShippedData = {}): RenderedEmail {
  const name = data.customer_name
    ? escapeHtml(data.customer_name)
    : "there"
  const orderRef = escapeHtml(
    data.display_id != null ? `#${data.display_id}` : "your order",
  )
  const tracking = data.tracking_number
    ? escapeHtml(data.tracking_number)
    : null
  const carrier = data.carrier ? escapeHtml(data.carrier) : null
  const trackUrl = data.tracking_url || data.order_url || emailSiteUrl()

  const bodyHtml = [
    primaryParagraph(`Hi ${name},`),
    primaryParagraph(
      orderRef === "your order"
        ? "Good news — your Elai order is on its way."
        : `Good news — order <strong>${orderRef}</strong> is on its way.`,
    ),
    carrier || tracking
      ? mutedParagraph(
          [
            carrier ? `Carrier: <strong>${carrier}</strong>` : null,
            tracking ? `Tracking: <strong>${tracking}</strong>` : null,
          ]
            .filter(Boolean)
            .join("<br />"),
        )
      : mutedParagraph(
          "Your package has been handed to the courier. Tracking details will appear when available.",
        ),
    ctaButton(trackUrl, data.tracking_url ? "Track shipment" : "View order"),
  ].join("")

  return {
    subject: "Your Elai order is on the way",
    html: renderEmailLayout({
      title: "Order shipped",
      preheader: "Your accessories are on the way.",
      bodyHtml,
    }),
    text: [
      "Order shipped",
      "",
      `Hi ${data.customer_name || "there"},`,
      "Your Elai order is on its way.",
      carrier ? `Carrier: ${data.carrier}` : "",
      tracking ? `Tracking: ${data.tracking_number}` : "",
      "",
      `Details: ${trackUrl}`,
    ]
      .filter(Boolean)
      .join("\n"),
  }
}
