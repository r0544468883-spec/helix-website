// What a quote carries about the business: the limits and the rules, shared by the
// "פרטי העסק" form and its server actions. Pure: no server imports, so client
// components use it too. See DESIGN.md — Business details.

import type { Dict } from '@/lib/i18n/he';
import { safeHttpUrl } from '@/lib/crm-contact-fields';

export const BUSINESS_LIMITS = {
  name: 120,
  company_number: 20,
  address: 200,
  phone: 30,
  email: 254,
  website: 300,
  default_notes: 1000,
} as const;

export const VALIDITY_MIN = 1;
export const VALIDITY_MAX = 365;
export const VALIDITY_DEFAULT = 14;

export type TextField = keyof typeof BUSINESS_LIMITS;
export type BusinessField = TextField | 'validity_days';

/** Stored in crm_workspaces.business. logo_url is the document logo, not the nav's. */
export type Business = Record<TextField, string> & {
  vat_exempt: boolean;
  validity_days: number;
  logo_url: string | null;
};

/** The form as typed. */
export type BusinessInput = Record<TextField, string> & { vat_exempt: boolean; validity_days: string };

export const EMPTY_BUSINESS: Business = {
  name: '', company_number: '', address: '', phone: '', email: '', website: '', default_notes: '',
  vat_exempt: false, validity_days: VALIDITY_DEFAULT, logo_url: null,
};

/** Whatever the column holds, as a Business: missing or malformed values fall back to the defaults. */
export function businessFrom(raw: unknown): Business {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const text = (k: TextField) => (typeof r[k] === 'string' ? (r[k] as string) : '');
  const days = Number(r.validity_days);
  return {
    name: text('name'),
    company_number: text('company_number'),
    address: text('address'),
    phone: text('phone'),
    email: text('email'),
    website: text('website'),
    default_notes: text('default_notes'),
    vat_exempt: r.vat_exempt === true,
    validity_days: Number.isInteger(days) && days >= VALIDITY_MIN && days <= VALIDITY_MAX ? days : VALIDITY_DEFAULT,
    logo_url: typeof r.logo_url === 'string' && r.logo_url ? r.logo_url : null,
  };
}

export type BusinessProblem = { field: BusinessField; code: 'long' | 'email' | 'url' | 'range' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const length = (s: string) => Array.from(s).length;

/** Every problem in form order, or the value to store (without the logo, which has its own action). */
export function validateBusiness(input: BusinessInput):
  | { ok: true; value: Omit<Business, 'logo_url'> }
  | { ok: false; problems: BusinessProblem[] } {
  const v = Object.fromEntries(
    (Object.keys(BUSINESS_LIMITS) as TextField[]).map((k) => [k, (input[k] ?? '').trim()]),
  ) as Record<TextField, string>;
  const problems: BusinessProblem[] = [];
  for (const field of Object.keys(BUSINESS_LIMITS) as TextField[]) {
    if (length(v[field]) > BUSINESS_LIMITS[field]) { problems.push({ field, code: 'long' }); continue; }
    if (field === 'email' && v.email && !EMAIL_RE.test(v.email)) problems.push({ field, code: 'email' });
    if (field === 'website' && v.website && !safeHttpUrl(v.website)) problems.push({ field, code: 'url' });
  }
  const days = Number(String(input.validity_days ?? '').trim());
  if (!Number.isInteger(days) || days < VALIDITY_MIN || days > VALIDITY_MAX) problems.push({ field: 'validity_days', code: 'range' });
  if (problems.length > 0) return { ok: false, problems };
  return { ok: true, value: { ...v, email: v.email.toLowerCase(), vat_exempt: input.vat_exempt === true, validity_days: days } };
}

/** The sentence for a problem, in the screen's language. */
export function businessProblemText(p: BusinessProblem, t: Dict['crm'], locale: string): string {
  if (p.code === 'email') return t.errEmailInvalid;
  if (p.code === 'url') return t.errUrlInvalid;
  if (p.code === 'range') return t.errValidityRange;
  const max = p.field === 'validity_days' ? VALIDITY_MAX : BUSINESS_LIMITS[p.field];
  return t.errTooLong.replace('{max}', max.toLocaleString(locale === 'en' ? 'en-US' : 'he-IL'));
}

// ---- the document logo ------------------------------------------------------------

export const LOGO_MAX_BYTES = 1024 * 1024;
export type LogoType = 'image/png' | 'image/jpeg' | 'image/webp';
export const LOGO_EXT: Record<LogoType, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

/**
 * The image type from the file's first bytes, or null. The name and the declared
 * type can lie; the bytes can't. No SVG: opened on its own, an SVG runs script.
 */
export function sniffLogoType(bytes: Uint8Array): LogoType | null {
  const at = (i: number, ...b: number[]) => b.every((x, k) => bytes[i + k] === x);
  if (at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return 'image/png';
  if (at(0, 0xff, 0xd8, 0xff)) return 'image/jpeg';
  if (at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return 'image/webp';
  return null;
}
