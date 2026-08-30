// HELIX CHIEF — agent registry. Each product exposes itself as a HelixAgent.
// MVP ships two: CRM (real DB ops) and Outreach (drafting). Add Scheduling /
// Marketing / SDR / Meeting here as their extension packages land — the
// orchestrator picks up any registered agent the workspace is entitled to.

import type { HelixAgent, ChiefContext } from './types';
import { getSlots, createBooking, calcomConfigured } from './scheduling/calcom';

const crmAgent: HelixAgent = {
  id: 'crm',
  label: 'CRM',
  entitlement: 'crm', // חינם — כל workspace
  tools: [
    {
      name: 'list_leads',
      description: 'רשימת אנשי קשר לפי ניקוד. tier: hot (חם) / warm / cold. השתמש כדי למצוא את הלידים החמים.',
      autonomyClass: 'read',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          tier: { type: 'string', enum: ['hot', 'warm', 'cold'] },
          limit: { type: 'integer', minimum: 1, maximum: 100 },
        },
      },
      run: (input, ctx: ChiefContext) =>
        ctx.contacts.listLeads({ tier: input.tier as 'hot' | 'warm' | 'cold' | undefined, limit: input.limit as number }),
    },
    {
      name: 'get_contact',
      description: 'שליפת איש קשר בודד לפי id.',
      autonomyClass: 'read',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: { id: { type: 'string' } },
        required: ['id'],
      },
      run: (input, ctx) => ctx.contacts.getContact(String(input.id)),
    },
    {
      name: 'create_contact',
      description: 'יצירת ליד חדש ב-CRM (מנוקד ומועשר אוטומטית).',
      autonomyClass: 'internal',
      featureKey: 'crm.next_step',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          full_name: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          source: { type: 'string' },
        },
        required: ['full_name'],
      },
      run: (input, ctx) =>
        ctx.contacts.createContact({
          full_name: String(input.full_name),
          email: input.email as string,
          phone: input.phone as string,
          source: input.source as string,
        }),
    },
    {
      name: 'log_activity',
      description: 'רישום פעילות (הערה/שיחה/מייל) על איש קשר או עסקה.',
      autonomyClass: 'internal',
      featureKey: 'crm.next_step',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          contact_id: { type: 'string' },
          deal_id: { type: 'string' },
          type: { type: 'string', enum: ['note', 'call', 'email', 'meeting'] },
          body: { type: 'string' },
        },
        required: ['body'],
      },
      run: (input, ctx) =>
        ctx.contacts.logActivity({
          contact_id: input.contact_id as string,
          deal_id: input.deal_id as string,
          type: input.type as string,
          body: String(input.body),
        }),
    },
  ],
};

const outreachAgent: HelixAgent = {
  id: 'outreach',
  label: 'Outreach',
  entitlement: 'sdr', // בתשלום
  tools: [
    {
      name: 'draft_followup',
      description:
        'ניסוח הודעת פולואפ בעברית לליד, לפי שמו וההקשר. מחזיר טיוטה בלבד — לא שולח. השתמש כשמבקשים להכין/לנסח פולואפ.',
      autonomyClass: 'read', // ניסוח בלבד; השליחה בפועל היא outbound ותיחסם במתג
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
          context: { type: 'string', description: 'הקשר: מוצר, שיחה קודמת, כאב הלקוח' },
          channel: { type: 'string', enum: ['email', 'whatsapp'] },
        },
        required: ['name'],
      },
      // ניסוח דטרמיניסטי קליל; ה-agent האמיתי יחליף בזה תבנית/LLM ייעודי.
      run: async (input) => {
        const name = String(input.name);
        const channel = (input.channel as string) || 'whatsapp';
        const ctxLine = input.context ? ` בהמשך ל${String(input.context)},` : '';
        return {
          channel,
          draft: `היי ${name},${ctxLine} רק רציתי לוודא שקיבלת את מה ששלחנו ולראות אם יש שאלות. מתי נוח לך לדבר השבוע?`,
        };
      },
    },
  ],
};

