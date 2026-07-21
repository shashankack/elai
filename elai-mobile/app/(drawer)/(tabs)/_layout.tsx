import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ElaiPalette } from '@/constants/theme';
import { useCart } from '@/context/cart-context';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const colors = Colors.light;
  const { cart } = useCart();
  const itemCount = cart?.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) ?? 0;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 6,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={focused ? 23 : 22}
              name="home"
              color={color}
              strokeWidth={focused ? 2.1 : 1.7}
            />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="(categories)"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={focused ? 23 : 22}
              name="categories"
              color={color}
              strokeWidth={focused ? 2.1 : 1.7}
            />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="(cart)"
        options={{
          title: 'Bag',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={focused ? 23 : 22}
              name="bag"
              color={color}
              strokeWidth={focused ? 2.1 : 1.7}
            />
          ),
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: ElaiPalette.highlight,
            color: '#fff',
            fontSize: 10,
          },
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="(account)"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={focused ? 23 : 22}
              name="account"
              color={color}
              strokeWidth={focused ? 2.1 : 1.7}
            />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
