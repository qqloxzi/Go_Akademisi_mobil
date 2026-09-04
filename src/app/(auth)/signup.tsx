import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';
import { signInWithGoogle } from '@/lib/google-sign-in';
import { GoogleIcon } from '@/components/google-icon';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Card } from '@/components/ui/card';

WebBrowser.maybeCompleteAuthSession();

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user, router]);

  const onSignUp = async () => {
    if (!email.trim() || !password) {
      setError('E-posta ve şifre gerekli.');
      return;
    }

    setSubmitting(true);
    setError(null);
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess(true);
    }
    setSubmitting(false);
  };

  const onSignUpWithGoogle = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      const result = await signInWithGoogle();
      if (!result.ok && !result.cancelled) {
        setError(result.message);
      }
    } catch (e: any) {
      setError(e.message ?? 'Google ile kayıt başarısız.');
    } finally {
      if (Platform.OS !== 'web') {
        setGoogleLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-ice-white">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 20,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Card className="w-full max-w-md self-center px-6 py-8">
          <Text
            className="text-2xl text-ink mb-1"
            style={{ fontFamily: 'PlusJakartaSans-ExtraBold' }}>
            Hesap Oluştur
          </Text>
          <Text className="text-sm text-ink/50 mb-6">
            E-posta ve şifre ile yeni hesap oluşturun.
          </Text>

          <TextInput
            className="w-full rounded-xl border border-silver bg-white px-4 py-3.5 text-ink mb-3"
            placeholder="E-posta Adresi"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            className="w-full rounded-xl border border-silver bg-white px-4 py-3.5 text-ink mb-4"
            placeholder="Şifre"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text className="text-sm text-heart mb-3">{error}</Text> : null}
          {success ? (
            <Text className="text-sm text-success mb-3">
              Kayıt başarılı. E-posta doğrulama linkini kontrol edin.
            </Text>
          ) : null}

          <View className="mb-6">
            <PrimaryButton label="Kayıt Ol" loading={submitting} onPress={onSignUp} />
          </View>

          <View className="flex-row items-center gap-4 mb-6">
            <View className="flex-1 h-px bg-silver" />
            <Text className="text-sm text-ink/40">veya</Text>
            <View className="flex-1 h-px bg-silver" />
          </View>

          <PrimaryButton
            label="Google ile kaydol"
            variant="secondary"
            loading={googleLoading}
            onPress={onSignUpWithGoogle}
            icon={<GoogleIcon size={20} />}
          />

          <Pressable onPress={() => router.back()} className="mt-5 py-2">
            <Text className="text-center text-sm font-bold text-accent-blue">
              Giriş sayfasına dön
            </Text>
          </Pressable>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
