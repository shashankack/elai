import { Loading } from '@/components/loading';
import { ProductCard } from '@/components/product-card';
import { Colors, FontFamily, Spacing } from '@/constants/theme';
import { useRegion } from '@/context/region-context';
import { useLayout } from '@/hooks/use-layout';
import { listStoreCategories } from '@/lib/categories';
import { sdk } from '@/lib/sdk';
import type { HttpTypes } from '@medusajs/types';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

export default function CategoryProductsScreen() {
  const colors = Colors.light;
  const navigation = useNavigation();
  const { selectedRegion } = useRegion();
  const { columns, contentPad, gridGap, productImageHeight, sectionTitleSize } =
    useLayout();
  const { handle, name, id } = useLocalSearchParams<{
    handle: string;
    name?: string;
    id?: string;
  }>();

  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({
      title: name || handle || 'Category',
    });
  }, [navigation, name, handle]);

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      let categoryId = id && id.length > 0 ? id : undefined;

      if (!categoryId && handle) {
        const cats = await listStoreCategories();
        const match = cats.find((c) => c.handle === handle);
        if (match && !match.id.startsWith('fallback-')) {
          categoryId = match.id;
        }
      }

      const query: Record<string, unknown> = {
        region_id: selectedRegion?.id,
        fields: '*variants.calculated_price,+variants.inventory_quantity',
        limit: 40,
      };
      if (categoryId) {
        query.category_id = [categoryId];
      }

      const { products: fetched } = await sdk.store.product.list(query as never);

      if (!categoryId && handle) {
        const filtered = fetched.filter((p) =>
          (p.categories ?? []).some((c) => c.handle === handle),
        );
        setProducts(filtered.length ? filtered : fetched);
      } else {
        setProducts(fetched);
      }
    } catch (err) {
      console.error('Failed to load category products:', err);
      setError('Failed to load products.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [handle, id, selectedRegion]);

  useEffect(() => {
    if (selectedRegion) {
      setLoading(true);
      fetchProducts();
    }
  }, [selectedRegion, fetchProducts]);

  if (loading) {
    return <Loading message="Loading products..." />;
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <FlatList
        key={`plp-cols-${columns}`}
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={columns}
        columnWrapperStyle={
          columns > 1
            ? [styles.row, { paddingHorizontal: contentPad, gap: gridGap }]
            : undefined
        }
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text
            style={[
              styles.heading,
              {
                color: colors.text,
                fontSize: sectionTitleSize + 2,
                paddingHorizontal: contentPad,
              },
            ]}
          >
            {name || handle}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <ProductCard product={item} imageHeight={productImageHeight} />
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchProducts();
            }}
            tintColor={colors.tint}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: colors.textMuted }}>
              No products in this category yet
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, width: '100%' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  list: {
    paddingBottom: Spacing.xxl,
    width: '100%',
  },
  row: {
    marginBottom: Spacing.sm,
  },
  cell: {
    flex: 1,
    minWidth: 0,
  },
  heading: {
    fontFamily: FontFamily.heading,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
});
