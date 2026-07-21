import { assertMercurConfigured } from './config'
import { storeFetch } from './store-client'
import type { StoreCart } from './cart'
import type { StoreOrderGroup } from './orders'
import type { AddressInput } from './addresses'

const CHECKOUT_CART_FIELDS = [
  'id',
  'currency_code',
  'region_id',
  'email',
  'item_total',
  'item_subtotal',
  'subtotal',
  'total',
  'shipping_total',
  'tax_total',
  '+items.id',
  '+items.title',
  '+items.thumbnail',
  '+items.quantity',
  '+items.unit_price',
  '+items.total',
  '+items.variant_id',
  '+items.product_title',
  '+items.product.handle',
  '+items.product.thumbnail',
  '*shipping_address',
  '*billing_address',
  '*shipping_methods',
  'payment_collection.id',
  'payment_collection.amount',
  'payment_collection.status',
  '*payment_collection.payment_sessions',
].join(',')

export type CartAddressPayload = {
  first_name: string
  last_name: string
  phone: string
  address_1: string
  address_2?: string
  city: string
  province?: string
  postal_code: string
  country_code: string
  company?: string
}

export type StoreShippingOption = {
  id: string
  name?: string | null
  amount?: number | null
  price_type?: string | null
  data?: Record<string, unknown> | null
  provider_id?: string | null
}

export type SellerShippingOptionsMap = Record<string, StoreShippingOption[]>

export type StorePaymentProvider = {
  id: string
  is_enabled?: boolean
}

export type StorePaymentSession = {
  id: string
  provider_id?: string
  status?: string
  amount?: number
  currency_code?: string
  data?: Record<string, unknown> | null
}

export type StorePaymentCollection = {
  id: string
  amount?: number
  status?: string
  payment_sessions?: StorePaymentSession[]
}

type CartResponse = { cart: StoreCart }
type ShippingOptionsResponse = { shipping_options: SellerShippingOptionsMap }
type PaymentProvidersResponse = { payment_providers: StorePaymentProvider[] }
type PaymentCollectionResponse = { payment_collection: StorePaymentCollection }

export type CompleteCartResult =
  | { type: 'order_group'; order_group: StoreOrderGroup }
  | {
      type: 'cart'
      cart: StoreCart
      error?: { message?: string; type?: string; name?: string }
    }

export const RAZORPAY_PROVIDER_ID = 'pp_razorpay_razorpay'
export const SYSTEM_PROVIDER_ID = 'pp_system_default'

export function addressInputToCartPayload(
  input: AddressInput & { first_name?: string; last_name?: string; phone?: string },
): CartAddressPayload {
  return {
    first_name: (input.first_name || '').trim(),
    last_name: (input.last_name || '').trim(),
    phone: (input.phone || '').trim(),
    address_1: input.address_1.trim(),
    address_2: input.address_2?.trim() || undefined,
    city: input.city.trim(),
    province: input.province?.trim() || undefined,
    postal_code: input.postal_code.trim(),
    country_code: (input.country_code || 'in').toLowerCase(),
    company: input.company?.trim() || undefined,
  }
}

export async function updateCartCheckout(
  cartId: string,
  input: {
    email?: string
    shipping_address?: CartAddressPayload
    billing_address?: CartAddressPayload
  },
  token?: string | null,
): Promise<StoreCart> {
  assertMercurConfigured()
  const data = await storeFetch<CartResponse>(`/store/carts/${cartId}`, {
    method: 'POST',
    token,
    body: {
      email: input.email?.trim().toLowerCase() || undefined,
      shipping_address: input.shipping_address,
      billing_address: input.billing_address,
    },
    searchParams: { fields: CHECKOUT_CART_FIELDS },
    cache: 'no-store',
  })
  return data.cart
}

export async function listSellerShippingOptions(
  cartId: string,
): Promise<SellerShippingOptionsMap> {
  assertMercurConfigured()
  const data = await storeFetch<ShippingOptionsResponse>(
    '/store/shipping-options',
    {
      searchParams: { cart_id: cartId },
      cache: 'no-store',
    },
  )
  return data.shipping_options ?? {}
}

