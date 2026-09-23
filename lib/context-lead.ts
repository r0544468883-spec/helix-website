// Lead capture for the "מאפס ל-AI" org-context questionnaire.
//
// This used to POST straight from the browser to Supabase REST with the public
// anon key. Two things were wrong with that. It shipped a credential that can
// write to our database inside the page bundle, and the row landed in
// context_kit_leads, a table nobody opens, so no human ever saw the lead.
// It now goes through /api/context-lead, which persists it with the service key
// and emails it.
//
// The comment that used to sit here claimed server routes are dead in
// production because of output:'export'. They are not. That output only applies
// under STATIC_EXPORT=1 (next.config.mjs), which only `npm run build:static`
// sets for the PR previews. helix.co.il is served by the App Hosting backend
// 'helix-website' (firebase.json), a real Next.js server with live API routes.
//
// Degrades gracefully: resolves false instead of throwing, so the questionnaire
// (file download + diagnosis) keeps working when the call fails, including in a
// static preview build where there is no route to call.

// Most field names here are the old context_kit_leads column names, so a few
// say one thing and carry another: `offerings` holds the tool stack, `tone`
// holds the pain point, `redlines` holds the 12-month goal. crm..ai_where are
// answers the questionnaire scored into the gauge and then dropped instead of
// sending, so those carry the name of the question they answer.
export interface ContextLead {
  website?: string;
  occupation?: string;
  org_name?: string;
  what_you_do?: string;
  audience?: string;
  offerings?: string;
  tone?: string;
  redlines?: string;
  ai_uses?: string;
  ai_policy?: string;
  ai_training?: string;
  crm?: string;
  automation?: string;
  integrations?: string;
  tracking?: string;
  decisions?: string;
  ai_where?: string;
  readiness_score?: number;
  name?: string;
  phone?: string;
  email?: string;
  source?: string;
}

export async function submitContextLead(entry: ContextLead): Promise<boolean> {
  try {
    const res = await fetch('/api/context-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'context-kit', ...entry }),
    });
    return res.ok;
  } catch (err) {
    console.error('submitContextLead failed', err);
    return false;
  }
}
