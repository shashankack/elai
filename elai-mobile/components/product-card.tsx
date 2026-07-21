import { Colors, Radii, Spacing } from '@/constants/theme';
import { useRegion } from '@/context/region-context';
import { useLayout } from '@/hooks/use-layout';
import { formatPrice } from '@/lib/format-price';
import type { HttpTypes } from '@medusajs/types';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProductCardProps {
  product: HttpTypes.StoreProduct;
  /** Override image height from parent grid layout. */
  imageHeight?: number;
}

export const ProductCard = React.memo(function ProductCard({
  product,
  imageHeight,
}: ProductCardProps) {
  const router = useRouter();
  const colors = Colors.light;
  const { selectedRegion } = useRegion();
  const { productImageHeight, isCompact } = useLayout();

  const thumbnail = product.thumbnail || product.images?.[0]?.url;
  const variant = product.variants?.[0];
  const priceAmount = variant?.calculated_price?.calculated_amount || 0;
  const currencyCode = selectedRegion?.currency_code;
  const imgH = imageHeight ?? productImageHeight;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
          maxWidth: '100%',
        },
      ]}
      onPress={() =>
        router.push({
          pathname: `/(drawer)/(tabs)/(home)/product/${product.id}` as never,
          params: { title: product.title },
        })
      }
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: thumbnail || 'https://via.placeholder.com/200' }}
        style={[
          styles.image,
          { backgroundColor: colors.imagePlaceholder, height: imgH },
        ]}
        contentFit="cover"
      />
      <View style={[styles.content, { padding: isCompact ? Spacing.sm : Spacing.md }]}>
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              fontSize: isCompact ? 12 : 13,
              minHeight: isCompact ? 32 : 36,
            },
          ]}
          numberOfLines={2}
        >
          {product.title}
        </Text>
        <Text style={[styles.price, { color: colors.tint, fontSize: isCompact ? 13 : 14 }]}>
          {formatPrice(priceAmount, currencyCode)}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: Radii.md,
    borderWidth: 1,
    minWidth: 0,
  },
  image: {
    width: '100%',
  },
  content: {
    gap: 4,
  },
  title: {
    fontWeight: '600',
    lineHeight: 18,
  },
  price: {
    fontWeight: '700',
  },
});
