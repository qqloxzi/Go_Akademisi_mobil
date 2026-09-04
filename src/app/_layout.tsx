import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import { AuthProvider } from '@/context/auth-context';
import { SettingsProvider } from '@/context/SettingsContext';
import { OnboardingProvider } from '@/context/OnboardingContext';
import { AuthDeepLinkHandler } from '@/components/auth-deep-link-handler';
import { RootNavigationGate } from '@/screens/root-navigation-gate';
import { APP_FONTS } from '@/constants/fonts';

import '@/global.css';

export { ErrorBoundary } from 'expo-router';

/** Prefer login for cold start; gate still redirects if a session exists. */
export const unstable_settings = { initialRouteName: '(auth)' };

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts(APP_FONTS);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SettingsProvider>
      <AuthProvider>
        <OnboardingProvider>
          <AuthDeepLinkHandler />
          <RootNavigationGate>
            <Stack screenOptions={{ headerShown: false }} initialRouteName="(auth)">
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
              <Stack.Screen name="course-detail/[slug]" options={{ presentation: 'card' }} />
              <Stack.Screen name="atolyeler/[slug]" options={{ presentation: 'card' }} />
              <Stack.Screen name="atolyeler/kurs/[slug]" options={{ presentation: 'card' }} />
              <Stack.Screen name="fikstur" options={{ presentation: 'card' }} />
              <Stack.Screen name="contact" options={{ presentation: 'card' }} />
              <Stack.Screen name="blog/index" options={{ presentation: 'card' }} />
              <Stack.Screen name="blog/[slug]" options={{ presentation: 'card' }} />
              <Stack.Screen name="instructor/index" options={{ presentation: 'card' }} />
              <Stack.Screen name="instructor/[id]" options={{ presentation: 'card' }} />
            </Stack>
          </RootNavigationGate>
        </OnboardingProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
