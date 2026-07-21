import { CartItem } from '@/components/cart-item';
import { Loading } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { Colors, FontFamily, Spacing } from '@/constants/theme';
import { useCart } from '@/context/cart-context';
import { formatPrice } from '@/lib/format-price';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function CartScreen() {
  const colors = Colors.light;
  const router = useRouter();
  const { cart, updateItemQuantity, removeItem, loading } = useCart();

  const isEmpty = !cart?.items || cart.items.length === 0;

  if (loading && !cart) {
    return <Loading message="Loading bag..." />;
  }

  if (isEmpty) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Your bag is empty</Text>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          Find accessories that finish the look
        </Text>
        <Button
          title="Continue shopping"
          onPress={() => router.push('/(drawer)/(tabs)/(home)' as never)}
          style={styles.browseButton}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            currencyCode={cart.currency_code}
            onUpdateQuantity={(quantity) => updateItemQuantity(item.id, quantity)}
            onRemove={() => removeItem(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />

      <View
        style={[
          styles.footer,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.textMuted }]}>Subtotal</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>
              {formatPrice(cart.item_subtotal, cart.currency_code)}
            </Text>
          </View>
          {cart.tax_total !== undefined && cart.tax_total > 0 && (
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.textMuted }]}>Tax</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>
                {formatPrice(cart.tax_total, cart.currency_code)}
              </Text>
            </View>
          )}
          {cart.shipping_total !== undefined && cart.shipping_total > 0 && (
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.textMuted }]}>Shipping</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>
                {formatPrice(cart.shipping_total, cart.currency_code)}
              </Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.grandTotalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.grandTotalValue, { color: colors.tint }]}>
              {formatPrice(cart.total, cart.currency_code)}
            </Text>
          </View>
        </View>
        <Button
          title="Proceed to checkout"
          onPress={() => router.push('/checkout')}
          loading={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontFamily: FontFamily.heading,
    fontSize: 26,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
  },
  browseButton: {
    minWidth: 200,
  },
  listContent: {
    paddingBottom: 20,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  totals: {
    marginBottom: Spacing.lg,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 14,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  grandTotalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
});
