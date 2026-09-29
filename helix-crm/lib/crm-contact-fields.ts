// A contact's editable details: the limits and the rules, in one place. The drawer's
// form runs them before sending so most mistakes show without a round trip, and
// crmUpdateContactDetails runs them again, because the server decides. Pure: no
// server imports, so client components use it too. See DESIGN.md — Contact details.

import type { Dict } from '@/lib/i18n/he';

/** Characters, counted as the user sees them (code points, not UTF-16 units). */
export const CONTACT_LIMITS = {
  full_name: 120,
  phone: 30,
  email: 254,
  role_title: 120,
  linkedin_url: 300,
  source: 60,
  notes: 2000,
} as const;

export type LimitedField = keyof typeof CONTACT_LIMITS;
export type ContactField = LimitedField | 'company_id';

/** The form as typed. `company_id` is '' for no company. */
export type ContactDetailsInput = Record<ContactField, string>;

/** What is stored: trimmed, empty as null, the email lowercased. */
export type ContactDetails = {
  full_name: string;
  phone: string | null;
  email: string | null;
  role_title: string | null;
  linkedin_url: string | null;
  source: string | null;
  notes: string | null;
  company_id: string | null;
};

export type ProblemCode = 'required' | 'email' | 'url' | 'long';
export type DetailsProblem = { field: ContactField; code: ProblemCode };

// The same pattern the team invite uses.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const length = (s: string) => Array.from(s).length;

/**
 * An `http:` or `https:` address, or null. The only way a stored LinkedIn value
 * becomes a link: a contact that came in through the public API may carry any
 * string, and `javascript:` in an href runs on click.
 */
export function safeHttpUrl(v: string | null | undefined): string | null {
  if (!v) return null;
  try {
    const u = new URL(v.trim());
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null;
  } catch {
    return null;
  }
}

/** The sentence for a problem, in the screen's language. The form shows it under its field. */
export function problemText(p: DetailsProblem, t: Dict['crm'], locale: string): string {
  if (p.code === 'required') return t.errNameRequired;
  if (p.code === 'email') return t.errEmailInvalid;
  if (p.code === 'url') return t.errUrlInvalid;
  if (p.field === 'company_id') return t.detSaveFailed;
  return t.errTooLong.replace('{max}', CONTACT_LIMITS[p.field].toLocaleString(locale === 'en' ? 'en-US' : 'he-IL'));
}

/**
 * Every problem with the form, in form order, or the value to store. A field that
 * is both too long and malformed reports only that it is too long.
 */
export function validateContactDetails(input: ContactDetailsInput):
  | { ok: true; value: ContactDetails }
  | { ok: false; problems: DetailsProblem[] } {
  const v = Object.fromEntries(
    (Object.keys(CONTACT_LIMITS) as LimitedField[]).map((k) => [k, (input[k] ?? '').trim()]),
  ) as Record<LimitedField, string>;
  const problems: DetailsProblem[] = [];

  for (const field of Object.keys(CONTACT_LIMITS) as LimitedField[]) {
    if (field === 'full_name' && !v.full_name) { problems.push({ field, code: 'required' }); continue; }
    if (length(v[field]) > CONTACT_LIMITS[field]) { problems.push({ field, code: 'long' }); continue; }
    if (field === 'email' && v.email && !EMAIL_RE.test(v.email)) problems.push({ field, code: 'email' });
    if (field === 'linkedin_url' && v.linkedin_url && !safeHttpUrl(v.linkedin_url)) problems.push({ field, code: 'url' });
  }
  if (problems.length > 0) return { ok: false, problems };

  const orNull = (s: string) => (s === '' ? null : s);
  return {
    ok: true,
    value: {
      full_name: v.full_name,
      phone: orNull(v.phone),
      email: orNull(v.email.toLowerCase()),
      role_title: orNull(v.role_title),
      linkedin_url: orNull(v.linkedin_url),
      source: orNull(v.source),
      notes: orNull(v.notes),
      company_id: orNull((input.company_id ?? '').trim()),
    },
  };
}
