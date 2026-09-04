import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { completeSupabaseSessionFromUrl, isAuthCallbackUrl } from '@/lib/auth-session-from-url';

/**
 * OAuth callback'leri uygulama genelinde yakala (login ekranı mount olmasa bile).
 * app/_layout.tsx içinde her zaman aktif — hangi ekranda olursa olsun deep
 * link geldiğinde session'ı kurar.
 */
export function AuthDeepLinkHandler() {
  useEffect(() => {
    const handleUrl = async ({ url }: { url: string }) => {
      if (__DEV__) console.log('[AuthDeepLinkHandler] received url:', url, 'isAuthCallback:', isAuthCallbackUrl(url));
      if (!isAuthCallbackUrl(url)) return;
      const { error } = await completeSupabaseSessionFromUrl(url);
      if (__DEV__) console.log('[AuthDeepLinkHandler] session exchange error:', error?.message ?? null);

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const onCallback =
          window.location.pathname.includes('/auth/callback') ||
          window.location.hash.includes('access_token') ||
          window.location.search.includes('code=');
        if (onCallback) {
          window.history.replaceState({}, '', '/');
        }
      }
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      void handleUrl({ url: window.location.href });
    }

    const sub = Linking.addEventListener('url', handleUrl);
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    return () => sub.remove();
  }, []);

  return null;
}
