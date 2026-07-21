import type { RenderedEmail } from "./layout"
import { renderCustomerWelcome } from "./customer-welcome"
import { renderEmailVerification } from "./email-verification"
import { renderMemberInvite } from "./member-invite"
import { renderOrderCanceled } from "./order-canceled"
import { renderOrderPlaced } from "./order-placed"
import { renderOrderRefunded } from "./order-refunded"
import { renderOrderShipped } from "./order-shipped"
import { renderPasswordReset } from "./password-reset"
import { renderSellerInvitation } from "./seller-invitation"
import {
  renderSellerApproved,
  renderSellerRejected,
} from "./seller-status"

export type EmailTemplateId =
  | "password-reset"
  | "password_reset"
  | "member-invite"
  | "newSellerInvitation"
  | "seller-invitation"
  | "order-placed"
  | "order-shipped"
  | "order-canceled"
  | "order-cancelled"
  | "order-refunded"
  | "customer-welcome"
  | "email-verification"
  | "seller-approved"
  | "seller-rejected"

type TemplateRenderer = (data: Record<string, unknown>) => RenderedEmail

const REGISTRY: Record<string, TemplateRenderer> = {
  "password-reset": (data) => renderPasswordReset(data),
  password_reset: (data) => renderPasswordReset(data),
  "member-invite": (data) => renderMemberInvite(data),
  newSellerInvitation: (data) => renderSellerInvitation(data),
  "seller-invitation": (data) => renderSellerInvitation(data),
  "order-placed": (data) => renderOrderPlaced(data),
  "order-shipped": (data) => renderOrderShipped(data),
  "order-canceled": (data) => renderOrderCanceled(data),
  "order-cancelled": (data) => renderOrderCanceled(data),
  "order-refunded": (data) => renderOrderRefunded(data),
  "customer-welcome": (data) => renderCustomerWelcome(data),
  "email-verification": (data) => renderEmailVerification(data),
  "seller-approved": (data) => renderSellerApproved(data),
  "seller-rejected": (data) => renderSellerRejected(data),
}

/**
 * Central email template registry for Elai transactional mail.
 * Subscribers/workflows pass a `template` id + `data`; Resend renders here.
 */
export function renderEmailTemplate(
  templateId: string,
  data: Record<string, unknown> = {},
): RenderedEmail | null {
  const renderer = REGISTRY[templateId]
  if (!renderer) return null
  return renderer(data)
}

export function listEmailTemplateIds(): string[] {
  return Object.keys(REGISTRY).sort()
}

export * from "./layout"
export {
  renderPasswordReset,
  renderMemberInvite,
  renderSellerInvitation,
  renderOrderPlaced,
  renderOrderShipped,
  renderOrderCanceled,
  renderOrderRefunded,
  renderCustomerWelcome,
  renderEmailVerification,
  renderSellerApproved,
  renderSellerRejected,
}
