import { Loading } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useCart } from '@/context/cart-context';
import { formatPrice } from '@/lib/format-price';
import {
  flattenOrderGroup,
  retrieveCustomerOrderGroup,
} from '@/lib/order-groups';
import {
  asOrderLike,
  ORDER_STATUS_FIELDS,
  orderTrackingLinks,
  presentOrderStatus,
  statusPillColors,
} from '@/lib/orders';
import { getPaymentProviderInfo } from '@/lib/payment-providers';
import { sdk } from '@/lib/sdk';
import type { HttpTypes } from '@medusajs/types';
import { Image } from 'expo-image';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function OrderConfirmationScreen() {
  const { id, fresh, group } = useLocalSearchParams<{
    id: string
    fresh?: string
    group?: string
  }>()
  const router = useRouter()
  const navigation = useNavigation()
  const colors = Colors.light
  const { clearCart } = useCart()

  const [order, setOrder] = useState<HttpTypes.StoreOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasCleared = useRef(false)

  const fetchOrder = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)

      const preferGroup = group === '1'
      if (preferGroup) {
        const orderGroup = await retrieveCustomerOrderGroup(id)
        if (orderGroup) {
          setOrder(flattenOrderGroup(orderGroup) as unknown as HttpTypes.StoreOrder)
          return
        }
      }

      try {
        const { order: fetchedOrder } = await sdk.store.order.retrieve(id, {
          fields: ORDER_STATUS_FIELDS,
        })
        setOrder(fetchedOrder)
      } catch {
        const orderGroup = await retrieveCustomerOrderGroup(id)
        if (!orderGroup) {
          throw new Error('Order not found')
        }
        setOrder(flattenOrderGroup(orderGroup) as unknown as HttpTypes.StoreOrder)
      }
    } catch (err) {
      console.error('Failed to fetch order:', err)
      setError('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }, [id, group])

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id, fetchOrder]);

  // Only clear cart after a fresh checkout — not when reopening from Account.
  useEffect(() => {
    if (fresh === '1' && !hasCleared.current) {
      hasCleared.current = true;
      clearCart();
    }
  }, [fresh, clearCart]);

  const status = useMemo(
    () => (order ? presentOrderStatus(asOrderLike(order)) : null),
    [order],
  );
  const tracking = useMemo(
    () => (order ? orderTrackingLinks(asOrderLike(order)) : []),
    [order],
  );
  const pill = status
    ? statusPillColors(status.key, {
        tint: colors.tint,
        success: colors.success,
        error: colors.error,
        textMuted: colors.textMuted,
      })
    : null;

  useEffect(() => {
    if (status) {
      navigation.setOptions({ title: status.title });
    }
  }, [navigation, status]);

  if (loading) {
    return <Loading message="Loading order details..." />;
  }

  if (error || !order || !status || !pill) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          {error || 'Order not found'}
        </Text>
        <Button
          title="Go to Home"
          onPress={() => {
            router.dismissAll();
            router.replace('/(drawer)/(tabs)/(home)');
          }}
          style={styles.button}
        />
      </View>
    );
  }

  const iconBg =
    status.key === 'canceled'
      ? colors.error
      : status.key === 'delivered'
        ? colors.success
        : colors.tint;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.successIcon, { backgroundColor: iconBg }]}>
          <Text style={styles.checkmark}>
            {status.key === 'canceled' ? '!' : '✓'}
          </Text>
        </View>

        <View style={[styles.statusPill, { backgroundColor: pill.bg }]}>
          <Text style={[styles.statusPillText, { color: pill.text }]}>{status.pill}</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{status.title}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{status.subtitle}</Text>

        {tracking.length > 0 ? (
          <View style={styles.trackingBlock}>
            {tracking.map((link) => (
              <TouchableOpacity
                key={link.url}
                style={[styles.trackBtn, { borderColor: colors.border }]}
                onPress={() => Linking.openURL(link.url)}
              >
                <Text style={[styles.trackBtnText, { color: colors.tint }]}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <Button
          title="Continue Shopping"
          onPress={() => {
            router.dismissAll();
            router.replace('/(drawer)/(tabs)/(home)');
          }}
          style={styles.continueButton}
        />

        <View
          style={[
            styles.card,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>Order Details</Text>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Order ID</Text>
            <Text style={[styles.value, { color: colors.text }]}>#{order.display_id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Status</Text>
            <Text style={[styles.value, { color: pill.text }]}>{status.pill}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Email</Text>
            <Text style={[styles.value, { color: colors.text }]}>{order.email}</Text>
          </View>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>Order Items</Text>

          {order.items?.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.itemRow,
                index === order.items!.length - 1 && styles.lastItemRow,
                { borderBottomColor: colors.border },
              ]}
            >
              <Image
                source={{ uri: item.thumbnail || 'https://via.placeholder.com/60' }}
                style={[styles.itemImage, { backgroundColor: colors.imagePlaceholder }]}
                contentFit="cover"
              />
              <View style={styles.itemInfo}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>
                  {item.product_title || item.title}
                </Text>
                {item.variant_title ? (
                  <Text style={[styles.itemVariant, { color: colors.textMuted }]}>
                    {item.variant_title}
                  </Text>
                ) : null}
                <Text style={[styles.itemQuantity, { color: colors.textMuted }]}>
                  Qty: {item.quantity}
                </Text>
              </View>
              <Text style={[styles.itemPrice, { color: colors.text }]}>
                {formatPrice(item.subtotal, order.currency_code)}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>Shipping</Text>

          {order.shipping_address ? (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Shipping Address</Text>
              <Text style={[styles.addressText, { color: colors.text }]}>
                {order.shipping_address.first_name} {order.shipping_address.last_name}
              </Text>
              <Text style={[styles.addressText, { color: colors.text }]}>
                {order.shipping_address.address_1}
              </Text>
              <Text style={[styles.addressText, { color: colors.text }]}>
                {order.shipping_address.city}, {order.shipping_address.postal_code}
              </Text>
              <Text style={[styles.addressText, { color: colors.text }]}>
                {order.shipping_address.country_code?.toUpperCase()}
              </Text>
            </>
          ) : null}

          {order.shipping_methods && order.shipping_methods.length > 0 ? (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Shipping Method</Text>
              {order.shipping_methods.map((method) => (
                <Text key={method.id} style={[styles.addressText, { color: colors.text }]}>
                  {method.name} - {formatPrice(method.amount || 0, order.currency_code)}
                </Text>
              ))}
            </>
          ) : null}
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>Payment</Text>

          {order.payment_collections && order.payment_collections.length > 0 ? (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
              {order.payment_collections[0].payments?.map((payment) => {
                const providerInfo = getPaymentProviderInfo(payment.provider_id);
                return (
                  <View key={payment.id} style={styles.paymentMethodRow}>
                    <IconSymbol
                      size={20}
                      name={providerInfo.icon as any}
                      color={colors.text}
                    />
                    <Text style={[styles.addressText, { color: colors.text, marginLeft: 8 }]}>
                      {providerInfo.title}
                    </Text>
                  </View>
                );
              })}
            </>
          ) : null}

          {order.billing_address ? (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Billing Address</Text>
              <Text style={[styles.addressText, { color: colors.text }]}>
                {order.billing_address.first_name} {order.billing_address.last_name}
              </Text>
              <Text style={[styles.addressText, { color: colors.text }]}>
                {order.billing_address.address_1}
              </Text>
              <Text style={[styles.addressText, { color: colors.text }]}>
                {order.billing_address.city}, {order.billing_address.postal_code}
              </Text>
              <Text style={[styles.addressText, { color: colors.text }]}>
                {order.billing_address.country_code?.toUpperCase()}
              </Text>
            </>
          ) : null}
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatPrice(order.item_subtotal || 0, order.currency_code)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Discount</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {(order.discount_total || 0) > 0 ? '-' : ''}
              {formatPrice(order.discount_total || 0, order.currency_code)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Shipping</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatPrice(order.shipping_total || 0, order.currency_code)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Tax</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatPrice(order.tax_total || 0, order.currency_code)}
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.tint }]}>
              {formatPrice(order.total, order.currency_code)}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  checkmark: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    marginBottom: Spacing.sm,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  trackingBlock: {
    width: '100%',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  trackBtn: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  trackBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
  continueButton: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  button: {
    marginTop: Spacing.lg,
    minWidth: 180,
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  lastItemRow: {
    borderBottomWidth: 0,
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: Radii.sm,
  },
  itemInfo: {
    flex: 1,
    marginHorizontal: Spacing.md,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemVariant: {
    fontSize: 12,
    marginTop: 2,
  },
  itemQuantity: {
    fontSize: 12,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
