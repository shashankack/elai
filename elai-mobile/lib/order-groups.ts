import { sdk } from '@/lib/sdk'

export type StoreOrderGroupOrder = {
  id: string
  display_id?: number | null
  status?: string | null
  email?: string | null
  currency_code?: string | null
  total?: number | null
  subtotal?: number | null
  shipping_total?: number | null
  tax_total?: number | null
  discount_total?: number | null
  payment_status?: string | null
  created_at?: string | null
  shipping_address?: {
    first_name?: string | null
    last_name?: string | null
    address_1?: string | null
    address_2?: string | null
    city?: string | null
    postal_code?: string | null
    country_code?: string | null
    phone?: string | null
  } | null
  shipping_methods?: { name?: string | null }[] | null
  items?: {
    id: string
    title?: string | null
    product_title?: string | null
    variant_title?: string | null
    quantity?: number
    thumbnail?: string | null
    subtotal?: number | null
  }[]
  fulfillments?: {
    shipped_at?: string | null
    delivered_at?: string | null
    labels?: {
      tracking_number?: string | null
      tracking_url?: string | null
    }[] | null
  }[] | null
  payment_collections?: {
    payments?: { provider_id?: string | null }[] | null
  }[] | null
}

export type StoreOrderGroup = {
  id: string
  display_id?: number | null
  seller_count?: number | null
  total?: number | null
  created_at?: string | null
  currency_code?: string | null
  orders?: StoreOrderGroupOrder[]
}

const ORDER_GROUP_FIELDS = [
  'id',
  'display_id',
  'seller_count',
  'total',
  'created_at',
  '*orders',
  'orders.status',
  'orders.display_id',
  'orders.email',
  'orders.currency_code',
  'orders.total',
  'orders.subtotal',
  'orders.shipping_total',
  'orders.tax_total',
  'orders.discount_total',
  'orders.payment_status',
  'orders.created_at',
  '*orders.items',
  'orders.items.thumbnail',
  'orders.items.title',
  'orders.items.product_title',
  'orders.items.variant_title',
  'orders.items.quantity',
  'orders.items.subtotal',
  '*orders.shipping_address',
  '*orders.shipping_methods',
  '*orders.fulfillments',
  'orders.fulfillments.shipped_at',
  'orders.fulfillments.delivered_at',
  '*orders.fulfillments.labels',
  'orders.fulfillments.labels.tracking_number',
  'orders.fulfillments.labels.tracking_url',
  '*orders.payment_collections',
  '*orders.payment_collections.payments',
].join(',')

export async function listCustomerOrderGroups(options?: {
  limit?: number
}): Promise<StoreOrderGroup[]> {
  const data = await sdk.client.fetch<{
    order_groups?: StoreOrderGroup[]
  }>('/store/order-groups', {
    query: {
      limit: options?.limit ?? 20,
      order: '-created_at',
      fields: ORDER_GROUP_FIELDS,
    },
  })
  return data.order_groups ?? []
}

export async function retrieveCustomerOrderGroup(
  id: string,
): Promise<StoreOrderGroup | null> {
  try {
    const data = await sdk.client.fetch<{ order_group?: StoreOrderGroup }>(
      `/store/order-groups/${id}`,
      {
        query: { fields: ORDER_GROUP_FIELDS },
      },
    )
    return data.order_group ?? null
  } catch {
    return null
  }
}

export function orderGroupLabel(group: StoreOrderGroup): string {
  if (group.display_id != null) return `#${group.display_id}`
  return group.id.slice(-8).toUpperCase()
}

export function orderGroupCurrency(group: StoreOrderGroup): string {
  return (
    group.orders?.find((o) => o.currency_code)?.currency_code ||
    group.currency_code ||
    'inr'
  )
}

export function orderGroupTotal(group: StoreOrderGroup): number {
  if (typeof group.total === 'number') return group.total
  return (group.orders ?? []).reduce((sum, o) => sum + (o.total || 0), 0)
}

/** Flatten group into a StoreOrder-like shape for the confirmation UI. */
export function flattenOrderGroup(group: StoreOrderGroup) {
  const orders = group.orders ?? []
  const primary = orders[0]
  const currency = orderGroupCurrency(group)
  const items = orders.flatMap((o) => o.items || [])
  const fulfillments = orders.flatMap((o) => o.fulfillments || [])
  const paymentProviderId =
    orders
      .flatMap((o) => o.payment_collections || [])
      .flatMap((pc) => pc.payments || [])
      .find((p) => p.provider_id)?.provider_id || null

  return {
    id: group.id,
    display_id: group.display_id ?? primary?.display_id ?? null,
    email: primary?.email || null,
    currency_code: currency,
    status: primary?.status || 'pending',
    payment_status: primary?.payment_status || null,
    created_at: group.created_at || primary?.created_at || null,
    total: orderGroupTotal(group),
    subtotal: orders.reduce((s, o) => s + (o.subtotal || 0), 0),
    shipping_total: orders.reduce((s, o) => s + (o.shipping_total || 0), 0),
    tax_total: orders.reduce((s, o) => s + (o.tax_total || 0), 0),
    discount_total: orders.reduce((s, o) => s + (o.discount_total || 0), 0),
    shipping_address: primary?.shipping_address || null,
    shipping_methods: orders.flatMap((o) => o.shipping_methods || []),
    items,
    fulfillments,
    payment_collections: paymentProviderId
      ? [{ payments: [{ provider_id: paymentProviderId }] }]
      : [],
  }
}
