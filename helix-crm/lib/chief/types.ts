// HELIX CHIEF — core contracts for the agent orchestrator.
// Portable & host-agnostic. The "door" (DataSource) is capability-based, not
// tool-based: a source provides one or more capabilities (contacts, invoices,
// email, tasks, messaging, calendar, tickets, files). CHIEF sits over ANY
// system — our CRM, HubSpot, monday, כוורת, חשבשבת, Slack, Jira, Google — and
// each connector exposes only what it actually does. Adding a tool = one line.

import type { AutonomyMode, RiskClass } from '@/lib/autonomy/types';

/** רמת רגישות של פעולת-agent — קובעת אם צריך את מתג האוטונומיה. */
export type AutonomyClass = 'read' | RiskClass; // 'read' | 'internal' | 'outbound' | 'money' | 'tos'

/** כלי בודד שסוכן חושף. read רץ חופשי; שאר המחלקות עוברות דרך המתג. */
export interface AgentTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>; // JSON Schema (object)
  autonomyClass: AutonomyClass;
  /** feature key ל-resolveMode (למשל 'crm.followup'); חובה לכל מה שאינו read. */
  featureKey?: string;
  run(input: Record<string, unknown>, ctx: ChiefContext): Promise<unknown>;
}

/** סוכן = מוצר HELIX שנחשף לצ'יף. רץ stand-alone וגם מתוזמר. */
export interface HelixAgent {
  id: string;
  label: string;
  entitlement: string;
  tools: AgentTool[];
}

// ───────────────────────── Capabilities (the "door") ─────────────────────────
// מקור מספק אחת או יותר מהיכולות. CHIEF פותר יכולת → אל המקור שמחובר לה.

export type CapabilityKind =
  | 'contacts'   // CRM / אנשי קשר ולידים
  | 'invoices'   // הנהלת חשבונות / חשבוניות
  | 'email'      // דיוור / מיילים ורשימות
  | 'tasks'      // ניהול משימות ופרויקטים
  | 'messaging'  // הודעות (Slack/Teams/וואטסאפ)
  | 'calendar'   // יומן ופגישות
  | 'tickets'    // תמיכה / קריאות שירות
  | 'files';     // מסמכים וקבצים

export interface ContactsCapability {
  listLeads(input: { tier?: 'hot' | 'warm' | 'cold'; limit?: number }): Promise<LeadRow[]>;
  getContact(id: string): Promise<LeadRow | null>;
  createContact(input: { full_name: string; email?: string; phone?: string; source?: string }): Promise<{ id: string }>;
  logActivity(input: { contact_id?: string; deal_id?: string; type?: string; body: string }): Promise<{ id: string }>;
}
/** התאמה לאחור: CrmClient הוא שם ישן ל-ContactsCapability. */
export type CrmClient = ContactsCapability;

export interface InvoicesCapability {
  listOverdue(input?: { limit?: number }): Promise<InvoiceRow[]>;
  createInvoice(input: { contact_id?: string; amount: number; currency?: string; due_date?: string }): Promise<{ id: string }>;
}
export interface EmailCapability {
  listSubscribers(input?: { limit?: number }): Promise<SubscriberRow[]>;
  sendCampaign(input: { name: string; segment?: string; body: string }): Promise<{ id: string }>;
}
export interface TasksCapability {
  listTasks(input?: { assignee?: string; status?: string; limit?: number }): Promise<TaskRow[]>;
  createTask(input: { title: string; assignee?: string; due_date?: string; project?: string }): Promise<{ id: string }>;
}
export interface MessagingCapability {
  listChannels(): Promise<{ id: string; name: string }[]>;
  sendMessage(input: { channel: string; text: string }): Promise<{ id: string }>;
}
export interface CalendarCapability {
  listEvents(input?: { from?: string; to?: string }): Promise<CalendarEventRow[]>;
  createEvent(input: { title: string; start: string; end?: string; attendees?: string[] }): Promise<{ id: string }>;
}
export interface TicketsCapability {
  listTickets(input?: { status?: string; limit?: number }): Promise<TicketRow[]>;
  createTicket(input: { subject: string; body: string; contact_id?: string; priority?: string }): Promise<{ id: string }>;
}
export interface FilesCapability {
  listFiles(input?: { folder?: string; limit?: number }): Promise<FileRow[]>;
  getFile(id: string): Promise<{ id: string; name: string; url: string } | null>;
}

