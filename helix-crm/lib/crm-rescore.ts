import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { scoreContact, type ScoreInput } from './crm-score';

// Everything the score folds in, loaded in one place. Before this, four paths
// rescored a contact from its row alone, so the 20 points for an open deal (which
// the v19 backfill applied) fell away the first time anything touched the person,
// and opening or closing a deal never rescored anyone. crm-score.ts stays a pure
// function because client components import it; the I/O lives here.

const FIELDS = 'is_business, company_id, status, phone, linkedin_url, last_activity_at';

export type ScoreRow = ScoreInput & { status: string };

/**
 * The contact's scoring fields plus whether it has an open deal, or null when the
 * contact is not in this workspace. For writes that also change the contact:
 * compute with scoreContact({ ...row, ...change }) and store the score in the same
 * update as the change.
 */
export async function loadScoreInputs(
  db: SupabaseClient,
  workspaceId: string,
  contactId: string,
): Promise<ScoreRow | null> {
  const [{ data: row }, { data: open }] = await Promise.all([
    db.from('crm_contacts').select(FIELDS).eq('id', contactId).eq('workspace_id', workspaceId).maybeSingle(),
    db.from('crm_deals').select('id').eq('contact_id', contactId).eq('workspace_id', workspaceId).eq('status', 'open').limit(1),
  ]);
  if (!row) return null;
  return { ...(row as ScoreRow), hasOpenDeal: (open?.length ?? 0) > 0 };
}

/** Recompute and store the score alone: for writes that change a deal, not the person. */
export async function rescoreContact(
  db: SupabaseClient,
  workspaceId: string,
  contactId: string,
): Promise<number | null> {
  const inputs = await loadScoreInputs(db, workspaceId, contactId);
  if (!inputs) return null;
  const score = scoreContact(inputs);
  const { error } = await db.from('crm_contacts').update({ score }).eq('id', contactId).eq('workspace_id', workspaceId);
  return error ? null : score;
}
