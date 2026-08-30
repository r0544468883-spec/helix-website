'use server';

import { revalidatePath } from 'next/cache';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getWorkspace } from '@/lib/crm-workspace';
import { runGraph, type RunResult } from '@/lib/automations/engine';
import { emptyGraph, NODE_SPECS, TRIGGER_LABELS, type Graph, type TriggerKind } from '@/lib/automations/types';
import { templateByKey } from '@/lib/automations/templates';

async function ctx() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'auth' };
  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  if (!ws) return { ok: false as const, error: 'workspace' };
  return { ok: true as const, supabase, user, ws };
}

export type AutomationRow = { id: string; name: string; trigger: string; enabled: boolean; updated_at: string };

export async function autoList(): Promise<{ ok: false; error: string } | { ok: true; rows: AutomationRow[] }> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  const { data } = await c.supabase
    .from('automations').select('id, name, trigger, enabled, updated_at')
    .eq('workspace_id', c.ws.workspaceId).order('updated_at', { ascending: false });
  return { ok: true, rows: (data ?? []) as AutomationRow[] };
}

export async function autoGet(id: string): Promise<{ ok: false; error: string } | { ok: true; name: string; trigger: string; enabled: boolean; graph: Graph }> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  const { data } = await c.supabase
    .from('automations').select('name, trigger, enabled, graph')
    .eq('id', id).eq('workspace_id', c.ws.workspaceId).maybeSingle();
  if (!data) return { ok: false, error: 'notfound' };
  return { ok: true, name: data.name as string, trigger: data.trigger as string, enabled: data.enabled as boolean, graph: data.graph as Graph };
}

export async function autoCreate(input: { locale: string; trigger?: TriggerKind; templateKey?: string }): Promise<{ ok: boolean; error?: string; id?: string }> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  const tpl = input.templateKey ? templateByKey(input.templateKey) : undefined;
  const trigger = (tpl?.trigger ?? input.trigger ?? 'contact.created') as TriggerKind;
  const { data, error } = await c.supabase.from('automations').insert({
    workspace_id: c.ws.workspaceId, trigger,
    name: tpl?.name ?? 'אוטומציה חדשה',
    graph: tpl?.graph ?? emptyGraph(trigger),
    created_by: c.user.id,
  }).select('id').single();
  if (error || !data) return { ok: false, error: 'failed' };
  revalidatePath(`/${input.locale}/dashboard/automations`);
  return { ok: true, id: data.id as string };
}

export async function autoSave(input: { locale: string; id: string; name: string; trigger: TriggerKind; graph: Graph }): Promise<{ ok: boolean; error?: string }> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  const { error } = await c.supabase.from('automations').update({
    name: input.name?.trim() || 'אוטומציה', trigger: input.trigger, graph: input.graph, updated_at: new Date().toISOString(),
  }).eq('id', input.id).eq('workspace_id', c.ws.workspaceId);
  if (error) return { ok: false, error: 'failed' };
  revalidatePath(`/${input.locale}/dashboard/automations/${input.id}`);
  return { ok: true };
}

export async function autoToggle(input: { locale: string; id: string; enabled: boolean }): Promise<{ ok: boolean; error?: string }> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  const { error } = await c.supabase.from('automations')
    .update({ enabled: input.enabled }).eq('id', input.id).eq('workspace_id', c.ws.workspaceId);
  if (error) return { ok: false, error: 'failed' };
  revalidatePath(`/${input.locale}/dashboard/automations`);
  return { ok: true };
}

export async function autoDelete(input: { locale: string; id: string }): Promise<{ ok: boolean; error?: string }> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  await c.supabase.from('automations').delete().eq('id', input.id).eq('workspace_id', c.ws.workspaceId);
  revalidatePath(`/${input.locale}/dashboard/automations`);
  return { ok: true };
}

/** Test-run a graph against the workspace's top-scoring contact (no side-effect gating). */
export async function autoTestRun(input: { id: string; graph: Graph; trigger: TriggerKind }): Promise<{ ok: false; error: string } | { ok: true; result: RunResult; contactName: string }> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  const db = createAdminClient() ?? c.supabase;
  const { data: contact } = await c.supabase
    .from('crm_contacts').select('id, full_name').eq('workspace_id', c.ws.workspaceId)
    .order('score', { ascending: false }).limit(1).maybeSingle();
  if (!contact) return { ok: false, error: 'no-contact' };
  const result = await runGraph(db, c.ws.workspaceId, input.graph, contact.id as string, input.trigger);
  return { ok: true, result, contactName: contact.full_name as string };
}

/** Verbal builder — describe the automation in Hebrew, Claude emits a graph. */
export async function autoFromPrompt(input: { prompt: string; trigger: TriggerKind }): Promise<{ ok: false; error: string } | { ok: true; graph: Graph }> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { ok: false, error: 'no-key' };
  if (!input.prompt?.trim()) return { ok: false, error: 'empty' };

  const kinds = Object.values(NODE_SPECS).map((s) => `- ${s.kind}: ${s.label} (${s.hint})${s.branching ? ' [יש true/false]' : ''}`).join('\n');
  const sys = `אתה בונה גרף אוטומציה ל-CRM. החזר אך ורק JSON תקין במבנה:
{"nodes":[{"id":"trigger","kind":"trigger","position":{"x":80,"y":160},"data":{"trigger":"${input.trigger}"}}, ...],"edges":[{"id":"e1","source":"trigger","target":"n1"}, ...]}
סוגי צמתים זמינים:
${kinds}
כללים: תמיד צומת אחד בשם trigger. חבר כל צומת בקשת (edge). לצומת condition צור שתי קשתות עם sourceHandle "true" ו-"false". פזר position על ציר x בקפיצות ~220 וב-y סביב 100–260. data מכיל את שדות הקונפיג הרלוונטיים. אל תוסיף טקסט מחוץ ל-JSON.`;

  try {
    const client = new Anthropic({ apiKey: key });
    const msg = await client.messages.create({
      model: 'claude-opus-4-8', max_tokens: 2000,
      system: sys,
      messages: [{ role: 'user', content: input.prompt.trim() }],
    });
    const text = msg.content.filter((b) => b.type === 'text').map((b) => (b as { text: string }).text).join('');
    const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const graph = JSON.parse(json) as Graph;
    if (!Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) return { ok: false, error: 'bad-graph' };
    if (!graph.nodes.some((n) => n.kind === 'trigger')) return { ok: false, error: 'no-trigger' };
    return { ok: true, graph };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function autoTriggerLabels() {
  return TRIGGER_LABELS;
}
