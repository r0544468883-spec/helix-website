import { he, type Dict } from './he';
import { en } from './en';

export const locales = ['he', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'he';

export function getDict(locale: string): Dict {
  return locale === 'en' ? en : he;
}

export function isRtl(locale: string): boolean {
  return locale !== 'en';
}

/** Text direction for a locale. Known on the server, so layout that depends on it
 *  renders the same before and after hydration (unlike reading document.dir). */
export function dirOf(locale: string): 'rtl' | 'ltr' {
  return isRtl(locale) ? 'rtl' : 'ltr';
}

export function categoryName(cat: { name_he: string; name_en: string }, locale: string): string {
  return locale === 'en' ? cat.name_en : cat.name_he;
}

export type PluralForms = { zero?: string; one: string; two?: string; other: string };

/**
 * The form Intl.PluralRules picks for n, with {n} filled in. Hebrew has a dual
 * ("יומיים"), so `two` exists; `zero` is for a sentence that says it better than
 * "0 ימים". Languages without a dual fall through to `other`.
 */
export function plural(locale: string, n: number, forms: PluralForms): string {
  if (n === 0 && forms.zero) return forms.zero;
  const cat = new Intl.PluralRules(locale === 'en' ? 'en' : 'he').select(n);
  const form = cat === 'one' ? forms.one : cat === 'two' ? (forms.two ?? forms.other) : forms.other;
  return form.replace('{n}', n.toLocaleString(locale === 'en' ? 'en-US' : 'he-IL'));
}

export function formatDate(date: string | Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(typeof date === 'string' ? new Date(date) : date);
}
