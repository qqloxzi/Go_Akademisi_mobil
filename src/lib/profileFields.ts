import { supabase } from './supabase';

export function logSupabaseError(prefix: string, error: any) {
  if (error == null) return;
  const o =
    typeof error === 'object' && error !== null
      ? {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        }
      : { raw: error };
  console.error(prefix, o);
}

export function extractProfileDisplayFields(row: any) {
  if (!row || typeof row !== 'object') {
    return {
      xp: null,
      username: null,
      rank: null,
      tokens: null,
      hearts: null,
      streakCount: null,
    };
  }
  const xp = typeof row.xp === 'number' && Number.isFinite(row.xp) ? row.xp : null;
  const usernameRaw = row.username;
  const username =
    usernameRaw != null && String(usernameRaw).trim() !== '' ? String(usernameRaw).trim() : null;
  const rankRaw = row.rank;
  const rank = rankRaw != null && String(rankRaw).trim() !== '' ? String(rankRaw).trim() : null;
  const tokens = typeof row.tokens === 'number' && Number.isFinite(row.tokens) ? row.tokens : null;
  const hearts = typeof row.hearts === 'number' && Number.isFinite(row.hearts) ? row.hearts : null;
  const streakCount =
    typeof row.streak_count === 'number' && Number.isFinite(row.streak_count)
      ? row.streak_count
      : null;
  return { xp, username, rank, tokens, hearts, streakCount };
}

export async function fetchProfileRow(client = supabase, userId: string): Promise<{ data: any | null, error: Error | null }> {
  const { data, error } = await client.from('profiles').select('*').eq('id', userId).maybeSingle();

  if (error) {
    logSupabaseError('[fetchProfileRow]', error);
    return { data: null, error: error as any };
  }
  return { data, error: null };
}
