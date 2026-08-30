// Shared automation graph types — used by the visual builder, the verbal (AI)
// builder, and the execution engine. Keep this the single source of truth.

export type NodeKind =
  | 'trigger'        // entry point (matches automation.trigger)
  | 'enrich'         // enrich a contact from its email
  | 'score'          // (re)compute the lead score
  | 'condition'      // branch on a field comparison (true/false handles)
  | 'create_task'    // open a CRM task
  | 'log_activity'   // write a note/activity on the contact
  | 'send_whatsapp'  // outbound WhatsApp (needs a channel connection)
  | 'send_email'     // outbound email (needs a channel connection)
  | 'wait'           // delay N hours before continuing
  | 'n8n';           // hand off to an external n8n workflow (needs N8N_WEBHOOK_URL)

export type FlowNode = {
  id: string;
  kind: NodeKind;
  position: { x: number; y: number };
  data: Record<string, unknown>;   // per-kind config (see NODE_SPECS)
};

export type FlowEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;    // 'true' | 'false' for condition nodes
};

export type Graph = { nodes: FlowNode[]; edges: FlowEdge[] };

export type TriggerKind =
  | 'contact.created'
  | 'contact.updated'
  | 'deal.created'
  | 'deal.stage_changed'
  | 'manual';

// Palette metadata — labels (Hebrew), the config fields each node exposes, and
// whether the node has two outputs (condition) or one.
export type NodeSpec = {
  kind: NodeKind;
  label: string;
  hint: string;
  branching?: boolean;             // condition → true/false handles
  needsConnection?: boolean;       // greys out / warns when no channel wired
  fields?: { key: string; label: string; type: 'text' | 'number' | 'select'; options?: string[] }[];
};

export const NODE_SPECS: Record<Exclude<NodeKind, 'trigger'>, NodeSpec> = {
  enrich:       { kind: 'enrich', label: 'העשרה', hint: 'משלים פרטים מהמייל' },
  score:        { kind: 'score', label: 'ניקוד ליד', hint: 'מחשב מחדש 0–100' },
  condition:    { kind: 'condition', label: 'תנאי', hint: 'מסתעף לפי שדה', branching: true,
    fields: [
      { key: 'field', label: 'שדה', type: 'select', options: ['score', 'lifecycle_stage', 'lead_status', 'is_business'] },
      { key: 'op', label: 'אופרטור', type: 'select', options: ['>=', '<=', '==', '!='] },
      { key: 'value', label: 'ערך', type: 'text' },
    ] },
  create_task:  { kind: 'create_task', label: 'צור משימה', hint: 'פותח משימת מעקב',
    fields: [{ key: 'title', label: 'כותרת', type: 'text' }, { key: 'due_days', label: 'תוך (ימים)', type: 'number' }] },
  log_activity: { kind: 'log_activity', label: 'רשום פעילות', hint: 'הערה על הליד',
    fields: [{ key: 'body', label: 'תוכן', type: 'text' }] },
  send_whatsapp:{ kind: 'send_whatsapp', label: 'שלח וואטסאפ', hint: 'הודעה יוצאת', needsConnection: true,
    fields: [{ key: 'message', label: 'הודעה', type: 'text' }] },
  send_email:   { kind: 'send_email', label: 'שלח מייל', hint: 'הודעה יוצאת', needsConnection: true,
    fields: [{ key: 'subject', label: 'נושא', type: 'text' }, { key: 'body', label: 'תוכן', type: 'text' }] },
  wait:         { kind: 'wait', label: 'המתנה', hint: 'עצירה לפני ההמשך',
    fields: [{ key: 'hours', label: 'שעות', type: 'number' }] },
  n8n:          { kind: 'n8n', label: 'n8n', hint: 'מעביר ל-workflow חיצוני', needsConnection: true,
    fields: [{ key: 'workflow', label: 'שם/URL', type: 'text' }] },
};

export const TRIGGER_LABELS: Record<TriggerKind, string> = {
  'contact.created': 'ליד נכנס',
  'contact.updated': 'ליד עודכן',
  'deal.created': 'עסקה נוצרה',
  'deal.stage_changed': 'עסקה שינתה שלב',
  'manual': 'הפעלה ידנית',
};

export function emptyGraph(trigger: TriggerKind): Graph {
  return { nodes: [{ id: 'trigger', kind: 'trigger', position: { x: 80, y: 160 }, data: { trigger } }], edges: [] };
}
