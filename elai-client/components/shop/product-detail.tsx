'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import Image from 'next/image'
import Link from 'next/link'
import { type ReactNode, useMemo, useRef, useState } from 'react'
import { ProductCard } from '@/components/shop/product-card'
import { AddToCartButton } from '@/components/cart/add-to-cart-button'
import {
  formatVariantPrice,
  getProductImages,
  type StoreProduct,
} from '@/lib/mercur/products'

gsap.registerPlugin(useGSAP)

type ProductDetailProps = {
  product: StoreProduct
  /** Streamed related section (Suspense slot from the server page). */
  children?: ReactNode
}

export function ProductDetail({ product, children }: ProductDetailProps) {
  const rootRef = useRef<HTMLElement>(null)
  const images = useMemo(() => getProductImages(product), [product])
  const variants = product.variants ?? []
  const [activeImage, setActiveImage] = useState(0)
  const [activeVariantId, setActiveVariantId] = useState(variants[0]?.id)

  const activeVariant =
    variants.find((v) => v.id === activeVariantId) ?? variants[0]
  const price = formatVariantPrice(activeVariant)
  const primaryCategory = product.categories?.[0]

  const details = [
    product.material ? { label: 'Material', value: product.material } : null,
    product.origin_country
      ? {
          label: 'Origin',
          value: product.origin_country.toUpperCase(),
        }
      : null,
    product.weight != null
      ? { label: 'Weight', value: `${product.weight} g` }
      : null,
    product.type?.value ? { label: 'Type', value: product.type.value } : null,
    product.collection?.title
      ? { label: 'Collection', value: product.collection.title }
      : null,
  ].filter(Boolean) as { label: string; value: string }[]

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (reduceMotion) return

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(
        '.pd-crumb',
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.35 },
      )
        .fromTo(
          '.pd-media',
          { opacity: 0, y: 24, scale: 0.985 },
          { opacity: 1, y: 0, scale: 1, duration: 0.55 },
          '-=0.12',
        )
        .fromTo(
          '.pd-info > *',
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.07 },
          '-=0.35',
        )
    },
    { scope: rootRef, dependencies: [product.id], revertOnUpdate: true },
  )

  return (
    <main ref={rootRef} className="pb-16 md:pb-24">
      <div className="elai-commerce-shell pt-6 md:pt-8">
        <nav
          className="pd-crumb flex flex-wrap items-center gap-2 font-subheading text-xs font-semibold text-foreground/55"
          aria-label="Breadcrumb"
        >
          <Link
            href="/shop"
            className="rounded-full px-2 py-1 transition-colors hover:bg-[var(--highlight-light)] hover:text-[var(--highlight-dark)]"
          >
            Shop
          </Link>
          {primaryCategory?.handle && (
            <>
              <span aria-hidden>/</span>
              <Link
                href={`/shop?category=${encodeURIComponent(primaryCategory.handle)}`}
                className="rounded-full px-2 py-1 transition-colors hover:bg-[var(--highlight-light)] hover:text-[var(--highlight-dark)]"
              >
                {primaryCategory.name}
              </Link>
            </>
          )}
          <span aria-hidden>/</span>
          <span className="text-foreground/80 line-clamp-1">{product.title}</span>
        </nav>
      </div>

      <section className="elai-commerce-shell mt-6 grid items-start gap-8 lg:mt-10 lg:grid-cols-2 lg:gap-14">
        <div className="pd-media space-y-3">
          <div
            className="relative aspect-[3/4] overflow-hidden bg-[linear-gradient(160deg,#fffdf0_0%,#f3ecd2_100%)] shadow-[0_12px_36px_rgba(46,62,32,0.08)] md:aspect-[4/5]"
            style={{ borderRadius: 'var(--radius-xl)' }}
          >
            {images[activeImage] ? (
              <Image
                src={images[activeImage]}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-subheading text-sm text-foreground/40">
                No image
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {images.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden transition-[transform,box-shadow,opacity] duration-300 md:h-20 md:w-20 ${
                    activeImage === index
                      ? 'scale-[1.03] opacity-100 shadow-[0_0_0_2px_var(--highlight-dark)]'
                      : 'opacity-65 hover:scale-[1.02] hover:opacity-100'
                  }`}
                  style={{ borderRadius: 'var(--radius-md)' }}
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pd-info flex flex-col gap-6 lg:sticky lg:top-28">
          {product.type?.value && (
            <p className="font-subheading text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--highlight)]">
              {product.type.value}
            </p>
          )}
          <div>
            <h1 className="font-heading text-3xl leading-tight text-foreground md:text-4xl lg:text-[2.75rem]">
              {product.title}
            </h1>
            {product.subtitle && (
              <p className="mt-2 font-subheading text-base text-foreground/65">
                {product.subtitle}
              </p>
            )}
          </div>

          {price && (
            <p className="font-subheading text-2xl font-bold text-[var(--highlight-dark)]">
              {price}
            </p>
          )}

          {variants.length > 1 && (
            <div>
              <p className="font-subheading text-xs font-semibold uppercase tracking-[0.14em] text-foreground/55">
                Options
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {variants.map((variant) => {
                  const selected = variant.id === activeVariant?.id
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setActiveVariantId(variant.id)}
                      className={`rounded-full border px-4 py-2 font-subheading text-sm transition-[transform,background,border-color,color] duration-300 ${
                        selected
                          ? 'border-[var(--highlight-dark)] bg-[var(--highlight)] text-white shadow-[0_6px_16px_rgba(116,137,86,0.25)]'
                          : 'border-[var(--border-color)] bg-[#fffef8]/70 text-foreground hover:-translate-y-0.5 hover:border-[var(--highlight)]'
                      }`}
                    >
                      {variant.title || 'Option'}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="space-y-2 border-y border-[var(--border-color)]/70 py-5">
            <AddToCartButton
              variantId={activeVariant?.id}
              className="w-full rounded-full bg-[var(--highlight)] px-8 py-3.5 font-subheading text-sm font-semibold text-white shadow-[0_8px_20px_rgba(116,137,86,0.28)] transition-[transform,background,opacity] duration-300 hover:-translate-y-0.5 hover:bg-[var(--highlight-dark)] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
              disabled={!activeVariant?.id}
              label="Add to bag"
            />
            <p className="font-subheading text-xs text-foreground/50">
              Sign in required at checkout   browse and bag freely.
            </p>
          </div>

          {product.description && (
            <div>
              <p className="font-subheading text-xs font-semibold uppercase tracking-[0.14em] text-foreground/55">
                Product details
              </p>
              <p className="mt-2 max-w-prose font-subheading text-[15px] font-medium leading-relaxed text-foreground/80 whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          {details.length > 0 && (
            <dl className="grid gap-3 sm:grid-cols-2">
              {details.map((item) => (
                <div
                  key={item.label}
                  className="bg-[#fffef8] px-4 py-3.5 shadow-[0_1px_0_rgba(46,62,32,0.04)] transition-transform duration-300 hover:-translate-y-0.5"
                  style={{ borderRadius: 'var(--radius-md)' }}
                >
                  <dt className="font-subheading text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/50">
                    {item.label}
                  </dt>
                  <dd className="mt-1 font-subheading text-sm font-semibold text-foreground">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {!!product.tags?.length && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag.id ?? tag.value}
                  className="rounded-full border border-[var(--border-color)] bg-[#fffef8]/80 px-3 py-1.5 font-subheading text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--highlight-dark)]"
                >
                  {tag.value}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {children}
    </main>
  )
}

type ProductRelatedProps = {
  products: StoreProduct[]
  categoryHandle?: string
}

export function ProductRelated({
  products,
  categoryHandle,
}: ProductRelatedProps) {
  if (!products.length) return null

  return (
    <section className="pd-related elai-commerce-shell mt-16 md:mt-24">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="font-subheading text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--highlight)]">
            You may also like
          </p>
          <h2 className="mt-1 font-heading text-2xl text-foreground md:text-3xl">
            Similar picks
          </h2>
        </div>
        <Link
          href={
            categoryHandle
              ? `/shop?category=${encodeURIComponent(categoryHandle)}`
              : '/shop'
          }
          className="hidden rounded-full px-3 py-1.5 font-subheading text-sm font-semibold text-[var(--highlight-dark)] transition-colors hover:bg-[var(--highlight-light)] sm:inline"
        >
          View all
        </Link>
      </div>
      <div className="shop-plp-grid">
        {products.map((item, index) => (
          <ProductCard key={item.id} product={item} index={index} />
        ))}
      </div>
    </section>
  )
}

export function ProductRelatedSkeleton() {
  return (
    <section className="elai-commerce-shell mt-16 md:mt-24" aria-hidden>
      <div className="mb-6 h-8 w-48 animate-pulse rounded-full bg-[var(--foreground)]/10" />
      <div className="shop-plp-grid">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="overflow-hidden bg-[#fffef8]"
            style={{ borderRadius: 'var(--radius-lg)' }}
          >
            <div className="aspect-[3/4] animate-pulse bg-[linear-gradient(160deg,#fffdf0_0%,#f3ecd2_100%)]" />
            <div className="space-y-2 px-3 py-3.5">
              <div className="h-3 w-3/4 animate-pulse rounded-full bg-[var(--foreground)]/10" />
              <div className="h-3 w-1/3 animate-pulse rounded-full bg-[var(--foreground)]/8" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
