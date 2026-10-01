import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDict } from '@/lib/i18n';
import { todayInIsrael } from '@/lib/crm-dates';
import type { BusinessSnapshot, ClientSnapshot, QuoteLine, QuoteView } from '@/lib/crm-quote';
import QuoteDocument from '@/components/QuoteDocument';
import QuotePrintButton from '@/components/QuotePrintButton';
import QuoteViewBeacon from '@/components/QuoteViewBeacon';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string; token: string }>;

// 32 random bytes in base64url are 43 characters. Anything else never reaches the database.
const TOKEN_RE = /^[A-Za-z0-9_-]{40,64}$/;

type Row = {
  status: 'draft' | 'sent' | 'cancelled';
  number: string | null;
  locale: 'he' | 'en';
  subject: string;
  items: QuoteLine[];
  vat_rate: number;
  subtotal: number;
  vat: number;
  total: number;
  valid_until: string | null;
  notes: string | null;
  business_snapshot: BusinessSnapshot | null;
  client_snapshot: ClientSnapshot | null;
  sent_at: string | null;
};

/**
 * The quote behind a link, read with the service role: a client has no session, and
 * no policy lets anyone read quotes by token. A draft is not public, so it reads as
 * not found. Cached per request, so the metadata and the page read it once.
 */
const loadQuote = cache(async (token: string): Promise<Row | null> => {
  if (!TOKEN_RE.test(token)) return null;
  const admin = createAdminClient();
  if (!admin) return null;
  const { data } = await admin.from('crm_quotes')
    .select('status, number, locale, subject, items, vat_rate, subtotal, vat, total, valid_until, notes, business_snapshot, client_snapshot, sent_at')
    .eq('public_token', token).maybeSingle();
  if (!data || data.status === 'draft') return null;
  return data as unknown as Row;
});

// The link preview names the business and says "הצעת מחיר". It never shows an amount.
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { token } = await params;
  const q = await loadQuote(token);
  const t = getDict(q?.locale ?? 'he').crm;
  const name = q?.business_snapshot?.name?.trim();
  const title = name ? `${t.docTitle} · ${name}` : t.docTitle;
  return {
    title,
    robots: { index: false, follow: false },
    openGraph: { title, description: title, type: 'website' },
  };
}

/**
 * A client's quote, opened from a link with no login and no CRM around it. It shows
 * the quote as it was frozen at sending. See DESIGN.md §9 — A public document page.
 */
export default async function QuotePage({ params }: { params: Params }) {
  const { locale, token } = await params;
  const q = await loadQuote(token);
  if (!q || !q.business_snapshot || !q.client_snapshot) notFound();
  if (q.locale !== locale) redirect(`/${q.locale}/q/${token}`);
  const t = getDict(q.locale).crm;

  if (q.status === 'cancelled') {
    return (
      <main id="main-content" className="min-h-screen bg-bg">
        <div className="max-w-[820px] mx-auto px-4 py-16 text-center">
          <p className="font-bold text-[18px]">{t.docCancelled}</p>
          <p className="text-ink-secondary mt-1" dir="auto">{q.business_snapshot.name}</p>
        </div>
      </main>
    );
  }

  const sentDay = q.sent_at ? todayInIsrael(new Date(q.sent_at)) : todayInIsrael();
  const view: QuoteView = {
    number: q.number,
    date: sentDay,
    locale: q.locale,
    subject: q.subject,
    lines: q.items ?? [],
    vat_rate: Number(q.vat_rate),
    subtotal: Number(q.subtotal),
    vat: Number(q.vat),
    total: Number(q.total),
    valid_until: q.valid_until,
    notes: q.notes,
    business: q.business_snapshot,
    client: q.client_snapshot,
  };
  const expired = !!q.valid_until && q.valid_until < todayInIsrael();
  const expiredOn = q.valid_until
    ? new Intl.DateTimeFormat(q.locale === 'en' ? 'en-GB' : 'he-IL', { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC' })
        .format(new Date(`${q.valid_until}T12:00:00Z`))
    : '';

  return (
    <main id="main-content" className="min-h-screen bg-bg print:bg-white">
      <div className="max-w-[820px] mx-auto px-4 py-6 md:py-10">
        <div className="flex justify-end mb-4 print:hidden">
          <QuotePrintButton label={t.docSavePdf} />
        </div>
        {expired && (
          <p role="status" className="mb-4 text-[14px] font-semibold bg-surface border border-border-strong rounded-xl px-4 py-3">
            {t.docExpired.replace('{date}', '')}<bdi dir="ltr">{expiredOn}</bdi>
          </p>
        )}
        <QuoteDocument quote={view} />
      </div>
      <QuoteViewBeacon token={token} />
    </main>
  );
}
