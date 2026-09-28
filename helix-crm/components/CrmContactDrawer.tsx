'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Mail, Phone, CalendarDays, StickyNote, X } from 'lucide-react';
import type { Dict } from '@/lib/i18n/he';
import { formatDate, dirOf, plural } from '@/lib/i18n';
import { Drawer } from '@/lib/motion/Drawer';
import { Dialog } from '@/lib/motion/Dialog';
import { STATUS_BADGE, type ContactStatus } from '@/lib/crm-status';
import { useStatusChange, withTimeout, failureText } from '@/lib/use-status-change';
import { whatsAppLink } from '@/lib/phone-il';
import { crmLogActivity, crmLogWhatsApp, crmSendEmail, crmMoveDeal } from '@/app/crm-actions';
import BidiParts from '@/components/BidiParts';
import CrmStatusPath from '@/components/CrmStatusPath';
import CrmStatusFeedback from '@/components/CrmStatusFeedback';
import CrmNextStep, { NO_STEP_DRAFT, type DrawerTask, type StepDraft } from '@/components/CrmNextStep';
import CrmDrawerDeals, { NO_DEAL_DRAFT, type DealDraft, type DrawerDeal } from '@/components/CrmDrawerDeals';

export type { DrawerDeal };
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
  /** Israeli calendar days in the current status; null when there is no honest count. */
  statusDays: number | null;
  /** Open tasks, next step first: the home row's order. */
  tasks: DrawerTask[];
  deals: DrawerDeal[];
  activities: DrawerActivity[];
};

// The drawer's reach-and-log boxes. Call, meeting and note are touches logged by
// hand; WhatsApp and email reach the person and log themselves.
type Box = 'whatsapp' | 'email' | 'call' | 'meeting' | 'note';
type LogType = 'call' | 'meeting' | 'note';
const isLogType = (b: Box): b is LogType => b === 'call' || b === 'meeting' || b === 'note';
const NO_LOGS: Record<LogType, string> = { call: '', meeting: '', note: '' };

// Where status and deals meet, the drawer asks and never moves either side by
// itself (DESIGN.md §16). One prompt at a time, in the header's feedback line.
type Prompt =
  | { kind: 'openDeal' }
  | { kind: 'markWon'; deal: DrawerDeal }
  | { kind: 'openDeals'; n: number }
  | { kind: 'moveSigned' }
  | null;

