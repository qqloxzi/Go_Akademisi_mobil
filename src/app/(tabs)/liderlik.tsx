import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trophy, Flame } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';
import { Eyebrow } from '@/components/ui/eyebrow';

type LeaderboardRow = {
  id: string;
  username: string | null;
  rank: string | null;
  xp: number | null;
  streak_count: number | null;
};

const AVATAR_COLORS = ['#2E9FE0', '#4C9A6A', '#D9A83B', '#D6564F', '#8B5CF6', '#E8752B'];

function avatarColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const MEDALS = ['#D9A83B', '#B0B7C3', '#C9A06B'];

function RankBadge({ position }: { position: number }) {
  if (position <= 3) {
    return (
      <View
        className="h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: MEDALS[position - 1] }}>
        <Text className="text-xs font-extrabold text-white">{position}</Text>
      </View>
    );
  }
  return (
    <View className="h-8 w-8 items-center justify-center rounded-full bg-silver/50">
      <Text className="text-xs font-bold text-ink/50">{position}</Text>
    </View>
  );
}

export default function LiderlikScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('id, username, rank, xp, streak_count')
        .order('xp', { ascending: false })
        .limit(50);
      if (!cancelled) {
        setRows((data as LeaderboardRow[]) ?? []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-ice-white dark:bg-dark-bg" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" color="#2E9FE0" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-ice-white dark:bg-dark-bg" style={{ paddingTop: insets.top }}>
      <View className="items-center px-5 pb-4 pt-6">
        <Eyebrow>Genel Sıralama</Eyebrow>
        <View className="mt-1 flex-row items-center gap-2">
          <Trophy size={22} color="#D9A83B" />
          <Text className="text-[26px] text-ink dark:text-slate-100" style={{ fontFamily: 'PlusJakartaSans-ExtraBold' }}>
            Liderlik Tablosu
          </Text>
        </View>
        <Text className="mt-1 text-sm text-ink/50">Toplam XP&apos;ye göre en iyi öğrenciler.</Text>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 100, gap: 10 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const name = item.username || 'Oyuncu';
          const isMe = item.id === user?.id;
          return (
            <View
              className={`flex-row items-center gap-3 rounded-2xl bg-white dark:bg-dark-card p-3.5 ${
                isMe ? 'border-2 border-accent-blue' : ''
              }`}
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 2,
              }}>
              <RankBadge position={index + 1} />
              <View
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: avatarColor(name) }}>
                <Text className="font-bold text-white">{name[0]?.toUpperCase() ?? '?'}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-ink dark:text-slate-100" numberOfLines={1}>
                  {name}
                </Text>
                <Text className="text-xs text-ink/40">{item.rank || '20 Kyu'}</Text>
              </View>
              <View className="flex-row items-center gap-1 rounded-full bg-streak/10 px-2.5 py-1">
                <Flame size={12} color="#E8752B" />
                <Text className="text-[11px] font-bold text-streak">{item.streak_count ?? 0} gün</Text>
              </View>
              <Text style={{ fontFamily: 'IBMPlexMono-SemiBold' }} className="text-sm text-primary-blue w-16 text-right">
                {item.xp ?? 0} XP
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text className="mt-10 text-center text-ink/40">Henüz sıralama verisi yok.</Text>
        }
      />
    </View>
  );
}
