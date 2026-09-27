'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Mail, X } from 'lucide-react';
import type { Dict } from '@/lib/i18n/he';
import { formatDate, dirOf } from '@/lib/i18n';
import { Drawer } from '@/lib/motion/Drawer';
import { Dialog } from '@/lib/motion/Dialog';
import { CONTACT_STATUSES, STATUS_BADGE, isContactStatus, type ContactStatus } from '@/lib/crm-status';
import { whatsAppLink } from '@/lib/phone-il';
import { crmUpdateContact, crmLogWhatsApp, crmSendEmail } from '@/app/crm-actions';
import BidiParts from '@/components/BidiParts';

export type DrawerDeal = { id: string; title: string; value: number; stage: string; status: string };
export type DrawerActivity = { id: string; type: string; body: string; created_at: string };
export type DrawerContact = {
  id: string;
  full_name: string;
  role_title: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  status: string;
  score: number;
  deals: DrawerDeal[];
  activities: DrawerActivity[];
};

/**
 * A contact opens beside the list instead of replacing it. Identity lives in the URL
 * as ?c=<id>, so back closes it and the address is shareable; the contents are
 * rendered by the server, so there is no second place where workspace scoping has to
 * be got right. See DESIGN.md — CRM contact drawer.
 */
export default function CrmContactDrawer({
  locale,
  contact,
  readOnly = false,
  t,
}: {
  locale: string;
  contact: DrawerContact | null;
  /** viewer role: status, WhatsApp and email controls are omitted, not disabled. */
  readOnly?: boolean;
  t: Dict['crm'];
}) {
  const router = useRouter();
  // Held so the panel still has content while it springs out after `contact` clears.
  const [last, setLast] = useState<DrawerContact | null>(contact);
  // Which contact the form belongs to. Every revalidation hands us a NEW contact
  // object for the SAME person (logging a WhatsApp touch triggers one), and resetting
  // on object identity would wipe a half-typed email out from under the user.
  const lastId = useRef<string | null>(contact?.id ?? null);
  const [st, setSt] = useState<ContactStatus>('new');
  const [statusErr, setStatusErr] = useState<string | null>(null);
  const [waText, setWaText] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [mailMsg, setMailMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [askDiscard, setAskDiscard] = useState(false);
  const [isPending, startTransition] = useTransition();
  // isPending flips a render late, so a double press can slip two sends through.
  const inFlight = useRef(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const open = contact !== null;
  const c = contact ?? last;

  useEffect(() => {
    if (!contact) return;
    setLast(contact);
    if (lastId.current === contact.id) return;   // same person, fresher data
    lastId.current = contact.id;
    setSt(isContactStatus(contact.status) ? contact.status : 'new');
    setStatusErr(null);
    setMailMsg(null);
    setWaText('');
    setSubject('');
    setBody('');
    setAskDiscard(false);
  }, [contact]);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  const dirty = subject.trim() !== '' || body.trim() !== '';

  function reallyClose() {
    const id = c?.id;
    setAskDiscard(false);
    // replace, not push: closing should not leave an entry that reopens the drawer
    // when the user presses back.
    router.replace(`/${locale}/dashboard/crm`, { scroll: false });
    // Focus goes back to the row that opened the drawer, once it is interactive again.
    if (id) {
      requestAnimationFrame(() => {
        const row = document.querySelector<HTMLElement>(`[data-contact-row="${id}"]`);
        row?.focus();
      });
    }
  }

  // Escape, the scrim and the close control all land here.
  function attemptClose() {
    if (dirty) setAskDiscard(true);
    else reallyClose();
  }

  function changeStatus(next: ContactStatus) {
    if (!c) return;
    const prev = st;
    setSt(next);            // full opacity, immediately — the save is not the user's problem
    setStatusErr(null);
    startTransition(async () => {
      const res = await crmUpdateContact({ locale, id: c.id, status: next });
      if (res && 'error' in res && res.error) {
        setSt(prev);        // never show a status that is not stored
        setStatusErr(res.error === 'auth' ? t.sessionExpired : ('message' in res && res.message) || t.statusFailed);
      }
    });
  }

  function onWhatsApp() {
    if (!c) return;
    startTransition(() => { void crmLogWhatsApp({ locale, contact_id: c.id }); });
  }

  function sendEmail() {
    if (!c || inFlight.current) return;
    if (!subject.trim()) { setMailMsg({ kind: 'err', text: t.errSubjectRequired }); return; }
    if (!body.trim()) { setMailMsg({ kind: 'err', text: t.errBodyRequired }); return; }
    setMailMsg(null);
    inFlight.current = true;
    startTransition(async () => {
      try {
        const res = await crmSendEmail({ locale, contact_id: c.id, subject, body });
        if (res && 'ok' in res && res.ok) {
          setSubject('');
          setBody('');
          setMailMsg({ kind: 'ok', text: t.emailSent });
          return;
        }
        if (res && 'message' in res && res.message) { setMailMsg({ kind: 'err', text: res.message }); return; }
        const code = res && 'error' in res && res.error ? res.error : 'failed';
        const resetAt = res && 'resetAt' in res ? (res.resetAt as string) : null;
        setMailMsg({ kind: 'err', text: mailError(code, resetAt) });
      } catch {
        setMailMsg({ kind: 'err', text: t.errEmailSendFailed });
      } finally {
        inFlight.current = false;
      }
    });
  }

  // The cap resets within the hour, so this needs a clock time. formatDate renders
  // day/month/year, which would tell the user nothing useful here.
  const timeOf = (iso: string) =>
    new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'he-IL', { hour: '2-digit', minute: '2-digit' })
      .format(new Date(iso));

  function mailError(code: string, resetAt: string | null): string {
    if (code === 'auth') return t.sessionExpired;
    if (code === 'subject') return t.errSubjectRequired;
    if (code === 'body') return t.errBodyRequired;
    if (code === 'noemail') return t.noEmail;
    if (code === 'unavailable') return t.emailUnavailable;
    if (code === 'rate') {
      const when = resetAt ? timeOf(resetAt) : '';
      return t.emailRateLimited.replace('{time}', when);
    }
    return t.errEmailSendFailed;
  }

  const label = (s: ContactStatus) => t[`cs_${s}` as keyof Dict['crm']] as string;
  const wa = c ? whatsAppLink(c.phone, waText) : null;

  return (
    <>
      <Drawer open={open} onClose={attemptClose} side="start" dir={dirOf(locale)} width={420}>
        {c && (
          <div className="h-full flex flex-col text-ink">
            {/* header */}
            <div className="flex items-start gap-3 shrink-0">
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-[22px] font-extrabold tracking-tight truncate" dir="auto">{c.full_name}</h2>
                <p className="text-ink-secondary text-[14px] truncate">
                  <BidiParts parts={[c.role_title, c.company]} />
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={attemptClose}
                aria-label={t.drawerClose}
                className="text-ink-muted hover:text-ink min-w-[44px] min-h-[44px] flex items-center justify-center -me-2 -mt-2"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto mt-4" style={{ overscrollBehavior: 'contain' }}>
              {/* status */}
              <div className="mb-5">
                <span className="text-[12px] text-ink-muted">{t.statusLabel}</span>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_BADGE[st]}`}>
                    {label(st)}
                  </span>
                  {!readOnly && <select
                    value={st}
                    onChange={(e) => { if (isContactStatus(e.target.value)) changeStatus(e.target.value); }}
                    aria-label={t.statusLabel}
                    className="bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand min-h-[44px]"
                  >
                    {CONTACT_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                  </select>}
                  <span className="font-mono text-[13px] text-ink-secondary bg-white/5 rounded-lg px-2 py-1">{c.score}</span>
                </div>
                {statusErr && <p role="alert" aria-live="polite" className="text-red-400 text-[13px] mt-2">{statusErr}</p>}
              </div>

              {/* reach */}
              <div className="flex flex-col gap-1 mb-5 text-[13px]">
                {c.email && <a href={`mailto:${c.email}`} className="text-brand truncate" dir="ltr">{c.email}</a>}
                {c.phone && <a href={`tel:${c.phone}`} className="text-ink-secondary" dir="ltr">{c.phone}</a>}
                {c.linkedin_url && <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-brand">LinkedIn ↗</a>}
              </div>

              {/* whatsapp + email write to the timeline, so a viewer gets neither */}
              {!readOnly && <>
              {/* whatsapp */}
              <div className="mb-5">
                {wa ? (
                  <>
                    <input
                      value={waText}
                      onChange={(e) => setWaText(e.target.value)}
                      placeholder={t.waMessage}
                      dir="auto"
                      className="w-full bg-bg border border-border rounded-[10px] px-3 py-2.5 text-[14px] outline-none focus:border-brand"
                    />
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onWhatsApp}
                      className="mt-2 inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-bg font-semibold px-4 py-2.5 rounded-[10px] min-h-[44px]"
                    >
                      <MessageCircle size={15} aria-hidden="true" />
                      {t.waAction}
                    </a>
                  </>
                ) : (
                  <p className="text-ink-muted text-[13px]">{c.phone ? t.phoneUnusable : t.noPhone}</p>
                )}
              </div>

              {/* email */}
              <div className="mb-6 border-t border-border pt-5">
                {c.email ? (
                  <>
                    <span className="text-[12px] text-ink-muted flex items-center gap-1.5">
                      <Mail size={13} aria-hidden="true" />{t.emailAction}
                    </span>
                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={t.emailSubject}
                      dir="auto"
                      className="w-full mt-1 bg-bg border border-border rounded-[10px] px-3 py-2.5 text-[14px] outline-none focus:border-brand"
                    />
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder={t.emailBody}
                      dir="auto"
                      rows={4}
                      className="w-full mt-2 bg-bg border border-border rounded-[10px] px-3 py-2.5 text-[14px] outline-none focus:border-brand resize-y"
                    />
                    <button
                      type="button"
                      onClick={sendEmail}
                      disabled={isPending}
                      className="mt-2 bg-brand hover:bg-brand-hover disabled:opacity-50 text-bg font-semibold px-4 py-2.5 rounded-[10px] min-h-[44px]"
                    >
                      {t.emailSend}
                    </button>
                    {mailMsg && (
                      <p
                        role="alert"
                        aria-live="polite"
                        className={`text-[13px] mt-2 ${mailMsg.kind === 'ok' ? 'text-brand' : 'text-red-400'}`}
                      >
                        {mailMsg.text}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-ink-muted text-[13px]">{t.noEmail}</p>
                )}
              </div>
              </>}

              {/* deals — omitted entirely when there are none */}
              {c.deals.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-[14px] mb-2">{t.relatedDeals}</h3>
                  <div className="flex flex-col gap-2">
                    {c.deals.map((d) => (
                      <div key={d.id} className="flex items-center justify-between gap-2 bg-bg border border-border rounded-xl p-2.5">
                        <span className="text-[13px] font-semibold truncate" dir="auto">{d.title}</span>
                        <span className="flex items-center gap-2 text-[12px] shrink-0">
                          {d.value > 0 && <span className="text-brand font-mono">₪{d.value.toLocaleString()}</span>}
                          <span className="text-ink-muted border border-border rounded-full px-2 py-0.5">
                            {(t[`st_${d.stage}` as keyof Dict['crm']] as string) ?? d.stage}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* timeline */}
              <div>
                <h3 className="font-bold text-[14px] mb-2">{t.timeline}</h3>
                {c.activities.length === 0 ? (
                  <p className="text-ink-muted text-[13px]">{t.noActivity}</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {c.activities.map((a) => (
                      <div key={a.id} className="flex gap-2">
                        <span className="text-[10px] font-bold uppercase text-ink-muted w-14 shrink-0 pt-0.5">
                          {(t[`at_${a.type}` as keyof Dict['crm']] as string) ?? a.type}
                        </span>
                        <div className="min-w-0 flex-1 border-s border-border ps-2">
                          <p className="text-[13px] whitespace-pre-line" dir="auto">{a.body}</p>
                          <span className="text-[11px] text-ink-muted">{formatDate(a.created_at, locale)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <Dialog open={askDiscard} onClose={() => setAskDiscard(false)}>
        <div className="text-ink">
          <p className="font-bold text-[16px] mb-4">{t.draftDiscardAsk}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { setSubject(''); setBody(''); reallyClose(); }}
              className="bg-brand hover:bg-brand-hover text-bg font-semibold px-5 py-2.5 rounded-[10px] min-h-[44px]"
            >
              {t.discardYes}
            </button>
            <button
              type="button"
              onClick={() => setAskDiscard(false)}
              className="border border-border text-ink-secondary hover:text-ink px-5 py-2.5 rounded-[10px] min-h-[44px]"
            >
              {t.discardNo}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
