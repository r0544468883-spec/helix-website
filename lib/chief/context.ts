// HELIX CHIEF — host wiring. Resolves the session into a ChiefContext:
// the connected sources (the "door"), the capability resolver, autonomy, and
// entitlements. Today only HELIX CRM is live; the rest of the catalog is shown
// as available-to-connect (via n8n / API) so CHIEF knows the whole stack.

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getWorkspace } from '@/lib/crm-workspace';
import { resolveMode } from '@/lib/autonomy/resolve';
import { inProcessCrmClient } from './crm-client';
import { CONNECTORS } from './connectors';
import type { ChiefContext, DataSource, CapabilityKind, CapabilityFor, ContactsCapability } from './types';

// Entitlement statuses that keep a product open (trial or paid, incl. dunning).
const UNLOCKED_STATUSES = ['active', 'trialing', 'past_due'];

/** Real entitlements from the shared HELIX Account Portal (`helix_entitlements`).
 *  CRM + CHIEF are always free — owning ANY product grants CHIEF. */
async function loadEntitlements(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<Set<string>> {
  const set = new Set<string>(['crm', 'chief']);
  try {
    const { data } = await supabase
      .from('helix_entitlements')
      .select('product_key, status')
      .eq('user_id', userId);
    for (const r of data ?? []) {
      if (UNLOCKED_STATUSES.includes(r.status as string)) set.add(r.product_key as string);
    }
  } catch { /* fail soft — CRM + CHIEF only */ }
  return set;
}

// אילו מקורות מחוברים בפועל ל-workspace. כרגע רק ה-CRM שלנו; השאר יתחברו דרך n8n.
// TODO: לקרוא את החיבורים של ה-workspace מטבלת connections.
const CONFIGURED_SOURCE_IDS = new Set(['helix-crm']);

function buildSources(workspaceId: string): DataSource[] {
  const liveContacts = inProcessCrmClient(workspaceId); // ה-CRM החינם שלנו
  return CONNECTORS.map((c) => {
    const configured = CONFIGURED_SOURCE_IDS.has(c.id);
    const src: DataSource = {
      id: c.id,
      label: c.label,
      kind: c.kind,
      region: c.region,
      provides: c.provides,
      configured,
    };
    // מחברים יכולת חיה רק למקור שמחובר בפועל.
    if (configured && c.id === 'helix-crm') src.contacts = liveContacts;
    return src;
  });
}

export async function buildChiefContext(
  locale: string,
): Promise<{ ok: true; ctx: ChiefContext } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthorized' };

  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  if (!ws) return { ok: false, error: 'no_workspace' };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: 'service_role_missing' };

  const sources = buildSources(ws.workspaceId);
  const entitlements = await loadEntitlements(supabase, user.id);

  const capability = <T extends CapabilityKind>(kind: T): CapabilityFor<T> => {
    const src = sources.find((s) => s.configured && s[kind]);
    if (!src) throw new Error(`CHIEF: אין מקור מחובר שמספק "${kind}". חברו כלי דרך n8n או הגדרות.`);
    return src[kind] as CapabilityFor<T>;
  };

  const ctx: ChiefContext = {
    workspaceId: ws.workspaceId,
    locale,
    sources,
    capability,
    get contacts(): ContactsCapability {
      return capability('contacts');
    },
    hasEntitlement: (e) => entitlements.has(e),
    resolveAutonomy: (featureKey) => resolveMode(admin, ws.workspaceId, featureKey),
  };
  return { ok: true, ctx };
}
