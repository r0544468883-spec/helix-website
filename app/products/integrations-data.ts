// External tools each HELIX product can connect to via integration.
// Shown on every product page (ProductIntegrations) and on the main software
// hub card (SoftwarePageClient). Keyed by product slug.
//
// CHIEF connects to the whole stack — its list mirrors the CHIEF connector
// catalog (helix-crm/lib/chief/connectors.ts). Each product lists the concrete
// external systems it actually talks to; keep names as users know them.

export const INTEGRATIONS: Record<string, string[]> = {
  // HELIX CHIEF — sits over the entire stack (mirrors the connector catalog).
  chief: [
    'HubSpot', 'Salesforce', 'monday', 'כוורת', 'Zoho', 'Pipedrive',
    'חשבשבת', 'חשבונית ירוקה', 'iCount', 'Priority', 'SAP', 'QuickBooks',
    'Slack', 'Teams', 'WhatsApp', 'Telegram',
    'Jira', 'Asana', 'ClickUp', 'Trello', 'Linear', 'Notion',
    'Airtable', 'NocoDB', 'Coda', 'Smartsheet', 'Basecamp', 'Wrike',
    'Gmail', 'Outlook', 'Google Calendar', 'Google Drive', 'Google Sheets',
    'Zendesk', 'Intercom', 'Freshdesk', 'Calendly',
  ],
  crm: [
    'Gmail', 'Outlook', 'Google Calendar', 'Google Contacts', 'WhatsApp',
    'חשבונית ירוקה', 'iCount', 'Calendly', 'Zapier', 'Make', 'n8n',
  ],
  'marketing-ops': [
    'Facebook', 'Instagram', 'LinkedIn', 'TikTok', 'X (Twitter)', 'YouTube',
    'WhatsApp', 'Telegram', 'Meta Ads', 'TikTok Ads', 'Google Ads', 'Outbrain',
    'Resend', 'Canva', 'HubSpot',
  ],
  dashboards: [
    'Google Analytics', 'Google Ads', 'Meta Ads', 'Facebook', 'Stripe',
    'HubSpot', 'Salesforce', 'Google Sheets', 'Shopify', 'Microsoft Clarity', 'Supabase',
  ],
  sdr: [
    'LinkedIn Sales Navigator', 'Apollo', 'Gmail', 'Outlook', 'HubSpot',
    'Salesforce', 'Pipedrive', 'WhatsApp', 'Calendly',
  ],
  geo: [
    'Google Search Console', 'WordPress', 'Webflow', 'Wix', 'Shopify',
    'ChatGPT', 'Perplexity', 'Gemini', 'Google AI Overviews',
  ],
  reputation: [
    'Google Business Profile', 'Google Reviews', 'Facebook', 'Instagram',
    'Trustpilot', 'ChatGPT', 'Perplexity',
  ],
  assistant: [
    'Gmail', 'Google Calendar', 'Google Drive', 'WhatsApp', 'Slack',
    'פיד בנק', 'Zapier', 'n8n',
  ],
  'growth-doctor': [
    'Microsoft Clarity', 'Google Analytics', 'Hotjar', 'Stripe', 'Meta Pixel', 'Shopify',
  ],
  forms: [
    'WhatsApp', 'Gmail', 'Google Drive', 'חשבונית ירוקה', 'iCount', 'Zapier', 'Make',
  ],
  meeting: [
    'Zoom', 'Google Meet', 'Google Calendar', 'Gmail', 'WhatsApp',
    'HELIX SDR', 'HELIX CRM', 'HELIX OPS', 'HELIX GEO',
  ],
  shop: [
    'Shopify', 'WooCommerce', 'WhatsApp', 'Instagram', 'Messenger',
    'צ׳אט באתר', 'HELIX CRM',
  ],
};

/** Integrations for a product slug (empty array if none defined). */
export function integrationsFor(slug: string): string[] {
  return INTEGRATIONS[slug] || [];
}
