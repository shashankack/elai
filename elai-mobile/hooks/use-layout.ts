import { useWindowDimensions } from 'react-native';

/** Breakpoints aligned to phone / large phone / tablet. */
export const Breakpoints = {
  compact: 360,
  phone: 400,
  tablet: 768,
} as const;

export function useLayout() {
  const { width, height } = useWindowDimensions();
  const isCompact = width < Breakpoints.compact;
  const isTablet = width >= Breakpoints.tablet;
  const isLandscape = width > height;

  const contentPad = isTablet ? 28 : isCompact ? 12 : 16;
  const gridGap = isCompact ? 6 : 8;
  const columns = isTablet ? (isLandscape ? 4 : 3) : 2;

  const productImageHeight = isTablet ? 220 : isCompact ? 140 : Math.min(180, Math.round(width * 0.42));
  const categoryCircle = isCompact ? 52 : isTablet ? 72 : 60;
  const bannerWidth = Math.max(240, width - contentPad * 2);
  const logoSize = isCompact ? 36 : isTablet ? 52 : 44;
  const titleSize = isCompact ? 20 : isTablet ? 28 : 24;
  const sectionTitleSize = isCompact ? 20 : isTablet ? 28 : 24;

  return {
    width,
    height,
    isCompact,
    isTablet,
    isLandscape,
    contentPad,
    gridGap,
    columns,
    productImageHeight,
    categoryCircle,
    bannerWidth,
    logoSize,
    titleSize,
    sectionTitleSize,
  };
}
