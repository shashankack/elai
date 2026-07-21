import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { type StyleProp, type TextStyle } from 'react-native';

/**
 * Semantic names → Feather outline icons.
 * Feather ships with Expo (@expo/vector-icons) and matches the thin
 * stroke look of Lucide on the web storefront — without Metro/package issues.
 */
const ICONS = {
  home: 'home',
  'house.fill': 'home',
  bag: 'shopping-bag',
  'bag.fill': 'shopping-bag',
  'cart.fill': 'shopping-bag',
  account: 'user',
  'person.fill': 'user',
  categories: 'grid',
  'square.grid.2x2.fill': 'grid',
  menu: 'menu',
  'line.3.horizontal': 'menu',
  search: 'search',
  magnifyingglass: 'search',
  trash: 'trash-2',
  close: 'x',
  xmark: 'x',
  'xmark.circle.fill': 'x',
  'chevron.right': 'chevron-right',
  'chevron.down': 'chevron-down',
  'chevron.up': 'chevron-up',
  creditcard: 'credit-card',
  'creditcard.fill': 'credit-card',
  storefront: 'shopping-bag',
} as const;

export type AppIconName = keyof typeof ICONS;

type IconSymbolProps = {
  name: AppIconName | string;
  size?: number;
  color: string;
  /** Kept for call-site compatibility; Feather uses a fixed stroke weight. */
  strokeWidth?: number;
  style?: StyleProp<TextStyle>;
};

export function IconSymbol({
  name,
  size = 22,
  color,
  style,
}: IconSymbolProps) {
  const glyph = ICONS[name as AppIconName] ?? 'circle';
  return <Feather name={glyph} size={size} color={color} style={style} />;
}
