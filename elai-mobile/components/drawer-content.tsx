import { BrandLogo } from '@/components/brand-logo';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import { useRegion } from '@/context/region-context';
import { useLayout } from '@/hooks/use-layout';
import {
  FALLBACK_SHOP_CATEGORIES,
  listStoreCategories,
  shortCategoryLabel,
  type StoreCategory,
} from '@/lib/categories';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import type { HttpTypes } from '@medusajs/types';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const VENDOR_URL = 'https://vendor.elaai.co/register';

type NavItem = {
  key: string;
  label: string;
  icon: string;
  href: string;
  badge?: number;
};

export function DrawerContent(props: DrawerContentComponentProps) {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { customer } = useAuth();
  const { cart } = useCart();
  const { contentPad, isCompact, logoSize } = useLayout();
  const { regions, selectedRegion, selectedCountryCode, setSelectedRegion } =
    useRegion();

  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [regionOpen, setRegionOpen] = useState(false);

  const itemCount =
    cart?.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) ?? 0;

  useEffect(() => {
    listStoreCategories().then((cats) => {
      setCategories(
        cats.length
          ? cats
          : FALLBACK_SHOP_CATEGORIES.map((c) => ({
              id: `fallback-${c.handle}`,
              name: c.name,
              handle: c.handle,
            })),
      );
    });
  }, []);

  const countries = useMemo(() => {
    const list: {
      countryCode: string;
      countryName: string;
      region: HttpTypes.StoreRegion;
      currencyCode: string;
    }[] = [];
    regions.forEach((region) => {
      region.countries?.forEach((country) => {
        list.push({
          countryCode: country.iso_2 || country.id,
          countryName:
            country.display_name || country.name || country.iso_2 || country.id,
          region,
          currencyCode: region.currency_code || '',
        });
      });
    });
    return list.sort((a, b) => a.countryName.localeCompare(b.countryName));
  }, [regions]);

  const currentCountry =
    countries.find(
      (c) =>
        c.region.id === selectedRegion?.id &&
        c.countryCode === selectedCountryCode,
    ) ?? countries[0];

  const close = () => props.navigation.closeDrawer();

  const go = (href: string) => {
    close();
    router.push(href as never);
  };

  const primaryNav: NavItem[] = [
    {
      key: 'home',
      label: 'Shop',
      icon: 'home',
      href: '/(drawer)/(tabs)/(home)',
    },
    {
      key: 'categories',
      label: 'Categories',
      icon: 'categories',
      href: '/(drawer)/(tabs)/(categories)',
    },
    {
      key: 'bag',
      label: itemCount > 0 ? `Bag (${itemCount})` : 'Bag',
      icon: 'bag',
      href: '/(drawer)/(tabs)/(cart)',
      badge: itemCount,
    },
    {
      key: 'account',
      label: customer ? 'Account' : 'Sign in',
      icon: 'account',
      href: '/(drawer)/(tabs)/(account)',
    },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 8) + Spacing.md,
            paddingHorizontal: contentPad,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View style={styles.brandBlock}>
            <BrandLogo size={logoSize + 8} />
            <Text
              style={[
                styles.tagline,
                { color: colors.textMuted, fontSize: isCompact ? 11 : 12 },
              ]}
            >
              Where every look finds its flavour
            </Text>
          </View>
          <TouchableOpacity
            onPress={close}
            style={styles.closeBtn}
            accessibilityLabel="Close menu"
            hitSlop={12}
          >
            <IconSymbol size={22} name="xmark" color={colors.text} />
          </TouchableOpacity>
        </View>

        <Pressable
          style={[
            styles.accountCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => go('/(drawer)/(tabs)/(account)')}
        >
          <View style={[styles.avatar, { backgroundColor: `${colors.tint}22` }]}>
            <Text style={[styles.avatarText, { color: colors.tint }]}>
              {customer?.first_name?.charAt(0)?.toUpperCase() ||
                customer?.email?.charAt(0)?.toUpperCase() ||
                'E'}
            </Text>
          </View>
          <View style={styles.accountCopy}>
            <Text
              style={[styles.accountTitle, { color: colors.text }]}
              numberOfLines={1}
            >
              {customer
                ? `Hi, ${customer.first_name || customer.email}`
                : 'Welcome to ELAI'}
            </Text>
            <Text
              style={[styles.accountSub, { color: colors.textMuted }]}
              numberOfLines={1}
            >
              {customer ? 'View orders & profile' : 'Sign in for faster checkout'}
            </Text>
          </View>
          <IconSymbol size={18} name="chevron.right" color={colors.textMuted} />
        </Pressable>
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: contentPad }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Menu</Text>
        {primaryNav.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.navRow}
            onPress={() => go(item.href)}
            activeOpacity={0.7}
          >
            <View style={[styles.navIcon, { backgroundColor: colors.surface }]}>
              <IconSymbol size={18} name={item.icon} color={colors.tint} />
            </View>
            <Text style={[styles.navLabel, { color: colors.text }]} numberOfLines={1}>
              {item.label}
            </Text>
            <IconSymbol size={16} name="chevron.right" color={colors.border} />
          </TouchableOpacity>
        ))}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          Shop by category
        </Text>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id || cat.handle}
            style={styles.catRow}
            onPress={() => {
              close();
              router.push({
                pathname: '/(drawer)/(tabs)/(categories)/[handle]' as never,
                params: {
                  handle: cat.handle,
                  name: cat.name,
                  id: cat.id.startsWith('fallback-') ? '' : cat.id,
                },
              } as never);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.catLabel, { color: colors.text }]} numberOfLines={1}>
              {shortCategoryLabel(cat.name, cat.handle)}
            </Text>
            <IconSymbol size={14} name="chevron.right" color={colors.border} />
          </TouchableOpacity>
        ))}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <TouchableOpacity
          style={styles.navRow}
          onPress={() => Linking.openURL(VENDOR_URL)}
          activeOpacity={0.7}
        >
          <View style={[styles.navIcon, { backgroundColor: colors.surface }]}>
            <IconSymbol size={18} name="storefront" color={colors.tint} />
          </View>
          <Text style={[styles.navLabel, { color: colors.text }]}>Sell on Elai</Text>
          <IconSymbol size={16} name="chevron.right" color={colors.border} />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          Country & currency
        </Text>
        <TouchableOpacity
          style={[
            styles.regionToggle,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => setRegionOpen((v) => !v)}
          activeOpacity={0.8}
        >
          <View style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
            <Text style={[styles.regionName, { color: colors.text }]} numberOfLines={1}>
              {currentCountry?.countryName ?? 'Select country'}
            </Text>
            <Text style={[styles.regionMeta, { color: colors.textMuted }]}>
              {(
                currentCountry?.currencyCode ||
                selectedRegion?.currency_code ||
                ''
              ).toUpperCase() || '—'}
            </Text>
          </View>
          <IconSymbol
            size={18}
            name={regionOpen ? 'chevron.up' : 'chevron.down'}
            color={colors.textMuted}
          />
        </TouchableOpacity>

        {regionOpen
          ? countries.map((country) => {
              const selected =
                country.region.id === selectedRegion?.id &&
                country.countryCode === selectedCountryCode;
              return (
                <TouchableOpacity
                  key={`${country.region.id}-${country.countryCode}`}
                  style={[
                    styles.regionOption,
                    selected && { backgroundColor: `${colors.tint}18` },
                  ]}
                  onPress={() => {
                    setSelectedRegion(country.region, country.countryCode);
                    setRegionOpen(false);
                    close();
                  }}
                >
                  <Text
                    style={[
                      styles.regionOptionName,
                      { color: selected ? colors.tint : colors.text, flex: 1 },
                    ]}
                    numberOfLines={1}
                  >
                    {country.countryName}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                    {country.currencyCode.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })
          : null}
      </DrawerContentScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
  },
  header: {
    paddingBottom: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  brandBlock: {
    flex: 1,
    paddingRight: Spacing.md,
    minWidth: 0,
    gap: Spacing.sm,
  },
  tagline: {
    lineHeight: 16,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    width: '100%',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  accountCopy: {
    flex: 1,
    minWidth: 0,
  },
  accountTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  accountSub: {
    fontSize: 12,
    marginTop: 2,
  },
  scroll: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 12,
  },
  navIcon: {
    width: 34,
    height: 34,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    minWidth: 0,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    gap: 8,
  },
  catLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    minWidth: 0,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.md,
  },
  regionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
    width: '100%',
  },
  regionName: {
    fontSize: 15,
    fontWeight: '600',
  },
  regionMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  regionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.sm,
    gap: 8,
  },
  regionOptionName: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 0,
  },
});
