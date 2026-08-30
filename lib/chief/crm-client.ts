// CrmClient — in-process implementation for helix-stage.
// Talks to Supabase (admin, workspace-scoped) exactly like /api/v1/crm/*.
// A standalone helix-chief app would ship an HttpCrmClient hitting that API instead.

import { createAdminClient } from '@/lib/supabase/admin';
import { scoreContact } from '@/lib/crm-score';
import { enrichEmail } from '@/lib/enrich';
import type { CrmClient, LeadRow } from './types';

const LEAD_COLS =
  'id, full_name, email, phone, role_title, lifecycle_stage, lead_status, score, last_activity_at';

export function inProcessCrmClient(workspaceId: string): CrmClient {
  const admin = createAdminClient();
  if (!admin) throw new Error('CHIEF: service role not configured');

  return {
    async listLeads({ tier, limit = 20 }) {
      let q = admin
        .from('crm_contacts')
        .select(LEAD_COLS)
        .eq('workspace_id', workspaceId)
        .order('score', { ascending: false })
        .limit(Math.min(Math.max(limit, 1), 100));
      if (tier === 'hot') q = q.gte('score', 70);
      else if (tier === 'warm') q = q.gte('score', 40).lt('score', 70);
      else if (tier === 'cold') q = q.lt('score', 40);
      const { data, error } = await q;
      if (error) throw new Error('CHIEF: listLeads failed');
      return (data ?? []) as LeadRow[];
    },

    async getContact(id) {
      const { data } = await admin
        .from('crm_contacts')
        .select(LEAD_COLS)
        .eq('workspace_id', workspaceId)
        .eq('id', id)
        .maybeSingle();
      return (data as LeadRow | null) ?? null;
    },

    async createContact({ full_name, email, phone, source }) {
      const mail = email ? email.trim().toLowerCase() : null;
      const enriched = mail ? enrichEmail(mail) : { isBusiness: false };
      const score = scoreContact({ is_business: enriched.isBusiness, lifecycle_stage: 'lead', phone: phone?.trim() || null });
      const { data, error } = await admin
        .from('crm_contacts')
        .insert({
          workspace_id: workspaceId,
          full_name: full_name.trim(),
          email: mail,
          phone: phone?.trim() || null,
          is_business: enriched.isBusiness,
          score,
          source: source || 'chief',
          lifecycle_stage: 'lead',
        })
        .select('id')
        .single();
      if (error || !data) throw new Error('CHIEF: createContact failed');
      return { id: data.id as string };
    },

    async logActivity({ contact_id, deal_id, type, body }) {
      const { data, error } = await admin
        .from('crm_activities')
        .insert({
          workspace_id: workspaceId,
          contact_id: contact_id ?? null,
          deal_id: deal_id ?? null,
          type: type || 'note',
          body,
          occurred_at: new Date().toISOString(),
        })
        .select('id')
        .single();
      if (error || !data) throw new Error('CHIEF: logActivity failed');
      return { id: data.id as string };
    },
  };
}
