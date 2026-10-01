/**
 * When two records are the same person: the same email, ignoring case, or the same
 * phone compared on digits, with a leading 972 read as 0 (an Israeli number written
 * internationally). Used by the public API's opt-in match and by the Google import,
 * so a person never lands in the CRM twice by either road. Pure: clients may import it.
 * openspec: crm-connect-google-and-make, design decision 2.
 */

/** A trimmed, lowercased address, or null when there is nothing to compare. */
export function normalizeEmail(raw: string | null | undefined): string | null {
  const v = (raw ?? '').trim().toLowerCase();
  return v.includes('@') ? v : null;
}

/** Digits only, 972… as 0…; null when fewer than 7 digits remain (not a phone). */
export function normalizePhone(raw: string | null | undefined): string | null {
  let d = (raw ?? '').replace(/\D/g, '');
  if (d.startsWith('00972')) d = d.slice(2);
  if (d.startsWith('972')) d = `0${d.slice(3)}`;
  return d.length >= 7 ? d : null;
}

export type MatchKeys = { emails: Set<string>; phones: Set<string> };

/** The keys a set of existing contacts can be matched on. */
export function matchKeys(rows: { email?: string | null; phone?: string | null }[]): MatchKeys {
  const emails = new Set<string>();
  const phones = new Set<string>();
  for (const r of rows) {
    const e = normalizeEmail(r.email);
    const p = normalizePhone(r.phone);
    if (e) emails.add(e);
    if (p) phones.add(p);
  }
  return { emails, phones };
}

/** Whether a person (any of their emails or phones) is already among `keys`. */
export function isKnown(keys: MatchKeys, person: { emails?: (string | null | undefined)[]; phones?: (string | null | undefined)[] }): boolean {
  return (person.emails ?? []).some((e) => {
    const n = normalizeEmail(e);
    return n !== null && keys.emails.has(n);
  }) || (person.phones ?? []).some((p) => {
    const n = normalizePhone(p);
    return n !== null && keys.phones.has(n);
  });
}

/** Two single records: the same person? */
export function sameContact(
  a: { email?: string | null; phone?: string | null },
  b: { email?: string | null; phone?: string | null },
): boolean {
  return isKnown(matchKeys([a]), { emails: [b.email], phones: [b.phone] });
}
