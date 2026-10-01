import 'server-only';

// שומר לידים מדף מתנת החג לטבלה הייעודית matana_leads דרך PostgREST,
// באותה שיטת degrade-gracefully של lib/content-leads.ts: אם SUPABASE_URL /
// SUPABASE_SERVICE_KEY לא מוגדרים, פשוט לא נשמר (בלי לזרוק). ראה docs/matana_leads.sql.

export interface MatanaLead {
  name: string;
  phone: string;
  email: string;
  business?: string;
  website?: string;
  field?: string;
  area?: string;
  audience?: string;
  recommendFor?: string;
  notes?: string;
  marketingConsent?: boolean;
}

export interface RecordResult {
  stored: boolean;
  status?: number;
  error?: string;
}

export async function recordMatanaLead(entry: MatanaLead): Promise<RecordResult> {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!base || !key) return { stored: false, error: 'unconfigured' };

  // snake_case כדי להתאים לעמודות הטבלה.
  const row: Record<string, unknown> = {
    name: entry.name,
    phone: entry.phone,
    email: entry.email,
    business: entry.business || null,
    website: entry.website || null,
    field: entry.field || null,
    area: entry.area || null,
    audience: entry.audience || null,
    recommend_for: entry.recommendFor || null,
    notes: entry.notes || null,
    marketing_consent: !!entry.marketingConsent,
  };

  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/rest/v1/matana_leads`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) return { stored: true };
    const body = await res.text().catch(() => '');
    return { stored: false, status: res.status, error: body.slice(0, 200) };
  } catch (err) {
    console.error('recordMatanaLead failed', err);
    return { stored: false, error: err instanceof Error ? err.message : 'exception' };
  }
}
