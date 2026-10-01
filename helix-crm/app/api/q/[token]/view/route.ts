import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { accessRole } from '@/lib/crm-workspace';
import { getDict } from '@/lib/i18n';

const TOKEN_RE = /^[A-Za-z0-9_-]{40,64}$/;
const done = () => new NextResponse(null, { status: 204 });

/**
 * Records that a sent quote's page was opened. Called by the page's script after it
 * mounts (QuoteViewBeacon), so link-preview robots, which run no script, never get
 * here. It answers 204 to everything and records only a sent quote opened by
 * someone who is not a signed-in member of its workspace. The first open writes one
 * timeline row; later opens only move last_viewed_at.
 * See DESIGN.md §9 — Counting a view.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!TOKEN_RE.test(token)) return done();
  const admin = createAdminClient();
  if (!admin) return done();
  const { data: q } = await admin.from('crm_quotes')
    .select('id, workspace_id, contact_id, status, number, locale, first_viewed_at, client_snapshot')
    .eq('public_token', token).maybeSingle();
  if (!q || q.status !== 'sent') return done();

  // Someone from the workspace checking their own link is not the client opening it.
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user && (await accessRole(admin, user.id, q.workspace_id as string))) return done();
  } catch {
    // no session: the client
  }

  const now = new Date().toISOString();
  if (!q.first_viewed_at) {
    // Only the request that sets first_viewed_at writes the timeline row, so two
    // opens at once write one.
    const { data: first } = await admin.from('crm_quotes')
      .update({ first_viewed_at: now, last_viewed_at: now })
      .eq('id', q.id).is('first_viewed_at', null).select('id');
    if (first && first.length > 0) {
      if (q.contact_id) {
        const t = getDict(q.locale as string).crm;
        const snap = q.client_snapshot as { name?: string } | null;
        const firstName = String(snap?.name ?? '').trim().split(/\s+/)[0] ?? '';
        const { error } = await admin.from('crm_activities').insert({
          workspace_id: q.workspace_id,
          contact_id: q.contact_id,
          type: 'quote',
          body: t.quoteOpenedBody.replace('{name}', firstName).replace('{number}', String(q.number ?? '')),
        });
        if (error) console.error('[quote view] opened but not logged:', error.message);
      }
      return done();
    }
  }
  await admin.from('crm_quotes').update({ last_viewed_at: now }).eq('id', q.id);
  return done();
}
