// Client-side lead capture for the "מאפס ל-AI" org-context questionnaire.
// The live site is a static export (next.config.mjs → output:'export'), so
// server /api/* routes are dead in production. We therefore insert straight
// to Supabase REST from the browser using the PUBLIC anon key.
//
// Mirrors the server-side pattern in lib/supabase-scans.ts, but:
//   - reads NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (browser-safe)
//   - relies on an RLS policy that allows `anon` INSERT only (see docs/context_kit_leads.sql)
//
// Degrades gracefully: if env vars are missing it resolves without throwing,
// so the questionnaire (file download + diagnosis) keeps working regardless.

export interface ContextLead {
  website?: string;
  occupation?: string;
  org_name?: string;
  what_you_do?: string;
  audience?: string;
  offerings?: string;
  tone?: string;
  terms?: string;
  redlines?: string;
  ai_uses?: string;
  ai_policy?: string;
  ai_training?: string;
  readiness_score?: number;
  name?: string;
  phone?: string;
  email?: string;
  source?: string;
}

export async function submitContextLead(entry: ContextLead): Promise<boolean> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !key) return false; // not configured — skip silently
  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/rest/v1/context_kit_leads`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ source: 'context-kit', ...entry }),
    });
    return res.ok;
  } catch (err) {
    console.error('submitContextLead failed', err);
    return false;
  }
}
