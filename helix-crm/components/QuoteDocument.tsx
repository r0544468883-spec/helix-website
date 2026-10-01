import { getDict, dirOf } from '@/lib/i18n';
import { formatMoney, lineTotal, type QuoteView } from '@/lib/crm-quote';

/** "3.10.2026" from "2026-10-03", read at noon UTC so no zone moves the day. */
function day(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'he-IL', {
    day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${iso}T12:00:00Z`));
}

const qty = (n: number) => (Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2))));

/**
 * The one rendering of a quote. The editor's preview, the client's page and the
 * printed PDF are all this component, so they can't drift apart. It is paper in
 * every theme (`.doc-paper`), and it takes no hooks, so both server and client
 * components render it. See DESIGN.md — Quote document.
 */
export default function QuoteDocument({ quote }: { quote: QuoteView }) {
  const t = getDict(quote.locale).crm;
  const { business: b, client, locale } = quote;
  const money = (n: number) => <span dir="ltr" className="font-mono">{formatMoney(n, locale)}</span>;
  const details = [
    b.company_number && t.docCompanyNumber.replace('{n}', b.company_number),
    b.address, b.phone, b.email, b.website,
  ].filter(Boolean) as string[];

  return (
    <article
      className="doc-paper bg-surface text-ink rounded-2xl border border-border p-6 md:p-10 print:border-0 print:rounded-none print:p-0"
      dir={dirOf(locale)}
      lang={locale}
    >
      <header className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          {b.logo_url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={b.logo_url} alt={b.name} className="max-h-16 w-auto object-contain" />
            : <p className="text-[20px] font-extrabold break-words" dir="auto">{b.name}</p>}
        </div>
        <div className="text-end shrink-0">
          <p className="text-[22px] font-extrabold">{t.docTitle}</p>
          <p className="text-[14px]">{quote.number ? <span dir="ltr" className="font-mono">{quote.number}</span> : t.quoteDraft}</p>
          <p className="text-[13px] text-ink-secondary"><bdi dir="ltr">{day(quote.date, locale)}</bdi></p>
        </div>
      </header>

      <div className="mt-4 text-[13px] text-ink-secondary leading-relaxed">
        {b.logo_url && b.name && <p className="font-semibold text-ink" dir="auto">{b.name}</p>}
        {details.map((d) => <p key={d} dir="auto">{d}</p>)}
      </div>

      <div className="mt-6">
        <p className="text-[12px] text-ink-muted">{t.docTo}</p>
        <p className="font-semibold" dir="auto">{client.name}</p>
        {client.company && <p className="text-[13px] text-ink-secondary" dir="auto">{client.company}</p>}
      </div>

      {quote.subject && <h2 className="text-[17px] font-bold mt-6 mb-3 break-words" dir="auto">{quote.subject}</h2>}

      {/* From sm (and on the A4 page) a table; on a phone each line is a block. */}
      <table className="hidden sm:table w-full text-[14px] mt-2">
        <thead>
          <tr className="text-[12px] text-ink-muted border-b border-border">
            <th scope="col" className="text-start font-semibold py-2">{t.quoteLineDescription}</th>
            <th scope="col" className="text-end font-semibold py-2 w-16">{t.quoteLineQty}</th>
            <th scope="col" className="text-end font-semibold py-2 w-36">{t.quoteLinePrice}</th>
            <th scope="col" className="text-end font-semibold py-2 w-36">{t.quoteLineTotal}</th>
          </tr>
        </thead>
        <tbody>
          {quote.lines.map((l, i) => (
            <tr key={i} className="border-b border-border align-top">
              <td className="py-2 pe-3 break-words" dir="auto">{l.description}</td>
              <td className="py-2 text-end"><span dir="ltr" className="font-mono">{qty(l.quantity)}</span></td>
              <td className="py-2 text-end">{money(l.unit_price)}</td>
              <td className="py-2 text-end">{money(lineTotal(l))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="sm:hidden mt-2 divide-y divide-border border-y border-border">
        {quote.lines.map((l, i) => (
          <li key={i} className="py-2">
            <p className="text-[14px] break-words" dir="auto">{l.description}</p>
            <p className="flex items-center justify-between gap-2 text-[13px] text-ink-secondary">
              <span dir="ltr" className="font-mono">{qty(l.quantity)} × {formatMoney(l.unit_price, locale)}</span>
              <span className="text-ink">{money(lineTotal(l))}</span>
            </p>
          </li>
        ))}
      </ul>

      <dl className="ms-auto w-full sm:w-72 mt-4 text-[14px] flex flex-col gap-1">
        <div className="flex justify-between gap-4"><dt>{t.quoteSubtotal}</dt><dd>{money(quote.subtotal)}</dd></div>
        {quote.vat_rate > 0 ? (
          <div className="flex justify-between gap-4">
            <dt>{t.quoteVat.replace('{rate}', String(Math.round(quote.vat_rate * 100)))}</dt>
            <dd>{money(quote.vat)}</dd>
          </div>
        ) : (
          <div className="flex justify-between gap-4"><dt>{t.quoteVatExempt}</dt><dd /></div>
        )}
        <div className="flex justify-between gap-4 font-bold text-[16px] border-t border-border pt-2 mt-1">
          <dt>{t.quoteTotal}</dt><dd>{money(quote.total)}</dd>
        </div>
      </dl>

      {quote.valid_until && (
        <p className="text-[13px] mt-6">
          {t.docValidUntil.replace('{date}', '')}<bdi dir="ltr">{day(quote.valid_until, locale)}</bdi>
        </p>
      )}
      {quote.notes && <p className="text-[13px] mt-3 whitespace-pre-line break-words" dir="auto">{quote.notes}</p>}
    </article>
  );
}
