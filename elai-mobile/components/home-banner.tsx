import { Colors, FontFamily, Radii, Spacing } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const SLIDES = [
  {
    id: '1',
    eyebrow: 'Accessories marketplace',
    title: 'Where every look finds its flavour',
    cta: 'Shop new in',
  },
  {
    id: '2',
    eyebrow: 'Curated for you',
    title: 'Jewellery to lifestyle — all under one roof',
    cta: 'Browse categories',
  },
  {
    id: '3',
    eyebrow: 'Trend-first picks',
    title: 'Fresh finds for every vibe',
    cta: 'Explore',
  },
];

export function HomeBanner() {
  const colors = Colors.light;
  const router = useRouter();
  const { bannerWidth, contentPad, isCompact, isTablet } = useLayout();
  const [index, setIndex] = useState(0);
  const gap = Spacing.md;
  const slideWidth = bannerWidth;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const next = Math.round(x / (slideWidth + gap));
    if (next !== index && next >= 0 && next < SLIDES.length) {
      setIndex(next);
    }
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        decelerationRate="fast"
        snapToInterval={slideWidth + gap}
        snapToAlignment="start"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.row, { paddingHorizontal: contentPad, gap }]}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {SLIDES.map((slide) => (
          <View
            key={slide.id}
            style={[
              styles.slide,
              {
                width: slideWidth,
                backgroundColor: colors.surface,
                borderColor: colors.border,
                padding: isCompact ? Spacing.lg : Spacing.xl,
                minHeight: isCompact ? 148 : isTablet ? 200 : 168,
              },
            ]}
          >
            <Text
              style={[
                styles.eyebrow,
                { color: colors.tint, fontSize: isCompact ? 11 : 12 },
              ]}
            >
              {slide.eyebrow}
            </Text>
            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                  fontSize: isCompact ? 22 : isTablet ? 30 : 26,
                  lineHeight: isCompact ? 26 : isTablet ? 34 : 30,
                },
              ]}
            >
              {slide.title}
            </Text>
            <TouchableOpacity
              style={[styles.cta, { backgroundColor: colors.tint }]}
              onPress={() => router.push('/(drawer)/(tabs)/(categories)' as never)}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaText}>{slide.cta}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {SLIDES.map((slide, i) => (
          <View
            key={slide.id}
            style={[
              styles.dot,
              {
                backgroundColor: i === index ? colors.tint : colors.border,
                width: i === index ? 16 : 6,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.lg,
    width: '100%',
  },
  row: {
    alignItems: 'stretch',
  },
  slide: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    justifyContent: 'center',
    maxWidth: '100%',
  },
  eyebrow: {
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.heading,
    marginBottom: Spacing.lg,
    flexShrink: 1,
  },
  cta: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radii.pill,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.md,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
