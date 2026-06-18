import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ShopStatus } from '@/components/shop/shop-status'
import {
  getProductByHandle,
  getProductPrice,
  isMercurStoreError,
} from '@/lib/mercur/products'

type ProductPageProps = {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { handle } = await params
  try {
    const product = await getProductByHandle(handle)
    if (!product) return { title: 'Product not found | Elai' }
    return {
      title: `${product.title} | Elai Shop`,
      description: product.description ?? undefined,
    }
  } catch {
    return { title: 'Product | Elai Shop' }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params

  try {
    const product = await getProductByHandle(handle)
    if (!product) notFound()

    const price = getProductPrice(product)

    return (
      <main className="elai-shell py-10 md:py-16">
        <Link
          href="/shop"
          className="mb-8 inline-block font-subheading text-sm font-semibold text-[var(--highlight-dark)] hover:underline"
        >
          ← Back to shop
        </Link>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-[var(--border-color)] bg-white/50">
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
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

          <div className="flex flex-col gap-6">
            <div>
              <p className="font-subheading text-xs font-semibold uppercase tracking-[0.2em] text-[var(--highlight)]">
                Elai Shop
              </p>
              <h1 className="mt-2 font-heading text-3xl text-foreground md:text-4xl">
                {product.title}
              </h1>
              {price && (
                <p className="mt-4 font-subheading text-2xl font-bold text-[var(--highlight-dark)]">
                  {price}
                </p>
              )}
            </div>

            {product.description && (
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6">
                <h2 className="font-subheading text-sm font-semibold uppercase tracking-wide text-foreground/60">
                  Description
                </h2>
                <p className="mt-3 font-subheading text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}

            <button
              type="button"
              disabled
              className="w-full rounded-full bg-[var(--highlight)] px-8 py-4 font-subheading text-sm font-semibold text-white opacity-60"
            >
              Add to cart — coming soon
            </button>
          </div>
        </div>
      </main>
    )
  } catch (error) {
    if (isMercurStoreError(error) && error.status === 404) {
      notFound()
    }

    const message = isMercurStoreError(error)
      ? `Mercur API error (${error.status}): ${error.message}`
      : error instanceof Error
        ? error.message
        : 'Could not load this product.'

    return (
      <main className="elai-shell py-16">
        <ShopStatus title="Product unavailable" message={message} />
      </main>
    )
  }
}
