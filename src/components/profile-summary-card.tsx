import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';
import { extractProfileDisplayFields, fetchProfileOnboarding } from '@/lib/profileOnboarding';
import { resolveDisplayRank } from '@/utils/profileDisplay';
import { fetchCurriculum, flattenLessons, type Course } from '@/lib/education/fetchCurriculum';
import {
  fetchRemoteCompletedLessonIds,
  loadLocalCompletedIds,
} from '@/lib/education/progressStorage';
import { ATOLYELER_SECTIONS } from '@/lib/education/atolyelerSections';
import { StatPill } from '@/components/ui/stat-pill';
import { Card } from '@/components/ui/card';

type SectionProgress = { id: string; title: string; done: number; total: number };

/** Web'deki /profil ve /atolyeler'de aynı görünen ilerleme özeti kartı. */
export function ProfileSummaryCard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('Oyuncu');
  const [rankInfo, setRankInfo] = useState(() => resolveDisplayRank(null, null));
  const [tokens, setTokens] = useState(0);
  const [hearts, setHearts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [leagueCount, setLeagueCount] = useState(0);
  const [sectionProgress, setSectionProgress] = useState<SectionProgress[]>([]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const [{ data: profRow }, leagueRes] = await Promise.all([
        fetchProfileOnboarding(supabase, user.id),
        supabase.from('league_registrations').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);
      if (cancelled) return;

      const fields = extractProfileDisplayFields(profRow);
      setDisplayName(fields.preferredName || fields.username || user.email?.split('@')[0] || 'Oyuncu');
      setRankInfo(resolveDisplayRank(profRow, fields.rank));
      setTokens(fields.tokens ?? 0);
      setHearts(fields.hearts ?? 0);
      setStreak(fields.streakCount ?? 0);
      setXp(fields.xp ?? 0);
      setLeagueCount(leagueRes.count ?? 0);

      const [localIds, { courses }] = await Promise.all([loadLocalCompletedIds(), fetchCurriculum()]);
      const remoteIds = await fetchRemoteCompletedLessonIds(user.id);
      const completed = new Set([...localIds, ...remoteIds]);

      const perSection: SectionProgress[] = ATOLYELER_SECTIONS.map((section) => {
        const sectionCourses = courses.filter((c: Course) => (c.levelBand ?? '17-12-kyu') === section.levelBand);
        const lessons = flattenLessons(sectionCourses);
        return {
          id: section.id,
          title: section.title,
          done: lessons.filter((l) => completed.has(l.id)).length,
          total: lessons.length,
        };
      });
      if (!cancelled) setSectionProgress(perSection);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <Card className="items-center justify-center py-10">
        <ActivityIndicator color="#2E9FE0" />
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <View className="flex-row items-center gap-3 mb-4">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-blue">
          <Text className="text-lg font-extrabold text-white">{displayName[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-[15px] text-ink dark:text-slate-100" style={{ fontFamily: 'PlusJakartaSans-Bold' }} numberOfLines={1}>
            {displayName}
          </Text>
          <Text className="text-xs text-ink/40">{rankInfo.primaryLabel}</Text>
        </View>
      </View>

      {rankInfo.showMasterBar && rankInfo.masterPercent != null ? (
        <>
          <View className="flex-row items-center justify-between mb-1.5">
            <Text style={{ fontFamily: 'IBMPlexMono-SemiBold' }} className="text-xs text-primary-blue dark:text-accent-blue">
              {rankInfo.primaryLabel}
            </Text>
            <Text className="text-[11px] text-ink/40">
              {xp} XP · sıradaki: {rankInfo.nextRank}
            </Text>
          </View>
          <View className="h-1.5 rounded-full bg-silver/50 overflow-hidden mb-4">
            <View
              className="h-full rounded-full bg-primary-blue dark:bg-accent-blue"
              style={{ width: `${Math.max(rankInfo.masterPercent, 2)}%` }}
            />
          </View>
        </>
      ) : (
        <View className="mb-4" />
      )}

      <View className="flex-row gap-2 mb-4">
        <StatPill kind="heart" value={hearts} />
        <StatPill kind="token" value={tokens} />
        <StatPill kind="streak" value={streak} />
      </View>

      <View className="border-t border-silver/60 pt-3 mb-3">
        <Text className="text-[10px] font-extrabold uppercase tracking-widest text-accent-blue mb-1.5">
          Katıldığın Ligler
        </Text>
        {leagueCount > 0 ? (
          <Text className="text-sm font-semibold text-ink">{leagueCount} lige katıldın</Text>
        ) : (
          <Pressable onPress={() => router.push('/(tabs)/ligler')}>
            <Text className="text-sm font-semibold text-accent-blue">Henüz katılmadın — bir lige göz at</Text>
          </Pressable>
        )}
      </View>

      {sectionProgress.length > 0 ? (
        <View className="border-t border-silver/60 pt-3 gap-2.5">
          <Text className="text-[10px] font-extrabold uppercase tracking-widest text-accent-blue mb-0.5">
            Atölye İlerlemen
          </Text>
          {sectionProgress.map((s) => {
            const pct = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0;
            return (
              <View key={s.id}>
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-xs font-semibold text-ink/70">{s.title}</Text>
                  <Text className="text-xs text-ink/40">
                    {s.done}/{s.total}
                  </Text>
                </View>
                <View className="h-1.5 rounded-full bg-silver/40 overflow-hidden">
                  <View className="h-full rounded-full bg-primary-blue dark:bg-accent-blue" style={{ width: `${Math.max(pct, pct > 0 ? 3 : 0)}%` }} />
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
    </Card>
  );
}
