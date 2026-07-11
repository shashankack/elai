import { notFound } from 'next/navigation'
import { ProductDetail } from '@/components/shop/product-detail'
import { ShopStatus } from '@/components/shop/shop-status'
import {
  getProductByHandle,
  isMercurStoreError,
  listRelatedProducts,
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
      description:
        product.subtitle ?? product.description ?? undefined,
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

    const related = await listRelatedProducts(product, 4)

    return <ProductDetail product={product} related={related} />
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
