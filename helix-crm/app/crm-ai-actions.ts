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

export type AssistKind = 'summary' | 'email' | 'next' | 'score';

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
        : kind === 'score'
          ? 'הערך את פוטנציאל הסגירה של הליד. שורה ראשונה בדיוק בפורמט "פוטנציאל: NN/100", ואז 2-3 שורות נימוק: מה מעלה, מה מוריד, ומה יזיז את המחט.'
          : 'מה הצעד הבא הכי חכם עם הליד הזה? המלצה אחת קונקרטית + ניסוח הודעה קצרה לשליחה (וואטסאפ או מייל).';

  const r = await callAi(s, SYSTEM, `${lines.join('\n')}\n\nמשימה: ${ask}`, 700);
  if (!r.ok) return { ok: false, error: r.error };

  // An AI assessment is worth keeping: log it to the timeline (without touching
  // the computed score — the assessment sits beside it, not instead of it).
  if (kind === 'score') {
    await c.supabase.from('crm_activities').insert({
      workspace_id: c.ws.workspaceId, contact_id: contactId, type: 'note',
      body: `🤖 הערכת AI:\n${r.text.slice(0, 1500)}`,
    }).then(() => undefined, () => undefined);
  }
  return { ok: true, text: r.text };
}

// ---- Workspace snapshot: the context every "whole-CRM" AI feature shares -----
async function workspaceSnapshot(c: { supabase: Awaited<ReturnType<typeof createClient>>; ws: { workspaceId: string } }): Promise<string> {
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const [{ data: contacts }, { data: deals }, { data: tasks }, { count: newContacts }, { data: weekActs }] = await Promise.all([
    c.supabase.from('crm_contacts').select('full_name, status, score, source, last_activity_at')
      .eq('workspace_id', c.ws.workspaceId).order('score', { ascending: false }).limit(30),
    c.supabase.from('crm_deals').select('title, value, stage, status, created_at')
      .eq('workspace_id', c.ws.workspaceId).order('created_at', { ascending: false }).limit(40),
    c.supabase.from('crm_tasks').select('title, due_date, status').eq('workspace_id', c.ws.workspaceId)
      .eq('status', 'open').order('due_date', { ascending: true }).limit(20),
    c.supabase.from('crm_contacts').select('id', { count: 'exact', head: true })
      .eq('workspace_id', c.ws.workspaceId).gte('created_at', weekAgo),
    c.supabase.from('crm_activities').select('type').eq('workspace_id', c.ws.workspaceId).gte('created_at', weekAgo).limit(500),
  ]);
  const now = Date.now();
  const L: string[] = [`[תמונת מצב של ה-CRM]`, `לידים חדשים השבוע: ${newContacts ?? 0} · פעולות שנרשמו השבוע: ${(weekActs ?? []).length}`];
  L.push('אנשי קשר מובילים (שם · סטטוס · ניקוד · ימים מאז מגע):');
  for (const p of (contacts ?? []) as { full_name: string; status: string; score: number; source: string | null; last_activity_at: string | null }[]) {
    const days = p.last_activity_at ? Math.floor((now - new Date(p.last_activity_at).getTime()) / 86_400_000) : null;
    L.push(`- ${p.full_name} · ${p.status} · ${p.score}${days !== null ? ` · ${days} ימים` : ' · ללא מגע'}${p.source ? ` · מקור: ${p.source}` : ''}`);
  }
  L.push('עסקאות (שם · שלב · סטטוס · ₪):');
  for (const d of (deals ?? []) as { title: string; value: number; stage: string; status: string }[]) {
    L.push(`- ${d.title} · ${d.stage} · ${d.status}${d.value ? ` · ₪${d.value}` : ''}`);
  }
  L.push('משימות פתוחות:');
  for (const tk of (tasks ?? []) as { title: string; due_date: string | null }[]) {
    L.push(`- ${tk.title}${tk.due_date ? ` · עד ${tk.due_date}` : ''}`);
  }
  return L.join('\n');
}

export type ChatMsg = { role: 'user' | 'assistant'; content: string };

