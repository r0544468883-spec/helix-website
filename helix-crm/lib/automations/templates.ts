import type { Graph, TriggerKind } from './types';

// Ready-made starter flows — a new automation can begin from one of these instead
// of a blank canvas. Each is a valid graph the engine can run as-is.

export type Template = { key: string; name: string; trigger: TriggerKind; desc: string; graph: Graph };

const n = (id: string, kind: string, x: number, y: number, data: Record<string, unknown> = {}) =>
  ({ id, kind: kind as never, position: { x, y }, data });
const e = (id: string, source: string, target: string, sourceHandle?: string) =>
  ({ id, source, target, sourceHandle });

export const AUTOMATION_TEMPLATES: Template[] = [
  {
    key: 'enrich-score-hot',
    name: 'ליד נכנס → העשר, נקד, וחם → משימה',
    trigger: 'contact.created',
    desc: 'העשרה אוטומטית, ניקוד, ואם הליד חם (מעל 70) — פותח משימת מעקב.',
    graph: {
      nodes: [
        n('trigger', 'trigger', 60, 160, { trigger: 'contact.created' }),
        n('enrich', 'enrich', 280, 160),
        n('score', 'score', 480, 160),
        n('cond', 'condition', 680, 160, { field: 'score', op: '>=', value: '70' }),
        n('task', 'create_task', 900, 90, { title: 'ליד חם — ליצור קשר', due_days: 1 }),
        n('note', 'log_activity', 900, 240, { body: 'ליד נכנס — בחימום' }),
      ],
      edges: [
        e('e1', 'trigger', 'enrich'), e('e2', 'enrich', 'score'), e('e3', 'score', 'cond'),
        e('e4', 'cond', 'task', 'true'), e('e5', 'cond', 'note', 'false'),
      ],
    },
  },
  {
    key: 'welcome-whatsapp',
    name: 'ליד נכנס → וואטסאפ ברוכים הבאים',
    trigger: 'contact.created',
    desc: 'שולח הודעת פתיחה בוואטסאפ (פועל לאחר חיבור ערוץ) ורושם פעילות.',
    graph: {
      nodes: [
        n('trigger', 'trigger', 60, 160, { trigger: 'contact.created' }),
        n('wa', 'send_whatsapp', 300, 160, { message: 'היי! תודה שהשארת פרטים, נחזור אליך בהקדם 🙌' }),
        n('note', 'log_activity', 540, 160, { body: 'נשלחה הודעת ברוכים הבאים' }),
      ],
      edges: [e('e1', 'trigger', 'wa'), e('e2', 'wa', 'note')],
    },
  },
  {
    key: 'stalled-deal',
    name: 'עסקה שינתה שלב → תזכורת מעקב',
    trigger: 'deal.stage_changed',
    desc: 'בכל מעבר שלב בעסקה — פותח משימת מעקב בעוד 3 ימים.',
    graph: {
      nodes: [
        n('trigger', 'trigger', 60, 160, { trigger: 'deal.stage_changed' }),
        n('task', 'create_task', 300, 160, { title: 'מעקב אחרי מעבר שלב', due_days: 3 }),
      ],
      edges: [e('e1', 'trigger', 'task')],
    },
  },
  {
    key: 'nurture-wait',
    name: 'ליד נכנס → המתן יום → נקד מחדש',
    trigger: 'contact.created',
    desc: 'נותן ללקוח יום, ואז מנקד מחדש כדי לתפוס שינוי בפעילות. (המתנה תיושם עם תזמון)',
    graph: {
      nodes: [
        n('trigger', 'trigger', 60, 160, { trigger: 'contact.created' }),
        n('wait', 'wait', 300, 160, { hours: 24 }),
        n('score', 'score', 520, 160),
      ],
      edges: [e('e1', 'trigger', 'wait'), e('e2', 'wait', 'score')],
    },
  },
];

export function templateByKey(key: string): Template | undefined {
  return AUTOMATION_TEMPLATES.find((t) => t.key === key);
}
