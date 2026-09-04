import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

export const AUTH_CALLBACK_PATH = 'auth/callback';

/**
 * HTTPS OAuth köprüsü — isteğe bağlı (EXPO_PUBLIC_OAUTH_USE_BRIDGE=1).
 * ÖNEMLİ: köprünün canlıda çalışması için sunucunun /auth/mobile-callback
 * isteğini statik `mobile-callback.html`'e yönlendirmesi gerekir (SPA'nın
 * index.html'ine düşerse kullanıcı web sitesinde takılı kalır — bkz. web
 * projesindeki public/.htaccess). return_to kullanılırken Supabase Redirect
 * URLs listesine wildcard (…/mobile-callback?**) eklenmiş olmalı.
 */
export const OAUTH_BRIDGE_URL =
  (process.env.EXPO_PUBLIC_OAUTH_BRIDGE_URL as string | undefined)?.replace(/\/$/, '') ??
  'https://agoragoakademisi.com/auth/mobile-callback';

/** Standalone AAB/IPA — allowlist ile birebir eşleşmeli (üç slash'li createURL'den kaçın). */
export const NATIVE_AUTH_CALLBACK = 'agoramobil://auth/callback';

function useOAuthBridge(): boolean {
  const v = process.env.EXPO_PUBLIC_OAUTH_USE_BRIDGE;
  return v === '1' || v === 'true';
}

/**
 * Uygulama deep link (openAuthSessionAsync dinleyicisi + köprü return_to).
 * Expo Go → exp://…/--/auth/callback
 * Standalone → agoramobil://auth/callback
 */
export function getNativeAppReturnUri(): string {
  if (Constants.appOwnership === 'expo') {
    return Linking.createURL(AUTH_CALLBACK_PATH);
  }
  return NATIVE_AUTH_CALLBACK;
}

/**
 * Supabase `redirectTo`.
 *
 * Varsayılan (mobil): doğrudan native deep link.
 *   Expo Go  → exp://…  (Redirect URLs: exp://**)
 *   AAB/IPA  → agoramobil://auth/callback (Redirect URLs: agoramobil://** )
 *
 * Köprü modu (EXPO_PUBLIC_OAUTH_USE_BRIDGE=1):
 *   Exact: https://…/auth/mobile-callback  (return_to yok → köprü agoramobil://)
 *   Expo Go + köprü: return_to zorunlu → allowlist'te ?** gerekir.
 */
export function getAuthRedirectUri(): string {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin.replace(/\/$/, '')}/${AUTH_CALLBACK_PATH}`;
    }
    const siteUrl = process.env.EXPO_PUBLIC_SITE_URL;
    if (siteUrl) {
      return `${siteUrl.replace(/\/$/, '')}/${AUTH_CALLBACK_PATH}`;
    }
  }

  const appReturn = getNativeAppReturnUri();

  if (!useOAuthBridge()) {
    return appReturn;
  }

  // Expo Go: köprü return_to olmadan agoramobil://'e düşer → exp:// ile bilerek geçir.
  if (Constants.appOwnership === 'expo') {
    return `${OAUTH_BRIDGE_URL}?return_to=${encodeURIComponent(appReturn)}`;
  }

  // Standalone: exact bridge URL (allowlist'teki kayıtla birebir). Köprü DEFAULT_RETURN = agoramobil://
  return OAUTH_BRIDGE_URL;
}

/**
 * Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
 * Site URL'i /dashboard yapmayın — eşleşmeyen redirectTo Site URL'e düşer.
 */
export function getSupabaseRedirectUrlHints(): string[] {
  return [
    'exp://**',
    'exp://**/--/auth/callback',
    NATIVE_AUTH_CALLBACK,
    'agoramobil://**',
    OAUTH_BRIDGE_URL,
    `${OAUTH_BRIDGE_URL}?**`,
    'https://agoragoakademisi.com/auth/mobile-callback',
    'https://agoragoakademisi.com/auth/mobile-callback?**',
    'https://agoragoakademisi.com/**',
  ];
}
