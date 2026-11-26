import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { enrichEmail } from '@/lib/enrich';
import { getAiSettings, callAi } from '@/lib/crm-ai';
import { rescoreContact } from '@/lib/crm-rescore';
import type { Graph, FlowNode, TriggerKind } from './types';

// ── Automation execution engine ──────────────────────────────────────────────
// Walks a stored node graph when a trigger fires. Reuses the same CRM primitives
// the manual actions use (enrichEmail / scoreContact / crm_tasks / crm_activities),
// so an automated step and a hand-done step behave identically. Outbound channels
// (WhatsApp/email/n8n) degrade to a logged no-op until a connection is configured.

type Db = SupabaseClient;

type Contact = {
  id: string; email: string | null; is_business: boolean;
  company_id: string | null; status: string; lifecycle_stage: string; lead_status: string;
  phone: string | null; linkedin_url: string | null; last_activity_at: string | null; score: number;
};

type Step = { node: string; kind: string; result: string };

const MAX_STEPS = 50; // cycle guard

export type RunResult = { status: 'ok' | 'error'; log: Step[] };

/** Run every enabled automation for this workspace + trigger against one contact. */
export async function runAutomationsForContact(
  db: Db, workspaceId: string, trigger: TriggerKind, contactId: string
): Promise<RunResult[]> {
  const { data: autos } = await db
    .from('automations')
    .select('id, name, graph')
    .eq('workspace_id', workspaceId).eq('trigger', trigger).eq('enabled', true);
  if (!autos?.length) return [];

  const results: RunResult[] = [];
  for (const a of autos) {
    const res = await runGraph(db, workspaceId, a.graph as Graph, contactId, trigger);
    results.push(res);
    await db.from('automation_runs').insert({
      automation_id: a.id, workspace_id: workspaceId, status: res.status, trigger, log: res.log,
    });
  }
  return results;
}

/** Execute a single graph. Exported so the builder's "test run" can call it directly. */
export async function runGraph(
  db: Db, workspaceId: string, graph: Graph, contactId: string, trigger: TriggerKind
): Promise<RunResult> {
  const log: Step[] = [];
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));

  const { data: c } = await db
    .from('crm_contacts')
    .select('id, email, is_business, company_id, status, lifecycle_stage, lead_status, phone, linkedin_url, last_activity_at, score')
    .eq('id', contactId).eq('workspace_id', workspaceId).maybeSingle();
  if (!c) return { status: 'error', log: [{ node: '-', kind: 'load', result: 'contact not found' }] };
  let contact = c as Contact;

  // walk from the trigger node
  let current: FlowNode | undefined = graph.nodes.find((n) => n.kind === 'trigger');
  let steps = 0;
  let branch: string | null = null; // for condition edges

  while (current && steps++ < MAX_STEPS) {
    if (current.kind !== 'trigger') {
      try {
        const r = await execNode(db, workspaceId, current, contact);
        log.push({ node: current.id, kind: current.kind, result: r.msg });
        if (r.contact) contact = r.contact;
        branch = r.branch ?? null;
      } catch (e) {
        log.push({ node: current.id, kind: current.kind, result: `error: ${(e as Error).message}` });
        return { status: 'error', log };
      }
    }
    const next = pickNext(graph, current.id, branch);
    branch = null;
    current = next ? nodeById.get(next) : undefined;
  }
  return { status: 'ok', log };
}

function pickNext(graph: Graph, from: string, branch: string | null): string | undefined {
  const outs = graph.edges.filter((e) => e.source === from);
  if (branch) {
    const match = outs.find((e) => (e.sourceHandle ?? 'true') === branch);
    return match?.target;
  }
  return outs[0]?.target;
}

