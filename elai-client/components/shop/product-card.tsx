import Image from 'next/image'
import Link from 'next/link'
import { AddToCartButton } from '@/components/cart/add-to-cart-button'
import type { StoreProduct } from '@/lib/mercur/products'
import { getProductPrice } from '@/lib/mercur/products'

type ProductCardProps = {
  product: StoreProduct
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const price = getProductPrice(product)
  const tag = product.tags?.[0]?.value
  const type = product.type?.value
  const variantId = product.variants?.[0]?.id

  return (
    <div
      className="shop-card-enter"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <article className="shop-card group">
        <Link
          href={`/shop/products/${product.handle}`}
          className="flex min-h-0 flex-1 flex-col text-inherit no-underline"
        >
          <div className="shop-card__media">
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-subheading text-sm font-medium text-foreground/40">
                No image
              </div>
            )}
            {(tag || type) && (
              <span
                className="absolute left-2.5 top-2.5 z-10 max-w-[85%] truncate bg-[var(--foreground)]/90 px-2.5 py-1 font-subheading text-[10px] font-semibold uppercase tracking-wide text-[var(--background)] backdrop-blur-sm"
                style={{ borderRadius: '999px' }}
              >
                {tag || type}
              </span>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1 px-3 pt-3.5 md:px-3.5 md:pt-4">
            {type && tag && (
              <p className="font-subheading text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/45">
                {type}
              </p>
            )}
            <h3 className="shop-card__title font-subheading text-[13px] font-semibold leading-snug text-foreground line-clamp-2 md:text-sm">
              {product.title}
            </h3>
          </div>
        </Link>

        <div className="shop-card__footer">
          {price ? (
            <p className="shop-card__price font-subheading text-sm font-bold text-[var(--highlight-dark)]">
              {price}
            </p>
          ) : (
            <p className="shop-card__price font-subheading text-xs text-foreground/50">
               
            </p>
          )}
          <AddToCartButton
            variantId={variantId}
            className="shop-card__cart"
            disabled={!variantId}
            label="Add to bag"
          />
        </div>
      </article>
    </div>
  )
}
