import { assertMercurConfigured } from './config'
import { MercurStoreError, storeFetch } from './store-client'

export type StoreProductVariant = {
  id: string
  title?: string
  calculated_price?: {
    calculated_amount: number
    currency_code: string
  } | null
}

export type StoreProduct = {
  id: string
  title: string
  handle: string
  description?: string | null
  thumbnail?: string | null
  variants?: StoreProductVariant[]
}

type ProductListResponse = {
  products: StoreProduct[]
  count: number
  offset: number
  limit: number
}

const PRODUCT_FIELDS =
  'id,title,handle,description,thumbnail,*variants.calculated_price'

export async function listProducts(options?: {
  limit?: number
  offset?: number
  q?: string
}): Promise<ProductListResponse> {
  assertMercurConfigured()

  return storeFetch<ProductListResponse>('/store/products', {
    searchParams: {
      fields: PRODUCT_FIELDS,
      limit: options?.limit ?? 24,
      offset: options?.offset ?? 0,
      q: options?.q,
    },
  })
}

export async function getProductByHandle(
  handle: string,
): Promise<StoreProduct | null> {
  assertMercurConfigured()

  const data = await storeFetch<ProductListResponse>('/store/products', {
    searchParams: {
      handle,
      fields: PRODUCT_FIELDS,
      limit: 1,
    },
  })

  return data.products[0] ?? null
}

export function formatVariantPrice(variant?: StoreProductVariant): string | null {
  const price = variant?.calculated_price
  if (!price) return null

  const amount = price.calculated_amount / 100
  const code = price.currency_code.toUpperCase()

  if (code === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
  }).format(amount)
}

export function getProductPrice(product: StoreProduct): string | null {
  const variant = product.variants?.[0]
  return formatVariantPrice(variant)
}

export function isMercurStoreError(error: unknown): error is MercurStoreError {
  return error instanceof MercurStoreError
}
