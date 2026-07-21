import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import {
  ProductDetail,
  ProductRelated,
  ProductRelatedSkeleton,
} from '@/components/shop/product-detail'
import { ShopStatus } from '@/components/shop/shop-status'
import {
  getProductByHandle,
  isMercurStoreError,
  listRelatedProducts,
  type StoreProduct,
} from '@/lib/mercur/products'

type ProductPageProps = {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { handle } = await params
  try {
    // Shares the same React cache() entry as the page render.
    const product = await getProductByHandle(handle)
    if (!product) return { title: 'Product not found | Elai' }
    return {
      title: `${product.title} | Elai Shop`,
      description: product.subtitle ?? product.description ?? undefined,
    }
  } catch {
    return { title: 'Product | Elai Shop' }
  }
}

async function RelatedSlot({ product }: { product: StoreProduct }) {
  const related = await listRelatedProducts(product, 4)
  return (
    <ProductRelated
      products={related}
      categoryHandle={product.categories?.[0]?.handle}
    />
  )
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params

  try {
    const product = await getProductByHandle(handle)
    if (!product) notFound()

    return (
      <ProductDetail product={product}>
        <Suspense fallback={<ProductRelatedSkeleton />}>
          <RelatedSlot product={product} />
        </Suspense>
      </ProductDetail>
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
