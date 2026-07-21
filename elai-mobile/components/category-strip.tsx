import { Colors, Radii, Spacing } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';
import {
  FALLBACK_SHOP_CATEGORIES,
  shortCategoryLabel,
  type StoreCategory,
} from '@/lib/categories';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const ACCENTS = ['#748956', '#5a6b42', '#8a9b6e', '#6b7a5c', '#9aab7a', '#4f5f3a', '#a8b88c'];

type CategoryStripProps = {
  categories?: StoreCategory[];
};

export function CategoryStrip({ categories }: CategoryStripProps) {
  const colors = Colors.light;
  const router = useRouter();
  const { categoryCircle, contentPad, isCompact } = useLayout();
  const items =
    categories && categories.length > 0
      ? categories
      : FALLBACK_SHOP_CATEGORIES.map((c) => ({
          id: `fallback-${c.handle}`,
          name: c.name,
          handle: c.handle,
        }));

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.row, { paddingHorizontal: contentPad }]}
      >
        {items.map((cat, index) => {
          const label = shortCategoryLabel(cat.name, cat.handle);
          const accent = ACCENTS[index % ACCENTS.length];
          return (
            <TouchableOpacity
              key={cat.id || cat.handle}
              style={[styles.item, { width: categoryCircle + 12 }]}
              activeOpacity={0.75}
              onPress={() =>
                router.push({
                  pathname: '/(drawer)/(tabs)/(categories)/[handle]' as never,
                  params: {
                    handle: cat.handle,
                    name: cat.name,
                    id: cat.id.startsWith('fallback-') ? '' : cat.id,
                  },
                } as never)
              }
            >
              <View
                style={[
                  styles.circle,
                  {
                    width: categoryCircle,
                    height: categoryCircle,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.initial,
                    { color: accent, fontSize: isCompact ? 18 : 22 },
                  ]}
                >
                  {label.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text
                style={[styles.label, { color: colors.text, fontSize: isCompact ? 11 : 12 }]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: Spacing.md,
    width: '100%',
  },
  row: {
    gap: Spacing.md,
  },
  item: {
    alignItems: 'center',
  },
  circle: {
    borderRadius: Radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  initial: {
    fontWeight: '700',
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
  },
});
