'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { formatCartMoney } from '@/lib/mercur/cart'
import {
  orderGroupCurrency,
  orderGroupLabel,
  retrieveCustomerOrderGroup,
  summarizeOrderStatuses,
  type StoreOrderGroup,
} from '@/lib/mercur/orders'
import '@/styles/checkout.scss'

export default function OrderConfirmationPage() {
  const params = useParams<{ id: string }>()
  const { token, loading, isAuthenticated } = useAuth()
  const [group, setGroup] = useState<StoreOrderGroup | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (loading || !isAuthenticated || !token || !params.id) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await retrieveCustomerOrderGroup(token, params.id)
        if (cancelled) return
        if (!data) {
          setError('Order not found.')
          return
        }
        setGroup(data)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Could not load order.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [loading, isAuthenticated, token, params.id])

  if (loading || !isAuthenticated) {
    return (
      <main className="elai-commerce-shell checkout-page">
        <p className="checkout-muted font-subheading">Loading confirmation…</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="elai-commerce-shell checkout-page">
        <p className="auth-error">{error}</p>
        <Link href="/account" className="checkout-btn checkout-btn--primary">
          Go to account
        </Link>
      </main>
    )
  }

  if (!group) {
    return (
      <main className="elai-commerce-shell checkout-page">
        <p className="checkout-muted font-subheading">Loading confirmation…</p>
      </main>
    )
  }

  const currency = orderGroupCurrency(group)

  return (
    <main className="elai-commerce-shell checkout-page">
      <p className="checkout-eyebrow font-subheading">Order confirmed</p>
      <h1 className="checkout-title font-heading">Thank you</h1>
      <p className="checkout-lead font-subheading">
        Order {orderGroupLabel(group)} · {summarizeOrderStatuses(group)}
      </p>

      <div className="checkout-panel checkout-confirm font-subheading">
        <div className="checkout-pay-total">
          <span>Total paid</span>
          <strong>{formatCartMoney(group.total, currency)}</strong>
        </div>

        <ul className="checkout-confirm__list">
          {(group.orders ?? []).map((order) => (
            <li key={order.id} className="checkout-confirm__card">
              <strong>
                {order.seller?.name || 'Seller'} · #
                {order.display_id ?? order.id.slice(-6)}
              </strong>
              <p>
                {order.status || 'pending'}
                {order.total != null
                  ? ` · ${formatCartMoney(order.total, order.currency_code || currency)}`
                  : ''}
              </p>
            </li>
          ))}
        </ul>

        <div className="checkout-actions" style={{ marginTop: '1.25rem' }}>
          <Link href="/account" className="checkout-btn checkout-btn--primary">
            View account
          </Link>
          <Link href="/shop" className="checkout-btn checkout-btn--ghost">
            Continue shopping
          </Link>
        </div>
      </div>
    </main>
  )
}
