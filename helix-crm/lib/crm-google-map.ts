import { isKnown, normalizeEmail, type MatchKeys } from '@/lib/crm-contact-match';

/**
 * Google People data as the CRM uses it. Pure (clients may import it): the shapes
 * below are the few fields of Google's Person the import reads, written out so no
 * Google package reaches a browser bundle. openspec: crm-connect-google-and-make, decision 5.
 */

export type GPerson = {
  resourceName?: string | null;
  names?: { displayName?: string | null }[] | null;
  emailAddresses?: { value?: string | null }[] | null;
  phoneNumbers?: { value?: string | null }[] | null;
  organizations?: { name?: string | null; title?: string | null }[] | null;
};

export type ImportRow = {
  resourceName: string;
  /** The display name, or the first email or phone when there is none. */
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  title: string | null;
  /** Already in the workspace (same email or phone): shown, never importable. */
  known: boolean;
};

const clean = (v: string | null | undefined) => (v ?? '').trim();

/** A Google person as the import list shows it, or null when there is nothing to import. */
export function toRow(p: GPerson, keys: MatchKeys): ImportRow | null {
  if (!p.resourceName) return null;
  const name = clean(p.names?.[0]?.displayName);
  const emails = (p.emailAddresses ?? []).map((e) => clean(e.value)).filter(Boolean);
  const phones = (p.phoneNumbers ?? []).map((x) => clean(x.value)).filter(Boolean);
  if (!name && emails.length === 0 && phones.length === 0) return null;
  const org = p.organizations?.[0];
  return {
    resourceName: p.resourceName,
    name: name || emails[0] || phones[0],
    email: emails[0] ? (normalizeEmail(emails[0]) ?? emails[0]) : null,
    phone: phones[0] ?? null,
    company: clean(org?.name) || null,
    title: clean(org?.title) || null,
    known: isKnown(keys, { emails, phones }),
  };
}

/** The list the page shows: importable rows mapped, empties dropped, sorted by name. */
export function toRows(list: GPerson[], keys: MatchKeys, locale: string): ImportRow[] {
  return list
    .map((p) => toRow(p, keys))
    .filter((r): r is ImportRow => r !== null)
    .sort((a, b) => a.name.localeCompare(b.name, locale === 'en' ? 'en' : 'he'));
}
