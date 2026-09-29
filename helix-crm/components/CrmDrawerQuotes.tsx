'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Dict } from '@/lib/i18n/he';
import { Dialog } from '@/lib/motion/Dialog';
import { crmCreateQuote, crmDuplicateQuote, crmCancelQuote } from '@/app/crm-actions';
import { withTimeout, failureText } from '@/lib/use-status-change';
import { formatMoney } from '@/lib/crm-quote';

/**
 * A quote as the drawer lists it. The dates are day/month, formatted on the server
 * in Israel; `openedOn` is the latest open, so a second look shows as a new day.
 */
export type DrawerQuote = {
  id: string;
  number: string | null;
  status: 'draft' | 'sent' | 'cancelled';
  subject: string;
  total: number;
  sentOn: string | null;
  openedOn: string | null;
  token: string;
  locale: 'he' | 'en';
};

const secondary = 'inline-flex items-center border border-border hover:border-brand text-ink-secondary hover:text-ink font-semibold px-3 rounded-[10px] text-[13px] min-h-[44px] transition-colors disabled:opacity-50';
const input = 'bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand min-h-[44px]';

/**
 * The person's price quotes, after the deals, newest first. A writer always gets
 * "+ הצעת מחיר"; a viewer gets the list with "פתיחה" only, and nothing when there
 * are none. A sent quote opens its page and has no editor; cancelling asks first,
 * by number. See DESIGN.md — Drawer quotes.
 */
