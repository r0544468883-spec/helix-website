'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { MessageCircle, Link2, X } from 'lucide-react';
import type { Dict } from '@/lib/i18n/he';
import { crmSaveQuote, crmSendQuote, crmUndoStatus } from '@/app/crm-actions';
import { withTimeout, failureText } from '@/lib/use-status-change';
import { whatsAppLink } from '@/lib/phone-il';
import { todayInIsrael } from '@/lib/crm-dates';
import { isContactStatus } from '@/lib/crm-status';
import type { Business } from '@/lib/crm-business';
import {
  validateQuote, quoteProblemText, parseLinesLoose, quoteTotals, lineTotal, formatMoney,
  VAT_RATE, QUOTE_LIMITS, SEND_MOVES_FROM, BLANK_LINE,
  type QuoteLine, type QuoteLineInput, type QuoteProblem, type QuoteView,
} from '@/lib/crm-quote';
import QuoteDocument from '@/components/QuoteDocument';

type EditorQuote = {
  id: string; locale: 'he' | 'en'; token: string; deal_id: string | null;
  subject: string; items: QuoteLine[]; notes: string; valid_until: string | null;
};
type EditorContact = { id: string; full_name: string; phone: string | null; status: string; company: string | null };

type Sent = {
  number: string; link: string; waUrl: string | null; moved: boolean; previous: string | null;
  activityId: string | null; partial: boolean; copied: boolean | null;
};

type Errors = {
  subject?: string; notes?: string; lines?: string;
  line: Record<number, Partial<Record<'description' | 'quantity' | 'unit_price', string>>>;
};
const NO_ERRORS: Errors = { line: {} };

const input = 'bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand min-h-[44px]';
const UNDO_MS = 8_000;

const toInput = (l: QuoteLine): QuoteLineInput => ({
  description: l.description, quantity: String(l.quantity), unit_price: String(l.unit_price),
});

/**
 * A draft quote beside the document it becomes, and the send bar. Sending saves
 * what is on screen, numbers and freezes it on the server, moves the lead and the
 * deal, and opens WhatsApp or copies the link. The WhatsApp window is opened on the
 * click itself, before anything is awaited, because browsers block one opened after.
 * See DESIGN.md — Quote editor, and §9 — Sending that opens another app.
 */
