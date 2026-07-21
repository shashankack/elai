'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/components/auth/auth-provider'
import { useCart } from '@/components/cart/cart-provider'
import {
  formatCartMoney,
  getItemHandle,
  getItemThumbnail,
  getItemTitle,
  getItemUnitPrice,
} from '@/lib/mercur/cart'

export default function CartPage() {
  const { cart, itemCount, busy, error, updateQuantity, removeItem, openCart } =
    useCart()
  const { isAuthenticated } = useAuth()

  const currency = cart?.currency_code || 'inr'
  const items = cart?.items ?? []
  const total = cart?.item_total ?? cart?.subtotal ?? cart?.total ?? null

  return (
    <main className="elai-commerce-shell py-8 md:py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-subheading text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--highlight)]">
            Shopping bag
          </p>
          <h1 className="mt-1 font-heading text-3xl text-foreground md:text-4xl">
            {itemCount === 0
              ? 'Your bag is empty'
              : `${itemCount} item${itemCount === 1 ? '' : 's'}`}
          </h1>
        </div>
        <Link
          href="/shop"
          className="rounded-full border border-[var(--border-color)] bg-[#fffef8] px-4 py-2 font-subheading text-sm font-semibold transition-colors hover:border-[var(--highlight)]"
        >
          Continue shopping
        </Link>
      </div>

      {error && (
        <p
          className="mb-6 rounded-[var(--radius-md)] px-4 py-3 font-subheading text-sm text-[#7c2d12]"
          style={{
            background: 'color-mix(in srgb, #b45309 12%, #fffef8)',
          }}
          role="alert"
        >
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <div
          className="bg-[#fffef8] px-6 py-12 text-center shadow-[0_1px_0_rgba(46,62,32,0.04)]"
          style={{ borderRadius: 'var(--radius-xl)' }}
        >
          <p className="mx-auto max-w-md font-subheading text-foreground/70">
            Browse jewellery, bags, hair, beauty and more   add pieces you love
            and come back here when you are ready.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-full bg-[var(--highlight)] px-6 py-2.5 font-subheading text-sm font-semibold text-white"
          >
            Browse shop
          </Link>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <ul className="space-y-4">
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
                <li
                  key={item.id}
                  className="grid grid-cols-[88px_1fr] gap-4 bg-[#fffef8] p-3 shadow-[0_1px_0_rgba(46,62,32,0.04)] sm:grid-cols-[104px_1fr] sm:p-4"
                  style={{ borderRadius: 'var(--radius-lg)' }}
                >
                  <div
                    className="relative aspect-[3/4] overflow-hidden bg-[linear-gradient(160deg,#fffdf0_0%,#f3ecd2_100%)]"
                    style={{ borderRadius: 'var(--radius-md)' }}
                  >
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt=""
                        fill
                        sizes="104px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex min-w-0 flex-col">
                    {handle ? (
                      <Link
                        href={`/shop/products/${handle}`}
                        className="font-subheading text-base font-semibold text-foreground hover:text-[var(--highlight-dark)]"
                      >
                        {title}
                      </Link>
                    ) : (
                      <p className="font-subheading text-base font-semibold">
                        {title}
                      </p>
                    )}
                    {item.variant_title &&
                      item.variant_title !== 'Default' && (
                        <p className="mt-1 font-subheading text-xs text-foreground/50">
                          {item.variant_title}
                        </p>
                      )}
                    <p className="mt-2 font-subheading text-sm font-bold text-[var(--highlight-dark)]">
                      {formatCartMoney(lineTotal, currency)}
                    </p>
                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-color)] bg-white font-subheading disabled:opacity-40"
                        disabled={busy || item.quantity <= 1}
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="min-w-6 text-center font-subheading text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-color)] bg-white font-subheading disabled:opacity-40"
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
                        className="ml-2 font-subheading text-xs font-semibold text-foreground/55 underline underline-offset-2 disabled:opacity-40"
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

          <aside
            className="h-fit bg-[#fffef8] p-5 shadow-[0_1px_0_rgba(46,62,32,0.04)] lg:sticky lg:top-28"
            style={{ borderRadius: 'var(--radius-xl)' }}
          >
            <div className="flex items-baseline justify-between font-subheading">
              <span className="text-sm text-foreground/60">Subtotal</span>
              <strong className="text-lg text-[var(--highlight-dark)]">
                {formatCartMoney(total, currency)}
              </strong>
            </div>
            <p className="mt-2 font-subheading text-xs text-foreground/50">
              Shipping and taxes calculated at checkout. An Elai account is
              required to place an order.
            </p>
            {isAuthenticated ? (
              <Link
                href="/shop/checkout"
                className="mt-5 flex w-full items-center justify-center rounded-full bg-[var(--highlight)] px-5 py-3 font-subheading text-sm font-semibold text-white transition-colors hover:bg-[var(--highlight-dark)]"
              >
                Checkout
              </Link>
            ) : (
              <Link
                href="/account/login?next=/shop/checkout"
                className="mt-5 flex w-full items-center justify-center rounded-full bg-[var(--highlight)] px-5 py-3 font-subheading text-sm font-semibold text-white transition-colors hover:bg-[var(--highlight-dark)]"
              >
                Sign in to checkout
              </Link>
            )}
            <button
              type="button"
              onClick={openCart}
              className="mt-3 w-full rounded-full border border-[var(--border-color)] bg-white px-5 py-2.5 font-subheading text-sm font-semibold"
            >
              Quick bag view
            </button>
          </aside>
        </div>
      )}
    </main>
  )
}
