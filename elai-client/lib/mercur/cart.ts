import { assertMercurConfigured, mercurConfig } from './config'
import { MercurStoreError, storeFetch } from './store-client'

const CART_FIELDS =
  'id,currency_code,region_id,item_total,item_subtotal,subtotal,total,+items.id,+items.title,+items.thumbnail,+items.quantity,+items.unit_price,+items.total,+items.variant_id,+items.variant_title,+items.product_title,+items.product.id,+items.product.handle,+items.product.title,+items.product.thumbnail'

const CART_CREATE_FIELDS = 'id,currency_code,region_id'

export type StoreCartItem = {
  id: string
  title?: string
  subtitle?: string | null
  thumbnail?: string | null
  quantity: number
  variant_id?: string
  product_id?: string
  product_title?: string
  variant_title?: string | null
  unit_price?: number
  total?: number
  product?: { id?: string; title?: string; handle?: string; thumbnail?: string | null }
  variant?: {
    id?: string
    title?: string
    product?: { handle?: string; title?: string; thumbnail?: string | null }
  }
}

export type StoreCart = {
  id: string
  region_id?: string
  currency_code?: string
  email?: string | null
  items?: StoreCartItem[]
  item_total?: number
  item_subtotal?: number
  subtotal?: number
  total?: number
  shipping_total?: number
  tax_total?: number
  shipping_address?: Record<string, unknown> | null
  billing_address?: Record<string, unknown> | null
  shipping_methods?: { id?: string; name?: string; amount?: number }[]
  payment_collection?: {
    id?: string
    amount?: number
    status?: string
    payment_sessions?: {
      id?: string
      provider_id?: string
      status?: string
      data?: Record<string, unknown> | null
    }[]
  } | null
}

type CartResponse = { cart: StoreCart }
type DeleteLineResponse = {
  parent?: StoreCart
  id?: string
  deleted?: boolean
}

type RegionListResponse = {
  regions: { id: string; currency_code?: string; countries?: { iso_2?: string }[] }[]
}

const regionIdFromEnv =
  process.env.NEXT_PUBLIC_MERCUR_REGION_ID ?? process.env.MERCUR_REGION_ID

let cachedRegionId: string | null = null

export async function resolveStoreRegionId(): Promise<string> {
  if (regionIdFromEnv) return regionIdFromEnv
  if (cachedRegionId) return cachedRegionId

  assertMercurConfigured()
  const { regions } = await storeFetch<RegionListResponse>('/store/regions', {
    searchParams: { limit: 50 },
    cache: 'no-store',
  })

  if (!regions?.length) {
    throw new Error('No store regions found. Seed Mercur or set MERCUR_REGION_ID.')
  }

  const india = regions.find(
    (r) =>
      r.currency_code?.toLowerCase() === 'inr' ||
      r.countries?.some((c) => c.iso_2?.toLowerCase() === 'in'),
  )

  cachedRegionId = (india ?? regions[0]).id
  return cachedRegionId
}

export async function createCart(): Promise<StoreCart> {
  assertMercurConfigured()
  const region_id = await resolveStoreRegionId()
  const data = await storeFetch<CartResponse>('/store/carts', {
    method: 'POST',
    body: {
      region_id,
      currency_code: 'inr',
    },
    searchParams: { fields: CART_CREATE_FIELDS },
  })
  return data.cart
}

export async function retrieveCart(cartId: string): Promise<StoreCart> {
  assertMercurConfigured()
  const data = await storeFetch<CartResponse>(`/store/carts/${cartId}`, {
    searchParams: { fields: CART_FIELDS },
    cache: 'no-store',
  })
  return data.cart
}

export async function addLineItem(
  cartId: string,
  variantId: string,
  quantity = 1,
): Promise<StoreCart> {
  assertMercurConfigured()
  const data = await storeFetch<CartResponse>(
    `/store/carts/${cartId}/line-items`,
    {
      method: 'POST',
      body: { variant_id: variantId, quantity },
      searchParams: { fields: CART_FIELDS },
    },
  )
  return data.cart
}

export async function updateLineItem(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<StoreCart> {
  assertMercurConfigured()
  const data = await storeFetch<CartResponse>(
    `/store/carts/${cartId}/line-items/${lineId}`,
    {
      method: 'POST',
      body: { quantity },
      searchParams: { fields: CART_FIELDS },
    },
  )
  return data.cart
}

export async function deleteLineItem(
  cartId: string,
  lineId: string,
): Promise<StoreCart | null> {
  assertMercurConfigured()
  const data = await storeFetch<DeleteLineResponse | CartResponse>(
    `/store/carts/${cartId}/line-items/${lineId}`,
    {
      method: 'DELETE',
      searchParams: { fields: CART_FIELDS },
    },
  )

  if ('cart' in data && data.cart) return data.cart
  if ('parent' in data && data.parent) return data.parent
  // Some Medusa versions delete without returning cart   re-fetch.
  try {
    return await retrieveCart(cartId)
  } catch (error) {
    if (error instanceof MercurStoreError && error.status === 404) return null
    throw error
  }
}

export function getCartItemCount(cart: StoreCart | null | undefined): number {
  if (!cart?.items?.length) return 0
  return cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
}

export function formatCartMoney(
  amount: number | null | undefined,
  currencyCode = 'inr',
): string {
  if (amount == null || Number.isNaN(amount)) return ' '
  const code = currencyCode.toUpperCase()
  // Medusa v2 store amounts are major units for calculated prices;
  // cart totals are also major units in current Mercur builds.
  return new Intl.NumberFormat(code === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: code,
    maximumFractionDigits: code === 'INR' ? 0 : 2,
  }).format(amount)
}

export function getItemUnitPrice(item: StoreCartItem): number | null {
  if (typeof item.unit_price === 'number') return item.unit_price
  if (typeof item.total === 'number' && item.quantity) {
    return item.total / item.quantity
  }
  return null
}

export function getItemTitle(item: StoreCartItem): string {
  return (
    item.product?.title ||
    item.product_title ||
    item.title ||
    item.variant?.product?.title ||
    'Item'
  )
}

export function getItemHandle(item: StoreCartItem): string | null {
  return item.product?.handle || item.variant?.product?.handle || null
}

export function getItemThumbnail(item: StoreCartItem): string | null {
  return (
    item.thumbnail ||
    item.product?.thumbnail ||
    item.variant?.product?.thumbnail ||
    null
  )
}

export function isMercurConfiguredInBrowser(): boolean {
  return Boolean(mercurConfig.publishableApiKey && mercurConfig.backendUrl)
}
