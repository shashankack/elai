import { sdk } from '@/lib/sdk'
import type { HttpTypes } from '@medusajs/types'

export const RAZORPAY_PROVIDER_ID = 'pp_razorpay_razorpay'
export const SYSTEM_PROVIDER_ID = 'pp_system_default'

export function isRazorpayProvider(providerId: string | null | undefined): boolean {
  return Boolean(providerId && providerId.toLowerCase().includes('razorpay'))
}

export type RazorpaySessionData = {
  razorpay_order_id?: string
  id?: string
  amount?: number
  currency?: string
  key_id?: string
}

export type CompleteCartResult =
  | {
      type: 'order_group'
      order_group: { id: string; orders?: { id: string }[] }
    }
  | { type: 'order'; order: { id: string } }
  | {
      type: 'cart'
      cart?: HttpTypes.StoreCart
      error?: { message?: string; type?: string; name?: string }
    }

export function pickRazorpaySession(
  paymentCollection: {
    payment_sessions?: Array<{
      provider_id?: string | null
      data?: Record<string, unknown> | null
    }> | null
  } | null | undefined,
  providerId: string,
): RazorpaySessionData | null {
  const sessions = paymentCollection?.payment_sessions || []
  const session =
    sessions.find((s) => s.provider_id === providerId) ||
    sessions.find((s) => isRazorpayProvider(s.provider_id || '')) ||
    sessions[0]
  if (!session?.data) return null
  return session.data as RazorpaySessionData
}

export async function confirmRazorpayPayment(
  cartId: string,
  payment: {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  },
): Promise<void> {
  await sdk.client.fetch(`/store/carts/${cartId}/razorpay/confirm`, {
    method: 'POST',
    body: {
      razorpay_payment_id: payment.razorpay_payment_id,
      razorpay_order_id: payment.razorpay_order_id,
      razorpay_signature: payment.razorpay_signature,
    },
  })
}

export async function completeCheckoutCart(
  cartId: string,
): Promise<CompleteCartResult> {
  return (await sdk.store.cart.complete(cartId)) as CompleteCartResult
}

export function confirmationPathFromCompleteResult(
  result: CompleteCartResult,
): string | null {
  if (result.type === 'order_group' && result.order_group?.id) {
    return `/order-confirmation/${result.order_group.id}?fresh=1&group=1`
  }
  if (result.type === 'order' && result.order?.id) {
    return `/order-confirmation/${result.order.id}?fresh=1`
  }
  return null
}