/** Already signed, paid or a client: a won deal has nothing to ask about the person. */
const PAST_SIGNED: readonly ContactStatus[] = ['signed', 'paid', 'client'];

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
  const [waText, setWaText] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [mailMsg, setMailMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  // One box open at a time; each keeps its own draft while another is open.
  const [openBox, setOpenBox] = useState<Box | null>(null);
  const [logText, setLogText] = useState<Record<LogType, string>>(NO_LOGS);
  const [logMsg, setLogMsg] = useState<string | null>(null);
  const logInFlight = useRef(false);
  // The next-step form's text lives here so closing can ask before discarding it.
  const [stepDraft, setStepDraft] = useState<StepDraft>(NO_STEP_DRAFT);
  const [stepDirty, setStepDirty] = useState(false);
  // The new-deal form: open or not, and its text.
  const [addingDeal, setAddingDeal] = useState(false);
  const [dealDraft, setDealDraft] = useState<DealDraft>(NO_DEAL_DRAFT);
  const [askDiscard, setAskDiscard] = useState(false);
  const [isPending, startTransition] = useTransition();
  // isPending flips a render late, so a double press can slip two sends through.
  const inFlight = useRef(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const open = contact !== null;
  const c = contact ?? last;

  // The one prompt the header's line may carry where status and deals meet.
  const [prompt, setPrompt] = useState<Prompt>(null);
  const [promptErr, setPromptErr] = useState<string | null>(null);
  // Accepting "move to חתם?" after a win: the deal just won may still read as open
  // until the page refreshes, and must not be offered as "mark as won?" again.
  const skipDealPrompt = useRef(false);

  // The status path's state: shown at once, reverted with a message when not
  // stored, undoable for 8 seconds, and the one question an exit asks. Shared with
  // the full contact page; the deal prompts are the drawer's own.
  const statusCtl = useStatusChange({
    locale, contactId: c?.id ?? null, contactName: c?.full_name ?? '', initial: c?.status ?? 'new', t,
    onChanged: ({ next }) => {
      if (skipDealPrompt.current) { skipDealPrompt.current = false; return; }
      const openDeals = (c?.deals ?? []).filter((d) => d.status === 'open');
      if (next === 'proposal' && openDeals.length === 0) setPrompt({ kind: 'openDeal' });
      else if (next === 'signed' && openDeals.length === 1) setPrompt({ kind: 'markWon', deal: openDeals[0] });
      else if (next === 'signed' && openDeals.length > 1) setPrompt({ kind: 'openDeals', n: openDeals.length });
    },
    onUndone: () => { setPrompt(null); setPromptErr(null); },
  });
  const st = statusCtl.status;
  const changeStatus = (next: ContactStatus) => { setPrompt(null); setPromptErr(null); statusCtl.change(next); };

  // A deal won in the drawer while the person is not yet past חתם.
  const onDealWon = () => {
    if (!PAST_SIGNED.includes(statusCtl.status)) { setPromptErr(null); setPrompt({ kind: 'moveSigned' }); }
  };

  function acceptPrompt() {
    if (!prompt) return;
    if (prompt.kind === 'openDeal') { setPrompt(null); setAddingDeal(true); return; }
    if (prompt.kind === 'moveSigned') { setPrompt(null); skipDealPrompt.current = true; statusCtl.change('signed'); return; }
    if (prompt.kind === 'markWon') {
      const id = prompt.deal.id;
      setPrompt(null);
      startTransition(async () => {
        const res = await withTimeout(crmMoveDeal(id, 'won', locale));
        if (!res || !('ok' in res) || !res.ok) setPromptErr(failureText(res, t.moveFailed, t));
      });
    }
  }

  // While the phone status list or the lost confirmation is open over the drawer,
  // Escape belongs to it: all of them listen on window, and each closes itself.
  const overlays = useRef({ list: false, lost: false });
  const onListOpenChange = useCallback((o: boolean) => { overlays.current.list = o; }, []);
  const onLostOpenChange = useCallback((o: boolean) => { overlays.current.lost = o; }, []);

  // Every way of closing ends the feedback line's offers, the back button included,
  // which never passes through reallyClose.
  const { clearFeedback } = statusCtl;
  useEffect(() => {
    if (open) return;
    clearFeedback();
    setPrompt(null);
    setPromptErr(null);
  }, [open, clearFeedback]);

  useEffect(() => {
    if (!contact) return;
    setLast(contact);
    if (lastId.current === contact.id) return;   // same person, fresher data
    lastId.current = contact.id;
    setMailMsg(null);
    setWaText('');
    setSubject('');
    setBody('');
    setOpenBox(null);
    setLogText(NO_LOGS);
    setLogMsg(null);
    setStepDraft(NO_STEP_DRAFT);
    setAddingDeal(false);
    setDealDraft(NO_DEAL_DRAFT);
    setPrompt(null);
    setPromptErr(null);
    setAskDiscard(false);
  }, [contact]);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  // Any box with unsent or unsaved text makes closing ask first.
  const dirty = stepDirty || [
    waText, subject, body, logText.call, logText.meeting, logText.note, dealDraft.title, dealDraft.value,
  ].some((v) => v.trim() !== '');

  function discardDrafts() {
    setWaText('');
    setSubject('');
    setBody('');
    setLogText(NO_LOGS);
    setStepDraft(NO_STEP_DRAFT);
    setDealDraft(NO_DEAL_DRAFT);
    setAddingDeal(false);
  }

  function reallyClose() {
    const id = c?.id;
    setAskDiscard(false);
    statusCtl.clearFeedback();   // an undo offer does not outlive the drawer
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
    if (overlays.current.list || overlays.current.lost) return;
    if (dirty) setAskDiscard(true);
    else reallyClose();
  }

  // A call, meeting or note: a touch, so it refreshes last touch and the score.
  function saveLog(type: LogType) {
    if (!c || logInFlight.current) return;
    const text = logText[type].trim();
    if (!text) return;
    logInFlight.current = true;
    setLogMsg(null);
    startTransition(async () => {
      const res = await withTimeout(crmLogActivity({ locale, contact_id: c.id, type, body: text }));
      logInFlight.current = false;
      if (res && 'ok' in res && res.ok) {
        setLogText((d) => ({ ...d, [type]: '' }));
        setOpenBox(null);
        return;
      }
      setLogMsg(res && 'error' in res && res.error === 'timeout' ? t.saveTimeout : failureText(res, t.logFailed, t));
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
  // A missing or unusable number or address hides its button and says why, once.
  const waOk = c ? whatsAppLink(c.phone, '') !== null : false;
  const actions = c ? [
    ...(waOk ? [{ key: 'whatsapp' as const, text: t.waAction, Icon: MessageCircle }] : []),
    ...(c.email ? [{ key: 'email' as const, text: t.emailAction, Icon: Mail }] : []),
    { key: 'call' as const, text: t.actCall, Icon: Phone },
    { key: 'meeting' as const, text: t.actMeeting, Icon: CalendarDays },
    { key: 'note' as const, text: t.actNote, Icon: StickyNote },
  ] : [];
  const unavailable = c ? [
    ...(!c.phone ? [t.noPhone] : !waOk ? [t.phoneUnusable] : []),
    ...(!c.email ? [t.noEmail] : []),
  ] : [];
  const logPlaceholder: Record<LogType, string> = {
    call: t.logCallPlaceholder, meeting: t.logMeetingPlaceholder, note: t.logNotePlaceholder,
  };
  // "12 ימים": Hebrew has a dual, so the count goes through plural().
  const days = c && c.statusDays !== null
    ? plural(locale, c.statusDays, { zero: t.daysZero, one: t.daysOne, two: t.daysTwo, other: t.daysOther })
    : null;

  return (
    <>
      <Drawer open={open} onClose={attemptClose} side="start" dir={dirOf(locale)} width={420}>
        {c && (
          <div className="h-full flex flex-col text-ink">
            {/* header: who, where they stand, and the path to move them. It does not
                scroll: the body under it does. */}
            <div className="shrink-0 pb-3 border-b border-border">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <h2 className="font-display text-[22px] font-extrabold tracking-tight truncate min-w-0" dir="auto">{c.full_name}</h2>
                    <span className={`text-[12px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 ${STATUS_BADGE[st]}`}>
                      {label(st)}
                    </span>
                    {days && (
                      <span className="text-[12px] text-ink-muted whitespace-nowrap shrink-0" title={t.daysInStatusTitle.replace('{days}', days)}>
                        {days}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="text-ink-secondary text-[14px] truncate min-w-0 flex-1">
                      <BidiParts parts={[c.role_title, c.company]} />
                    </p>
                    <span className="font-mono text-[12px] text-ink-secondary bg-white/5 rounded-md px-1.5 py-0.5 shrink-0">{c.score}</span>
                  </div>
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

              <div className="mt-3">
                <CrmStatusPath
                  locale={locale}
                  status={st}
                  readOnly={readOnly}
                  onChange={changeStatus}
                  onListOpenChange={onListOpenChange}
                  t={t}
                />
              </div>

              <CrmStatusFeedback status={statusCtl} t={t}>
                {prompt && c && (
                  <div className="basis-full flex flex-wrap items-center gap-2">
                    <span>
                      {prompt.kind === 'openDeal' && t.promptOpenDeal}
                      {prompt.kind === 'markWon' && t.promptMarkWon.replace('{title}', prompt.deal.title)}
                      {prompt.kind === 'openDeals' && t.promptOpenDeals.replace('{n}', String(prompt.n))}
                      {prompt.kind === 'moveSigned' && t.promptMoveSigned.replace('{name}', c.full_name)}
                    </span>
                    {prompt.kind !== 'openDeals' && (
                      <button
                        type="button"
                        onClick={acceptPrompt}
                        className="border border-brand/40 bg-brand/5 hover:bg-brand/10 text-brand font-semibold px-3 rounded-[10px] text-[13px] min-h-[44px]"
                      >
                        {prompt.kind === 'openDeal' ? t.promptOpenDealYes : prompt.kind === 'markWon' ? t.promptMarkWonYes : t.promptMoveSignedYes}
                      </button>
                    )}
                    <button type="button" onClick={() => setPrompt(null)} className="text-ink-secondary hover:text-ink px-3 min-h-[44px]">
                      {t.promptDismiss}
                    </button>
                  </div>
                )}
                {promptErr && <span className="text-red-400">{promptErr}</span>}
              </CrmStatusFeedback>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pt-4" style={{ overscrollBehavior: 'contain' }}>
              {/* reach */}
              <div className="flex flex-col gap-1 mb-5 text-[13px]">
                {c.email && <a href={`mailto:${c.email}`} className="text-brand truncate" dir="ltr">{c.email}</a>}
                {c.phone && <a href={`tel:${c.phone}`} className="text-ink-secondary" dir="ltr">{c.phone}</a>}
                {c.linkedin_url && <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-brand">LinkedIn ↗</a>}
              </div>

              {/* Reach and log: one row of buttons, each opening its own box in place,
                  one box at a time. They all write to the timeline, so a viewer gets none. */}
              {!readOnly && (
                <div className="mb-6">
                  <div role="group" aria-label={t.actionsLabel} className="flex flex-wrap gap-2">
                    {actions.map(({ key, text, Icon }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => { setLogMsg(null); setOpenBox((b) => (b === key ? null : key)); }}
                        aria-expanded={openBox === key}
                        aria-controls={`drawer-box-${key}`}
                        className={`inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-[10px] text-[13px] font-semibold border transition-colors ${
                          openBox === key ? 'border-brand text-brand bg-brand/10' : 'border-border text-ink-secondary hover:text-ink hover:border-brand'
                        }`}
                      >
                        <Icon size={15} aria-hidden="true" />
                        {text}
                      </button>
                    ))}
                  </div>
                  {unavailable.length > 0 && (
                    <p className="text-ink-muted text-[13px] mt-2">{unavailable.join(' ')}</p>
                  )}

                  {openBox === 'whatsapp' && wa && (
                    <div id="drawer-box-whatsapp" className="mt-3">
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
                    </div>
                  )}

                  {openBox === 'email' && c.email && (
                    <div id="drawer-box-email" className="mt-3">
                      <input
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder={t.emailSubject}
                        dir="auto"
                        className="w-full bg-bg border border-border rounded-[10px] px-3 py-2.5 text-[14px] outline-none focus:border-brand"
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
                    </div>
                  )}

                  {openBox && isLogType(openBox) && (
                    <div id={`drawer-box-${openBox}`} className="mt-3">
                      <textarea
                        value={logText[openBox]}
                        onChange={(e) => { const v = e.target.value; const k = openBox; setLogText((d) => ({ ...d, [k]: v })); }}
                        placeholder={logPlaceholder[openBox]}
                        dir="auto"
                        rows={3}
                        className="w-full bg-bg border border-border rounded-[10px] px-3 py-2.5 text-[14px] outline-none focus:border-brand resize-y"
                      />
                      <button
                        type="button"
                        onClick={() => saveLog(openBox)}
                        disabled={!logText[openBox].trim() || isPending}
                        className="mt-2 bg-brand hover:bg-brand-hover disabled:opacity-50 text-bg font-semibold px-4 py-2.5 rounded-[10px] min-h-[44px]"
                      >
                        {t.save}
                      </button>
                      {logMsg && <p role="alert" aria-live="polite" className="text-red-400 text-[13px] mt-2">{logMsg}</p>}
                    </div>
                  )}
                </div>
              )}

              <CrmNextStep
                locale={locale}
                contactId={c.id}
                tasks={c.tasks}
                readOnly={readOnly}
                draft={stepDraft}
                setDraft={setStepDraft}
                onDirtyChange={setStepDirty}
                t={t}
              />

              {/* deals: a writer always sees the line with "+ עסקה חדשה"; a viewer, only deals */}
              <CrmDrawerDeals
                locale={locale}
                contactId={c.id}
                deals={c.deals}
                readOnly={readOnly}
                adding={addingDeal}
                setAdding={setAddingDeal}
                draft={dealDraft}
                setDraft={setDealDraft}
                onWon={onDealWon}
                onOverlayChange={onLostOpenChange}
                t={t}
              />

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
              onClick={() => { discardDrafts(); reallyClose(); }}
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
