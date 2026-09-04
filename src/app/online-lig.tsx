import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, ExternalLink, Sparkles, Users } from 'lucide-react-native';
import { useAuth } from '@/context/auth-context';
import {
  OGS_GROUP_URL,
  fetchMyOnlineLeagueRegistration,
  fetchOnlineLeagueRoster,
  registerForOnlineLeague,
  type OnlineLeagueRosterEntry,
} from '@/lib/onlineLeague';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Card } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Eyebrow } from '@/components/ui/eyebrow';

function RegistrationForm({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [ogsNickname, setOgsNickname] = useState('');
  const [egfLevel, setEgfLevel] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function submit() {
    if (!user || !phone.trim() || !ogsNickname.trim() || !egfLevel.trim()) return;
    setStatus('loading');
    const { error } = await registerForOnlineLeague({
      userId: user.id,
      fullName: user.email?.split('@')[0] ?? 'Oyuncu',
      email: user.email ?? '',
      phone,
      ogsNickname,
      egfLevel,
    });
    if (!error) {
      setStatus('success');
      onSuccess();
    } else {
      setStatus(error.code === '23505' ? 'success' : 'error');
      if (error.code === '23505') onSuccess();
    }
  }

  if (status === 'success') {
    return (
      <View className="flex-row items-center gap-3 p-4 rounded-2xl bg-success/10 border border-success/25">
        <CheckCircle2 size={20} color="#4C9A6A" />
        <Text className="flex-1 text-sm font-bold text-success">Kaydın alındı! Aşağıdaki listede görünüyorsun.</Text>
      </View>
    );
  }

  return (
    <View className="gap-3.5">
      <View>
        <Text className="text-xs font-bold uppercase tracking-wider text-ink/40 mb-1.5">Telefon</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="05xx xxx xx xx"
          placeholderTextColor="#9AA0AC"
          className="px-4 py-3.5 rounded-2xl border border-silver/60 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-ink dark:text-slate-100"
        />
      </View>
      <View>
        <Text className="text-xs font-bold uppercase tracking-wider text-ink/40 mb-1.5">OGS Nickin</Text>
        <TextInput
          value={ogsNickname}
          onChangeText={setOgsNickname}
          autoCapitalize="none"
          placeholder="online-go.com kullanıcı adın"
          placeholderTextColor="#9AA0AC"
          className="px-4 py-3.5 rounded-2xl border border-silver/60 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-ink dark:text-slate-100"
        />
      </View>
      <View>
        <Text className="text-xs font-bold uppercase tracking-wider text-ink/40 mb-1.5">Gerçek Seviyen (EGF)</Text>
        <TextInput
          value={egfLevel}
          onChangeText={setEgfLevel}
          placeholder="ör. 5 kyu, 1 dan"
          placeholderTextColor="#9AA0AC"
          className="px-4 py-3.5 rounded-2xl border border-silver/60 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-ink dark:text-slate-100"
        />
      </View>

      {status === 'error' && <Text className="text-sm font-bold text-heart">Bir şeyler ters gitti, tekrar dener misin?</Text>}

      <PrimaryButton label={status === 'loading' ? 'Kaydediliyor...' : 'Lige Kayıt Ol'} loading={status === 'loading'} onPress={submit} />
    </View>
  );
}

export default function OnlineLeagueScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [roster, setRoster] = useState<OnlineLeagueRosterEntry[]>([]);
  const [rosterLoading, setRosterLoading] = useState(true);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);

  function loadRoster() {
    setRosterLoading(true);
    fetchOnlineLeagueRoster().then((data) => {
      setRoster(data);
      setRosterLoading(false);
    });
  }

  useEffect(() => {
    loadRoster();
  }, []);

  useEffect(() => {
    if (!user) {
      setCheckingRegistration(false);
      return;
    }
    setCheckingRegistration(true);
    fetchMyOnlineLeagueRegistration(user.id).then((registered) => {
      setAlreadyRegistered(registered);
      setCheckingRegistration(false);
    });
  }, [user]);

  return (
    <ScrollView
      className="flex-1 bg-ice-white dark:bg-dark-bg"
      contentContainerStyle={{ paddingTop: insets.top + 18, paddingHorizontal: 20, paddingBottom: insets.bottom + 36 }}
      showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Agora Online Ligi" subtitle="Ücretsiz · Herkese açık" />

      <Card className="p-5 mb-5 flex-row items-center gap-4">
        <View className="w-14 h-14 rounded-2xl bg-ink items-center justify-center p-2">
          <Image source={require('../../assets/images/community/ogs.png')} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
        </View>
        <View className="flex-1">
          <Text className="text-base text-ink dark:text-slate-100" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            OGS Topluluk Grubumuz
          </Text>
          <Text className="text-xs text-ink/50 mt-0.5 leading-4">Maçlarını Online-Go Server üzerinden oynuyoruz.</Text>
        </View>
      </Card>
      <View className="mb-6">
        <PrimaryButton
          label="Gruba Katıl"
          variant="secondary"
          onPress={() => Linking.openURL(OGS_GROUP_URL)}
          icon={<ExternalLink size={16} color="#1E3A5F" />}
        />
      </View>

      <Card className="p-5 mb-6">
        <View className="flex-row items-center gap-2 mb-1">
          <Sparkles size={18} color="#2E9FE0" />
          <Text className="text-base text-ink dark:text-slate-100" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
            Lige Katıl
          </Text>
        </View>
        <Text className="text-xs text-ink/50 mb-4">Telefon numaran, OGS kullanıcı adın ve gerçek seviyen yeterli.</Text>

        {authLoading || checkingRegistration ? (
          <ActivityIndicator color="#2E9FE0" />
        ) : !user ? (
          <View className="items-center gap-3 py-2">
            <Text className="text-sm text-ink/60 text-center">Kayıt olmak için önce giriş yapmalısın.</Text>
            <PrimaryButton label="Ücretsiz Hesap Oluştur" onPress={() => router.push('/(auth)')} />
          </View>
        ) : alreadyRegistered ? (
          <View className="flex-row items-center gap-3 p-4 rounded-2xl bg-success/10 border border-success/25">
            <CheckCircle2 size={20} color="#4C9A6A" />
            <Text className="flex-1 text-sm font-bold text-success">Bu lige zaten kayıtlısın.</Text>
          </View>
        ) : (
          <RegistrationForm
            onSuccess={() => {
              setAlreadyRegistered(true);
              loadRoster();
            }}
          />
        )}
      </Card>

      <View className="flex-row items-center gap-2 mb-3">
        <Users size={18} color="#2E9FE0" />
        <Eyebrow>Kayıtlı Oyuncular ({roster.length})</Eyebrow>
      </View>

      {rosterLoading ? (
        <ActivityIndicator color="#2E9FE0" />
      ) : roster.length === 0 ? (
        <Text className="text-sm text-ink/40">Henüz kimse kayıt olmadı — ilk sen ol!</Text>
      ) : (
        <View className="gap-2">
          {roster.map((r, i) => (
            <View key={r.id} className="flex-row items-center gap-3 px-4 py-3 rounded-xl bg-primary-blue/[0.04] dark:bg-white/5">
              <Text className="w-6 text-xs text-ink/30 font-bold">{i + 1}</Text>
              <Text className="flex-1 text-sm font-bold text-ink dark:text-slate-100" numberOfLines={1}>
                {r.full_name}
              </Text>
              <Text className="text-xs font-bold text-accent-blue" numberOfLines={1}>
                {r.ogs_nickname}
              </Text>
              <Text className="text-xs text-ink/50">{r.egf_level}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
