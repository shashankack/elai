import { Colors, FontFamily } from '@/constants/theme';
import { Stack } from 'expo-router';
import React from 'react';

export default function AccountLayout() {
  const colors = Colors.light;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
          fontFamily: FontFamily.heading,
          fontSize: 22,
        },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Account' }} />
    </Stack>
  );
}
