import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { ThemeProvider as AuraThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'onboarding',
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <AuraThemeProvider>
        <AuthProvider>
          <CartProvider>
            <RootNavigation />
          </CartProvider>
        </AuthProvider>
      </AuraThemeProvider>
    </SafeAreaProvider>
  );
}

function RootNavigation() {
  const { isAuthenticated, needsPhoneVerification, locked, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inTabs = segments[0] === '(tabs)';
    const inAuthFlow = segments[0] === 'onboarding' || segments[0] === 'auth';
    const inOtp = segments[0] === 'otp';
    const inUnlock = segments[0] === 'unlock';

    if (locked && !inUnlock) {
      router.replace('/unlock');
    } else if (!locked && !isAuthenticated && inTabs) {
      router.replace('/onboarding');
    } else if (isAuthenticated && needsPhoneVerification && !inOtp) {
      router.replace('/otp');
    } else if (isAuthenticated && !needsPhoneVerification && (inAuthFlow || inOtp || inUnlock)) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, needsPhoneVerification, locked, loading, segments, router]);

  if (loading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
      <Stack.Screen name="auth" options={{ gestureEnabled: false }} />
      <Stack.Screen name="otp" options={{ gestureEnabled: false }} />
      <Stack.Screen name="unlock" options={{ gestureEnabled: false }} />
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      <Stack.Screen name="products" options={{ presentation: 'card' }} />
      <Stack.Screen name="product/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="wallet/index" options={{ presentation: 'card' }} />
    </Stack>
  );
}
