import { CategoryStrip } from '@/components/category-strip';
import { HomeBanner } from '@/components/home-banner';
import { HomeEditorial, HomeFooterNote } from '@/components/home-editorial';
import { Loading } from '@/components/loading';
import { ProductCard } from '@/components/product-card';
import { SiteHeader } from '@/components/site-header';
import { Colors, FontFamily, Spacing } from '@/constants/theme';
import { useRegion } from '@/context/region-context';
import { useLayout } from '@/hooks/use-layout';
import { listStoreCategories, type StoreCategory } from '@/lib/categories';
import { sdk } from '@/lib/sdk';
import type { HttpTypes } from '@medusajs/types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const colors = Colors.light;
  const { selectedRegion } = useRegion();
  const { columns, contentPad, gridGap, productImageHeight, sectionTitleSize } =
    useLayout();

  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [{ products: fetchedProducts }, cats] = await Promise.all([
        sdk.store.product.list({
          region_id: selectedRegion?.id,
          fields: '*variants.calculated_price,+variants.inventory_quantity',
          limit: 40,
        }),
        listStoreCategories(),
      ]);
      setProducts(fetchedProducts);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to fetch home data:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (selectedRegion) {
      setLoading(true);
      fetchData();
    }
  }, [selectedRegion, fetchData]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.handle?.toLowerCase().includes(q),
    );
  }, [products, search]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const searching = search.trim().length > 0;

  if (loading) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <SiteHeader searchValue={search} onSearchChange={setSearch} />
        <Loading message="Loading products..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <SiteHeader searchValue={search} onSearchChange={setSearch} />
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <SiteHeader searchValue={search} onSearchChange={setSearch} />
      <FlatList
        key={`home-cols-${columns}`}
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={columns}
        columnWrapperStyle={
          columns > 1
            ? [styles.row, { paddingHorizontal: contentPad, gap: gridGap }]
            : undefined
        }
        initialNumToRender={columns * 3}
        maxToRenderPerBatch={columns * 3}
        windowSize={5}
        removeClippedSubviews
        ListHeaderComponent={
          <View>
            <CategoryStrip categories={categories} />
            <HomeBanner />
            {!searching ? <HomeEditorial /> : null}
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                  fontSize: sectionTitleSize,
                  paddingHorizontal: contentPad,
                },
              ]}
            >
              {searching ? 'Search results' : 'New in'}
            </Text>
          </View>
        }
        ListFooterComponent={!searching ? <HomeFooterNote /> : null}
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <ProductCard product={item} imageHeight={productImageHeight} />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {searching ? 'No matches for that search' : 'No products available'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    width: '100%',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sectionTitle: {
    fontFamily: FontFamily.heading,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  listContent: {
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
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
  },
});
