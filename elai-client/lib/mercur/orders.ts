import { assertMercurConfigured } from './config'
import { storeFetch } from './store-client'

export type StoreOrderFulfillmentLabel = {
  tracking_number?: string | null
  tracking_url?: string | null
}

export type StoreOrderFulfillment = {
  id?: string
  shipped_at?: string | null
  delivered_at?: string | null
  labels?: StoreOrderFulfillmentLabel[] | null
}

export type StoreOrderGroupOrder = {
  id: string
  display_id?: number | null
  status?: string | null
  currency_code?: string | null
  total?: number | null
  seller?: { id?: string; name?: string | null } | null
  items?: {
    id: string
    title?: string | null
    quantity?: number
    thumbnail?: string | null
  }[]
  fulfillments?: StoreOrderFulfillment[] | null
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

type OrderGroupListResponse = {
  order_groups: StoreOrderGroup[]
  count?: number
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
  'orders.currency_code',
  'orders.total',
  'orders.seller.id',
  'orders.seller.name',
  '*orders.items',
  'orders.items.thumbnail',
  'orders.items.title',
  'orders.items.quantity',
  '*orders.fulfillments',
  'orders.fulfillments.shipped_at',
  'orders.fulfillments.delivered_at',
  '*orders.fulfillments.labels',
  'orders.fulfillments.labels.tracking_number',
  'orders.fulfillments.labels.tracking_url',
].join(',')

export async function listCustomerOrderGroups(
  token: string,
  options?: { limit?: number },
): Promise<{ order_groups: StoreOrderGroup[]; count: number }> {
  assertMercurConfigured()
  const data = await storeFetch<OrderGroupListResponse>('/store/order-groups', {
    token,
    searchParams: {
      limit: options?.limit ?? 10,
      order: '-created_at',
      fields: ORDER_GROUP_FIELDS,
    },
    cache: 'no-store',
  })

  return {
    order_groups: data.order_groups ?? [],
    count: data.count ?? data.order_groups?.length ?? 0,
  }
}

export async function retrieveCustomerOrderGroup(
  token: string,
  orderGroupId: string,
): Promise<StoreOrderGroup | null> {
  assertMercurConfigured()
  try {
    const data = await storeFetch<{ order_group: StoreOrderGroup }>(
      `/store/order-groups/${orderGroupId}`,
      {
        token,
        searchParams: { fields: ORDER_GROUP_FIELDS },
        cache: 'no-store',
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

export function summarizeOrderStatuses(group: StoreOrderGroup): string {
  const statuses = (group.orders ?? [])
    .map((o) => o.status)
    .filter((s): s is string => Boolean(s))
  if (!statuses.length) return 'Placed'
  const unique = [...new Set(statuses)]
  if (unique.length === 1) return titleCase(unique[0])
  return unique.map(titleCase).join(' · ')
}

/** Collect courier tracking links from shipped fulfillments in an order group. */
export function orderGroupTrackingLinks(group: StoreOrderGroup): {
  url: string
  label: string
}[] {
  const links: { url: string; label: string }[] = []
  const seen = new Set<string>()

  for (const order of group.orders ?? []) {
    for (const fulfillment of order.fulfillments ?? []) {
      if (!fulfillment.shipped_at && !fulfillment.delivered_at) continue
      for (const label of fulfillment.labels ?? []) {
        const url = label.tracking_url?.trim()
        if (!url || url === '#' || !/^https?:\/\//i.test(url)) continue
        if (seen.has(url)) continue
        seen.add(url)
        links.push({
          url,
          label: label.tracking_number?.trim() || 'Track shipment',
        })
      }
    }
  }

  return links
}

export function orderGroupIsShipped(group: StoreOrderGroup): boolean {
  return (group.orders ?? []).some((order) =>
    (order.fulfillments ?? []).some(
      (f) => Boolean(f.shipped_at) || Boolean(f.delivered_at),
    ),
  )
}

function titleCase(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
