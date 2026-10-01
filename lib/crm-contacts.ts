import 'server-only';

// כותב לידים ישירות ל-CRM של HELIX (POLICYHUB), טבלת crm_contacts, דרך PostgREST.
// פונקציה משותפת אחת שכל מסלולי הלידים באתר קוראים לה, כדי שכל ליד מכל מקום
// יגיע ישר ל-CRM. degrade-gracefully: אם משתני ה-CRM לא מוגדרים, לא עושה כלום
// (ולא זורק), כך שהאתר ממשיך לעבוד גם לפני החיבור.
//
// משתני סביבה (נפרדים מה-Supabase של האתר כדי לא לגעת בלידים האחרים):
//   CRM_SUPABASE_URL          כתובת הפרויקט (https://rymrafskckljgirrejqu.supabase.co)
//   CRM_SUPABASE_SERVICE_KEY  service_role key (סודי, עוקף RLS)
//   CRM_LEADS_OWNER_ID        מזהה המשתמש ב-CRM שאליו משויכים הלידים (profiles.id)
//   CRM_LEADS_WORKSPACE_ID    מזהה סביבת העבודה (crm_workspaces.id)
//
// סכמת היעד (helix-crm/supabase/migration-v13.sql + v14):
//   crm_contacts(owner_id*, workspace_id, full_name*, email, phone, role_title,
//                source, is_business, lifecycle_stage, lead_status, score, notes, ...)

export interface CrmLead {
  fullName?: string;
  email?: string;
  phone?: string;
  roleTitle?: string;
  source: string; // matana / community / content / report / first-users / vibe-code ...
  isBusiness?: boolean;
  /** שורות שנארזות ל-notes (קריאה אנושית). */
  notesLines?: string[];
  /** שדות מובנים ייחודיים לקמפיין, נשמרים ל-source_data (jsonb) לסינון ואוטומציה. */
  sourceData?: Record<string, string | number | boolean | null>;
}

export interface CrmRecordResult {
  stored: boolean;
  status?: number;
  error?: string;
}

export async function recordCrmContact(entry: CrmLead): Promise<CrmRecordResult> {
  const base = process.env.CRM_SUPABASE_URL;
  const key = process.env.CRM_SUPABASE_SERVICE_KEY;
  const ownerId = process.env.CRM_LEADS_OWNER_ID;
  const workspaceId = process.env.CRM_LEADS_WORKSPACE_ID;

  // לא מוגדר עדיין, פשוט מדלגים (האתר לא נשבר).
  if (!base || !key || !ownerId) return { stored: false, error: 'unconfigured' };

  const fullName = (entry.fullName || entry.email || 'ליד').slice(0, 200);
  const notes = (entry.notesLines || []).filter(Boolean).join('\n').slice(0, 4000);

  const row: Record<string, unknown> = {
    owner_id: ownerId,
    full_name: fullName,
    email: entry.email || null,
    phone: entry.phone || null,
    role_title: entry.roleTitle || null,
    source: entry.source,
    is_business: entry.isBusiness ?? true,
    lifecycle_stage: 'lead',
    lead_status: 'new',
    notes: notes || null,
  };
  if (workspaceId) row.workspace_id = workspaceId;
  if (entry.sourceData && Object.keys(entry.sourceData).length) {
    // תמיד כולל את מקור הקמפיין בתוך ה-jsonb לנוחות סינון.
    row.source_data = { source: entry.source, ...entry.sourceData };
  }

  const endpoint = `${base.replace(/\/$/, '')}/rest/v1/crm_contacts`;
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
  };
  const post = (payload: Record<string, unknown>) =>
    fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(payload), signal: AbortSignal.timeout(5000) });

  try {
    const res = await post(row);
    if (res.ok) return { stored: true };
    const body = await res.text().catch(() => '');
    // אם עמודת source_data עוד לא קיימת (לפני המיגרציה), ננסה שוב בלעדיה
    // כדי שהליד ייכנס בכל מקרה (נתוני ה-notes עדיין נשמרים).
    if ('source_data' in row && /source_data/.test(body)) {
      const { source_data, ...rest } = row;
      void source_data;
      const retry = await post(rest);
      if (retry.ok) return { stored: true };
      const rbody = await retry.text().catch(() => '');
      return { stored: false, status: retry.status, error: rbody.slice(0, 200) };
    }
    return { stored: false, status: res.status, error: body.slice(0, 200) };
  } catch (err) {
    console.error('recordCrmContact failed', err);
    return { stored: false, error: err instanceof Error ? err.message : 'exception' };
  }
}

// העשרת ליד קיים (שלב 2 של הטופס), PATCH לפי אימייל, כדי לא ליצור ליד כפול.
// מעדכן notes + source_data של הרשומה/ות עם אותו אימייל ומקור matana.
export async function enrichCrmContact(
  email: string,
  data: { notesLines?: string[]; sourceData?: Record<string, string | number | boolean | null> },
): Promise<CrmRecordResult> {
  const base = process.env.CRM_SUPABASE_URL;
  const key = process.env.CRM_SUPABASE_SERVICE_KEY;
  if (!base || !key || !email) return { stored: false, error: 'unconfigured' };

  const notes = (data.notesLines || []).filter(Boolean).join('\n').slice(0, 4000);
  const patch: Record<string, unknown> = {};
  if (notes) patch.notes = notes;
  if (data.sourceData && Object.keys(data.sourceData).length) patch.source_data = data.sourceData;
  if (!Object.keys(patch).length) return { stored: true };

  const q = `email=eq.${encodeURIComponent(email)}&source=eq.matana`;
  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/rest/v1/crm_contacts?${q}`, {
      method: 'PATCH',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(patch),
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) return { stored: true };
    const body = await res.text().catch(() => '');
    // אם source_data עוד לא קיים (לפני מיגרציה), ננסה שוב רק עם notes.
    if ('source_data' in patch && /source_data/.test(body)) {
      const res2 = await fetch(`${base.replace(/\/$/, '')}/rest/v1/crm_contacts?${q}`, {
        method: 'PATCH',
        headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify(notes ? { notes } : {}),
        signal: AbortSignal.timeout(5000),
      });
      if (res2.ok) return { stored: true };
    }
    return { stored: false, status: res.status, error: body.slice(0, 200) };
  } catch (err) {
    console.error('enrichCrmContact failed', err);
    return { stored: false, error: err instanceof Error ? err.message : 'exception' };
  }
}
