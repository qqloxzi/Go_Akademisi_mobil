import { supabase } from './supabase';

export const OGS_GROUP_URL = 'https://online-go.com/group/15895';

export type OnlineLeagueRosterEntry = {
  id: string;
  full_name: string;
  ogs_nickname: string;
  egf_level: string;
  created_at: string;
};

export async function fetchOnlineLeagueRoster(): Promise<OnlineLeagueRosterEntry[]> {
  const { data, error } = await supabase.rpc('get_online_league_roster');
  if (error) return [];
  return (data as OnlineLeagueRosterEntry[]) ?? [];
}

export async function fetchMyOnlineLeagueRegistration(userId: string) {
  const { data } = await supabase
    .from('online_league_registrations')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  return Boolean(data);
}

export async function registerForOnlineLeague(params: {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  ogsNickname: string;
  egfLevel: string;
}) {
  return supabase.from('online_league_registrations').insert({
    user_id: params.userId,
    full_name: params.fullName.trim(),
    email: params.email.trim(),
    phone: params.phone.trim(),
    ogs_nickname: params.ogsNickname.trim(),
    egf_level: params.egfLevel.trim(),
  });
}