export async function addShippingMethod(
  cartId: string,
  optionId: string,
  token?: string | null,
): Promise<StoreCart> {
  assertMercurConfigured()
  const data = await storeFetch<CartResponse>(
    `/store/carts/${cartId}/shipping-methods`,
    {
      method: 'POST',
      token,
      body: { option_id: optionId },
      searchParams: { fields: CHECKOUT_CART_FIELDS },
      cache: 'no-store',
    },
  )
  return data.cart
}

/** Add one shipping option per seller (Mercur marketplace requirement). */
export async function addShippingMethodsForSellers(
  cartId: string,
  optionIds: string[],
  token?: string | null,
): Promise<StoreCart | null> {
  let cart: StoreCart | null = null
  for (const optionId of optionIds) {
    cart = await addShippingMethod(cartId, optionId, token)
  }
  return cart
}

export async function listPaymentProviders(
  regionId: string,
): Promise<StorePaymentProvider[]> {
  assertMercurConfigured()
  const data = await storeFetch<PaymentProvidersResponse>(
    '/store/payment-providers',
    {
      searchParams: { region_id: regionId },
      cache: 'no-store',
    },
  )
  return (data.payment_providers ?? []).filter((p) => p.is_enabled !== false)
}

export async function createPaymentCollection(
  cartId: string,
  token?: string | null,
): Promise<StorePaymentCollection> {
  assertMercurConfigured()
  const data = await storeFetch<PaymentCollectionResponse>(
    '/store/payment-collections',
    {
      method: 'POST',
      token,
      body: { cart_id: cartId },
      cache: 'no-store',
    },
  )
  return data.payment_collection
}

export async function initiatePaymentSession(
  paymentCollectionId: string,
  providerId: string,
  sessionData?: Record<string, unknown>,
  token?: string | null,
): Promise<StorePaymentCollection> {
  assertMercurConfigured()
  const data = await storeFetch<PaymentCollectionResponse>(
    `/store/payment-collections/${paymentCollectionId}/payment-sessions`,
    {
      method: 'POST',
      token,
      body: {
        provider_id: providerId,
        data: sessionData,
      },
      cache: 'no-store',
    },
  )
  return data.payment_collection
}

export async function ensurePaymentSession(
  cartId: string,
  providerId: string,
  token?: string | null,
  sessionData?: Record<string, unknown>,
  existingCollectionId?: string | null,
): Promise<{
  payment_collection: StorePaymentCollection
  payment_session: StorePaymentSession | null
}> {
  const collectionId =
    existingCollectionId ||
    (await createPaymentCollection(cartId, token)).id
  const updated = await initiatePaymentSession(
    collectionId,
    providerId,
    sessionData,
    token,
  )
  const session =
    updated.payment_sessions?.find((s) => s.provider_id === providerId) ||
    updated.payment_sessions?.[0] ||
    null
  return { payment_collection: updated, payment_session: session }
}

export async function confirmRazorpayPayment(
  cartId: string,
  payment: {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  },
  token?: string | null,
): Promise<StorePaymentSession> {
  assertMercurConfigured()
  const data = await storeFetch<{ payment_session: StorePaymentSession }>(
    `/store/carts/${cartId}/razorpay/confirm`,
    {
      method: 'POST',
      token,
      body: {
        razorpay_payment_id: payment.razorpay_payment_id,
        razorpay_order_id: payment.razorpay_order_id,
        razorpay_signature: payment.razorpay_signature,
      },
      cache: 'no-store',
    },
  )
  return data.payment_session
}

export async function completeCart(
  cartId: string,
  token?: string | null,
): Promise<CompleteCartResult> {
  assertMercurConfigured()
  const data = await storeFetch<CompleteCartResult>(
    `/store/carts/${cartId}/complete`,
    {
      method: 'POST',
      token,
      body: {},
      cache: 'no-store',
    },
  )
  return data
}

export function pickPreferredProvider(
  providers: StorePaymentProvider[],
): StorePaymentProvider | null {
  if (!providers.length) return null
  const razorpay = providers.find((p) => p.id === RAZORPAY_PROVIDER_ID)
  if (razorpay) return razorpay
  const system = providers.find((p) => p.id === SYSTEM_PROVIDER_ID)
  return system || providers[0]
}

export function isRazorpayProvider(providerId: string | null | undefined): boolean {
  return Boolean(providerId && providerId.includes('razorpay'))
}
