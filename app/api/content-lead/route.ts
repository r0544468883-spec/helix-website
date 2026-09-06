import { NextResponse } from 'next/server';
import { getResend } from '@/lib/resend';
import { recordContentLead } from '@/lib/content-leads';
import { FREE_LIMIT, remainingUses } from '@/lib/content-usage';

// Lead capture for the free tools. Persists the lead (email + real source + name +
// questionnaire details), notifies HELIX with the FULL lead (best-effort via Resend), and
// returns ok. We never block the user because our own notification failed.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asString(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

// Accept a flat {key: value} bag of questionnaire answers, capped so an anonymous caller
// can't stuff the notification email. Keys/values are coerced to strings.
function asDetails(v: unknown): Record<string, string> {
  if (!v || typeof v !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    const key = asString(k).slice(0, 60);
    const value = asString(val).slice(0, 600);
    if (key && value) out[key] = value;
    if (Object.keys(out).length >= 25) break;
  }
  return out;
}

export async function POST(req: Request) {
  let body: { email?: unknown; company?: unknown; source?: unknown; name?: unknown; details?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  // Honeypot, pretend success.
  if (asString(body.company).length > 0) return NextResponse.json({ ok: true });

  const email = asString(body.email).toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
  }

  const source = asString(body.source).slice(0, 80) || 'content';
  const name = asString(body.name).slice(0, 120);
  const details = asDetails(body.details);

  // Persist the lead (best-effort; no-op if SUPABASE_* env is unset).
  await recordContentLead({ email, source, name, details });

  // Best-effort notify HELIX with the FULL lead, don't fail the unlock if unconfigured.
  // Recipients: RESEND_NOTIFY_TO (comma-separated) overrides; otherwise these defaults.
  const recipients = (process.env.RESEND_NOTIFY_TO || 'service@helix.co.il,r0544468883@gmail.com')
    .split(',').map((s) => s.trim()).filter(Boolean);
  if (recipients.length) {
    try {
      const resend = getResend();
      const detailLines = Object.entries(details).map(([k, v]) => `• ${k}: ${v}`);
      const text = [
        `ליד חדש מהכלים החינמיים`,
        ``,
        `מקור: ${source}`,
        name ? `שם: ${name}` : '',
        `אימייל: ${email}`,
        `התקבל: ${new Date().toISOString()}`,
        detailLines.length ? `\nפרטי השאלון:` : '',
        ...detailLines,
      ].filter(Boolean).join('\n');
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: recipients,
        subject: `ליד חדש · ${source}${name ? ` · ${name}` : ''} (${email})`,
        text,
      });
    } catch (err) {
      console.error('content-lead notify failed', err);
    }
  }

  // A DB outage means "unknown", not "zero".
  let remaining: number | null = null;
  try {
    remaining = await remainingUses(email);
  } catch {
    /* unknown */
  }
  return NextResponse.json({ ok: true, remaining, limit: FREE_LIMIT });
}
