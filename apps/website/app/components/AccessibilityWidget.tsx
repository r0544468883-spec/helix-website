'use client';

import { useEffect, useState, useCallback } from 'react';
import { SITE } from '@/lib/site';

/**
 * Interactive accessibility toolbar (Israeli תקנות שוויון זכויות / IS 5568).
 * Adjusts text size, contrast, link highlighting, readable font, big cursor and
 * stops animations. Every setting is applied as a class/attr on <html> and
 * persisted to localStorage. This complements the written הצהרת נגישות page.
 */

type A11yState = {
  fontStep: number; // 0..4  → 100%..160%
  contrast: 'none' | 'high' | 'invert';
  links: boolean;
  readable: boolean;
  bigCursor: boolean;
  stopAnim: boolean;
};

const DEFAULTS: A11yState = {
  fontStep: 0,
  contrast: 'none',
  links: false,
  readable: false,
  bigCursor: false,
  stopAnim: false,
};

const KEY = 'helix-a11y';
const FONT_SCALES = [1, 1.15, 1.3, 1.45, 1.6];

function apply(state: A11yState) {
  const el = document.documentElement;
  el.style.setProperty('--a11y-font-scale', String(FONT_SCALES[state.fontStep]));
  el.classList.toggle('a11y-font', state.fontStep > 0);
  el.classList.toggle('a11y-contrast', state.contrast === 'high');
  el.classList.toggle('a11y-invert', state.contrast === 'invert');
  el.classList.toggle('a11y-links', state.links);
  el.classList.toggle('a11y-readable', state.readable);
  el.classList.toggle('a11y-cursor', state.bigCursor);
  el.classList.toggle('a11y-no-anim', state.stopAnim);
}

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<A11yState>(DEFAULTS);

  // Load saved prefs on mount.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) {
        const parsed = { ...DEFAULTS, ...JSON.parse(saved) } as A11yState;
        setState(parsed);
        apply(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const update = useCallback((patch: Partial<A11yState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      apply(next);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setState(DEFAULTS);
    apply(DEFAULTS);
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <>
      <button
        type="button"
        className="a11y-toggle"
        aria-label="פתיחת תפריט נגישות"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((o) => !o)}
      >
        {/* Universal accessibility icon */}
        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="3.8" r="1.9" />
          <path d="M20 6.5c-2.4.9-5 1.4-8 1.4S6.4 7.4 4 6.5l-.6 1.9c1.8.7 3.7 1.1 5.6 1.3l-.6 4.2L7 20.9l1.9.5 1.7-5.9h.8l1.7 5.9 1.9-.5-1.4-6.9-.6-4.2c1.9-.2 3.8-.6 5.6-1.3L20 6.5z" />
        </svg>
      </button>

      {open && (
        <div className="a11y-panel" role="dialog" aria-label="הגדרות נגישות">
          <div className="a11y-panel__head">
            <h2 className="a11y-panel__title">נגישות</h2>
            <button
              type="button"
              className="a11y-panel__close"
              aria-label="סגירת תפריט נגישות"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="a11y-panel__body">
            <div className="a11y-row">
              <span className="a11y-row__label">גודל טקסט</span>
              <div className="a11y-stepper">
                <button
                  type="button"
                  aria-label="הקטנת טקסט"
                  disabled={state.fontStep === 0}
                  onClick={() => update({ fontStep: Math.max(0, state.fontStep - 1) })}
                >
                  −
                </button>
                <span aria-live="polite">{Math.round(FONT_SCALES[state.fontStep] * 100)}%</span>
                <button
                  type="button"
                  aria-label="הגדלת טקסט"
                  disabled={state.fontStep === FONT_SCALES.length - 1}
                  onClick={() =>
                    update({ fontStep: Math.min(FONT_SCALES.length - 1, state.fontStep + 1) })
                  }
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              className={`a11y-opt${state.contrast === 'high' ? ' is-on' : ''}`}
              aria-pressed={state.contrast === 'high'}
              onClick={() => update({ contrast: state.contrast === 'high' ? 'none' : 'high' })}
            >
              ניגודיות גבוהה
            </button>
            <button
              type="button"
              className={`a11y-opt${state.contrast === 'invert' ? ' is-on' : ''}`}
              aria-pressed={state.contrast === 'invert'}
              onClick={() => update({ contrast: state.contrast === 'invert' ? 'none' : 'invert' })}
            >
              היפוך צבעים
            </button>
            <button
              type="button"
              className={`a11y-opt${state.links ? ' is-on' : ''}`}
              aria-pressed={state.links}
              onClick={() => update({ links: !state.links })}
            >
              הדגשת קישורים
            </button>
            <button
              type="button"
              className={`a11y-opt${state.readable ? ' is-on' : ''}`}
              aria-pressed={state.readable}
              onClick={() => update({ readable: !state.readable })}
            >
              גופן קריא
            </button>
            <button
              type="button"
              className={`a11y-opt${state.bigCursor ? ' is-on' : ''}`}
              aria-pressed={state.bigCursor}
              onClick={() => update({ bigCursor: !state.bigCursor })}
            >
              סמן גדול
            </button>
            <button
              type="button"
              className={`a11y-opt${state.stopAnim ? ' is-on' : ''}`}
              aria-pressed={state.stopAnim}
              onClick={() => update({ stopAnim: !state.stopAnim })}
            >
              עצירת אנימציות
            </button>

            <button type="button" className="a11y-reset" onClick={reset}>
              איפוס הגדרות
            </button>

            <a className="a11y-statement" href="/accessibility">
              להצהרת הנגישות המלאה
            </a>
            <a className="a11y-statement" href={`mailto:${SITE.accessibilityEmail}`}>
              דיווח על תקלת נגישות
            </a>
          </div>
        </div>
      )}
    </>
  );
}
