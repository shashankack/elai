'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'
import { ProductCard } from '@/components/shop/product-card'
import {
  formatVariantPrice,
  getProductImages,
  type StoreProduct,
} from '@/lib/mercur/products'

gsap.registerPlugin(useGSAP)

type ProductDetailProps = {
  product: StoreProduct
  related: StoreProduct[]
}

export function ProductDetail({ product, related }: ProductDetailProps) {
  const rootRef = useRef<HTMLElement>(null)
  const images = useMemo(() => getProductImages(product), [product])
  const variants = product.variants ?? []
  const [activeImage, setActiveImage] = useState(0)
  const [activeVariantId, setActiveVariantId] = useState(variants[0]?.id)

  const activeVariant =
    variants.find((v) => v.id === activeVariantId) ?? variants[0]
  const price = formatVariantPrice(activeVariant)

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
    product.type?.value
      ? { label: 'Type', value: product.type.value }
      : null,
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

      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
      tl.from('.pd-back', { opacity: 0, y: -8, duration: 0.35 })
        .from('.pd-media', { opacity: 0, y: 24, duration: 0.55 }, '-=0.15')
        .from(
          '.pd-info > *',
          { opacity: 0, y: 18, duration: 0.4, stagger: 0.08 },
          '-=0.35',
        )
        .from(
          '.pd-related',
          { opacity: 0, y: 20, duration: 0.45 },
          '-=0.15',
        )
    },
    { scope: rootRef },
  )

  return (
    <main ref={rootRef} className="pb-16 md:pb-24">
      <div className="elai-shell pt-8 md:pt-12">
        <Link
          href="/shop"
          className="pd-back inline-flex items-center gap-2 font-subheading text-sm font-semibold text-[var(--highlight-dark)] transition-opacity hover:opacity-70"
        >
          <span aria-hidden>←</span> Back to shop
        </Link>
      </div>

      <section className="elai-shell mt-8 grid items-start gap-10 lg:mt-12 lg:grid-cols-2 lg:gap-16">
        <div className="pd-media space-y-4">
          <div className="relative aspect-[4/5] overflow-hidden bg-[linear-gradient(160deg,#fffdf0_0%,#f3ecd2_100%)] md:aspect-square">
            {images[activeImage] ? (
              <Image
                key={images[activeImage]}
                src={images[activeImage]}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-subheading text-foreground/40">
                No image
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`View image ${index + 1}`}
                  aria-pressed={activeImage === index}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden border transition-colors ${
                    activeImage === index
                      ? 'border-[var(--highlight-dark)]'
                      : 'border-[var(--border-color)] opacity-70 hover:opacity-100'
                  }`}
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

        <div className="pd-info flex flex-col gap-8 lg:sticky lg:top-[calc(var(--nav-offset)+1rem)]">
          <div>
            <p className="font-subheading text-xs font-semibold uppercase tracking-[0.22em] text-[var(--highlight)]">
              Elai
            </p>
            <h1 className="mt-3 font-heading text-4xl leading-tight text-foreground md:text-5xl">
              {product.title}
            </h1>
            {product.subtitle && (
              <p className="mt-3 font-subheading text-base text-foreground/65">
                {product.subtitle}
              </p>
            )}
            <p className="mt-5 font-subheading text-2xl font-bold text-[var(--highlight-dark)] md:text-3xl">
              {price ?? 'Price on request'}
            </p>
          </div>

          {variants.length > 1 && (
            <div>
              <p className="font-subheading text-xs font-semibold uppercase tracking-[0.16em] text-foreground/55">
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
                      className={`border px-4 py-2 font-subheading text-sm transition-colors ${
                        selected
                          ? 'border-[var(--highlight-dark)] bg-[var(--highlight)] text-white'
                          : 'border-[var(--border-color)] bg-transparent text-foreground hover:border-[var(--highlight)]'
                      }`}
                    >
                      {variant.title || 'Option'}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {product.description && (
            <div>
              <p className="font-subheading text-xs font-semibold uppercase tracking-[0.16em] text-foreground/55">
                About
              </p>
              <p className="mt-3 max-w-prose font-subheading text-base leading-relaxed text-foreground/80 whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          {details.length > 0 && (
            <dl className="grid gap-4 border-y border-[var(--border-color)] py-6 sm:grid-cols-2">
              {details.map((item) => (
                <div key={item.label}>
                  <dt className="font-subheading text-xs font-semibold uppercase tracking-[0.14em] text-foreground/50">
                    {item.label}
                  </dt>
                  <dd className="mt-1 font-subheading text-sm text-foreground">
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
                  className="font-subheading text-xs font-semibold uppercase tracking-[0.12em] text-[var(--highlight-dark)]"
                >
                  #{tag.value}
                </span>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              disabled
              className="w-full bg-[var(--highlight)] px-8 py-4 font-subheading text-sm font-semibold text-white opacity-55"
            >
              Add to cart — coming soon
            </button>
            <p className="font-subheading text-xs text-foreground/50">
              Checkout is on the way. Browse freely for now.
            </p>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="pd-related elai-shell mt-20 md:mt-28">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="font-subheading text-xs font-semibold uppercase tracking-[0.2em] text-[var(--highlight)]">
                More from Elai
              </p>
              <h2 className="mt-2 font-heading text-3xl text-foreground md:text-4xl">
                You may also like
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden font-subheading text-sm font-semibold text-[var(--highlight-dark)] hover:underline sm:inline"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
