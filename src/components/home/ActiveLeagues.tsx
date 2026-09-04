import { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Trophy } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Eyebrow } from '@/components/ui/eyebrow';

type LeagueGroup = { id: number; name: string; sub: string; status: string };

export function ActiveLeagues() {
  const router = useRouter();
  const [leagues, setLeagues] = useState<LeagueGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from('league_groups')
      .select('id, name, sub, status')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (active) {
          setLeagues((data as LeagueGroup[]) ?? []);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  if (!loading && leagues.length === 0) return null;

  return (
    <View className="mb-8">
      <Eyebrow>Sezon Devam Ediyor</Eyebrow>
      <Text className="mt-1 text-2xl text-ink dark:text-slate-100" style={{ fontFamily: 'PlusJakartaSans-ExtraBold' }}>
        Aktif Ligler
      </Text>
      <Text className="mt-1.5 text-sm leading-relaxed text-ink/50 dark:text-slate-400">
        Eğitmen eşliğinde 6 haftalık programlarla seviyene uygun ligde gerçek rakiplerle eşleş.
      </Text>
      <Pressable onPress={() => router.push('/(tabs)/ligler')} className="mt-2 self-start active:opacity-70">
        <Text className="text-xs font-bold text-accent-blue">Tüm ligleri gör →</Text>
      </Pressable>

      <View className="mt-4 gap-2.5">
        {loading ? (
          <ActivityIndicator color="#2E9FE0" />
        ) : (
          leagues.map((league) => (
            <Pressable
              key={league.id}
              onPress={() => router.push('/(tabs)/ligler')}
              className="flex-row items-center gap-3 rounded-2xl bg-white dark:bg-dark-card p-3.5 active:opacity-80"
              style={{
                shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2,
              }}>
              <View className="h-10 w-10 items-center justify-center rounded-full bg-token/15">
                <Trophy size={18} color="#D9A83B" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-ink dark:text-slate-100" style={{ fontFamily: 'PlusJakartaSans-Bold' }}>
                  {league.name}
                </Text>
                <Text className="text-xs text-ink/40 mt-0.5">{league.sub}</Text>
              </View>
              <View className="rounded-full bg-silver/40 px-3.5 py-1.5">
                <Text className="text-xs font-bold text-ink/70">Katıl</Text>
              </View>
            </Pressable>
          ))
        )}
      </View>
    </View>
  );
}