const schedulingAgent: HelixAgent = {
  id: 'scheduling',
  label: 'Scheduling',
  entitlement: 'crm', // חינם — תיאום פגישות הוא חלק מהליבה
  tools: [
    {
      name: 'propose_slots',
      description: 'מציע שעות פנויות לפגישה עם ליד (טקסט בלבד, לא קובע). השתמש כשמבקשים לתאם פגישה.',
      autonomyClass: 'read',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: { day_part: { type: 'string', enum: ['morning', 'afternoon'] } },
      },
      run: async (input) => {
        const part = (input.day_part as string) || 'afternoon';
        // Live availability from Cal.com when configured; else a text-only suggestion.
        if (calcomConfigured()) {
          const now = new Date();
          const to = new Date(now.getTime() + 7 * 86400000);
          const slots = await getSlots(now.toISOString(), to.toISOString());
          if (slots && slots.length) {
            const filtered = slots.filter((iso) => {
              const h = new Date(iso).getHours();
              return part === 'morning' ? h < 12 : h >= 12;
            });
            return { slots: (filtered.length ? filtered : slots).slice(0, 5), source: 'cal.com', note: 'זמינות אמיתית מהיומן — קביעה דורשת אישור.' };
          }
        }
        const slots = part === 'morning' ? ['09:00', '10:30', '11:15'] : ['14:00', '15:30', '16:45'];
        return { slots, note: 'הצעה בלבד — קביעה בפועל דורשת אישור.' };
      },
    },
    {
      name: 'book_meeting',
      description: 'קובע פגישה עם איש קשר ורושם אותה ב-CRM. פעולה חיצונית — כפופה למתג האוטונומיה.',
      autonomyClass: 'outbound',
      featureKey: 'crm.followup',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          contact_id: { type: 'string' },
          when: { type: 'string', description: 'תאריך ושעה, טקסט חופשי' },
          start_iso: { type: 'string', description: 'זמן התחלה ISO — נדרש לקביעה אמיתית ב-Cal.com' },
          attendee_email: { type: 'string', description: 'אימייל המוזמן — נדרש לקביעה אמיתית' },
          attendee_name: { type: 'string' },
        },
        required: ['contact_id', 'when'],
      },
      run: async (input, ctx) => {
        const when = String(input.when);
        // Real Cal.com booking when configured + we have an ISO start + attendee email.
        let booked: { id: string } | null = null;
        if (calcomConfigured() && input.start_iso && input.attendee_email) {
          booked = await createBooking({
            start: String(input.start_iso),
            name: String(input.attendee_name ?? 'לקוח'),
            email: String(input.attendee_email),
          });
        }
        const body = booked
          ? `פגישה נקבעה ב-Cal.com ל-${when} (מזהה ${booked.id}, דרך HELIX CHIEF)`
          : `פגישה תואמה ל-${when} (דרך HELIX CHIEF)`;
        return ctx.contacts.logActivity({ contact_id: String(input.contact_id), type: 'meeting', body });
      },
    },
  ],
};

const connectorsAgent: HelixAgent = {
  id: 'connectors',
  label: 'Connectors',
  entitlement: 'crm', // תמיד זמין
  tools: [
    {
      name: 'list_sources',
      description:
        'מחזיר את כל המקורות ש-CHIEF יכול להתחבר אליהם (CRM, הנהלת חשבונות, דיוור ועוד), עם סימון מה כבר מחובר. השתמש כשמבקשים לדעת למה אפשר להתחבר או איזה כלים נתמכים.',
      autonomyClass: 'read',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: { kind: { type: 'string', enum: ['crm', 'accounting', 'email-marketing', 'erp', 'spreadsheet', 'inbox'] } },
      },
      run: async (input, ctx) => {
        const kind = input.kind as string | undefined;
        return ctx.sources
          .filter((s) => !kind || s.kind === kind)
          .map((s) => ({ id: s.id, label: s.label, kind: s.kind, region: s.region, configured: s.configured, provides: s.provides }));
      },
    },
  ],
};

export const AGENTS: HelixAgent[] = [crmAgent, outreachAgent, schedulingAgent, connectorsAgent];

export async function entitledAgents(ctx: ChiefContext): Promise<HelixAgent[]> {
  const out: HelixAgent[] = [];
  for (const a of AGENTS) {
    if (await ctx.hasEntitlement(a.entitlement)) out.push(a);
  }
  return out;
}
