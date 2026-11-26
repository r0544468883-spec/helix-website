'use server';

// BYOK AI server actions: save/test the workspace's own AI key and run the
// assistant on a contact. The key is admin-gated on write and never returned —
// only a masked prefix. Assist is open to every workspace member.

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getWorkspace } from '@/lib/crm-workspace';
import { getAiSettings, callAi, maskKey, defaultModelFor, AI_PROVIDERS, type AiProvider } from '@/lib/crm-ai';

async function ctx() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'auth' };
  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  if (!ws) return { ok: false as const, error: 'workspace' };
  return { ok: true as const, supabase, user, ws };
}

export type AiStatus = {
  configured: boolean;
  enabled: boolean;
  provider: AiProvider;
  model: string;
  masked: string | null;
  isAdmin: boolean;
};

export async function crmAiStatus(): Promise<{ ok: false; error: string } | ({ ok: true } & AiStatus)> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  const s = await getAiSettings(c.ws.workspaceId);
  return {
    ok: true,
    configured: !!s,
    enabled: s?.enabled ?? false,
    provider: (s?.provider ?? 'anthropic') as AiProvider,
    model: s?.model || defaultModelFor((s?.provider ?? 'anthropic') as AiProvider),
    masked: s ? maskKey(s.api_key) : null,
    isAdmin: c.ws.role === 'admin',
  };
}

export async function crmAiSave(input: { provider: string; apiKey?: string; model?: string; enabled: boolean }): Promise<{ ok: boolean; error?: string }> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  if (c.ws.role !== 'admin') return { ok: false, error: 'admin_only' };
  const provider = AI_PROVIDERS.some((p) => p.id === input.provider) ? (input.provider as AiProvider) : 'anthropic';
  const apiKey = (input.apiKey ?? '').trim();
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: 'noadmin' };

  const existing = await getAiSettings(c.ws.workspaceId);
  if (!apiKey && !existing) return { ok: false, error: 'key_required' };

  const row = {
    workspace_id: c.ws.workspaceId,
    provider,
    // An empty key keeps the stored one (edits shouldn't force re-pasting the secret).
    api_key: apiKey || existing!.api_key,
    model: (input.model ?? '').trim() || null,
    enabled: input.enabled,
    updated_at: new Date().toISOString(),
  };
  const { error } = await admin.from('crm_ai_settings').upsert(row, { onConflict: 'workspace_id' });
  if (error) return { ok: false, error: 'save_failed' };
  return { ok: true };
}

export async function crmAiTest(): Promise<{ ok: boolean; error?: string }> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  const s = await getAiSettings(c.ws.workspaceId);
  if (!s) return { ok: false, error: 'not_configured' };
  const r = await callAi(s, 'אתה בודק חיבור. ענה במילה אחת בלבד: תקין', 'בדיקה', 20);
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}

export type AssistKind = 'summary' | 'email' | 'next';

const SYSTEM = `אתה עוזר מכירות של עסק קטן ישראלי, בתוך ה-CRM שלו.
כתוב עברית טבעית בגובה העיניים. בלי קו מפריד ארוך, בלי סופרלטיבים ריקים, בלי המצאת עובדות —
אם חסר מידע, אמור זאת. קצר ושימושי.`;

export async function crmAiAssist(contactId: string, kind: AssistKind): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  const s = await getAiSettings(c.ws.workspaceId);
  if (!s || !s.enabled) return { ok: false, error: 'not_configured' };

  // Workspace-scoped context: the contact, open deals, latest activity.
  const [{ data: contact }, { data: acts }, { data: deals }] = await Promise.all([
    c.supabase.from('crm_contacts').select('full_name, role_title, status, score, source, notes, crm_companies(name)')
      .eq('id', contactId).eq('workspace_id', c.ws.workspaceId).maybeSingle(),
    c.supabase.from('crm_activities').select('type, body, created_at')
      .eq('contact_id', contactId).order('created_at', { ascending: false }).limit(15),
    c.supabase.from('crm_deals').select('title, value, stage, status')
      .eq('contact_id', contactId).order('created_at', { ascending: false }).limit(5),
  ]);
  if (!contact) return { ok: false, error: 'not_found' };

  const co = Array.isArray(contact.crm_companies)
    ? (contact.crm_companies[0] as { name: string } | undefined)?.name
    : (contact.crm_companies as { name: string } | null)?.name;
  const lines: string[] = [
    `ליד: ${contact.full_name}${contact.role_title ? `, ${contact.role_title}` : ''}${co ? `, ${co}` : ''}`,
    `סטטוס: ${contact.status} · ניקוד: ${contact.score}${contact.source ? ` · מקור: ${contact.source}` : ''}`,
  ];
  if (contact.notes) lines.push(`רקע: ${String(contact.notes).slice(0, 500)}`);
  for (const d of (deals ?? []) as { title: string; value: number; stage: string; status: string }[]) {
    lines.push(`עסקה: ${d.title} · ${d.stage} (${d.status})${d.value ? ` · ₪${d.value}` : ''}`);
  }
  lines.push('פעילות אחרונה (מהחדש לישן):');
  for (const a of (acts ?? []) as { type: string; body: string; created_at: string }[]) {
    lines.push(`- [${a.created_at.slice(0, 10)}] ${a.type}: ${a.body.slice(0, 200)}`);
  }

  const ask =
    kind === 'summary'
      ? 'סכם את הליד הזה ב-4-5 שורות: מי זה, איפה זה עומד, מה חם ומה מדאיג.'
      : kind === 'email'
        ? 'נסח מייל מעקב קצר (עד 90 מילים) מבעל העסק אל הליד, חם וענייני, שמקדם את העסקה צעד אחד. כולל שורת נושא.'
        : 'מה הצעד הבא הכי חכם עם הליד הזה? המלצה אחת קונקרטית + ניסוח הודעה קצרה לשליחה (וואטסאפ או מייל).';

  const r = await callAi(s, SYSTEM, `${lines.join('\n')}\n\nמשימה: ${ask}`, 700);
  return r.ok ? { ok: true, text: r.text } : { ok: false, error: r.error };
}
