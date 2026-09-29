'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import type { Dict } from '@/lib/i18n/he';
import { Dialog } from '@/lib/motion/Dialog';
import { crmCreateDeal, crmMoveDeal, crmUpdateDeal } from '@/app/crm-actions';
import { withTimeout, failureText } from '@/lib/use-status-change';

export type DrawerDeal = { id: string; title: string; value: number; stage: string; status: string };

/** The new-deal form's text, held by the drawer so closing it can ask first. */
export type DealDraft = { title: string; value: string };
export const NO_DEAL_DRAFT: DealDraft = { title: '', value: '' };

// The board's stages, in its order. Lost is not a stage you pick: it asks first.
const STAGES = ['lead', 'qualified', 'meeting', 'proposal', 'negotiation', 'won'] as const;

/**
 * Shekels as typed: "18000", "18,000", "₪18 000". Empty is no value. "18k" is not
 * a number, and saying so beats storing 0.
 */
export function parseDealValue(v: string): { ok: true; value: number | undefined } | { ok: false } {
  const s = v.replace(/[\s,₪]/g, '');
  if (!s) return { ok: true, value: undefined };
  if (!/^\d+(\.\d+)?$/.test(s)) return { ok: false };
  return { ok: true, value: Number(s) };
}

const field = 'bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand min-h-[44px]';

/**
 * A person's deals, worked from the person: open one already attached to them,
 * change a deal's stage, title and value in place, win it or lose it. One deal is
 * open at a time. The board shows every change within its revalidation. See
 * DESIGN.md — Drawer deals.
 */
