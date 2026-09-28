'use client';

import { useOptimistic, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Dict } from '@/lib/i18n/he';
import { crmCreateDeal, crmMoveDeal } from '@/app/crm-actions';
import { useFlip } from '@/lib/motion/useFlip';
import { Dialog } from '@/lib/motion/Dialog';
import { createSpring, SPRINGS } from '@/lib/motion/spring';
import { useReducedMotion } from '@/lib/motion/useMotionPreference';

const STAGES = ['lead', 'qualified', 'meeting', 'proposal', 'negotiation', 'won'] as const;
type Stage = (typeof STAGES)[number];

// A server action has no timeout of its own; without this a dropped connection
// leaves the card optimistically moved with nothing ever reconciling it.
const MOVE_TIMEOUT_MS = 15_000;
// Arming gates: a press this long, or this much travel across the columns.
const HOLD_MS = 200;
const ARM_PX = 8;

type Deal = { id: string; title: string; value: number; currency: string; stage: string; status: string; contact_id: string | null; contactName?: string };

export default function CrmDealBoard({
  locale,
  deals,
  contacts,
  readOnly = false,
  t,
}: {
  locale: string;
  deals: Deal[];
  contacts: { id: string; name: string }[];
  /** viewer role: no add, no drag, no stage buttons. Omitted, not disabled. */
  readOnly?: boolean;
  t: Dict['crm'];
}) {
  const [, startTransition] = useTransition();
  const reduce = useReducedMotion();
  const router = useRouter();
  // A drag ends in a click the browser still delivers; that click must not open
  // the person. Set on release of an armed drag, cleared once the click has passed.
  const suppressClick = useRef(false);

  // A deal leads to its person: the drawer over this same page.
  const personHref = (d: Deal) => `/${locale}/dashboard/crm?c=${d.contact_id}`;

  // The card moves on release and the server reconciles. A failed move unwinds on
  // its own when the transition ends, so only the message needs handling.
  const [shown, applyMove] = useOptimistic(
    deals,
    (state: Deal[], m: { id: string; stage: string; status: string }) =>
      state.map((d) => (d.id === m.id ? { ...d, stage: m.stage, status: m.status } : d))
  );

  // FLIP reflow: a stage change makes cards flow to their new column (both axes).
  const boardRef = useFlip<HTMLDivElement>([shown]);

  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [nf, setNf] = useState({ title: '', value: '', contact_id: '' });
  const [lostDeal, setLostDeal] = useState<Deal | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [hoverStage, setHoverStage] = useState<string | null>(null);

  const colRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  // Live drag state lives in a ref: writing transforms straight to the node keeps
  // the gesture off React's render path.
  const drag = useRef<{
    id: string; el: HTMLElement; pointerId: number;
    startX: number; startY: number; armed: boolean; hold: number | null;
    rects: { stage: Stage; rect: DOMRect }[];
  } | null>(null);

  function stageName(stage: string) {
    return (t[`st_${stage}` as keyof Dict['crm']] as string) ?? stage;
  }

  function commit(id: string, stage: string) {
    const status = stage === 'won' ? 'won' : stage === 'lost' ? 'lost' : 'open';
    setError(null);
    startTransition(async () => {
      applyMove({ id, stage, status });
      const res = await Promise.race([
        crmMoveDeal(id, stage, locale),
        new Promise<{ error: string }>((r) => setTimeout(() => r({ error: 'timeout' }), MOVE_TIMEOUT_MS)),
      ]);
      if (res && 'error' in res && res.error) {
        setError(res.error === 'auth' ? t.sessionExpired : ('message' in res && res.message) || t.moveFailed);
      }
    });
  }

  function step(id: string, dir: -1 | 1, cur: string) {
    const i = STAGES.indexOf(cur as Stage);
    const ni = Math.max(0, Math.min(STAGES.length - 1, i + dir));
    if (ni === i) return;
    commit(id, STAGES[ni]);
  }

  function add() {
    if (!nf.title.trim()) return;
    startTransition(async () => {
      const res = await crmCreateDeal({ locale, title: nf.title, value: Number(nf.value) || 0, contact_id: nf.contact_id || undefined });
      if (res?.ok) { setNf({ title: '', value: '', contact_id: '' }); setAdding(false); }
    });
  }

  // ---- drag ------------------------------------------------------------------
  function clearDrag(springHome: boolean) {
    const d = drag.current;
    drag.current = null;
    setDragId(null);
    setHoverStage(null);
    if (!d) return;
    if (d.hold) window.clearTimeout(d.hold);
    const el = d.el;
    el.style.zIndex = '';
    el.style.touchAction = '';
    const m = /translate\((-?[\d.]+)px, (-?[\d.]+)px\)/.exec(el.style.transform || '');
    const fromX = m ? parseFloat(m[1]) : 0;
    const fromY = m ? parseFloat(m[2]) : 0;
    if (!springHome || reduce || (!fromX && !fromY)) {
      el.style.transform = '';
      return;
    }
    // Released over nothing: spring back to where it came from.
    const cur = { x: fromX, y: fromY };
    const write = () => { el.style.transform = `translate(${cur.x}px, ${cur.y}px)`; };
    let pend = (fromX ? 1 : 0) + (fromY ? 1 : 0);
    const settle = () => { if (--pend <= 0) el.style.transform = ''; };
    if (fromX) createSpring({ from: fromX, to: 0, ...SPRINGS.reflow, reduce, onUpdate: (v) => { cur.x = v; write(); }, onRest: settle });
    if (fromY) createSpring({ from: fromY, to: 0, ...SPRINGS.reflow, reduce, onUpdate: (v) => { cur.y = v; write(); }, onRest: settle });
  }

  function arm() {
    const d = drag.current;
    if (!d || d.armed) return;
    d.armed = true;
    if (d.hold) { window.clearTimeout(d.hold); d.hold = null; }
    d.rects = STAGES.map((s) => {
      const node = colRefs.current.get(s);
      return node ? { stage: s, rect: node.getBoundingClientRect() } : null;
    }).filter(Boolean) as { stage: Stage; rect: DOMRect }[];
    d.el.style.zIndex = '40';
    // Only now does the card stop deferring to the browser's panning.
    d.el.style.touchAction = 'none';
    setDragId(d.id);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>, d: Deal) {
    // Never hijack the buttons, or the title link, that live inside the card.
    if ((e.target as HTMLElement).closest('button, a')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    drag.current = {
      id: d.id, el, pointerId: e.pointerId,
      startX: e.clientX, startY: e.clientY, armed: false, rects: [],
      hold: window.setTimeout(arm, HOLD_MS),
    };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    // Travel across the columns arms the drag; vertical travel is left to scrolling.
    if (!d.armed && Math.abs(dx) > ARM_PX) arm();
    if (!d.armed) return;
    d.el.style.transform = `translate(${dx}px, ${dy}px)`;
    const hit = d.rects.find(({ rect }) =>
      e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
    );
    setHoverStage(hit ? hit.stage : null);
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    const wasArmed = d.armed;
    const id = d.id;
    if (wasArmed) {
      suppressClick.current = true;
      window.setTimeout(() => { suppressClick.current = false; }, 0);
    }
    const hit = wasArmed
      ? d.rects.find(({ rect }) =>
          e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
        )
      : undefined;
    const from = shown.find((x) => x.id === id)?.stage;
    // Released outside every column: nothing is sent, the card goes home.
    if (wasArmed && hit && hit.stage !== from) {
      clearDrag(false);
      commit(id, hit.stage);
    } else {
      clearDrag(true);
    }
  }

  const cardBase = 'bg-surface border border-border rounded-lg p-2.5 select-none';

  return (
    <>
      {/* The section owns its title. With no deals it is this one line and nothing
          else: six empty columns read as structure around nothing. */}
      <div className={`flex flex-wrap items-center justify-between gap-2 ${shown.length > 0 || adding ? 'mb-4' : ''}`}>
        <h2 className="font-bold text-[18px]">{t.pipeline}</h2>
        {!readOnly && !adding && (
          <button onClick={() => setAdding(true)} className="border border-brand/40 bg-brand/5 hover:bg-brand/10 text-brand-ink font-semibold px-4 py-2 rounded-[10px] text-[14px] min-h-[44px]">+ {t.addDeal}</button>
        )}
      </div>

      <div className={`flex flex-wrap items-center gap-2 ${adding || error ? 'mb-4' : ''}`}>
        {readOnly || !adding ? null : (
          <div className="bg-surface border border-border rounded-2xl p-4 flex flex-wrap gap-2 items-center w-full">
            <input value={nf.title} onChange={(e) => setNf({ ...nf, title: e.target.value })} placeholder={t.dealTitle} dir="auto" className="flex-1 min-w-[160px] bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand" />
            <input value={nf.value} onChange={(e) => setNf({ ...nf, value: e.target.value })} placeholder={t.dealValue} dir="ltr" inputMode="numeric" className="w-28 bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand" />
            <select value={nf.contact_id} onChange={(e) => setNf({ ...nf, contact_id: e.target.value })} className="bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand">
              <option value="">{t.dealNoContact}</option>
              {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={add} className="bg-brand text-on-brand font-semibold px-4 py-2 rounded-[10px] text-[14px]">{t.save}</button>
            <button onClick={() => setAdding(false)} className="text-ink-secondary px-3 py-2 text-[14px]">{t.cancel}</button>
          </div>
        )}
        {error && <span role="alert" aria-live="polite" className="text-danger text-[13px]">{error}</span>}
      </div>

      {shown.length > 0 && <div ref={boardRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAGES.map((stage) => {
          const items = shown.filter((d) => d.stage === stage && d.status !== 'lost');
          const total = items.reduce((a, d) => a + (d.value || 0), 0);
          const isTarget = hoverStage === stage;
          return (
            <div
              key={stage}
              ref={(n) => { if (n) colRefs.current.set(stage, n); else colRefs.current.delete(stage); }}
              className={`border rounded-xl p-2 min-h-[120px] transition-colors ${isTarget ? 'bg-brand/10 border-brand' : 'bg-bg border-border'}`}
            >
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-[12px] font-bold text-ink-secondary">{stageName(stage)}</span>
                <span className="text-[11px] text-ink-muted font-mono">{items.length}</span>
              </div>
              {total > 0 && <div className="text-[11px] text-brand-ink font-mono px-1 mb-2">₪{total.toLocaleString()}</div>}
              <div className="flex flex-col gap-2">
                {items.map((d) => (
                  <div
                    key={d.id}
                    data-flip-id={d.id}
                    role="group"
                    aria-label={`${d.title} — ${t.stageLabel}: ${stageName(d.stage)}`}
                    onPointerDown={readOnly ? undefined : (e) => onPointerDown(e, d)}
                    onPointerMove={readOnly ? undefined : onPointerMove}
                    onPointerUp={readOnly ? undefined : onPointerUp}
                    onPointerCancel={readOnly ? undefined : () => clearDrag(true)}
                    onClickCapture={(e) => {
                      if (!suppressClick.current) return;
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    // A tap on the card body opens the person. The title link and the
                    // buttons handle their own clicks; a deal with no person opens nothing.
                    onClick={(e) => {
                      if (!d.contact_id || (e.target as HTMLElement).closest('button, a')) return;
                      router.push(personHref(d), { scroll: false });
                    }}
                    // pan-y leaves vertical scrolling to the browser while handing us
                    // the across-the-columns gesture. It becomes 'none' once armed.
                    style={readOnly ? undefined : { touchAction: 'pan-y', cursor: dragId === d.id ? 'grabbing' : 'grab' }}
                    className={`${cardBase} ${dragId === d.id ? 'relative shadow-lg border-brand/60' : ''}`}
                  >
                    {d.contact_id ? (
                      <Link
                        href={personHref(d)}
                        scroll={false}
                        title={d.contactName ? t.openPerson.replace('{name}', d.contactName) : undefined}
                        className="block text-[13px] font-semibold leading-snug hover:underline"
                        dir="auto"
                      >
                        {d.title}
                      </Link>
                    ) : (
                      <p className="text-[13px] font-semibold leading-snug" dir="auto">{d.title}</p>
                    )}
                    {d.contactName && <p className="text-[11px] text-ink-muted mt-0.5" dir="auto">{d.contactName}</p>}
                    {d.value > 0 && <p className="text-[11px] text-brand-ink font-mono mt-0.5">₪{d.value.toLocaleString()}</p>}
                    {!readOnly && <div className="flex items-center gap-1 mt-2">
                      <button onClick={() => step(d.id, -1, d.stage)} aria-label={`${t.moveBack}: ${d.title}`} className="text-ink-muted hover:text-ink text-[14px] px-1.5 py-1">‹</button>
                      <button onClick={() => step(d.id, 1, d.stage)} aria-label={`${t.moveForward}: ${d.title}`} className="text-ink-muted hover:text-brand-ink text-[14px] px-1.5 py-1">›</button>
                      <button onClick={() => setLostDeal(d)} aria-label={`${t.lostYes}: ${d.title}`} className="text-ink-muted hover:text-danger text-[11px] px-1 ms-auto py-1">{t.st_lost}</button>
                    </div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>}

      {/* Losing a deal takes it out of the pipeline and no drag can reach 'lost',
          so it asks first, and it says which deal. */}
      <Dialog open={lostDeal !== null} onClose={() => setLostDeal(null)} width={420}>
        {lostDeal && (
          <div className="text-ink">
            <p className="font-bold text-[16px] mb-4" dir="auto">
              {t.lostAsk.replace('{title}', lostDeal.title)}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { const id = lostDeal.id; setLostDeal(null); commit(id, 'lost'); }}
                className="bg-danger hover:bg-danger/90 text-on-danger font-semibold px-5 py-2.5 rounded-[10px] min-h-[44px]"
              >
                {t.lostYes}
              </button>
              <button
                onClick={() => setLostDeal(null)}
                className="border border-border text-ink-secondary hover:text-ink px-5 py-2.5 rounded-[10px] min-h-[44px]"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
