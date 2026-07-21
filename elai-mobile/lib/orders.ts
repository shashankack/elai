import type { HttpTypes } from '@medusajs/types';

export type CustomerOrderStatus =
  | 'delivered'
  | 'shipped'
  | 'fulfilled'
  | 'confirmed'
  | 'canceled';

export type OrderStatusPresentation = {
  key: CustomerOrderStatus;
  title: string;
  subtitle: string;
  pill: string;
};

type FulfillmentLike = {
  shipped_at?: string | null;
  delivered_at?: string | null;
  canceled_at?: string | null;
  labels?: {
    tracking_number?: string | null;
    tracking_url?: string | null;
  }[] | null;
};

type OrderLike = {
  status?: string | null;
  fulfillment_status?: string | null;
  fulfillments?: FulfillmentLike[] | null;
};

/** Fields needed to show real shipping/delivery state on store orders. */
export const ORDER_STATUS_FIELDS =
  '+fulfillment_status,*fulfillments,*fulfillments.labels,*payment_collections.payments';

export function resolveCustomerOrderStatus(order: OrderLike): CustomerOrderStatus {
  if (order.status === 'canceled') return 'canceled';

  const fulfillments = order.fulfillments ?? [];
  const anyDelivered = fulfillments.some((f) => Boolean(f.delivered_at));
  const anyShipped = fulfillments.some((f) => Boolean(f.shipped_at));

  const fs = (order.fulfillment_status || '').toLowerCase();

  if (anyDelivered || fs === 'delivered' || fs === 'partially_delivered') {
    return 'delivered';
  }
  if (anyShipped || fs === 'shipped' || fs === 'partially_shipped') {
    return 'shipped';
  }
  if (fs === 'fulfilled' || fs === 'partially_fulfilled') {
    return 'fulfilled';
  }
  if (fs === 'canceled') {
    return 'canceled';
  }
  return 'confirmed';
}

export function presentOrderStatus(order: OrderLike): OrderStatusPresentation {
  const key = resolveCustomerOrderStatus(order);
  switch (key) {
    case 'delivered':
      return {
        key,
        title: 'Delivered',
        subtitle: 'This order has been marked as delivered.',
        pill: 'Delivered',
      };
    case 'shipped':
      return {
        key,
        title: 'Shipped',
        subtitle: 'Your order is on the way.',
        pill: 'Shipped',
      };
    case 'fulfilled':
      return {
        key,
        title: 'Ready to ship',
        subtitle: 'Your order has been packed and will ship soon.',
        pill: 'Packed',
      };
    case 'canceled':
      return {
        key,
        title: 'Canceled',
        subtitle: 'This order was canceled.',
        pill: 'Canceled',
      };
    default:
      return {
        key: 'confirmed',
        title: 'Order confirmed',
        subtitle: 'We have received your order and will process it soon.',
        pill: 'Confirmed',
      };
  }
}

export function orderTrackingLinks(order: OrderLike): { url: string; label: string }[] {
  const links: { url: string; label: string }[] = [];
  const seen = new Set<string>();

  for (const fulfillment of order.fulfillments ?? []) {
    if (!fulfillment.shipped_at && !fulfillment.delivered_at) continue;
    for (const label of fulfillment.labels ?? []) {
      const url = label.tracking_url?.trim();
      if (!url || url === '#' || !/^https?:\/\//i.test(url)) continue;
      if (seen.has(url)) continue;
      seen.add(url);
      links.push({
        url,
        label: label.tracking_number?.trim() || 'Track shipment',
      });
    }
  }

  return links;
}

export function statusPillColors(
  key: CustomerOrderStatus,
  colors: { tint: string; success: string; error: string; textMuted: string },
): { bg: string; text: string } {
  switch (key) {
    case 'delivered':
      return { bg: `${colors.success}22`, text: colors.success };
    case 'shipped':
      return { bg: `${colors.tint}22`, text: colors.tint };
    case 'canceled':
      return { bg: `${colors.error}22`, text: colors.error };
    case 'fulfilled':
      return { bg: `${colors.tint}18`, text: colors.tint };
    default:
      return { bg: `${colors.textMuted}22`, text: colors.textMuted };
  }
}

/** Narrow Medusa store order to the fields we care about for status. */
export function asOrderLike(
  order: HttpTypes.StoreOrder | OrderLike | Record<string, unknown>,
): OrderLike {
  return order as OrderLike;
}
