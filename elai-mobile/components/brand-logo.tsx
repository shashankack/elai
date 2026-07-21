import { Image } from 'expo-image';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useLayout } from '@/hooks/use-layout';

type BrandLogoProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Elai mark from elai-client/public/logo.png — scales with screen size by default.
 */
export function BrandLogo({ size, style }: BrandLogoProps) {
  const { logoSize } = useLayout();
  const dim = size ?? logoSize;

  return (
    <View style={[styles.wrap, { width: dim, height: dim }, style]} accessibilityLabel="ELAI">
      <Image
        source={require('../assets/images/logo.png')}
        style={{ width: dim, height: dim }}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
