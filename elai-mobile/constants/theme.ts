/**
 * Elai brand tokens — aligned with elai-client cream / olive palette.
 * Light-only commerce surface (matches the web storefront).
 */

import { Platform } from 'react-native';

export const ElaiPalette = {
  cream: '#fff7d4',
  creamDeep: '#f5e9b8',
  foreground: '#2e3e20',
  highlight: '#748956',
  highlightDeep: '#5a6b42',
  muted: '#6b7a5c',
  border: 'rgba(46, 62, 32, 0.14)',
  surface: '#fffcef',
  card: '#fffcf0',
  imagePlaceholder: '#efe6c4',
  white: '#ffffff',
  error: '#b54a3a',
  warning: '#c48a2a',
  success: '#4a7a45',
} as const;

const brand = {
  text: ElaiPalette.foreground,
  textMuted: ElaiPalette.muted,
  background: ElaiPalette.cream,
  surface: ElaiPalette.surface,
  tint: ElaiPalette.highlight,
  highlight: ElaiPalette.highlight,
  highlightDeep: ElaiPalette.highlightDeep,
  icon: ElaiPalette.muted,
  tabIconDefault: ElaiPalette.muted,
  tabIconSelected: ElaiPalette.highlightDeep,
  border: ElaiPalette.border,
  cardBackground: ElaiPalette.card,
  error: ElaiPalette.error,
  warning: ElaiPalette.warning,
  success: ElaiPalette.success,
  imagePlaceholder: ElaiPalette.imagePlaceholder,
};

export const Colors = {
  light: brand,
  /** Keep a dark key for existing call sites; still Elai cream brand. */
  dark: brand,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radii = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 999,
} as const;

export const FontFamily = {
  heading: 'Kingred',
  body: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }) as string,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
    heading: FontFamily.heading,
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
    heading: FontFamily.heading,
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    heading: FontFamily.heading,
  },
});

export const ElaiNavTheme = {
  dark: false,
  colors: {
    primary: ElaiPalette.highlight,
    background: ElaiPalette.cream,
    card: ElaiPalette.cream,
    text: ElaiPalette.foreground,
    border: ElaiPalette.border,
    notification: ElaiPalette.highlight,
  },
  fonts: {
    regular: {
      fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
      fontWeight: '500' as const,
    },
    bold: {
      fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
      fontWeight: '700' as const,
    },
    heavy: {
      fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
      fontWeight: '800' as const,
    },
  },
};
