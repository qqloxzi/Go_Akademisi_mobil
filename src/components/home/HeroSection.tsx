import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Trophy, ArrowRight, Megaphone } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { PrimaryButton } from '@/components/ui/primary-button';

type Stats = { students: number; exercises: number; matches: number };

export function HeroSection() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ students: 0, exercises: 0, matches: 0 });

  useEffect(() => {
    let active = true;
    (async () => {
      const [profiles, problems, matches] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('go_problems').select('id', { count: 'exact', head: true }),
        supabase.from('league_match_results').select('id', { count: 'exact', head: true }),
      ]);
      if (!active) return;
      setStats({
        students: profiles.count ?? 0,
        exercises: problems.count ?? 0,
        matches: matches.count ?? 0,
      });
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <View className="mt-2 mb-8 items-center">
      <View className="w-full flex-row items-center gap-2.5 rounded-2xl bg-white dark:bg-dark-card px-4 py-3" style={{
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2,
      }}>
        <Megaphone size={16} color="#2E9FE0" />
        <Text className="flex-1 text-xs text-ink/60" numberOfLines={2}>
          <Text className="font-bold text-accent-blue">Yeni Sezon Yakında </Text>
          Yeni sezon tarihi ve detayları çok yakında burada.
        </Text>
      </View>

      <View className="mt-5 w-full gap-3">
        <PrimaryButton
          label="Öğrenmeye devam et"
          onPress={() => router.push('/(tabs)/atolyeler')}
          icon={<ArrowRight size={18} color="#fff" />}
        />
        <PrimaryButton
          label="Bir Lige Katıl"
          variant="secondary"
          onPress={() => router.push('/(tabs)/ligler')}
          icon={<Trophy size={18} color="#1E3A5F" />}
        />
      </View>

      <View className="mt-7 flex-row w-full justify-around">
        <StatCell value={`${stats.students}+`} label="ÖĞRENCİ" />
        <StatCell value={`${stats.exercises}+`} label="ALIŞTIRMA" />
        <StatCell value={`${stats.matches}+`} label="LİG MAÇI" />
      </View>
    </View>
  );
}

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <View className="items-center">
      <Text className="text-2xl text-primary-blue dark:text-accent-blue" style={{ fontFamily: 'PlusJakartaSans-ExtraBold' }}>
        {value}
      </Text>
      <Text className="mt-0.5 text-[10px] font-bold tracking-wider text-ink/40">{label}</Text>
    </View>
  );
}