/** Free chat over the whole CRM: "מי שווה לחזור אליו היום?". */
export async function crmAiChat(history: ChatMsg[]): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  const s = await getAiSettings(c.ws.workspaceId);
  if (!s || !s.enabled) return { ok: false, error: 'not_configured' };
  const snapshot = await workspaceSnapshot(c);
  const trimmed = history.slice(-10).map((m) => `${m.role === 'user' ? 'שאלה' : 'תשובה קודמת'}: ${String(m.content).slice(0, 800)}`).join('\n');
  const r = await callAi(
    s,
    `${SYSTEM}\nאתה עונה על שאלות על ה-CRM של המשתמש לפי תמונת המצב. ענה קצר, קונקרטי, עם שמות. אל תמציא נתונים שלא מופיעים.`,
    `${snapshot}\n\n${trimmed}`,
    800,
  );
  return r.ok ? { ok: true, text: r.text } : { ok: false, error: r.error };
}

/** AI lead assessment: potential score + why. Logged to the timeline so it sticks. */
export async function crmAiScore(contactId: string): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  return crmAiAssist(contactId, 'score');
}

/** Weekly business summary, written by the AI, optionally emailed to the caller. */
export async function crmAiWeekly(send: boolean): Promise<{ ok: true; text: string; sent: boolean } | { ok: false; error: string }> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  const s = await getAiSettings(c.ws.workspaceId);
  if (!s || !s.enabled) return { ok: false, error: 'not_configured' };
  const snapshot = await workspaceSnapshot(c);
  const r = await callAi(
    s,
    `${SYSTEM}\nאתה כותב סיכום שבועי קצר לבעל העסק על מצב המכירות שלו.`,
    `${snapshot}\n\nמשימה: כתוב סיכום שבועי (עד 10 שורות): מה קרה השבוע, 3 הלידים שהכי שווה לטפל בהם עכשיו ולמה, ומה הדבר האחד הכי חשוב לשבוע הבא.`,
    900,
  );
  if (!r.ok) return { ok: false, error: r.error };
  let sent = false;
  if (send && c.user.email && process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const esc = (v: string) => v.replace(/[<>&]/g, (ch) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[ch] as string));
      const { error } = await resend.emails.send({
        from: process.env.RESEND_FROM || 'HELIX <noreply@helix.co.il>',
        to: c.user.email,
        subject: 'הסיכום השבועי של העסק שלך 📊',
        html: `<div dir="rtl" style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.7">${esc(r.text).replace(/\n/g, '<br>')}</div>`,
      });
      sent = !error;
    } catch { sent = false; }
  }
  return { ok: true, text: r.text, sent };
}

/** AI-written email campaign: topic → subject + simple-HTML body, in the
 *  business's voice. Used by the campaign composer's "write with AI". */
export async function crmAiCampaign(topic: string): Promise<{ ok: true; subject: string; body: string } | { ok: false; error: string }> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  const s = await getAiSettings(c.ws.workspaceId);
  if (!s || !s.enabled) return { ok: false, error: 'not_configured' };
  const clean = topic.trim().slice(0, 300);
  if (!clean) return { ok: false, error: 'topic_required' };

  const r = await callAi(
    s,
    `${SYSTEM}\nאתה כותב מייל שיווקי לרשימת התפוצה של העסק. חם, ענייני, בלי לחץ מכירתי מוגזם.`,
    `כתוב מייל שיווקי בעברית בנושא: "${clean}".
שורה ראשונה: שורת הנושא בלבד (בלי המילה "נושא").
אחר כך שורה ריקה, ואז גוף המייל: 3-5 פסקאות קצרות, בלי כותרות, עם קריאה אחת ברורה לפעולה בסוף.`,
    900,
  );
  if (!r.ok) return { ok: false, error: r.error };
  const linesOut = r.text.split('\n');
  const subject = (linesOut[0] ?? '').replace(/^נושא[:\s]*/, '').trim().slice(0, 150) || clean;
  const rest = linesOut.slice(1).join('\n').trim();
  const body = rest
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/[<>&]/g, (ch) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[ch] as string)).replace(/\n/g, '<br>')}</p>`)
    .join('\n');
  return { ok: true, subject, body };
}
