// A price quote's rules: its lines, totals and VAT, its number, and what sending
// it moves. Pure: the editor uses it for instant feedback, and the server actions
// decide with the same code. See DESIGN.md — Quote editor, Quote document.

import type { Dict } from '@/lib/i18n/he';
import type { ContactStatus } from '@/lib/crm-status';

export const QUOTE_LIMITS = {
  subject: 120,
  lines: 50,
  description: 200,
  notes: 1000,
  maxQuantity: 99_999,
  maxPrice: 10_000_000,
} as const;

/** Israel's VAT since 2025. Fixed on each quote when it is drafted, so a later change can't rewrite it. */
export const VAT_RATE = 0.18;

export type QuoteLine = { description: string; quantity: number; unit_price: number };
/** A line as typed in the editor. */
export type QuoteLineInput = { description: string; quantity: string; unit_price: string };
export const BLANK_LINE: QuoteLineInput = { description: '', quantity: '1', unit_price: '' };

export type QuoteProblem =
  | { field: 'subject' | 'lines' | 'notes'; code: 'required' | 'long' | 'count' }
  | { field: 'line'; index: number; part: 'description' | 'quantity' | 'unit_price'; code: 'required' | 'long' | 'range' | 'decimals' };

/** The business as a quote shows it, frozen at sending. */
export type BusinessSnapshot = {
  name: string; company_number: string; address: string; phone: string; email: string; website: string;
  vat_exempt: boolean; logo_url: string | null;
};
/** The client as a quote shows it: a name and a company, nothing more on a public link. */
export type ClientSnapshot = { name: string; company: string | null };

/** Everything QuoteDocument needs: a draft's live values, or a sent quote's frozen ones. */
export type QuoteView = {
  number: string | null;
  /** "YYYY-MM-DD", in Israel. */
  date: string;
  locale: 'he' | 'en';
  subject: string;
  lines: QuoteLine[];
  vat_rate: number;
  subtotal: number;
  vat: number;
  total: number;
  valid_until: string | null;
  notes: string | null;
  business: BusinessSnapshot;
  client: ClientSnapshot;
};

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const length = (s: string) => Array.from(s).length;

/** Each line is rounded to the agora on its own, then VAT on the subtotal, then the sum. */
export function lineTotal(l: QuoteLine): number {
  return round2(l.quantity * l.unit_price);
}

export function quoteTotals(lines: QuoteLine[], vatRate: number) {
  const subtotal = round2(lines.reduce((a, l) => a + lineTotal(l), 0));
  const vat = round2(subtotal * vatRate);
  return { subtotal, vat, total: round2(subtotal + vat) };
}

