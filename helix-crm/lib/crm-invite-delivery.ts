import 'server-only';
import { Resend } from 'resend';
import type { createAdminClient } from '@/lib/supabase/admin';
import { SETTLED_DELIVERY } from '@/lib/crm-invite-state';

type Admin = NonNullable<ReturnType<typeof createAdminClient>>;

const MAX_LOOKUPS = 3;
const BUDGET_MS = 3_000;
const RECHECK_MS = 60_000;

/**
 * Asks Resend what happened to the workspace's unsettled invite emails, when the
 * Team screen opens: at most 3, the least recently checked first, one at a time
 * (Resend allows 2 requests a second), within 3 seconds, and each at most once a
 * minute. Stops on a 429 or the budget and leaves the rest at their last known
 * state. Never throws. See openspec/changes/crm-team-invites/design.md, decision 6.
 */
export async function refreshDeliveries(admin: Admin, workspaceId: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const started = Date.now();
  try {
    const { data } = await admin.from('crm_invites')
      .select('id, email_id, delivery, delivery_checked_at')
      .eq('workspace_id', workspaceId)
      .not('email_id', 'is', null)
      .order('delivery_checked_at', { ascending: true, nullsFirst: true })
      .limit(20);
    const due = ((data ?? []) as { id: string; email_id: string; delivery: string | null; delivery_checked_at: string | null }[])
      .filter((r) => !SETTLED_DELIVERY.has(r.delivery ?? '')
        && (!r.delivery_checked_at || started - Date.parse(r.delivery_checked_at) >= RECHECK_MS))
      .slice(0, MAX_LOOKUPS);
    if (due.length === 0) return;

    const resend = new Resend(key);
    for (const r of due) {
      const left = BUDGET_MS - (Date.now() - started);
      if (left <= 0) break;
      const got = await Promise.race([
        resend.emails.get(r.email_id),
        new Promise<null>((res) => setTimeout(() => res(null), left)),
      ]);
      if (!got) break;                                   // out of time
      if (got.error) {
        if (got.error.statusCode === 429 || got.error.name === 'rate_limit_exceeded') break;
        continue;                                        // this one, not the rest
      }
      await admin.from('crm_invites')
        .update({ delivery: got.data.last_event, delivery_checked_at: new Date().toISOString() })
        .eq('id', r.id);
    }
  } catch (e) {
    console.error('[invite delivery] lookup failed', e instanceof Error ? e.message : String(e));
  }
}
