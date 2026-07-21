import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router';
import React from 'react';

export default function HomeStackLayout() {
  const colors = Colors.light;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text, fontWeight: '600' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="product/[id]"
        options={{
          title: 'Product',
          presentation: 'card',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
    </Stack>
  );
}
