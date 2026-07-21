import { BrandLogo } from '@/components/brand-logo';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useCart } from '@/context/cart-context';
import { useLayout } from '@/hooks/use-layout';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SiteHeaderProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  showSearch?: boolean;
  /** When set, shows this label instead of the brand mark (e.g. Categories). */
  title?: string;
};

export function SiteHeader({
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  showSearch = true,
  title,
}: SiteHeaderProps) {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const { cart } = useCart();
  const { contentPad, isCompact, logoSize } = useLayout();
  const itemCount = cart?.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) ?? 0;
  const iconSize = isCompact ? 22 : 24;

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: Math.max(insets.top, 8) + Spacing.sm,
          paddingHorizontal: contentPad,
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.iconBtn}
          accessibilityLabel="Open menu"
          hitSlop={8}
        >
          <IconSymbol size={iconSize} name="menu" color={colors.text} />
        </TouchableOpacity>

        <View style={styles.center}>
          {title ? (
            <Text
              style={[styles.titleText, { color: colors.text, fontSize: isCompact ? 16 : 18 }]}
              numberOfLines={1}
            >
              {title}
            </Text>
          ) : (
            <BrandLogo size={logoSize} />
          )}
        </View>

        <TouchableOpacity
          onPress={() => router.push('/(drawer)/(tabs)/(cart)' as never)}
          style={styles.iconBtn}
          accessibilityLabel="Open bag"
          hitSlop={8}
        >
          <IconSymbol size={iconSize} name="bag" color={colors.text} />
          {itemCount > 0 ? (
            <View style={[styles.badge, { backgroundColor: colors.tint }]}>
              <Text style={styles.badgeText}>{itemCount > 99 ? '99+' : itemCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      {showSearch ? (
        <View
          style={[
            styles.search,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              minHeight: isCompact ? 40 : 44,
            },
          ]}
        >
          <IconSymbol size={isCompact ? 16 : 18} name="search" color={colors.icon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text, fontSize: isCompact ? 14 : 15 }]}
            placeholder="Search accessories"
            placeholderTextColor={colors.textMuted}
            value={searchValue}
            onChangeText={onSearchChange}
            onSubmitEditing={onSearchSubmit}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    minHeight: 44,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  titleText: {
    fontWeight: '700',
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    width: '100%',
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: 0,
    minWidth: 0,
  },
});