export interface LeadRow {
  id: string; full_name: string; email: string | null; phone: string | null;
  role_title: string | null; lifecycle_stage: string | null; lead_status: string | null;
  score: number | null; last_activity_at: string | null;
}
export interface InvoiceRow { id: string; contact_id: string | null; amount: number; currency: string; status: 'open' | 'paid' | 'overdue'; due_date: string | null; }
export interface SubscriberRow { id: string; email: string; name: string | null; status: string; }
export interface TaskRow { id: string; title: string; status: string; assignee: string | null; due_date: string | null; project: string | null; }
export interface CalendarEventRow { id: string; title: string; start: string; end: string | null; attendees: string[]; }
export interface TicketRow { id: string; subject: string; status: string; priority: string | null; contact_id: string | null; }
export interface FileRow { id: string; name: string; url: string; folder: string | null; }

export type SourceKind =
  | 'crm' | 'accounting' | 'email-marketing' | 'erp' | 'spreadsheet' | 'inbox'
  | 'project-management' | 'messaging' | 'calendar' | 'support' | 'files' | 'productivity';

/** מקור נתונים = מערכת חיצונית שמתחברת ל-CHIEF. חי (configured) או מטא-דאטה בלבד. */
export interface DataSource {
  id: string;
  label: string;
  kind: SourceKind;
  region: 'IL' | 'global';
  configured: boolean;
  provides: CapabilityKind[];
  // יכולות חיות — קיימות רק כשמחובר:
  contacts?: ContactsCapability;
  invoices?: InvoicesCapability;
  email?: EmailCapability;
  tasks?: TasksCapability;
  messaging?: MessagingCapability;
  calendar?: CalendarCapability;
  tickets?: TicketsCapability;
  files?: FilesCapability;
}

export type CapabilityFor<K extends CapabilityKind> =
  K extends 'contacts' ? ContactsCapability :
  K extends 'invoices' ? InvoicesCapability :
  K extends 'email' ? EmailCapability :
  K extends 'tasks' ? TasksCapability :
  K extends 'messaging' ? MessagingCapability :
  K extends 'calendar' ? CalendarCapability :
  K extends 'tickets' ? TicketsCapability :
  K extends 'files' ? FilesCapability : never;

/** מה ש-CHIEF יודע על הלקוח בזמן ריצה. */
export interface ChiefContext {
  workspaceId: string;
  locale: string;
  /** כל המקורות הידועים (מחוברים או זמינים-לחיבור). */
  sources: DataSource[];
  /** היכולת החיה לפי סוג. זורק אם אין מקור מחובר שמספק אותה. */
  capability<T extends CapabilityKind>(kind: T): CapabilityFor<T>;
  /** קיצור נוח ליכולת אנשי-הקשר (ה-CRM הפעיל). */
  contacts: ContactsCapability;
  hasEntitlement: (entitlement: string) => boolean | Promise<boolean>;
  resolveAutonomy: (featureKey: string) => Promise<AutonomyMode>;
}

/** רשומת פעולה בעקבות ריצת צ'יף — לתצוגה ב-Dashboards. */
export interface ChiefAction {
  agent: string;
  tool: string;
  input: Record<string, unknown>;
  status: 'done' | 'pending_approval' | 'suggested' | 'blocked_entitlement' | 'error';
  autonomy?: AutonomyMode;
  result?: unknown;
  error?: string;
}

export interface ChiefRun {
  reply: string;
  actions: ChiefAction[];
  usage?: { input_tokens: number; output_tokens: number };
}
