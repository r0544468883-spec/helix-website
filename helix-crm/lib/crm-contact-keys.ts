import type { SupabaseClient } from '@supabase/supabase-js';
import { matchKeys, type MatchKeys } from '@/lib/crm-contact-match';

/**
 * Every email and phone already in a workspace, as match keys, read a page of 1,000
 * at a time. For the Google import's "כבר ב-CRM" and its re-check on the server.
 */
export async function workspaceMatchKeys(db: SupabaseClient, workspaceId: string): Promise<MatchKeys> {
  const rows: { email: string | null; phone: string | null }[] = [];
  for (let from = 0; ; from += 1000) {
    const { data } = await db.from('crm_contacts').select('email, phone')
      .eq('workspace_id', workspaceId).order('created_at', { ascending: true }).range(from, from + 999);
    rows.push(...((data ?? []) as { email: string | null; phone: string | null }[]));
    if (!data || data.length < 1000) break;
  }
  return matchKeys(rows);
}