async function execNode(
  db: Db, workspaceId: string, node: FlowNode, contact: Contact
): Promise<{ msg: string; contact?: Contact; branch?: string }> {
  const d = node.data ?? {};
  switch (node.kind) {
    case 'enrich': {
      if (!contact.email) return { msg: 'אין מייל — דילוג' };
      const e = enrichEmail(contact.email);
      await db.from('crm_contacts').update({ is_business: e.isBusiness }).eq('id', contact.id).eq('workspace_id', workspaceId);
      return { msg: `הועשר (עסקי=${e.isBusiness})`, contact: { ...contact, is_business: e.isBusiness } };
    }
    case 'score': {
      // Reloads from the database so an open deal counts; earlier nodes write their
      // changes through before this runs.
      const score = (await rescoreContact(db, workspaceId, contact.id)) ?? contact.score;
      return { msg: `ניקוד=${score}`, contact: { ...contact, score } };
    }
    case 'condition': {
      const field = String(d.field ?? 'score');
      const op = String(d.op ?? '>=');
      const raw = (contact as unknown as Record<string, unknown>)[field];
      const passed = compare(raw, op, d.value);
      return { msg: `${field} ${op} ${d.value} → ${passed ? 'כן' : 'לא'}`, branch: passed ? 'true' : 'false' };
    }
    case 'create_task': {
      const dueDays = Number(d.due_days ?? 0);
      const due = dueDays > 0 ? new Date(Date.now() + dueDays * 86400_000).toISOString().slice(0, 10) : null;
      await db.from('crm_tasks').insert({
        workspace_id: workspaceId, contact_id: contact.id, title: String(d.title || 'מעקב אוטומטי'), due_date: due,
      });
      return { msg: `נוצרה משימה: ${d.title || 'מעקב אוטומטי'}` };
    }
    case 'log_activity': {
      await db.from('crm_activities').insert({
        workspace_id: workspaceId, contact_id: contact.id, type: 'note', body: String(d.body || 'פעילות אוטומטית'),
      });
      return { msg: 'נרשמה פעילות' };
    }
    case 'send_whatsapp':
      // No WhatsApp provider wired yet (only a token check). Honest skip until one exists.
      return { msg: hasChannel('whatsapp') ? 'שליחת וואטסאפ עדיין לא ממומשת — דילוג' : 'אין ערוץ וואטסאפ מחובר — דילוג' };
    case 'send_email': {
      if (!contact.email) return { msg: 'אין מייל לנמען — דילוג' };
      if (!process.env.RESEND_API_KEY) return { msg: 'אין ערוץ מייל מחובר (RESEND_API_KEY) — דילוג' };
      let subject = String(d.subject || 'הודעה מ-HELIX').slice(0, 200);
      let text = String(d.body || '').trim();
      // AI mode (BYOK): ai_prompt on the node → the workspace's own AI writes a
      // personalized email for THIS contact; the node's subject/body become fallbacks.
      const aiPrompt = String(d.ai_prompt || '').trim();
      if (aiPrompt) {
        const ai = await getAiSettings(workspaceId);
        if (ai && ai.enabled) {
          const r = await callAi(
            ai,
            'אתה כותב מייל קצר בעברית טבעית מעסק קטן אל ליד. בלי המצאות. שורה ראשונה: שורת הנושא בלבד, ואז שורה ריקה וגוף המייל.',
            `הליד: סטטוס ${contact.status}, ניקוד ${contact.score}${contact.email ? `, מייל ${contact.email}` : ''}.
מה לכתוב: ${aiPrompt.slice(0, 400)}`,
            500,
          );
          if (r.ok) {
            const ls = r.text.split('\n');
            subject = (ls[0] ?? subject).replace(/^נושא[:\s]*/, '').trim().slice(0, 200) || subject;
            text = ls.slice(1).join('\n').trim() || text;
          }
        }
      }
      if (!text) return { msg: 'אין תוכן למייל — דילוג' };
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        const from = process.env.RESEND_FROM || 'HELIX <noreply@helix.co.il>';
        const html = `<div dir="rtl" style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6">${text.replace(/[<>&]/g, (ch) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[ch] as string)).replace(/\n/g, '<br>')}</div>`;
        const { error } = await resend.emails.send({ from, to: contact.email, subject, html });
        if (error) return { msg: `שליחת מייל נכשלה: ${error.message}`.slice(0, 160) };
        return { msg: `נשלח מייל: ${subject}` };
      } catch (e) {
        return { msg: `שליחת מייל נכשלה: ${(e as Error).message}`.slice(0, 160) };
      }
    }
    case 'wait':
      // MVP: synchronous run logs the intended delay and continues. Real scheduling
      // (a queue that resumes later) is a follow-up; noted so behavior is honest.
      return { msg: `המתנה ${d.hours ?? 0}ש׳ (בהרצה מיידית — מדולג)` };
    case 'n8n': {
      const url = process.env.N8N_WEBHOOK_URL;
      if (!url) return { msg: 'לא הוגדר N8N_WEBHOOK_URL — דילוג' };
      try {
        await fetch(url, {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ workflow: d.workflow, workspaceId, contact }),
        });
        return { msg: `הועבר ל-n8n (${d.workflow || 'default'})` };
      } catch (e) { return { msg: `n8n נכשל: ${(e as Error).message}` }; }
    }
    default:
      return { msg: 'צומת לא מוכר — דילוג' };
  }
}

function hasChannel(kind: 'whatsapp' | 'email'): boolean {
  if (kind === 'whatsapp') return !!process.env.WHATSAPP_TOKEN;
  return !!(process.env.RESEND_API_KEY || process.env.SMTP_URL);
}

function compare(a: unknown, op: string, b: unknown): boolean {
  const na = Number(a), nb = Number(b);
  const numeric = !Number.isNaN(na) && !Number.isNaN(nb);
  switch (op) {
    case '>=': return numeric ? na >= nb : String(a) >= String(b);
    case '<=': return numeric ? na <= nb : String(a) <= String(b);
    case '==': return String(a) === String(b);
    case '!=': return String(a) !== String(b);
    default: return false;
  }
}
