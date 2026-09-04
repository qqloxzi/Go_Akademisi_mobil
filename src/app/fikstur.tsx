import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fallbackLeagueData, fetchLeagueData, type League, type LeagueMatch } from '@/data/leagueData';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Card } from '@/components/ui/card';

function groupMatchesByWeek(matches: LeagueMatch[]): Array<[number, LeagueMatch[]]> {
  const grouped = new Map<number, LeagueMatch[]>();
  matches.forEach((match) => {
    const weekMatches = grouped.get(match.week) ?? [];
    weekMatches.push(match);
    grouped.set(match.week, weekMatches);
  });
  return Array.from(grouped.entries()).sort(([a], [b]) => a - b);
}

function getPlayerName(league: League, playerId: string): string {
  return league.players.find((player) => player.id === playerId)?.name ?? '-';
}

export default function FiksturScreen() {
  const insets = useSafeAreaInsets();
  const [leagues, setLeagues] = useState<League[]>(fallbackLeagueData);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchLeagueData()
      .then((remoteLeagues) => {
        if (!active || remoteLeagues.length === 0) return;
        setLeagues(remoteLeagues);
        setErrorMsg(null);
      })
      .catch(() => {
        setErrorMsg('Lig verisi yüklenemedi. Geçici olarak yerel kayıtlar gösteriliyor.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-ice-white dark:bg-dark-bg"
      contentContainerStyle={{ paddingTop: insets.top + 18, paddingHorizontal: 20, paddingBottom: insets.bottom + 36 }}
      showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Fikstür" subtitle="Güncel puan durumu ve maç sonuçları" />

      {isLoading ? (
        <Card className="p-6 items-center mb-5">
          <ActivityIndicator size="small" color="#2E9FE0" />
          <Text className="text-sm text-ink/40 mt-3">Lig kayıtları yükleniyor…</Text>
        </Card>
      ) : null}

      {errorMsg ? (
        <View className="rounded-2xl border border-token/30 bg-token/10 p-4 mb-5">
          <Text className="text-sm font-semibold text-token">{errorMsg}</Text>
        </View>
      ) : null}

      <View className="gap-4">
        {leagues.map((league) => (
          <Card key={league.id} className="p-5">
            <View className="flex-row items-start justify-between gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-xl text-ink dark:text-slate-100" style={{ fontFamily: 'PlusJakartaSans-ExtraBold' }}>
                  {league.name}
                </Text>
                <Text className="text-sm font-semibold text-accent-blue mt-1">{league.sub}</Text>
              </View>
              <Text className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-full">{league.status}</Text>
            </View>

            <Text className="text-xs font-bold text-ink/40 uppercase tracking-wider mb-2">Oyuncular</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {league.players.map((player) => (
                <Text key={player.id} className="text-xs font-semibold text-ink/70 bg-silver/30 px-3 py-1 rounded-full">
                  {player.name}
                </Text>
              ))}
            </View>

            <Text className="text-xs font-bold text-ink/40 uppercase tracking-wider mb-2">Maç Fikstürü</Text>
            {league.matches.length === 0 ? (
              <Text className="text-sm italic text-ink/40">Fikstür için en az iki oyuncu gerekli.</Text>
            ) : (
              groupMatchesByWeek(league.matches).map(([week, matches]) => (
                <View key={`${league.id}-${week}`} className="mb-3">
                  <Text className="text-xs font-bold text-accent-blue mb-1">Hafta {week}</Text>
                  {matches.map((match) => (
                    <View key={match.id} className="flex-row items-center justify-between py-2 border-b border-silver/40">
                      <Text className="text-sm text-ink/70 flex-1 text-right" numberOfLines={1}>
                        {getPlayerName(league, match.p1Id)}
                      </Text>
                      <Text className="text-xs font-bold text-ink/40 px-3">vs</Text>
                      <Text className="text-sm text-ink/70 flex-1" numberOfLines={1}>
                        {getPlayerName(league, match.p2Id)}
                      </Text>
                    </View>
                  ))}
                </View>
              ))
            )}
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