/** "₪7,080.00". Always two decimals: this is a price, not a figure. */
export function formatMoney(n: number, locale: string): string {
  return `₪${n.toLocaleString(locale === 'en' ? 'en-US' : 'he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** "2026-004": the year in Israel and the workspace's running number, at least three digits. */
export function formatQuoteNumber(year: number, n: number): string {
  return `${year}-${String(n).padStart(3, '0')}`;
}

/** Statuses a sent quote moves forward to "הצעה נשלחה". Anyone past it stays where they are. */
export const SEND_MOVES_FROM: readonly ContactStatus[] = ['new', 'contacted', 'talking', 'declined', 'frozen'];
/** Deal stages a sent quote moves forward to the proposal stage. */
export const DEAL_STAGES_BEFORE_PROPOSAL = ['lead', 'qualified', 'meeting'] as const;

// "18,000", "₪1,500.50" and "1500" all read as numbers; "18k" and "-3" don't.
function parseAmount(s: string): { n: number; decimals: number } | null {
  const t = s.replace(/[\s,₪]/g, '');
  if (!/^\d+(\.\d+)?$/.test(t)) return null;
  return { n: Number(t), decimals: t.includes('.') ? t.split('.')[1].length : 0 };
}

const isBlank = (l: QuoteLineInput) => !l.description.trim() && !l.unit_price.trim();

/** The lines that parse, for live totals while typing. Anything unfinished is left out. */
export function parseLinesLoose(inputs: QuoteLineInput[]): QuoteLine[] {
  const out: QuoteLine[] = [];
  for (const l of inputs) {
    const q = parseAmount(l.quantity);
    const p = parseAmount(l.unit_price);
    if (q && p && q.n > 0) out.push({ description: l.description.trim(), quantity: q.n, unit_price: p.n });
  }
  return out;
}

/**
 * A quote as typed. `draft` accepts an empty subject and no lines; `send` needs a
 * subject and at least one line. Either way, a line with anything typed in it must
 * be whole, and a line with nothing in it is dropped.
 */
export function validateQuote(
  input: { subject: string; lines: QuoteLineInput[]; notes: string },
  mode: 'draft' | 'send',
): { ok: true; value: { subject: string; lines: QuoteLine[]; notes: string } } | { ok: false; problems: QuoteProblem[] } {
  const problems: QuoteProblem[] = [];
  const subject = input.subject.trim();
  const notes = input.notes.trim();
  if (mode === 'send' && !subject) problems.push({ field: 'subject', code: 'required' });
  if (length(subject) > QUOTE_LIMITS.subject) problems.push({ field: 'subject', code: 'long' });
  if (input.lines.length > QUOTE_LIMITS.lines) problems.push({ field: 'lines', code: 'count' });
  if (length(notes) > QUOTE_LIMITS.notes) problems.push({ field: 'notes', code: 'long' });

  const lines: QuoteLine[] = [];
  input.lines.forEach((l, index) => {
    if (isBlank(l)) return;
    const description = l.description.trim();
    if (!description) problems.push({ field: 'line', index, part: 'description', code: 'required' });
    else if (length(description) > QUOTE_LIMITS.description) problems.push({ field: 'line', index, part: 'description', code: 'long' });
    const q = parseAmount(l.quantity);
    if (!q || q.n <= 0 || q.n > QUOTE_LIMITS.maxQuantity) problems.push({ field: 'line', index, part: 'quantity', code: 'range' });
    else if (q.decimals > 2) problems.push({ field: 'line', index, part: 'quantity', code: 'decimals' });
    const p = parseAmount(l.unit_price);
    if (!p || p.n > QUOTE_LIMITS.maxPrice) problems.push({ field: 'line', index, part: 'unit_price', code: 'range' });
    else if (p.decimals > 2) problems.push({ field: 'line', index, part: 'unit_price', code: 'decimals' });
    if (description && q && p) lines.push({ description, quantity: q.n, unit_price: p.n });
  });
  if (mode === 'send' && lines.length === 0 && !problems.some((p) => p.field === 'line')) {
    problems.push({ field: 'lines', code: 'required' });
  }
  if (problems.length > 0) return { ok: false, problems };
  return { ok: true, value: { subject, lines, notes } };
}

/** The sentence for a problem, in the screen's language. */
export function quoteProblemText(p: QuoteProblem, t: Dict['crm'], locale: string): string {
  const max = (n: number) => t.errTooLong.replace('{max}', n.toLocaleString(locale === 'en' ? 'en-US' : 'he-IL'));
  if (p.field !== 'line') {
    if (p.field === 'subject') return p.code === 'required' ? t.errQuoteSubjectRequired : max(QUOTE_LIMITS.subject);
    if (p.field === 'notes') return max(QUOTE_LIMITS.notes);
    return p.code === 'count' ? t.quoteLinesMax : t.errLinesRequired;
  }
  if (p.part === 'description') return p.code === 'required' ? t.errLineDescription : max(QUOTE_LIMITS.description);
  if (p.code === 'decimals') return t.errDecimals;
  return p.part === 'quantity' ? t.errQtyRange : t.errPriceRange;
}
