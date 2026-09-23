import 'server-only';
import { getResend } from '@/lib/resend';
import { clientIp } from '@/lib/client-ip';

// One notification path for every form on the site.
//
// Before this existed each route hand-rolled its own resend.emails.send call, so
// the from-address, the recipient list, the subject style and the failure
// handling all drifted apart — and most routes that captured details (the free
// tools, the community form, the scanners) never sent anything at all. Anything
// a visitor types now goes through notifyLead().
//
// Two rules the callers rely on:
//   1. It NEVER throws. A form must not 500 because our own notification failed.
//      It returns true/false so a route that has no other record of the lead
//      (the plain lead form, the workshop registrations) can still decide to
//      report a failure to the visitor.
//   2. It sends EVERYTHING the visitor typed. A lead whose email address arrives
//      without the questionnaire answers next to it is a lead we have to chase.

/** Comma-separated env var, e.g. "a@x.com, b@y.com". */
function recipients(): string[] {
  return (process.env.RESEND_NOTIFY_TO || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// The sender. 'onboarding@resend.dev' is Resend's SANDBOX address: it delivers
// only to the address that owns the Resend account, and it rejects the WHOLE
// request (403) as soon as any other recipient is on the list. As of
// 2026-09-20 the account has no verified domain, so the sandbox is all there
// is. See apphosting.yaml for how to switch to leads@helix.co.il.
const SANDBOX_FROM = 'HELIX <onboarding@resend.dev>';
const FROM = process.env.RESEND_FROM || SANDBOX_FROM;

/**
 * True for the sandbox 403 that means "you may only mail the account owner".
 * Narrow on purpose: a genuine failure must stay a failure.
 */
function isSandboxRecipientError(err: unknown): boolean {
  const msg = typeof err === 'object' && err && 'message' in err ? String((err as { message: unknown }).message) : '';
  return /testing emails|own email address/i.test(msg);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface LeadNotification {
  /** What this is, in Hebrew, for the subject line. e.g. 'ליד חדש', 'הרשמה לסדנה'. */
  kind: string;
  /** Where it came from: a page path or tool name. e.g. '/free-tools/content'. */
  source: string;
  name?: string;
  email?: string;
  phone?: string;
  /** Everything else the visitor typed: questionnaire answers, business, website, free text. */
  details?: Record<string, unknown>;
  /** Passed through so the notification can carry IP + user-agent for spam triage. */
  req?: Request;
}

function clean(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return '';
  }
}

/**
 * Flattens the details bag to printable lines, capped so an anonymous caller
 * cannot stuff the notification: 40 fields, 1500 chars each.
 */
function detailLines(details?: Record<string, unknown>): Array<[string, string]> {
  if (!details) return [];
  const out: Array<[string, string]> = [];
  for (const [k, v] of Object.entries(details)) {
    const key = clean(k).slice(0, 80);
    const value = clean(v).slice(0, 1500);
    if (!key || !value) continue;
    out.push([key, value]);
    if (out.length >= 40) break;
  }
  return out;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Sends one lead notification to HELIX. Best-effort: returns false instead of
 * throwing when Resend is unconfigured, the recipient list is empty, or the
 * send fails.
 */
export async function notifyLead(entry: LeadNotification): Promise<boolean> {
  const to = recipients();
  if (!to.length) {
    console.error('notifyLead: RESEND_NOTIFY_TO is not set, lead not emailed', {
      source: entry.source,
    });
    return false;
  }

  const name = clean(entry.name).slice(0, 120);
  const email = clean(entry.email).slice(0, 200);
  const phone = clean(entry.phone).slice(0, 40);
  const source = clean(entry.source).slice(0, 120) || 'unknown';
  const kind = clean(entry.kind).slice(0, 80) || 'ליד חדש';
  const extras = detailLines(entry.details);

  // The subject is what Eran sees in the inbox list, so it carries the
  // identifying detail rather than a generic label.
  const who = [name, email, phone].filter(Boolean).join(' · ') || 'ללא פרטי קשר';
  const subject = `${kind} · ${source} · ${who}`;

  const meta: Array<[string, string]> = [];
  if (entry.req) {
    meta.push(['IP', clientIp(entry.req)]);
    meta.push(['User-Agent', (entry.req.headers.get('user-agent') || 'unknown').slice(0, 300)]);
    const referer = entry.req.headers.get('referer');
    if (referer) meta.push(['Referer', referer.slice(0, 300)]);
  }
  meta.push(['התקבל', new Date().toISOString()]);

  const rows: Array<[string, string]> = [
    ['מקור', source],
    ...(name ? ([['שם', name]] as Array<[string, string]>) : []),
    ...(email ? ([['אימייל', email]] as Array<[string, string]>) : []),
    ...(phone ? ([['טלפון', phone]] as Array<[string, string]>) : []),
  ];

  const text = [
    kind,
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    ...(extras.length ? ['', 'מה שמולא בטופס:', ...extras.map(([k, v]) => `• ${k}: ${v}`)] : []),
    '',
    ...meta.map(([k, v]) => `${k}: ${v}`),
  ].join('\n');

  const htmlRow = ([k, v]: [string, string]) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#6B6B6B;white-space:nowrap;vertical-align:top">${escapeHtml(
      k
    )}</td><td style="padding:4px 0;color:#1A1A1A;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`;

  const html = [
    `<div dir="rtl" style="font-family:Heebo,Arial,sans-serif;font-size:15px;color:#1A1A1A;background:#FAFAF8;padding:24px">`,
    `<h2 style="margin:0 0 16px;font-size:20px;font-weight:700">${escapeHtml(kind)}</h2>`,
    `<table style="border-collapse:collapse">${rows.map(htmlRow).join('')}</table>`,
    extras.length
      ? `<h3 style="margin:20px 0 8px;font-size:15px;font-weight:600;color:#6B6B6B">מה שמולא בטופס</h3><table style="border-collapse:collapse">${extras
          .map(htmlRow)
          .join('')}</table>`
      : '',
    `<table style="border-collapse:collapse;margin-top:20px;font-size:12px;color:#A8A8A8">${meta
      .map(
        ([k, v]) =>
          `<tr><td style="padding:2px 12px 2px 0;white-space:nowrap">${escapeHtml(
            k
          )}</td><td style="padding:2px 0;word-break:break-all">${escapeHtml(v)}</td></tr>`
      )
      .join('')}</table>`,
    `</div>`,
  ].join('');

  const payload = {
    from: FROM,
    subject,
    text,
    html,
    // Lets Eran answer the lead straight from the notification.
    ...(EMAIL_RE.test(email) ? { replyTo: email } : {}),
  };

  try {
    const resend = getResend();
    const { error } = await resend.emails.send({ ...payload, to });
    if (!error) return true;

    // On the sandbox sender a second recipient fails the entire send, which
    // would mean nobody is told about the lead. Falling back to the first
    // address is strictly better than losing it. Remove this once the domain
    // is verified and RESEND_FROM is set; the log line says when that is.
    if (isSandboxRecipientError(error) && to.length > 1) {
      console.error(
        `notifyLead: sandbox sender cannot reach ${to.slice(1).join(', ')} — retrying to ${to[0]} only. ` +
          'Verify helix.co.il in Resend and set RESEND_FROM to deliver to everyone.',
        { source }
      );
      const retry = await resend.emails.send({ ...payload, to: [to[0]] });
      if (!retry.error) return true;
      console.error('notifyLead: retry to the account owner also failed', { source, error: retry.error });
      return false;
    }

    console.error('notifyLead: Resend rejected the send', { source, error });
    return false;
  } catch (err) {
    console.error('notifyLead failed', { source, err });
    return false;
  }
}