export default function CrmDrawerQuotes({
  locale,
  contactId,
  quotes,
  readOnly = false,
  onOverlayChange,
  t,
}: {
  locale: string;
  contactId: string;
  quotes: DrawerQuote[];
  readOnly?: boolean;
  /** The drawer ignores Escape while the cancel question is open. */
  onOverlayChange?: (open: boolean) => void;
  t: Dict['crm'];
}) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [cancelQ, setCancelQ] = useState<DrawerQuote | null>(null);
  // `manual` holds the link itself, for when the clipboard is refused.
  const [msg, setMsg] = useState<{ at: string | null; kind: 'ok' | 'err' | 'manual'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const inFlight = useRef(false);

  useEffect(() => { setOpenId(null); setCancelQ(null); setMsg(null); }, [contactId]);
  useEffect(() => { onOverlayChange?.(cancelQ !== null); }, [cancelQ, onOverlayChange]);

  if (readOnly && quotes.length === 0) return null;

  const pageHref = (q: DrawerQuote) => `/${q.locale}/q/${q.token}`;
  const state = (q: DrawerQuote) =>
    q.status === 'draft' ? t.quoteDraft
      : q.status === 'cancelled' ? t.quoteCancelledState
        : q.openedOn ? t.quoteOpenedOn.replace('{date}', q.openedOn)
          : t.quoteSentOn.replace('{date}', q.sentOn ?? '');

  // Create and duplicate both land in the editor with the new draft.
  function toEditor(run: () => Promise<unknown>, at: string | null) {
    if (inFlight.current) return;
    inFlight.current = true;
    setMsg(null);
    startTransition(async () => {
      const res = (await withTimeout(run())) as { ok?: boolean; id?: string; error?: string; message?: string } | null;
      inFlight.current = false;
      if (res && res.ok && res.id) { router.push(`/${locale}/dashboard/crm/quotes/${res.id}`); return; }
      setMsg({ at, kind: 'err', text: failureText(res, t.quoteCreateFailed, t) });
    });
  }

  async function copy(q: DrawerQuote) {
    const link = `${window.location.origin}${pageHref(q)}`;
    try {
      await navigator.clipboard.writeText(link);
      setMsg({ at: q.id, kind: 'ok', text: t.quoteLinkCopied });
    } catch {
      // The clipboard was refused: show the link so it can be copied by hand.
      setMsg({ at: q.id, kind: 'manual', text: link });
    }
  }

  function cancel(q: DrawerQuote) {
    setCancelQ(null);
    startTransition(async () => {
      const res = await withTimeout(crmCancelQuote({ locale, id: q.id }));
      if (!res || !('ok' in res) || !res.ok) setMsg({ at: q.id, kind: 'err', text: failureText(res, t.quoteCancelFailed, t) });
    });
  }

  return (
    <section aria-label={t.quotesTitle} className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <h3 className="font-bold text-[14px]">{t.quotesTitle}</h3>
        {!readOnly && (
          <button
            type="button"
            onClick={() => toEditor(() => crmCreateQuote({ locale, contact_id: contactId }), null)}
            disabled={isPending}
            className="border border-brand/40 bg-brand/5 hover:bg-brand/10 text-brand-ink font-semibold px-3 rounded-[10px] text-[13px] min-h-[44px] disabled:opacity-50"
          >
            {t.quoteNew}
          </button>
        )}
      </div>

      {quotes.length > 0 && (
        <div className="flex flex-col gap-2">
          {quotes.map((q) => {
            const open = openId === q.id;
            return (
              <div key={q.id}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : q.id)}
                  className={`w-full flex items-center gap-2 bg-bg border p-2.5 min-h-[44px] text-start transition-colors ${
                    open ? 'border-brand rounded-t-xl' : 'border-border rounded-xl hover:border-brand'
                  }`}
                >
                  <span className={`text-[13px] shrink-0 ${q.number ? 'font-mono' : 'text-ink-muted'}`}>
                    {q.number ? <span dir="ltr">{q.number}</span> : t.quoteDraft}
                  </span>
                  <span className="text-[13px] truncate flex-1 min-w-0" dir="auto">{q.subject}</span>
                  <span dir="ltr" className="font-mono text-[12px] text-ink-secondary shrink-0">{formatMoney(q.total, locale)}</span>
                  {q.status !== 'draft' && <span className="text-[12px] text-ink-muted shrink-0 whitespace-nowrap">{state(q)}</span>}
                </button>
                {open && (
                  <div className="bg-bg border border-t-0 border-brand rounded-b-xl p-3 flex flex-wrap gap-2">
                    {/* A viewer's editor is the preview alone. */}
                    {q.status === 'draft' ? (
                      <Link href={`/${locale}/dashboard/crm/quotes/${q.id}`} className={secondary}>{t.quoteOpen}</Link>
                    ) : (
                      <a href={pageHref(q)} target="_blank" rel="noopener noreferrer" className={secondary}>{t.quoteOpen}</a>
                    )}
                    {!readOnly && q.status === 'sent' && (
                      <button type="button" onClick={() => copy(q)} className={secondary}>{t.quoteCopyLink}</button>
                    )}
                    {!readOnly && (
                      <button type="button" onClick={() => toEditor(() => crmDuplicateQuote({ locale, id: q.id }), q.id)} disabled={isPending} className={secondary}>
                        {t.quoteDuplicate}
                      </button>
                    )}
                    {!readOnly && q.status === 'sent' && (
                      <button type="button" onClick={() => setCancelQ(q)} className="ms-auto text-ink-muted hover:text-danger text-[13px] px-2 min-h-[44px]">
                        {t.quoteCancel}
                      </button>
                    )}
                  </div>
                )}
                {msg?.at === q.id && (msg.kind === 'manual' ? (
                  <label className="block text-[13px] text-ink-secondary mt-1">
                    {t.quoteCopyManual}
                    <input readOnly value={msg.text} dir="ltr" onFocus={(e) => e.currentTarget.select()} className={`mt-1 w-full ${input}`} />
                  </label>
                ) : (
                  <p role={msg.kind === 'err' ? 'alert' : 'status'} className={`text-[13px] mt-1 ${msg.kind === 'err' ? 'text-danger' : 'text-ink-secondary'}`}>
                    {msg.text}
                  </p>
                ))}
              </div>
            );
          })}
        </div>
      )}
      {msg?.at === null && <p role="alert" className="text-danger text-[13px] mt-1">{msg.text}</p>}

      {/* Cancel asks first, by number: it is the one thing that changes a sent quote. */}
      <Dialog open={cancelQ !== null} onClose={() => setCancelQ(null)} width={420}>
        {cancelQ && (
          <div className="text-ink">
            <p className="font-bold text-[16px] mb-4">{t.quoteCancelAsk.replace('{number}', cancelQ.number ?? '')}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => cancel(cancelQ)}
                className="bg-danger hover:bg-danger/90 text-on-danger font-semibold px-5 py-2.5 rounded-[10px] min-h-[44px]"
              >
                {t.quoteCancelYes}
              </button>
              <button
                type="button"
                onClick={() => setCancelQ(null)}
                className="border border-border text-ink-secondary hover:text-ink px-5 py-2.5 rounded-[10px] min-h-[44px]"
              >
                {t.promptDismiss}
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </section>
  );
}
