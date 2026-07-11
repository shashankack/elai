import { assertMercurConfigured } from './config'
import { getStoreRegionId } from './regions'
import { MercurStoreError, storeFetch } from './store-client'

export type StoreProductImage = {
  id?: string
  url: string
}

export type StoreProductVariant = {
  id: string
  title?: string
  sku?: string | null
  calculated_price?: {
    calculated_amount: number
    currency_code: string
  } | null
  options?: { value?: string; option?: { title?: string } }[]
}

export type StoreProduct = {
  id: string
  title: string
  handle: string
  subtitle?: string | null
  description?: string | null
  thumbnail?: string | null
  material?: string | null
  origin_country?: string | null
  weight?: number | null
  images?: StoreProductImage[]
  variants?: StoreProductVariant[]
  collection?: { id?: string; title?: string } | null
  type?: { id?: string; value?: string } | null
  tags?: { id?: string; value?: string }[]
}

type ProductListResponse = {
  products: StoreProduct[]
  count: number
  offset: number
  limit: number
}

const PRODUCT_LIST_FIELDS =
  'id,title,handle,description,thumbnail,*variants.calculated_price'

const PRODUCT_DETAIL_FIELDS = [
  'id',
  'title',
  'handle',
  'subtitle',
  'description',
  'thumbnail',
  'material',
  'origin_country',
  'weight',
  '*images',
  '*variants.calculated_price',
  '*variants.options',
  '*variants.options.option',
  '*collection',
  '*type',
  '*tags',
].join(',')

export async function listProducts(options?: {
  limit?: number
  offset?: number
  q?: string
}): Promise<ProductListResponse> {
  assertMercurConfigured()
  const region_id = await getStoreRegionId()

  return storeFetch<ProductListResponse>('/store/products', {
    searchParams: {
      region_id,
      fields: PRODUCT_LIST_FIELDS,
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
  const region_id = await getStoreRegionId()

  const data = await storeFetch<ProductListResponse>('/store/products', {
    searchParams: {
      region_id,
      handle,
      fields: PRODUCT_DETAIL_FIELDS,
      limit: 1,
    },
  })

  return data.products[0] ?? null
}

export async function listRelatedProducts(
  product: StoreProduct,
  limit = 4,
): Promise<StoreProduct[]> {
  const { products } = await listProducts({ limit: limit + 8 })
  return products.filter((p) => p.id !== product.id).slice(0, limit)
}

export function getProductImages(product: StoreProduct): string[] {
  const urls: string[] = []
  if (product.thumbnail) urls.push(product.thumbnail)
  for (const image of product.images ?? []) {
    if (image.url && !urls.includes(image.url)) urls.push(image.url)
  }
  return urls
}

export function formatVariantPrice(variant?: StoreProductVariant): string | null {
  const price = variant?.calculated_price
  if (price?.calculated_amount == null) return null

  // Medusa v2 calculated_amount is already in major currency units (e.g. 1000 = ₹1000).
  const amount = price.calculated_amount
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
