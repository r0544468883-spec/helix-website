// HELIX CHIEF — connector catalog. Every system CHIEF can sit on top of, grouped
// by what it PROVIDES, not by brand. Broad on purpose: CRM, accounting, email,
// project management, messaging, calendar, support, files. Israeli tools are
// first-class. Adding a tool = one line. Wiring happens via n8n / native API.

import type { CapabilityKind, SourceKind } from './types';

export interface ConnectorInfo {
  id: string;
  label: string;
  kind: SourceKind;
  region: 'IL' | 'global';
  provides: CapabilityKind[];
}

// מטא-דאטה בלבד. החיבור בפועל מגיע דרך n8n / API של הלקוח.
export const CONNECTORS: ConnectorInfo[] = [
  // ── CRM / אנשי קשר ──
  { id: 'helix-crm', label: 'HELIX CHIEF CRM', kind: 'crm', region: 'IL', provides: ['contacts'] },
  { id: 'hubspot', label: 'HubSpot', kind: 'crm', region: 'global', provides: ['contacts', 'email', 'tickets'] },
  { id: 'salesforce', label: 'Salesforce', kind: 'crm', region: 'global', provides: ['contacts', 'tickets'] },
  { id: 'monday', label: 'monday.com', kind: 'crm', region: 'IL', provides: ['contacts', 'tasks'] },
  { id: 'kaveret', label: 'כוורת (Kaveret)', kind: 'crm', region: 'IL', provides: ['contacts'] },
  { id: 'zoho', label: 'Zoho CRM', kind: 'crm', region: 'global', provides: ['contacts', 'email'] },
  { id: 'pipedrive', label: 'Pipedrive', kind: 'crm', region: 'global', provides: ['contacts'] },
  { id: 'dynamics365', label: 'Microsoft Dynamics 365', kind: 'crm', region: 'global', provides: ['contacts'] },

  // ── הנהלת חשבונות / חשבוניות ──
  { id: 'hashavshevet', label: 'חשבשבת (Hashavshevet)', kind: 'accounting', region: 'IL', provides: ['invoices'] },
  { id: 'rivhit', label: 'ריווחית (Rivhit)', kind: 'accounting', region: 'IL', provides: ['invoices'] },
  { id: 'greeninvoice', label: 'חשבונית ירוקה (Green Invoice)', kind: 'accounting', region: 'IL', provides: ['invoices'] },
  { id: 'icount', label: 'iCount', kind: 'accounting', region: 'IL', provides: ['invoices'] },
  { id: 'priority', label: 'Priority (פריוריטי)', kind: 'erp', region: 'IL', provides: ['contacts', 'invoices'] },
  { id: 'sap', label: 'SAP', kind: 'erp', region: 'global', provides: ['contacts', 'invoices'] },
  { id: 'quickbooks', label: 'QuickBooks', kind: 'accounting', region: 'global', provides: ['invoices'] },
  { id: 'xero', label: 'Xero', kind: 'accounting', region: 'global', provides: ['invoices'] },

  // ── דיוור / מיילים ──
  { id: 'smoove', label: 'smoove', kind: 'email-marketing', region: 'IL', provides: ['email'] },
  { id: 'activetrail', label: 'ActiveTrail', kind: 'email-marketing', region: 'IL', provides: ['email'] },
  { id: 'ravmesser', label: 'רב-מסר (Rav-Messer)', kind: 'email-marketing', region: 'IL', provides: ['email'] },
  { id: 'mailchimp', label: 'Mailchimp', kind: 'email-marketing', region: 'global', provides: ['email'] },
  { id: 'sendgrid', label: 'SendGrid', kind: 'email-marketing', region: 'global', provides: ['email'] },
  { id: 'brevo', label: 'Brevo (Sendinblue)', kind: 'email-marketing', region: 'global', provides: ['email'] },

  // ── ניהול משימות ופרויקטים ──
  { id: 'jira', label: 'Jira', kind: 'project-management', region: 'global', provides: ['tasks', 'tickets'] },
  { id: 'asana', label: 'Asana', kind: 'project-management', region: 'global', provides: ['tasks'] },
  { id: 'clickup', label: 'ClickUp', kind: 'project-management', region: 'global', provides: ['tasks'] },
  { id: 'trello', label: 'Trello', kind: 'project-management', region: 'global', provides: ['tasks'] },
  { id: 'linear', label: 'Linear', kind: 'project-management', region: 'global', provides: ['tasks'] },
  { id: 'notion', label: 'Notion', kind: 'productivity', region: 'global', provides: ['tasks', 'files'] },

  // ── מסדי-נתונים / no-code / PM נוספים ──
  { id: 'airtable', label: 'Airtable', kind: 'productivity', region: 'global', provides: ['contacts', 'tasks', 'files'] },
  { id: 'nocodb', label: 'NocoDB', kind: 'productivity', region: 'global', provides: ['contacts', 'tasks'] },
  { id: 'baserow', label: 'Baserow', kind: 'productivity', region: 'global', provides: ['contacts', 'tasks'] },
  { id: 'coda', label: 'Coda', kind: 'productivity', region: 'global', provides: ['tasks', 'files'] },
  { id: 'smartsheet', label: 'Smartsheet', kind: 'project-management', region: 'global', provides: ['tasks'] },
  { id: 'basecamp', label: 'Basecamp', kind: 'project-management', region: 'global', provides: ['tasks', 'messaging', 'files'] },
  { id: 'wrike', label: 'Wrike', kind: 'project-management', region: 'global', provides: ['tasks'] },
  { id: 'teamwork', label: 'Teamwork', kind: 'project-management', region: 'global', provides: ['tasks'] },
  { id: 'height', label: 'Height', kind: 'project-management', region: 'global', provides: ['tasks'] },
  { id: 'shortcut', label: 'Shortcut', kind: 'project-management', region: 'global', provides: ['tasks', 'tickets'] },

  // ── הודעות / תקשורת צוות ──
  { id: 'slack', label: 'Slack', kind: 'messaging', region: 'global', provides: ['messaging'] },
  { id: 'teams', label: 'Microsoft Teams', kind: 'messaging', region: 'global', provides: ['messaging'] },
  { id: 'whatsapp', label: 'WhatsApp', kind: 'messaging', region: 'IL', provides: ['messaging', 'contacts'] },
  { id: 'telegram', label: 'Telegram', kind: 'messaging', region: 'IL', provides: ['messaging'] },

  // ── יומן / פגישות ──
  { id: 'google-calendar', label: 'Google Calendar', kind: 'calendar', region: 'global', provides: ['calendar'] },
  { id: 'outlook-calendar', label: 'Outlook Calendar', kind: 'calendar', region: 'global', provides: ['calendar'] },
  { id: 'calendly', label: 'Calendly', kind: 'calendar', region: 'global', provides: ['calendar'] },

  // ── תמיכה / קריאות שירות ──
  { id: 'zendesk', label: 'Zendesk', kind: 'support', region: 'global', provides: ['tickets'] },
  { id: 'intercom', label: 'Intercom', kind: 'support', region: 'global', provides: ['tickets', 'messaging'] },
  { id: 'freshdesk', label: 'Freshdesk', kind: 'support', region: 'global', provides: ['tickets'] },

  // ── Google Workspace (כל הכלים של גוגל) ──
  { id: 'gmail', label: 'Gmail', kind: 'inbox', region: 'global', provides: ['email', 'contacts'] },
  { id: 'google-contacts', label: 'Google Contacts', kind: 'crm', region: 'global', provides: ['contacts'] },
  { id: 'google-sheets', label: 'Google Sheets', kind: 'spreadsheet', region: 'global', provides: ['contacts', 'tasks'] },
  { id: 'google-drive', label: 'Google Drive', kind: 'files', region: 'global', provides: ['files'] },
  { id: 'google-docs', label: 'Google Docs', kind: 'files', region: 'global', provides: ['files'] },

  // ── Microsoft / קבצים ──
  { id: 'outlook', label: 'Outlook', kind: 'inbox', region: 'global', provides: ['email', 'contacts'] },
  { id: 'onedrive', label: 'OneDrive', kind: 'files', region: 'global', provides: ['files'] },
  { id: 'dropbox', label: 'Dropbox', kind: 'files', region: 'global', provides: ['files'] },
  { id: 'excel', label: 'Excel', kind: 'spreadsheet', region: 'global', provides: ['contacts'] },
];

export function connectorById(id: string): ConnectorInfo | undefined {
  return CONNECTORS.find((c) => c.id === id);
}

/** קטלוג מקובץ לפי יכולת — נוח לתצוגה ("מה CHIEF יודע לחבר"). */
export function connectorsByCapability(): Record<CapabilityKind, ConnectorInfo[]> {
  const out = {
    contacts: [], invoices: [], email: [], tasks: [],
    messaging: [], calendar: [], tickets: [], files: [],
  } as Record<CapabilityKind, ConnectorInfo[]>;
  for (const c of CONNECTORS) for (const cap of c.provides) out[cap].push(c);
  return out;
}
