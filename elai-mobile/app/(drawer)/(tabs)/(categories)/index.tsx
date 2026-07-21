import { Loading } from '@/components/loading';
import { SiteHeader } from '@/components/site-header';
import { Colors, FontFamily, Radii, Spacing } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';
import {
  FALLBACK_SHOP_CATEGORIES,
  listStoreCategories,
  shortCategoryLabel,
  type StoreCategory,
} from '@/lib/categories';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const ACCENTS = ['#748956', '#5a6b42', '#8a9b6e', '#6b7a5c', '#9aab7a', '#4f5f3a', '#a8b88c'];

export default function CategoriesScreen() {
  const colors = Colors.light;
  const router = useRouter();
  const { columns, contentPad, gridGap, isCompact, sectionTitleSize } = useLayout();
  const catColumns = Math.min(columns, 3);

  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      const cats = await listStoreCategories();
      setCategories(
        cats.length
          ? cats
          : FALLBACK_SHOP_CATEGORIES.map((c) => ({
              id: `fallback-${c.handle}`,
              name: c.name,
              handle: c.handle,
            })),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q),
    );
  }, [categories, search]);

  if (loading) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <SiteHeader title="Categories" searchValue={search} onSearchChange={setSearch} />
        <Loading message="Loading categories..." />
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <SiteHeader title="Categories" searchValue={search} onSearchChange={setSearch} />
      <FlatList
        key={`cat-cols-${catColumns}`}
        data={filtered}
        keyExtractor={(item) => item.id || item.handle}
        numColumns={catColumns}
        columnWrapperStyle={
          catColumns > 1
            ? [styles.row, { paddingHorizontal: contentPad, gap: gridGap }]
            : undefined
        }
        contentContainerStyle={[styles.list, { paddingBottom: Spacing.xxl }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.tint}
          />
        }
        ListHeaderComponent={
          <Text
            style={[
              styles.intro,
              {
                color: colors.text,
                fontSize: sectionTitleSize,
                paddingHorizontal: contentPad,
              },
            ]}
          >
            Shop by accessory category
          </Text>
        }
        renderItem={({ item, index }) => {
          const accent = ACCENTS[index % ACCENTS.length];
          const label = shortCategoryLabel(item.name, item.handle);
          return (
            <TouchableOpacity
              style={[
                styles.tile,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  minHeight: isCompact ? 120 : 140,
                  padding: isCompact ? Spacing.md : Spacing.lg,
                },
              ]}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: '/(drawer)/(tabs)/(categories)/[handle]' as any,
                  params: {
                    handle: item.handle,
                    name: item.name,
                    id: item.id.startsWith('fallback-') ? '' : item.id,
                  },
                })
              }
            >
              <View style={[styles.orb, { backgroundColor: `${accent}22` }]}>
                <Text style={[styles.orbText, { color: accent }]}>
                  {label.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text
                style={[
                  styles.tileTitle,
                  { color: colors.text, fontSize: isCompact ? 13 : 15 },
                ]}
                numberOfLines={2}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: colors.textMuted }}>No categories found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, width: '100%' },
  list: {
    width: '100%',
  },
  intro: {
    fontFamily: FontFamily.heading,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  row: {
    marginBottom: Spacing.sm,
  },
  tile: {
    flex: 1,
    minWidth: 0,
    borderRadius: Radii.lg,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  orb: {
    width: 48,
    height: 48,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  orbText: {
    fontSize: 20,
    fontWeight: '700',
  },
  tileTitle: {
    fontWeight: '700',
    lineHeight: 20,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
});
