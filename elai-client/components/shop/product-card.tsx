import Image from 'next/image'
import Link from 'next/link'
import type { StoreProduct } from '@/lib/mercur/products'
import { getProductPrice } from '@/lib/mercur/products'

type ProductCardProps = {
  product: StoreProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const price = getProductPrice(product)

  return (
    <Link
      href={`/shop/products/${product.handle}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-white/50">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-subheading text-sm text-foreground/40">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-subheading text-sm font-semibold leading-snug text-foreground line-clamp-2">
          {product.title}
        </h3>
        {price ? (
          <p className="font-subheading text-sm font-bold text-[var(--highlight-dark)]">
            {price}
          </p>
        ) : (
          <p className="font-subheading text-xs text-foreground/50">Price on request</p>
        )}
      </div>
    </Link>
  )
}
