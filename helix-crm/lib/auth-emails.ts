import { getDict, isRtl } from '@/lib/i18n';

/**
 * The invite and sign-in emails the CRM sends through Resend (lib/crm-access-link.ts).
 * One light, single-column layout with inline styles and a table-cell button,
 * because mail apps drop <style> and Outlook ignores padding on <a>. No image,
 * no tracking pixel and no rewritten link: the only href is the one-time link.
 * The workspace and inviter names are typed by users, so every value is escaped.
 * See DESIGN.md §8 — Auth emails.
 */

export type AuthEmailKind = 'invite' | 'sign_in';
export type AuthEmail = { subject: string; html: string; text: string };

// The CRM's light tokens (app/globals.css), written out: a mail app has no CSS variables.
const C = {
  bg: '#FAFAF8',
  surface: '#FFFFFF',
  border: '#EBEBE8',
  ink: '#1A1A1A',
  secondary: '#555555',
  muted: '#6E6E6E',
  brand: '#10B981',
  onBrand: '#121413',
};
const FONT = 'Arial,Helvetica,sans-serif';
// Right-to-left mark: a plain-text paragraph that starts with a Latin name
// would otherwise be laid out left to right by apps that guess the direction.
const RLM = '‏';

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Fills {key} in a dictionary line. `wrap` formats each value, for HTML or text. */
function fill(template: string, vars: Record<string, string>, wrap: (v: string) => string): string {
  return template.replace(/\{(\w+)\}/g, (m, key: string) => (key in vars ? wrap(vars[key]) : m));
}

export function buildAuthEmail(input: {
  kind: AuthEmailKind;
  locale: string;
  /** The one-time link to /{locale}/auth/confirm. */
  link: string;
  /** The sign-in page, where a new link can be requested. */
  loginUrl: string;
  inviterName?: string;
  workspaceName?: string;
  roleLabel?: string;
}): AuthEmail {
  const t = getDict(input.locale).authEmail;
  const rtl = isRtl(input.locale);
  const dir = rtl ? 'rtl' : 'ltr';
  const align = rtl ? 'right' : 'left';
  const invite = input.kind === 'invite';
  // One line each: a name with a line break must not reach the subject header.
  const oneLine = (v: string | undefined) => (v ?? '').replace(/\s+/g, ' ').trim();
  const vars: Record<string, string> = {
    inviter: oneLine(input.inviterName) || 'HELIX',
    workspace: oneLine(input.workspaceName) || 'HELIX',
    role: oneLine(input.roleLabel),
    login: input.loginUrl,
  };

  // HTML: the template is escaped, then each value, escaped, sits in its own
  // direction so a Latin name inside Hebrew keeps its place. The login address
  // is text, not a link: the email's only href is the button's.
  const h = (template: string) =>
    fill(escapeHtml(template), vars, (v) => `<span dir="auto">${escapeHtml(v)}</span>`);
  const plain = (template: string) => fill(template, vars, (v) => v);

  const subject = plain(invite ? t.inviteSubject : t.signInSubject);
  const heading = invite ? t.inviteHeading : t.signInHeading;
  const body = invite ? t.inviteBody : t.signInBody;
  const once = invite ? t.inviteOnce : t.signInOnce;
  const last = invite ? t.inviteReply : t.signInIgnore;
  const href = escapeHtml(input.link);

  const html = `<!doctype html>
<html lang="${input.locale === 'en' ? 'en' : 'he'}" dir="${dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${C.bg};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="${dir}" style="max-width:560px;background:${C.surface};border:1px solid ${C.border};border-radius:16px;">
<tr><td dir="${dir}" style="padding:32px 24px;font-family:${FONT};color:${C.ink};text-align:${align};">
<div style="font-size:20px;font-weight:900;letter-spacing:-0.02em;" dir="ltr">HELIX<span style="color:${C.brand};">.</span></div>
<h1 style="font-size:22px;line-height:1.35;font-weight:800;margin:24px 0 12px;color:${C.ink};">${h(heading)}</h1>
<p style="font-size:16px;line-height:1.6;margin:0 0 24px;color:${C.ink};">${h(body)}</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="background:${C.brand};border-radius:10px;">
<a href="${href}" style="display:inline-block;padding:14px 28px;font-family:${FONT};font-size:16px;line-height:20px;font-weight:700;color:${C.onBrand};text-decoration:none;border-radius:10px;">${escapeHtml(t.button)}</a>
</td></tr></table>
<p style="font-size:14px;line-height:1.6;margin:24px 0 0;color:${C.secondary};">${h(once)}</p>
<p style="font-size:14px;line-height:1.6;margin:12px 0 0;color:${C.secondary};">${h(last)}</p>
<p style="font-size:13px;line-height:1.6;margin:24px 0 0;color:${C.muted};">${escapeHtml(t.linkFallback)}<br><span dir="ltr" style="word-break:break-all;">${href}</span></p>
</td></tr>
</table>
<p style="font-family:${FONT};font-size:12px;color:${C.muted};margin:16px 0 0;" dir="ltr">${escapeHtml(t.footer)}</p>
</td></tr>
</table>
</body>
</html>`;

  const mark = rtl ? RLM : '';
  const text = [
    plain(heading),
    plain(body),
    `${t.button}: ${input.link}`,
    plain(once),
    plain(last),
    t.footer,
  ].map((line) => mark + line).join('\n\n');

  return { subject, html, text };
}
