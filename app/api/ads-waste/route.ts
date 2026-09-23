// Free Scan "בדיקה B" — Ad Waste scan (paste/upload a Google Ads search-terms CSV). Runs the
// pure auditor (lib/ads-waste). Ungated: totals + top-3 waste teaser. Gated (email): the full
// classified term list. Detection only — the "found ₪X waste" aha, CTA into HELIX OPS.

import { NextResponse } from 'next/server';
import { auditWasteCsv } from '@/lib/ads-waste';
import { recordScan } from '@/lib/supabase-scans';
import { clientIp } from '@/lib/client-ip';
import { rateLimited } from '@/lib/rate-limit';
import { notifyLead } from '@/lib/notify-lead';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_MAX = 15;
const MAX_CSV_BYTES = 2 * 1024 * 1024; // 2MB guard

// includes('@') is enough to unlock the full term list, and it stays that way.
// It is NOT enough to put an address on an outbound mail: this route is
// unauthenticated, so "@" alone would let a script pump attacker-written
// content into the notification inbox. The mail is gated on a real address.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LEN = 200;

export async function POST(req: Request) {
  if (rateLimited('ads-waste', clientIp(req), RATE_MAX)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  let body: { csv?: unknown; email?: unknown; brandTerms?: unknown; name?: unknown; phone?: unknown; company?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  // Honeypot, same field the migrated forms use. No human sees it, so anything
  // in it is a bot: do nothing. Unlike the plain forms this route carries a result,
  // and the client renders that result straight away, so a bare ok:true with no
  // payload would white-screen the tool. Answer with an error code the client
  // already maps, reusing the rate-limit shape so a bot cannot tell the trap
  // apart from the limiter above.
  if (typeof body.company === 'string' && body.company.trim().length > 0) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  const csv = typeof body.csv === 'string' ? body.csv : '';
  if (!csv) return NextResponse.json({ ok: false, error: 'no_csv' }, { status: 400 });
  if (csv.length > MAX_CSV_BYTES) return NextResponse.json({ ok: false, error: 'too_large' }, { status: 413 });

  const email = typeof body.email === 'string' && body.email.includes('@') ? body.email : undefined;
  const mailTo = email && email.length <= MAX_EMAIL_LEN && EMAIL_RE.test(email) ? email : undefined;
  const name = typeof body.name === 'string' ? body.name : undefined;
  const phone = typeof body.phone === 'string' ? body.phone : undefined;
  const brandTerms = Array.isArray(body.brandTerms) ? body.brandTerms.filter((b): b is string => typeof b === 'string') : [];

  const audit = auditWasteCsv(csv, { brandTerms });
  if (!audit.ok) {
    // Same hole as the fetch failure in ads-scan: the gate submit re-posts the
    // CSV, and the visitor can edit the textarea between the two runs. A parse
    // that fails on the second pass would drop someone who already saw a result
    // and typed their email. Capture the lead, then report the failure.
    if (email) {
      await recordScan({ url: 'csv://ads-waste', source: 'ads-waste', has_lead: true, email, name, phone });
      if (mailTo) {
        await notifyLead({
          kind: 'ליד מבדיקת בזבוז בפרסום',
          source: '/free-tools/ads-waste',
          name,
          email: mailTo,
          phone,
          details: {
            'הערה': 'הניתוח עצמו נכשל, לא הצלחנו לקרוא את הקובץ. אין נתונים לליד הזה, אבל הוא השאיר אימייל.',
            'שגיאה': audit.error ?? 'parse_failed',
          },
          req,
        });
      }
    }
    return NextResponse.json({ ok: false, error: audit.error ?? 'parse_failed' }, { status: 422 });
  }

  await recordScan({ url: 'csv://ads-waste', issues: audit.totals.negativeCandidates, source: 'ads-waste', has_lead: !!email, email, name, phone });

  // Only an email turns an audit into a lead; anonymous audits stay unmailed. The totals and
  // the five costliest waste terms go in the mail, never the CSV itself: that is enough to
  // open the conversation with a number, and the raw export is the client's data.
  if (mailTo) {
    await notifyLead({
      kind: 'ליד מבדיקת בזבוז בפרסום',
      source: '/free-tools/ads-waste',
      name,
      email: mailTo,
      phone,
      details: {
        'מונחי חיפוש': audit.totals.terms,
        'הוצאה בקובץ': `₪${Math.round(audit.totals.spend)}`,
        'בזבוז מוערך': `₪${Math.round(audit.totals.wasteEstimate)}`,
        'מועמדים לשלילה': audit.totals.negativeCandidates,
        'דורשים בדיקה': audit.totals.needsReview,
        'מילות מותג שסומנו': brandTerms.join(', ').slice(0, 300) || 'לא סומנו',
        'הבזבוז הגדול': audit.topWaste
          .slice(0, 5)
          .map((t) => `${t.term} · ₪${Math.round(t.cost)} · ${t.clicks} קליקים · ${t.conversions} המרות`)
          .join(' | ')
          .slice(0, 800),
      },
      req,
    });
  }

  // Ungated: totals + top-3 teaser. Gated (email): full classified rows.
  const payload = {
    ok: true,
    totals: audit.totals,
    teaser: audit.topWaste.slice(0, 3),
    rows: email ? audit.rows : null,
    topWaste: email ? audit.topWaste : audit.topWaste.slice(0, 3),
    gated: !email,
  };
  return NextResponse.json(payload);
}