export default function CrmQuoteEditor({
  locale, quote, contact, deals, business, readOnly = false, t,
}: {
  locale: string;
  quote: EditorQuote;
  contact: EditorContact;
  deals: { id: string; title: string; value: number }[];
  business: Business;
  readOnly?: boolean;
  t: Dict['crm'];
}) {
  const [subject, setSubject] = useState(quote.subject);
  const [lines, setLines] = useState<QuoteLineInput[]>(quote.items.length ? quote.items.map(toInput) : [BLANK_LINE]);
  const [notes, setNotes] = useState(quote.notes);
  const [validUntil, setValidUntil] = useState(quote.valid_until ?? '');
  const [dealId, setDealId] = useState(quote.deal_id ?? '');
  const [errors, setErrors] = useState<Errors>(NO_ERRORS);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [sent, setSent] = useState<Sent | null>(null);
  const [undoable, setUndoable] = useState(false);
  const [undone, setUndone] = useState(false);
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [isPending, startTransition] = useTransition();
  // isPending flips a render late, so a double press could slip two sends through.
  const inFlight = useRef(false);
  const undoTimer = useRef<number | null>(null);

  useEffect(() => () => { if (undoTimer.current) window.clearTimeout(undoTimer.current); }, []);

  const vatRate = business.vat_exempt ? 0 : VAT_RATE;
  const liveLines = useMemo(() => parseLinesLoose(lines), [lines]);
  const totals = useMemo(() => quoteTotals(liveLines, vatRate), [liveLines, vatRate]);
  const firstName = contact.full_name.trim().split(/\s+/)[0] ?? contact.full_name;
  const canWhatsApp = whatsAppLink(contact.phone) !== null;
  const hasBusiness = business.name.trim() !== '';
  const willMove = isContactStatus(contact.status) && SEND_MOVES_FROM.includes(contact.status);
  const sendReady = hasBusiness && subject.trim() !== '' && liveLines.length > 0;

  const preview: QuoteView = {
    number: null,
    date: todayInIsrael(),
    locale: quote.locale,
    subject: subject.trim(),
    lines: liveLines,
    vat_rate: vatRate,
    ...totals,
    valid_until: validUntil || null,
    notes: notes.trim() || null,
    business: {
      name: business.name, company_number: business.company_number, address: business.address, phone: business.phone,
      email: business.email, website: business.website, vat_exempt: business.vat_exempt, logo_url: business.logo_url,
    },
    client: { name: contact.full_name, company: contact.company },
  };

  function showProblems(problems: QuoteProblem[]) {
    const next: Errors = { line: {} };
    for (const p of problems) {
      const text = quoteProblemText(p, t, locale);
      if (p.field === 'line') next.line[p.index] = { ...next.line[p.index], [p.part]: text };
      else next[p.field] = text;
    }
    setErrors(next);
  }

  const payload = () => ({
    locale, id: quote.id, subject, lines, notes, valid_until: validUntil || null, deal_id: dealId || null,
  });

  function save() {
    if (inFlight.current) return;
    const checked = validateQuote({ subject, lines, notes }, 'draft');
    if (!checked.ok) { showProblems(checked.problems); setMsg(null); return; }
    inFlight.current = true;
    setErrors(NO_ERRORS);
    setMsg(null);
    startTransition(async () => {
      const res = await withTimeout(crmSaveQuote(payload()));
      inFlight.current = false;
      if (res && 'ok' in res && res.ok) { setMsg({ kind: 'ok', text: t.quoteSaved }); return; }
      if (res && 'problem' in res && res.problem) { showProblems([res.problem as QuoteProblem]); return; }
      setMsg({ kind: 'err', text: res && 'error' in res && res.error === 'timeout' ? t.saveTimeout : failureText(res, t.quoteSaveFailed, t) });
    });
  }

  function send(via: 'whatsapp' | 'link') {
    if (inFlight.current || !sendReady) return;
    const checked = validateQuote({ subject, lines, notes }, 'send');
    if (!checked.ok) { showProblems(checked.problems); setMsg(null); return; }
    // Opened now, on the click; pointed at WhatsApp once the send is stored.
    const win = via === 'whatsapp' ? window.open('', '_blank') : null;
    inFlight.current = true;
    setErrors(NO_ERRORS);
    setMsg(null);
    startTransition(async () => {
      const res = await withTimeout(crmSendQuote({ ...payload(), via }));
      inFlight.current = false;
      if (!res || !('ok' in res) || !res.ok) {
        win?.close();
        if (res && 'problem' in res && res.problem) { showProblems([res.problem as QuoteProblem]); return; }
        setMsg({ kind: 'err', text: res && 'error' in res && res.error === 'timeout' ? t.quoteSendFailed : failureText(res, t.quoteSendFailed, t) });
        return;
      }
      if (win && res.waUrl) win.location.href = res.waUrl;
      let copied: boolean | null = null;
      if (via === 'link') {
        try { await navigator.clipboard.writeText(res.link); copied = true; } catch { copied = false; }
      }
      setSent({
        number: res.number, link: res.link, waUrl: res.waUrl, moved: res.moved, previous: res.previous,
        activityId: res.activityId, partial: res.partial, copied,
      });
      if (res.moved && res.previous) {
        setUndoable(true);
        undoTimer.current = window.setTimeout(() => setUndoable(false), UNDO_MS);
      }
    });
  }

  function undo() {
    if (!sent?.previous) return;
    setUndoable(false);
    if (undoTimer.current) window.clearTimeout(undoTimer.current);
    startTransition(async () => {
      const res = await withTimeout(crmUndoStatus({
        locale, contact_id: contact.id, activity_id: sent.activityId, previous: sent.previous as string,
      }));
      if (res && 'ok' in res && res.ok) setUndone(true);
      else setMsg({ kind: 'err', text: failureText(res, t.undoFailed.replace('{status}', t.cs_proposal), t) });
    });
  }

  const back = (
    <Link href={`/${locale}/dashboard/crm?c=${contact.id}`} scroll={false} className="text-brand-ink text-[14px] font-semibold">
      ← {t.quoteBack.replace('{name}', contact.full_name)}
    </Link>
  );

  // ---- after a send: the form gives way to what happened and where to go next ----
  if (sent) {
    const page = `/${quote.locale}/q/${quote.token}`;
    return (
      <div className="max-w-[760px] mx-auto px-5 md:px-10 pt-8 pb-16">
        {back}
        <div className="bg-surface border border-border rounded-2xl p-5 mt-4 flex flex-col gap-3" role="status" aria-live="polite">
          <p className="font-bold text-[16px]">{t.quoteSentLine.replace('{number}', sent.number)}</p>
          {sent.moved && !undone && (
            <p className="text-[14px] text-ink-secondary flex flex-wrap items-center gap-x-3">
              {t.quoteStatusMoved}
              {undoable && (
                <button type="button" onClick={undo} className="font-semibold text-ink hover:underline min-h-[44px] px-2">{t.undo}</button>
              )}
            </p>
          )}
          {sent.partial && <p role="alert" className="text-danger text-[13px]">{t.quoteSentPartial}</p>}
          {sent.copied === true && <p className="text-[14px] text-ink-secondary">{t.quoteLinkCopied}</p>}
          {sent.copied === false && (
            <label className="block text-[13px] text-ink-secondary">
              {t.quoteCopyManual}
              <input readOnly value={sent.link} dir="ltr" onFocus={(e) => e.currentTarget.select()} className={`mt-1 w-full ${input}`} />
            </label>
          )}
          <div className="flex flex-wrap gap-2">
            {sent.waUrl && (
              <a href={sent.waUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-border hover:border-brand text-ink-secondary hover:text-ink font-semibold px-4 rounded-[10px] text-[14px] min-h-[44px] transition-colors">
                <MessageCircle size={16} aria-hidden="true" />{t.quoteOpenWa}
              </a>
            )}
            <a href={page} target="_blank" rel="noopener noreferrer" className="inline-flex items-center border border-border hover:border-brand text-ink-secondary hover:text-ink font-semibold px-4 rounded-[10px] text-[14px] min-h-[44px] transition-colors">
              {t.quoteViewPage}
            </a>
          </div>
        </div>
      </div>
    );
  }

  const lineError = (i: number) => {
    const e = errors.line[i];
    if (!e) return null;
    return (
      <p role="alert" className="basis-full text-danger text-[13px]">
        {[e.description, e.quantity, e.unit_price].filter(Boolean).join(' ')}
      </p>
    );
  };

  const form = (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="quote-subject" className="block text-[12px] text-ink-muted">{t.quoteSubject}</label>
        <input
          id="quote-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={t.quoteSubjectPlaceholder}
          dir="auto"
          className={`mt-1 w-full ${input}`}
          aria-invalid={errors.subject ? true : undefined}
        />
        {errors.subject && <p role="alert" className="text-danger text-[13px] mt-1">{errors.subject}</p>}
      </div>

      <div>
        <label htmlFor="quote-deal" className="block text-[12px] text-ink-muted">{t.quoteDeal}</label>
        <select id="quote-deal" value={dealId} onChange={(e) => setDealId(e.target.value)} className={`mt-1 w-full ${input}`}>
          {deals.map((d) => (
            <option key={d.id} value={d.id}>{d.title} · {formatMoney(Number(d.value) || 0, locale)}</option>
          ))}
          <option value="">{t.quoteDealNew}</option>
        </select>
      </div>

      <div>
        <div className="hidden sm:flex gap-2 text-[12px] text-ink-muted pb-1">
          <span className="flex-1">{t.quoteLineDescription}</span>
          <span className="w-20">{t.quoteLineQty}</span>
          <span className="w-28">{t.quoteLinePrice}</span>
          <span className="w-24 text-end">{t.quoteLineTotal}</span>
          <span className="w-[44px]" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-3">
          {lines.map((l, i) => {
            const parsed = parseLinesLoose([l])[0];
            return (
              <div key={i} className="flex flex-wrap items-start gap-2 border-b border-border pb-3">
                <input
                  value={l.description}
                  onChange={(e) => setLines(lines.map((x, k) => (k === i ? { ...x, description: e.target.value } : x)))}
                  placeholder={t.quoteLineDescription}
                  aria-label={`${t.quoteLineDescription} ${i + 1}`}
                  dir="auto"
                  className={`flex-1 min-w-[200px] ${input}`}
                />
                <input
                  value={l.quantity}
                  onChange={(e) => setLines(lines.map((x, k) => (k === i ? { ...x, quantity: e.target.value } : x)))}
                  aria-label={`${t.quoteLineQty} ${i + 1}`}
                  dir="ltr"
                  inputMode="decimal"
                  className={`w-20 ${input}`}
                />
                <input
                  value={l.unit_price}
                  onChange={(e) => setLines(lines.map((x, k) => (k === i ? { ...x, unit_price: e.target.value } : x)))}
                  aria-label={`${t.quoteLinePrice} ${i + 1}`}
                  placeholder="₪"
                  dir="ltr"
                  inputMode="decimal"
                  className={`w-28 ${input}`}
                />
                <span className="w-24 text-end text-[13px] min-h-[44px] flex items-center justify-end">
                  {parsed ? <span dir="ltr" className="font-mono">{formatMoney(lineTotal(parsed), locale)}</span> : <span className="text-ink-muted">—</span>}
                </span>
                <button
                  type="button"
                  onClick={() => setLines(lines.length > 1 ? lines.filter((_, k) => k !== i) : [BLANK_LINE])}
                  aria-label={`${t.quoteLineRemove} ${i + 1}`}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-ink-muted hover:text-ink"
                >
                  <X size={16} aria-hidden="true" />
                </button>
                {lineError(i)}
              </div>
            );
          })}
        </div>
        {lines.length < QUOTE_LIMITS.lines ? (
          <button
            type="button"
            onClick={() => setLines([...lines, BLANK_LINE])}
            className="mt-3 border border-brand/40 bg-brand/5 hover:bg-brand/10 text-brand-ink font-semibold px-3 rounded-[10px] text-[13px] min-h-[44px]"
          >
            {t.quoteLineAdd}
          </button>
        ) : (
          <p className="mt-3 text-[13px] text-ink-muted">{t.quoteLinesMax}</p>
        )}
        {errors.lines && <p role="alert" className="text-danger text-[13px] mt-1">{errors.lines}</p>}
      </div>

      <dl className="ms-auto w-full sm:w-72 text-[14px] flex flex-col gap-1">
        <div className="flex justify-between gap-4"><dt>{t.quoteSubtotal}</dt><dd dir="ltr" className="font-mono">{formatMoney(totals.subtotal, locale)}</dd></div>
        {vatRate > 0 ? (
          <div className="flex justify-between gap-4">
            <dt>{t.quoteVat.replace('{rate}', String(Math.round(vatRate * 100)))}</dt>
            <dd dir="ltr" className="font-mono">{formatMoney(totals.vat, locale)}</dd>
          </div>
        ) : (
          <div className="flex justify-between gap-4"><dt>{t.quoteVatExempt}</dt><dd /></div>
        )}
        <div className="flex justify-between gap-4 font-bold border-t border-border pt-2 mt-1">
          <dt>{t.quoteTotal}</dt><dd dir="ltr" className="font-mono">{formatMoney(totals.total, locale)}</dd>
        </div>
      </dl>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="quote-valid" className="block text-[12px] text-ink-muted">{t.quoteValidUntil}</label>
          <input id="quote-valid" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} dir="ltr" className={`mt-1 w-full ${input}`} />
        </div>
      </div>
      <div>
        <label htmlFor="quote-notes" className="block text-[12px] text-ink-muted">{t.quoteNotes}</label>
        <textarea id="quote-notes" value={notes} onChange={(e) => setNotes(e.target.value)} dir="auto" rows={3} className={`mt-1 w-full ${input} resize-y`} />
        {errors.notes && <p role="alert" className="text-danger text-[13px] mt-1">{errors.notes}</p>}
      </div>

      {/* The send bar: what it will do is said before it does it. */}
      <div className="flex flex-col gap-2 border-t border-border pt-4">
        {!hasBusiness && (
          <p className="text-[13px] text-ink-secondary">
            {t.quoteNeedsBusiness}{' '}
            <Link href={`/${locale}/dashboard/crm/business`} className="text-brand-ink font-semibold hover:underline">{t.quoteNeedsBusinessLink}</Link>
          </p>
        )}
        {hasBusiness && !canWhatsApp && <p className="text-[13px] text-ink-secondary">{t.quoteNoPhone}</p>}
        <div className="flex flex-wrap items-center gap-2">
          {canWhatsApp && (
            <button
              type="button"
              onClick={() => send('whatsapp')}
              disabled={!sendReady || isPending}
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover disabled:opacity-50 text-on-brand font-bold px-4 rounded-[10px] text-[14px] min-h-[44px]"
            >
              <MessageCircle size={16} aria-hidden="true" />{t.quoteSendWa}
            </button>
          )}
          <button
            type="button"
            onClick={() => send('link')}
            disabled={!sendReady || isPending}
            className="inline-flex items-center gap-2 border border-border hover:border-brand text-ink-secondary hover:text-ink font-semibold px-4 rounded-[10px] text-[14px] min-h-[44px] transition-colors disabled:opacity-50"
          >
            <Link2 size={16} aria-hidden="true" />{t.quoteSendLink}
          </button>
          <button type="button" onClick={save} disabled={isPending} className="text-ink-secondary hover:text-ink px-3 text-[14px] min-h-[44px] disabled:opacity-50">
            {t.quoteSaveDraft}
          </button>
        </div>
        {willMove && hasBusiness && <p className="text-[12px] text-ink-muted">{t.quoteSendMoves.replace('{name}', firstName)}</p>}
        {msg && (
          <p role={msg.kind === 'err' ? 'alert' : 'status'} aria-live="polite" className={`text-[13px] ${msg.kind === 'err' ? 'text-danger' : 'text-ink-secondary'}`}>
            {msg.text}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-[1100px] mx-auto px-5 md:px-10 pt-8 pb-16">
      {back}
      <h1 className="font-display text-[clamp(24px,4vw,32px)] font-extrabold tracking-tight mt-2">{t.quoteEditorTitle}</h1>
      {readOnly && <p role="status" className="text-ink-secondary text-[13px] bg-surface border border-border rounded-xl px-4 py-3 mt-4">{t.readonlyNotice}</p>}

      {/* Below lg the preview is one tap away; from lg it sits beside the form. */}
      <div role="group" className="lg:hidden flex gap-2 mt-4">
        {(['edit', 'preview'] as const).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={tab === k}
            onClick={() => setTab(k)}
            className={`text-[13px] rounded-full px-3 min-h-[44px] border transition-colors ${tab === k ? 'border-brand text-brand-ink bg-brand/10' : 'border-border text-ink-secondary hover:text-ink'}`}
          >
            {k === 'edit' ? t.quoteEditTab : t.quotePreviewTab}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 mt-4">
        {!readOnly && <div className={tab === 'preview' ? 'hidden lg:block' : ''}>{form}</div>}
        <div className={!readOnly && tab === 'edit' ? 'hidden lg:block' : ''}>
          <div className="lg:sticky lg:top-20"><QuoteDocument quote={preview} /></div>
        </div>
      </div>
    </div>
  );
}
