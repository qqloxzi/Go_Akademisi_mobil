import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView, Platform, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogOut, ArrowRight, Trash2, ShieldCheck, Sun, Moon, SmartphoneIcon } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';
import { useOnboarding } from '@/context/OnboardingContext';
import { useSettings, type ThemeMode } from '@/context/SettingsContext';
import { signInWithGoogle } from '@/lib/google-sign-in';
import { GoogleIcon } from '@/components/google-icon';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Card } from '@/components/ui/card';
import { Eyebrow } from '@/components/ui/eyebrow';
import { ProfileSummaryCard } from '@/components/profile-summary-card';
import { LEGAL_LINKS } from '@/constants/socialLinks';

const THEME_OPTIONS: { value: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Açık', Icon: Sun },
  { value: 'dark', label: 'Koyu', Icon: Moon },
  { value: 'system', label: 'Sistem', Icon: SmartphoneIcon },
];

function ThemeToggle() {
  const { themeMode, setThemeMode } = useSettings();
  return (
    <View className="flex-row rounded-2xl bg-silver/25 p-1 mt-3">
      {THEME_OPTIONS.map(({ value, label, Icon }) => {
        const active = themeMode === value;
        return (
          <Pressable
            key={value}
            onPress={() => setThemeMode(value)}
            className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-2.5 ${active ? 'bg-white dark:bg-dark-card' : ''}`}
            style={active ? { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 1 } : undefined}>
            <Icon size={14} color={active ? '#1E3A5F' : '#9AA0AC'} />
            <Text className={`text-xs font-bold ${active ? 'text-primary-blue' : 'text-ink/40'}`}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ActionCard({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="active:opacity-80">
      <Card className="flex-row items-center justify-between p-4">
        <View className="flex-1 pr-3">
          <Text className="text-[15px] text-ink dark:text-slate-100" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            {title}
          </Text>
          <Text className="mt-0.5 text-xs text-ink/50" numberOfLines={2}>
            {description}
          </Text>
        </View>
        <ArrowRight size={18} color="#2E9FE0" />
      </Card>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { isInitialized, resetOnboarding } = useOnboarding();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const onSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    resetOnboarding();
    setSigningOut(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      if (Platform.OS !== 'web') setGoogleLoading(false);
    }
  };

  const executeAccountDeletion = async () => {
    try {
      const { error } = await supabase.rpc('delete_user');
      if (error) throw error;
      resetOnboarding();
      await supabase.auth.signOut();
    } catch (err: any) {
      const msg = err?.message || 'Bilinmeyen hata';
      Alert.alert('Hesap Silinemiyor', `Hata: ${msg}`, [{ text: 'Tamam', style: 'cancel' }]);
    }
  };

  const handleDeleteAccount = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz?')) {
        void executeAccountDeletion();
      }
      return;
    }
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Evet, Hesabımı Sil', style: 'destructive', onPress: () => void executeAccountDeletion() },
      ]
    );
  };

  if (!isInitialized) {
    return (
      <View className="flex-1 items-center justify-center bg-ice-white dark:bg-dark-bg">
        <ActivityIndicator size="large" color="#2E9FE0" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 bg-ice-white dark:bg-dark-bg px-6" style={{ paddingTop: insets.top + 24 }}>
        <Text className="text-3xl text-ink dark:text-slate-100 mb-2" style={{ fontFamily: 'PlusJakartaSans-ExtraBold' }}>
          Profilim
        </Text>
        <Text className="text-ink/50 dark:text-slate-400 mb-8">
          İlerlemenizi kaydetmek ve gelişiminizi görmek için giriş yapın.
        </Text>
        <View className="mb-3">
          <PrimaryButton
            label="Google ile Devam Et"
            variant="secondary"
            loading={googleLoading}
            onPress={handleGoogleSignIn}
            icon={<GoogleIcon size={20} />}
          />
        </View>
        <PrimaryButton label="E-posta ile Giriş Yap" onPress={() => router.push('/(auth)')} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-ice-white dark:bg-dark-bg"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}>
      <ProfileHero onSignOut={onSignOut} signingOut={signingOut} />

      <View className="mt-4">
        <ProfileSummaryCard />
      </View>

      <View className="mt-4 gap-3">
        <ActionCard
          title="Atölyelere Devam Et"
          description="Beceri ağacındaki bir sonraki derse geç."
          onPress={() => router.push('/(tabs)/atolyeler')}
        />
        <ActionCard
          title="Lig Durumunu Gör"
          description="Puan durumu ve haftalık eşleşmeler."
          onPress={() => router.push('/fikstur')}
        />
      </View>

      <View className="mt-4 border-t border-silver/60 pt-4">
        <Eyebrow className="mb-2">Ayarlar</Eyebrow>
        <ThemeToggle />
        <Pressable
          onPress={() => Linking.openURL(LEGAL_LINKS.privacyPolicy)}
          className="flex-row items-center gap-2 py-2.5 active:opacity-70">
          <ShieldCheck size={16} color="#9AA0AC" />
          <Text className="text-sm font-semibold text-ink/60">Gizlilik Politikası</Text>
        </Pressable>
        <Pressable onPress={handleDeleteAccount} className="flex-row items-center gap-2 py-2.5 active:opacity-70">
          <Trash2 size={16} color="#D6564F" />
          <Text className="text-sm font-semibold text-heart">Hesabımı Sil</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function ProfileHero({ onSignOut, signingOut }: { onSignOut: () => void; signingOut: boolean }) {
  const { user } = useAuth();
  const name =
    (user?.user_metadata?.full_name as string | undefined) || user?.email?.split('@')[0] || 'Oyuncu';

  return (
    <View className="rounded-3xl bg-primary-blue p-5 flex-row items-center">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-white/15 border-2 border-white/30">
        <Text className="text-xl font-extrabold text-white">{name[0]?.toUpperCase() ?? '?'}</Text>
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-lg text-white" style={{ fontFamily: 'PlusJakartaSans-ExtraBold' }} numberOfLines={1}>
          {name}
        </Text>
      </View>
      <Pressable
        onPress={onSignOut}
        disabled={signingOut}
        className="h-10 w-10 items-center justify-center rounded-full bg-white/10 active:opacity-70">
        {signingOut ? <ActivityIndicator size="small" color="#fff" /> : <LogOut size={18} color="#fff" />}
      </Pressable>
    </View>
  );
}
