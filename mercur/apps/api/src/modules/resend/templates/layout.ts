/**
 * Shared ELAI email chrome   transactional, spam-safe defaults:
 * - one logo, one CTA, calm copy
 * - no urgency bait / ALL CAPS / spammy phrases
 * - absolute logo URL (email clients cannot load localhost)
 */

export type EmailLayoutInput = {
  /** Visible page title / heading */
  title: string
  /** Optional preheader (inbox preview text) */
  preheader?: string
  /** Inner HTML (rows or blocks) already escaped where needed */
  bodyHtml: string
  /** Footer note under the card */
  footerNote?: string
}

const BRAND = {
  bg: "#fff7d4",
  card: "#ffffff",
  ink: "#2e3e20",
  muted: "#5a6b42",
  soft: "#748956",
  border: "rgba(46,62,32,0.12)",
  button: "#748956",
  buttonText: "#ffffff",
} as const

export function emailLogoUrl(): string {
  const explicit = process.env.EMAIL_LOGO_URL?.trim()
  if (explicit) return explicit

  const base = (
    process.env.STOREFRONT_URL ||
    process.env.MERCUR_STOREFRONT_URL ||
    "https://elaai.co"
  ).replace(/\/$/, "")

  return `${base}/logo.png`
}

export function emailSiteUrl(): string {
  return (
    process.env.STOREFRONT_URL ||
    process.env.MERCUR_STOREFRONT_URL ||
    "https://elaai.co"
  ).replace(/\/$/, "")
}

/** Escape text for safe interpolation into HTML. */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function ctaButton(href: string, label: string): string {
  const safeHref = escapeHtml(href)
  const safeLabel = escapeHtml(label)
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
      <tr>
        <td align="left" style="border-radius:999px;background:${BRAND.button};">
          <a href="${safeHref}" style="display:inline-block;padding:12px 22px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;line-height:1;color:${BRAND.buttonText};text-decoration:none;border-radius:999px;">
            ${safeLabel}
          </a>
        </td>
      </tr>
    </table>`
}

export function mutedParagraph(text: string): string {
  return `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${BRAND.muted};">${text}</p>`
}

export function primaryParagraph(text: string): string {
  return `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:${BRAND.ink};">${text}</p>`
}

/**
 * Wraps body content in the ELAI transactional shell.
 */
export function renderEmailLayout(input: EmailLayoutInput): string {
  const logo = emailLogoUrl()
  const site = emailSiteUrl()
  const preheader = escapeHtml(input.preheader ?? "")
  const title = escapeHtml(input.title)
  const footerNote =
    input.footerNote ||
    "This is a transactional message from Elai related to your account or order."

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${title}</title>
  <!--[if mso]><style>body,table,td{font-family:Arial,sans-serif!important}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${preheader}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 8px;border-bottom:1px solid ${BRAND.border};background:linear-gradient(180deg,#fffef8 0%,#ffffff 100%);">
              <a href="${escapeHtml(site)}" style="text-decoration:none;">
                <img src="${escapeHtml(logo)}" width="48" height="48" alt="Elai" style="display:block;border:0;outline:none;width:48px;height:48px;" />
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
              <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;font-weight:650;color:${BRAND.ink};">
                ${title}
              </h1>
              ${input.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
              <p style="margin:24px 0 0;padding-top:20px;border-top:1px solid ${BRAND.border};font-size:12px;line-height:1.55;color:${BRAND.muted};">
                ${escapeHtml(footerNote)}
              </p>
              <p style="margin:10px 0 0;font-size:12px;line-height:1.55;color:${BRAND.muted};">
                Elai · <a href="${escapeHtml(site)}" style="color:${BRAND.soft};text-decoration:underline;">elaai.co</a>
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;line-height:1.5;color:${BRAND.muted};">
          Sent by Elai. Please do not reply to this address for support.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export type RenderedEmail = {
  subject: string
  html: string
  text: string
}
