import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AuthProvider } from '@/context/auth-context';
import { CartProvider } from '@/context/cart-context';
import { RegionProvider } from '@/context/region-context';
import { Colors, ElaiNavTheme, ElaiPalette } from '@/constants/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Kingred: require('../assets/fonts/Kingred.otf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const colors = Colors.light;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: ElaiPalette.cream }}>
      <ThemeProvider value={ElaiNavTheme as React.ComponentProps<typeof ThemeProvider>['value']}>
        <RegionProvider>
          <AuthProvider>
            <CartProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  headerStyle: { backgroundColor: colors.background },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text, fontWeight: '600' },
                  contentStyle: { backgroundColor: colors.background },
                }}
              >
                <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="checkout"
                  options={{
                    headerShown: true,
                    title: 'Checkout',
                    presentation: 'card',
                    headerBackButtonDisplayMode: 'minimal',
                  }}
                />
                <Stack.Screen
                  name="order-confirmation/[id]"
                  options={{
                    headerShown: true,
                    title: 'Order',
                    headerLeft: () => null,
                    gestureEnabled: false,
                    headerBackVisible: false,
                  }}
                />
              </Stack>
              <StatusBar style="dark" backgroundColor={ElaiPalette.cream} />
            </CartProvider>
          </AuthProvider>
        </RegionProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
