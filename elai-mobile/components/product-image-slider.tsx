import { Colors, Radii } from '@/constants/theme'
import { useLayout } from '@/hooks/use-layout'
import { Image } from 'expo-image'
import React, { useRef, useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'

interface ProductImageSliderProps {
  images: string[]
  /** Height = width / aspectRatio when set (e.g. 3/4). */
  aspectRatio?: number
}

export function ProductImageSlider({
  images,
  aspectRatio,
}: ProductImageSliderProps) {
  const colors = Colors.light
  const { width, isCompact, isTablet } = useLayout()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const imageListRef = useRef<FlatList>(null)
  const imageHeight = aspectRatio
    ? Math.round(width / aspectRatio)
    : isTablet
      ? 480
      : isCompact
        ? 300
        : Math.min(400, Math.round(width * 1.05))

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentImageIndex(viewableItems[0].index || 0)
    }
  }).current

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current

  const renderImageItem = ({ item }: { item: string }) => (
    <View style={{ width }}>
      <Image
        source={{ uri: item }}
        style={{
          width,
          height: imageHeight,
          backgroundColor: colors.imagePlaceholder,
        }}
        contentFit="cover"
      />
    </View>
  )

  if (images.length === 0) {
    return (
      <View
        style={[
          styles.empty,
          {
            width,
            height: imageHeight,
            backgroundColor: colors.imagePlaceholder,
          },
        ]}
      >
        <Text style={{ color: colors.textMuted }}>No image</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        key={`slider-${width}-${imageHeight}`}
        ref={imageListRef}
        data={images}
        renderItem={renderImageItem}
        keyExtractor={(item, index) => `image-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
      {images.length > 1 && (
        <View style={styles.footer}>
          <View style={styles.pagination}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  {
                    backgroundColor:
                      currentImageIndex === index
                        ? colors.tint
                        : 'rgba(255,255,255,0.55)',
                    width: currentImageIndex === index ? 18 : 8,
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {currentImageIndex + 1}/{images.length}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
  },
  counter: {
    backgroundColor: 'rgba(46,62,32,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  counterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
})