export default function CrmDrawerDeals({
  locale,
  contactId,
  deals,
  readOnly = false,
  adding,
  setAdding,
  draft,
  setDraft,
  onWon,
  onOverlayChange,
  t,
}: {
  locale: string;
  contactId: string;
  deals: DrawerDeal[];
  /** viewer role: deals as plain rows, and no region at all when there are none. */
  readOnly?: boolean;
  adding: boolean;
  setAdding: (v: boolean) => void;
  draft: DealDraft;
  setDraft: (d: DealDraft) => void;
  /** After a deal is stored as won: the drawer may offer to move the person to חתם. */
  onWon?: (deal: DrawerDeal) => void;
  /** The drawer ignores Escape while the lost confirmation is open. */
  onOverlayChange?: (open: boolean) => void;
  t: Dict['crm'];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [edit, setEdit] = useState<DealDraft>(NO_DEAL_DRAFT);
  // A stage change shows at once; the stored one arrives with the revalidation.
  const [moved, setMoved] = useState<Record<string, { stage: string; status: string }>>({});
  const [msg, setMsg] = useState<{ at: string; text: string } | null>(null);
  const [lostDeal, setLostDeal] = useState<DrawerDeal | null>(null);
  const [isPending, startTransition] = useTransition();
  const inFlight = useRef(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setOpenId(null); setMoved({}); setMsg(null); setLostDeal(null); }, [contactId]);
  useEffect(() => { if (adding) titleRef.current?.focus(); }, [adding]);
  useEffect(() => { onOverlayChange?.(lostDeal !== null); }, [lostDeal, onOverlayChange]);
  // Once the page's data agrees with a shown move, the move is no longer needed.
  useEffect(() => {
    setMoved((m) => {
      const left = Object.fromEntries(Object.entries(m).filter(([id, v]) => {
        const d = deals.find((x) => x.id === id);
        return d && (d.stage !== v.stage || d.status !== v.status);
      }));
      return Object.keys(left).length === Object.keys(m).length ? m : left;
    });
  }, [deals]);

  const shown = deals.map((d) => ({ ...d, ...moved[d.id] }));
  if (readOnly && shown.length === 0) return null;

  const stageText = (d: DrawerDeal) =>
    d.status === 'won' ? t.dealWonLabel
      : d.status === 'lost' ? t.dealLostLabel
      : ((t[`st_${d.stage}` as keyof Dict['crm']] as string) ?? d.stage);

  function saveNew() {
    if (inFlight.current) return;
    const title = draft.title.trim();
    if (!title) { setMsg({ at: 'new', text: t.errDealTitleRequired }); return; }
    const value = parseDealValue(draft.value);
    if (!value.ok) { setMsg({ at: 'new', text: t.errDealValue }); return; }
    inFlight.current = true;
    setMsg(null);
    startTransition(async () => {
      const res = await withTimeout(crmCreateDeal({ locale, title, value: value.value, contact_id: contactId }));
      inFlight.current = false;
      if (res && 'ok' in res && res.ok) {
        setDraft(NO_DEAL_DRAFT);
        setAdding(false);
        return;
      }
      setMsg({ at: 'new', text: res && 'error' in res && res.error === 'timeout' ? t.saveTimeout : failureText(res, t.dealSaveFailed, t) });
    });
  }

  function move(d: DrawerDeal, stage: string) {
    const status = stage === 'won' ? 'won' : stage === 'lost' ? 'lost' : 'open';
    setMoved((m) => ({ ...m, [d.id]: { stage, status } }));
    setMsg(null);
    startTransition(async () => {
      const res = await withTimeout(crmMoveDeal(d.id, stage, locale));
      if (!res || !('ok' in res) || !res.ok) {
        setMoved((m) => Object.fromEntries(Object.entries(m).filter(([id]) => id !== d.id)));
        setMsg({ at: d.id, text: failureText(res, t.moveFailed, t) });
        return;
      }
      if (status === 'won') onWon?.({ ...d, stage, status });
    });
  }

  function toggle(d: DrawerDeal) {
    setMsg(null);
    if (openId === d.id) { setOpenId(null); return; }
    setOpenId(d.id);
    setEdit({ title: d.title, value: d.value ? String(d.value) : '' });
  }

  function saveEdit(d: DrawerDeal) {
    if (inFlight.current) return;
    const title = edit.title.trim();
    if (!title) { setMsg({ at: d.id, text: t.errDealTitleRequired }); return; }
    const value = parseDealValue(edit.value);
    if (!value.ok) { setMsg({ at: d.id, text: t.errDealValue }); return; }
    const change = {
      ...(title !== d.title ? { title } : {}),
      ...((value.value ?? 0) !== d.value ? { value: value.value ?? 0 } : {}),
    };
    if (Object.keys(change).length === 0) return;
    inFlight.current = true;
    setMsg(null);
    startTransition(async () => {
      const res = await withTimeout(crmUpdateDeal({ locale, id: d.id, ...change }));
      inFlight.current = false;
      if (!res || !('ok' in res) || !res.ok) {
        setMsg({ at: d.id, text: res && 'error' in res && res.error === 'timeout' ? t.saveTimeout : failureText(res, t.dealSaveFailed, t) });
      }
    });
  }

  const summary = (d: DrawerDeal) => (
    <>
      <span className="text-[13px] font-semibold truncate min-w-0" dir="auto">{d.title}</span>
      <span className="flex items-center gap-2 text-[12px] shrink-0">
        {d.value > 0 && <span className="text-brand-ink font-mono" dir="ltr">₪{d.value.toLocaleString()}</span>}
        <span className="text-ink-muted border border-border rounded-full px-2 py-0.5 whitespace-nowrap">{stageText(d)}</span>
      </span>
    </>
  );

  const errorLine = (at: string) =>
    msg?.at === at && <p role="alert" aria-live="polite" className="text-danger text-[13px] mt-2">{msg.text}</p>;

  return (
    <section className="mb-6" aria-label={t.relatedDeals}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <h3 className="font-bold text-[14px]">{t.relatedDeals}</h3>
        {!readOnly && !adding && (
          <button
            type="button"
            onClick={() => { setMsg(null); setAdding(true); }}
            className="border border-brand/40 bg-brand/5 hover:bg-brand/10 text-brand-ink font-semibold px-3 rounded-[10px] text-[13px] min-h-[44px]"
          >
            + {t.addDeal}
          </button>
        )}
      </div>

      {!readOnly && adding && (
        <div className="bg-surface border border-border rounded-2xl p-3 mb-2">
          <div className="flex flex-wrap gap-2">
            <input
              ref={titleRef}
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder={t.dealTitle}
              aria-label={t.dealTitle}
              dir="auto"
              className={`flex-1 min-w-[160px] ${field}`}
            />
            <input
              value={draft.value}
              onChange={(e) => setDraft({ ...draft, value: e.target.value })}
              placeholder={t.dealValue}
              aria-label={t.dealValue}
              dir="ltr"
              inputMode="numeric"
              className={`w-28 ${field}`}
            />
            <button
              type="button"
              onClick={saveNew}
              disabled={isPending}
              className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-on-brand font-bold px-4 rounded-[10px] text-[14px] min-h-[44px]"
            >
              {t.save}
            </button>
            <button
              type="button"
              onClick={() => { setDraft(NO_DEAL_DRAFT); setAdding(false); setMsg(null); }}
              className="text-ink-secondary hover:text-ink px-3 text-[14px] min-h-[44px]"
            >
              {t.cancel}
            </button>
          </div>
          {errorLine('new')}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {shown.map((d) => readOnly ? (
          <div key={d.id} className="flex items-center justify-between gap-2 bg-bg border border-border rounded-xl p-2.5">
            {summary(d)}
          </div>
        ) : (
          <div key={d.id}>
            <button
              type="button"
              onClick={() => toggle(d)}
              aria-expanded={openId === d.id}
              className={`w-full flex items-center justify-between gap-2 bg-bg border p-2.5 min-h-[44px] text-start transition-colors ${
                openId === d.id ? 'border-brand rounded-t-xl' : 'border-border rounded-xl hover:border-brand'
              }`}
            >
              {summary(d)}
            </button>
            {openId === d.id && (
              <div className="bg-bg border border-t-0 border-brand rounded-b-xl p-3 flex flex-col gap-3">
                <label className="block">
                  <span className="text-[12px] text-ink-muted">{t.stageLabel}</span>
                  <select
                    value={d.status === 'lost' ? 'lost' : d.stage}
                    onChange={(e) => move(d, e.target.value)}
                    className={`block w-full mt-1 ${field}`}
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>{s === 'won' ? t.dealWonLabel : (t[`st_${s}` as keyof Dict['crm']] as string)}</option>
                    ))}
                    {d.status === 'lost' && <option value="lost">{t.dealLostLabel}</option>}
                  </select>
                </label>
                <div className="flex flex-wrap gap-2">
                  <input
                    value={edit.title}
                    onChange={(e) => setEdit({ ...edit, title: e.target.value })}
                    aria-label={t.dealTitle}
                    dir="auto"
                    className={`flex-1 min-w-[140px] ${field}`}
                  />
                  <input
                    value={edit.value}
                    onChange={(e) => setEdit({ ...edit, value: e.target.value })}
                    aria-label={t.dealValue}
                    placeholder={t.dealValue}
                    dir="ltr"
                    inputMode="numeric"
                    className={`w-28 ${field}`}
                  />
                  <button
                    type="button"
                    onClick={() => saveEdit(d)}
                    disabled={isPending}
                    className="border border-border hover:border-brand text-ink-secondary hover:text-ink font-semibold px-4 rounded-[10px] text-[14px] min-h-[44px] transition-colors disabled:opacity-50"
                  >
                    {t.save}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {d.status === 'open' && (
                    <button
                      type="button"
                      onClick={() => move(d, 'won')}
                      className="border border-brand/40 bg-brand/5 hover:bg-brand/10 text-brand-ink font-semibold px-3 rounded-[10px] text-[13px] min-h-[44px]"
                    >
                      {t.dealMarkWon}
                    </button>
                  )}
                  {d.status !== 'lost' && (
                    <button
                      type="button"
                      onClick={() => setLostDeal(d)}
                      className="text-ink-muted hover:text-danger text-[12px] px-2 min-h-[44px] ms-auto transition-colors"
                    >
                      {t.lostYes}
                    </button>
                  )}
                </div>
                {errorLine(d.id)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lost takes a deal out of the pipeline, so it asks first, by name. The Dialog
          portals itself a layer above the drawer (DESIGN.md §9). */}
      <Dialog open={lostDeal !== null} onClose={() => setLostDeal(null)} width={420}>
        {lostDeal && (
          <div className="text-ink">
            <p className="font-bold text-[16px] mb-4" dir="auto">{t.lostAsk.replace('{title}', lostDeal.title)}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { const d = lostDeal; setLostDeal(null); move(d, 'lost'); }}
                className="bg-danger hover:bg-danger/90 text-on-danger font-semibold px-5 py-2.5 rounded-[10px] min-h-[44px]"
              >
                {t.lostYes}
              </button>
              <button
                type="button"
                onClick={() => setLostDeal(null)}
                className="border border-border text-ink-secondary hover:text-ink px-5 py-2.5 rounded-[10px] min-h-[44px]"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </section>
  );
}
