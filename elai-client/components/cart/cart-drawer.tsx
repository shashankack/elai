'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { useCart } from '@/components/cart/cart-provider'
import {
  formatCartMoney,
  getItemHandle,
  getItemThumbnail,
  getItemTitle,
  getItemUnitPrice,
} from '@/lib/mercur/cart'

const CLOSE_MS = 320

export function CartDrawer() {
  const {
    cart,
    itemCount,
    isOpen,
    closeCart,
    busy,
    error,
    updateQuantity,
    removeItem,
  } = useCart()
  const { isAuthenticated, customer } = useAuth()

  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      const id = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setVisible(true))
      })
      return () => window.cancelAnimationFrame(id)
    }

    setVisible(false)
    const timer = window.setTimeout(() => setMounted(false), CLOSE_MS)
    return () => window.clearTimeout(timer)
  }, [isOpen])

  useEffect(() => {
    if (!mounted) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    document.addEventListener('keydown', onKey)

    const scrollbar = Math.max(
      0,
      window.innerWidth - document.documentElement.clientWidth,
    )
    const { overflow, paddingRight } = document.body.style
    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) {
      document.body.style.paddingRight = `${scrollbar}px`
    }

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
    }
  }, [mounted, closeCart])

  if (!mounted) return null

  const currency = cart?.currency_code || 'inr'
  const items = cart?.items ?? []
  const total = cart?.item_total ?? cart?.subtotal ?? cart?.total ?? null

  return (
    <div
      className={`cart-drawer${visible ? ' is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping bag"
      aria-hidden={!visible}
    >
      <button
        type="button"
        className="cart-drawer__backdrop"
        aria-label="Close bag"
        tabIndex={visible ? 0 : -1}
        onClick={closeCart}
      />
      <aside className="cart-drawer__panel">
        <header className="cart-drawer__header">
          <div>
            <p className="cart-drawer__eyebrow font-subheading">Your bag</p>
            <h2 className="cart-drawer__title font-heading">
              {itemCount === 0
                ? 'Empty'
                : `${itemCount} item${itemCount === 1 ? '' : 's'}`}
            </h2>
          </div>
          <button
            type="button"
            className="cart-drawer__close font-subheading"
            onClick={closeCart}
          >
            Close
          </button>
        </header>

        {error && (
          <p className="cart-drawer__error font-subheading" role="alert">
            {error}
          </p>
        )}

        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="cart-drawer__empty">
              <p className="font-subheading">
                Nothing here yet. Find something that fits your flavour.
              </p>
              <Link
                href="/shop"
                className="cart-drawer__cta font-subheading"
                onClick={closeCart}
              >
                Browse shop
              </Link>
            </div>
          ) : (
            <ul className="cart-drawer__list">
              {items.map((item) => {
                const handle = getItemHandle(item)
                const thumb = getItemThumbnail(item)
                const title = getItemTitle(item)
                const unit = getItemUnitPrice(item)
                const lineTotal =
                  typeof item.total === 'number'
                    ? item.total
                    : unit != null
                      ? unit * item.quantity
                      : null

                return (
                  <li key={item.id} className="cart-drawer__item">
                    <div className="cart-drawer__thumb">
                      {thumb ? (
                        <Image
                          src={thumb}
                          alt=""
                          fill
                          sizes="72px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="font-subheading text-xs text-foreground/40">
                          No image
                        </span>
                      )}
                    </div>
                    <div className="cart-drawer__meta">
                      {handle ? (
                        <Link
                          href={`/shop/products/${handle}`}
                          className="cart-drawer__name font-subheading"
                          onClick={closeCart}
                        >
                          {title}
                        </Link>
                      ) : (
                        <p className="cart-drawer__name font-subheading">
                          {title}
                        </p>
                      )}
                      {item.variant_title &&
                        item.variant_title !== 'Default' && (
                          <p className="cart-drawer__variant font-subheading">
                            {item.variant_title}
                          </p>
                        )}
                      <p className="cart-drawer__price font-subheading">
                        {formatCartMoney(lineTotal, currency)}
                      </p>
                      <div className="cart-drawer__qty">
                        <button
                          type="button"
                          disabled={busy || item.quantity <= 1}
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="font-subheading">{item.quantity}</span>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="cart-drawer__remove font-subheading"
                          disabled={busy}
                          onClick={() => removeItem(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="cart-drawer__footer">
            <div className="cart-drawer__totals font-subheading">
              <span>Subtotal</span>
              <strong>{formatCartMoney(total, currency)}</strong>
            </div>
            <p className="cart-drawer__hint font-subheading">
              Shipping and taxes are calculated at checkout. An Elai account is
              required to place an order.
            </p>
            {isAuthenticated ? (
              <Link
                href="/shop/checkout"
                className="cart-drawer__checkout font-subheading"
                onClick={closeCart}
              >
                Checkout
              </Link>
            ) : (
              <Link
                href="/account/login?next=/shop/checkout"
                className="cart-drawer__checkout font-subheading"
                onClick={closeCart}
              >
                Sign in to checkout
              </Link>
            )}
            {isAuthenticated && customer?.email && (
              <p className="cart-drawer__hint font-subheading">
                Signed in as {customer.email}
              </p>
            )}
            <Link
              href="/shop/cart"
              className="cart-drawer__link font-subheading"
              onClick={closeCart}
            >
              View bag
            </Link>
          </footer>
        )}
      </aside>
    </div>
  )
}
