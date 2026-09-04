import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';
import { signInWithGoogle } from '@/lib/google-sign-in';
import { GoogleIcon } from '@/components/google-icon';
import { PrimaryButton } from '@/components/ui/primary-button';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user, router]);

  const onSignInWithGoogle = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      const result = await signInWithGoogle();
      if (!result.ok && !result.cancelled) {
        setError(result.message);
      }
    } catch (e: any) {
      setError(e.message ?? 'Google ile giriş başarısız.');
    } finally {
      if (Platform.OS !== 'web') {
        setGoogleLoading(false);
      }
    }
  };

  const onSignInWithPassword = async () => {
    if (!email.trim() || !password) {
      setError('E-posta ve şifre gerekli.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (err) {
      setError(
        err.message === 'Invalid login credentials' ? 'E-posta veya şifre hatalı.' : err.message
      );
    } else if (data.session) {
      router.replace('/(tabs)');
    }

    setSubmitting(false);
  };

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-ice-white">
        <ActivityIndicator color="#2E9FE0" size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-ice-white">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 28,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View className="w-full items-center mb-10">
          <Image
            source={require('@/assets/images/agora-logo.png')}
            style={{ width: 96, height: 96 }}
            resizeMode="contain"
          />
          <View className="mt-5 rounded-full bg-primary-blue/8 px-4 py-1.5">
            <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-primary-blue">
              Go öğrenmenin en eğlenceli yolu
            </Text>
          </View>
          <Text className="mt-4 text-center text-[28px] leading-9 text-ink">
            <Text style={{ fontFamily: 'PlusJakartaSans-ExtraBold' }}>Go </Text>
            <Text style={{ fontFamily: 'CormorantGaramond-SemiBoldItalic', fontSize: 30 }}>
              Akademisi&apos;ne
            </Text>
            <Text style={{ fontFamily: 'PlusJakartaSans-ExtraBold' }}>{'\n'}hoş geldin</Text>
          </Text>
        </View>

        <TextInput
          className="w-full rounded-2xl border border-silver bg-white px-5 py-4 text-ink mb-3.5 text-[16px]"
          style={{ fontFamily: 'PlusJakartaSans-Regular' }}
          placeholder="E-posta"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          className="w-full rounded-2xl border border-silver bg-white px-5 py-4 text-ink mb-5 text-[16px]"
          style={{ fontFamily: 'PlusJakartaSans-Regular' }}
          placeholder="Şifre"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text className="text-sm text-heart mb-4 text-center">{error}</Text> : null}

        <PrimaryButton label="Giriş Yap" loading={submitting} onPress={onSignInWithPassword} />

        <View className="flex-row items-center gap-4 my-7">
          <View className="flex-1 h-px bg-silver" />
          <Text className="text-sm text-ink/40">veya</Text>
          <View className="flex-1 h-px bg-silver" />
        </View>

        <PrimaryButton
          label="Google ile Giriş Yap"
          variant="secondary"
          loading={googleLoading}
          onPress={onSignInWithGoogle}
          icon={<GoogleIcon size={20} />}
        />

        <Pressable onPress={() => router.push('/(auth)/signup')} className="py-2 mt-6 active:opacity-70">
          <Text className="text-center text-[15px] text-ink/60">
            Hesabınız yok mu? <Text className="text-accent-blue font-bold">Kayıt Ol</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
