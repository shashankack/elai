import { ProductImageSlider } from '@/components/product-image-slider'
import { ProductSkeleton } from '@/components/product-skeleton'
import { Button } from '@/components/ui/button'
import { Toast } from '@/components/ui/toast'
import { Colors, ElaiPalette, FontFamily, Radii, Spacing } from '@/constants/theme'
import { useCart } from '@/context/cart-context'
import { useRegion } from '@/context/region-context'
import { formatPrice } from '@/lib/format-price'
import { isVariantInStock } from '@/lib/inventory'
import { sdk } from '@/lib/sdk'
import type { HttpTypes } from '@medusajs/types'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type ProductWithExtras = HttpTypes.StoreProduct & {
  material?: string | null
  origin_country?: string | null
  weight?: number | null
  subtitle?: string | null
  categories?: { id?: string; name?: string | null; handle?: string | null }[]
  collection?: { id?: string; title?: string | null } | null
  type?: { id?: string; value?: string | null } | null
}

export default function ProductDetailsScreen() {
  const { id, title } = useLocalSearchParams<{ id: string; title?: string }>()
  const colors = Colors.light
  const insets = useSafeAreaInsets()
  const { addToCart } = useCart()
  const { selectedRegion } = useRegion()
  const navigation = useNavigation()

  const [product, setProduct] = useState<ProductWithExtras | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    {},
  )
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { product: fetchedProduct } = await sdk.store.product.retrieve(id, {
        fields:
          '*variants.calculated_price,+variants.inventory_quantity,*categories,*collection,*type,+material,+origin_country,+weight,+subtitle',
        region_id: selectedRegion?.id,
      })

      setProduct(fetchedProduct as ProductWithExtras)

      if (fetchedProduct.variants && fetchedProduct.variants.length > 0) {
        const firstVariant = fetchedProduct.variants[0]
        const initialOptions: Record<string, string> = {}
        firstVariant.options?.forEach((optionValue) => {
          if (optionValue.option_id && optionValue.value) {
            initialOptions[optionValue.option_id] = optionValue.value
          }
        })
        setSelectedOptions(initialOptions)
      }
    } catch (err) {
      console.error('Failed to fetch product:', err)
      setError('Failed to load product. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [id, selectedRegion])

  useEffect(() => {
    if (id && selectedRegion) {
      fetchProduct()
    }
  }, [id, selectedRegion, fetchProduct])

  useEffect(() => {
    const productTitle = title || product?.title
    if (productTitle) {
      navigation.setOptions({ title: productTitle })
    }
  }, [title, product, navigation])

  const selectedVariant = useMemo(() => {
    if (
      !product?.variants ||
      !product.options ||
      Object.keys(selectedOptions).length !== product.options?.length
    ) {
      return
    }

    return product.variants.find((variant) =>
      variant.options?.every(
        (optionValue) =>
          optionValue.value === selectedOptions[optionValue.option_id!],
      ),
    )
  }, [selectedOptions, product])

  const shouldShowOptions = useMemo(() => {
    if (!product?.options || product.options.length === 0) return false
    return product.options.some((option) => (option.values?.length ?? 0) > 1)
  }, [product])

  const images = useMemo(() => {
    const productImages =
      product?.images?.map((img) => img.url).filter(Boolean) || []
    if (productImages.length === 0 && product?.thumbnail) {
      return [product.thumbnail]
    }
    return productImages.length > 0 ? productImages : []
  }, [product])

  const metaRows = useMemo(() => {
    if (!product) return []
    const rows: { label: string; value: string }[] = []
    if (product.material) rows.push({ label: 'Material', value: product.material })
    if (product.origin_country) {
      rows.push({
        label: 'Origin',
        value: product.origin_country.toUpperCase(),
      })
    }
    if (product.weight != null) {
      rows.push({ label: 'Weight', value: `${product.weight} g` })
    }
    if (product.type?.value) {
      rows.push({ label: 'Type', value: product.type.value })
    }
    if (product.collection?.title) {
      rows.push({ label: 'Collection', value: product.collection.title })
    }
    return rows
  }, [product])

  const primaryCategory = product?.categories?.[0]
  const description = product?.description?.trim() || ''
  const longDescription = description.length > 180

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      setToastMessage(
        shouldShowOptions ? 'Please select all options' : 'Variant not available',
      )
      setToastVisible(true)
      return
    }

    try {
      setAddingToCart(true)
      await addToCart(selectedVariant.id, quantity)
      setToastMessage('Added to bag')
      setToastVisible(true)
    } catch {
      setToastMessage('Failed to add product to bag')
      setToastVisible(true)
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return <ProductSkeleton />
  }

  if (error || !product) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorText, { color: colors.text }]}>
          {error || 'Product not found'}
        </Text>
      </View>
    )
  }

  const priceAmount = selectedVariant?.calculated_price?.calculated_amount || 0
  const currencyCode = selectedRegion?.currency_code
  const isInStock = isVariantInStock(selectedVariant)
  const lowStock =
    isInStock &&
    selectedVariant?.inventory_quantity !== undefined &&
    selectedVariant.inventory_quantity! <= 10 &&
    selectedVariant.manage_inventory !== false

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <ProductImageSlider images={images} aspectRatio={3 / 4} />

        <View style={styles.content}>
          {primaryCategory?.name ? (
            <View
              style={[styles.categoryChip, { backgroundColor: `${colors.tint}18` }]}
            >
              <Text style={[styles.categoryChipText, { color: colors.tint }]}>
                {primaryCategory.name}
              </Text>
            </View>
          ) : null}

          <Text style={[styles.title, { color: colors.text }]}>
            {product.title}
          </Text>

          {product.subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {product.subtitle}
            </Text>
          ) : null}

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.tint }]}>
              {formatPrice(priceAmount, currencyCode)}
            </Text>
            {!isInStock ? (
              <View style={[styles.stockBadge, { backgroundColor: colors.error }]}>
                <Text style={styles.stockBadgeText}>Out of stock</Text>
              </View>
            ) : lowStock ? (
              <View
                style={[styles.stockBadge, { backgroundColor: colors.warning }]}
              >
                <Text style={styles.stockBadgeText}>
                  Only {selectedVariant?.inventory_quantity} left
                </Text>
              </View>
            ) : (
              <View
                style={[styles.stockBadge, { backgroundColor: `${colors.success}22` }]}
              >
                <Text style={[styles.stockBadgeText, { color: colors.success }]}>
                  In stock
                </Text>
              </View>
            )}
          </View>

          {description ? (
            <View style={styles.descriptionBlock}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>
                About
              </Text>
              <Text
                style={[styles.description, { color: colors.textMuted }]}
                numberOfLines={
                  descriptionExpanded || !longDescription ? undefined : 4
                }
              >
                {description}
              </Text>
              {longDescription ? (
                <Pressable
                  onPress={() => setDescriptionExpanded((v) => !v)}
                  hitSlop={8}
                >
                  <Text style={[styles.readMore, { color: colors.tint }]}>
                    {descriptionExpanded ? 'Show less' : 'Read more'}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {shouldShowOptions ? (
            <View style={styles.optionsSection}>
              {product.options?.map((option) => (
                <View key={option.id} style={styles.optionGroup}>
                  <Text style={[styles.sectionLabel, { color: colors.text }]}>
                    {option.title}
                  </Text>
                  <View style={styles.optionValues}>
                    {option.values?.map((optionValue) => {
                      const isSelected =
                        selectedOptions[option.id!] === optionValue.value
                      return (
                        <Pressable
                          key={optionValue.id}
                          style={[
                            styles.optionButton,
                            {
                              backgroundColor: isSelected
                                ? colors.tint
                                : colors.surface,
                              borderColor: isSelected
                                ? colors.tint
                                : colors.border,
                            },
                          ]}
                          onPress={() => {
                            setSelectedOptions((prev) => ({
                              ...prev,
                              [option.id!]: optionValue.value!,
                            }))
                          }}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              {
                                color: isSelected ? '#fff' : colors.text,
                                fontWeight: isSelected ? '700' : '500',
                              },
                            ]}
                          >
                            {optionValue.value}
                          </Text>
                        </Pressable>
                      )
                    })}
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.quantitySection}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              Quantity
            </Text>
            <View
              style={[
                styles.quantityControls,
                { borderColor: colors.border, backgroundColor: colors.surface },
              ]}
            >
              <Pressable
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                hitSlop={8}
              >
                <Text style={[styles.quantityButtonText, { color: colors.text }]}>
                  −
                </Text>
              </Pressable>
              <Text style={[styles.quantity, { color: colors.text }]}>
                {quantity}
              </Text>
              <Pressable
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
                hitSlop={8}
              >
                <Text style={[styles.quantityButtonText, { color: colors.text }]}>
                  +
                </Text>
              </Pressable>
            </View>
          </View>

          {metaRows.length > 0 ? (
            <View
              style={[
                styles.metaCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.sectionLabel, { color: colors.text }]}>
                Details
              </Text>
              {metaRows.map((row) => (
                <View key={row.label} style={styles.metaRow}>
                  <Text style={[styles.metaLabel, { color: colors.textMuted }]}>
                    {row.label}
                  </Text>
                  <Text style={[styles.metaValue, { color: colors.text }]}>
                    {row.value}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View
        style={[
          styles.stickyBar,
          {
            backgroundColor: ElaiPalette.creamDeep,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <View style={styles.stickyPriceCol}>
          <Text style={[styles.stickyLabel, { color: colors.textMuted }]}>
            Total
          </Text>
          <Text style={[styles.stickyPrice, { color: colors.text }]}>
            {formatPrice(priceAmount * quantity, currencyCode)}
          </Text>
        </View>
        <Button
          title={isInStock ? 'Add to bag' : 'Out of stock'}
          onPress={handleAddToCart}
          loading={addingToCart}
          disabled={!isInStock}
          style={styles.stickyButton}
        />
      </View>

      <Toast
        message={toastMessage}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
        type="success"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    marginBottom: Spacing.md,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: FontFamily.heading,
    fontSize: 30,
    lineHeight: 36,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
  },
  stockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.pill,
  },
  stockBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  descriptionBlock: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
  },
  readMore: {
    marginTop: Spacing.sm,
    fontSize: 14,
    fontWeight: '700',
  },
  optionsSection: {
    marginBottom: Spacing.lg,
  },
  optionGroup: {
    marginBottom: Spacing.lg,
  },
  optionValues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radii.pill,
    borderWidth: 1.5,
  },
  optionText: {
    fontSize: 14,
  },
  quantitySection: {
    marginBottom: Spacing.xl,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Radii.pill,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  quantity: {
    minWidth: 36,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  metaCard: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: 8,
  },
  metaLabel: {
    fontSize: 13,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
  },
  stickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  stickyPriceCol: {
    flexShrink: 0,
    minWidth: 88,
  },
  stickyLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  stickyPrice: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  stickyButton: {
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
})
