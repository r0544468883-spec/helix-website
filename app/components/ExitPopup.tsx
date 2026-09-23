'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { SITE } from '@/lib/site';

const TIME_FALLBACK_MS = 45 * 1000; // show after 45s if nothing else triggered first
const SCROLL_TRIGGER = 0.45; // …or once the visitor scrolls 45% down the page
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // don't nag again for 7 days after dismiss
const STORAGE_KEY = 'helix-popup-dismissed-at';

// Lightweight event push to GTM/GA dataLayer (Analytics.tsx wires GTM/GA).
// Silently no-ops if no tag manager is present or consent wasn't granted.
function track(event: string, extra?: Record<string, unknown>) {
  try {
    const w = window as unknown as { dataLayer?: Array<Record<string, unknown>> };
    w.dataLayer?.push({ event, ...extra });
  } catch (_e) { /* noop */ }
}

/* Synthesized cricket chirp, closes the loop with the "שומע צרצרים" hook.
 * A real cricket is band-passed noise pulsed into fast syllables, not a pure
 * tone, so we filter white noise through two narrow band-passes and gate it
 * with soft (click-free) per-syllable envelopes. No asset, no external host. */
function playCricket(ctx: AudioContext) {
  const now = ctx.currentTime;

  // White-noise source, looped for the duration of the call.
  const noiseDur = 2.4;
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * noiseDur), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  // Two stacked band-passes give a pitched-but-raspy insect timbre (not a bell).
  const bp1 = ctx.createBiquadFilter();
  bp1.type = 'bandpass'; bp1.frequency.value = 4300; bp1.Q.value = 12;
  const bp2 = ctx.createBiquadFilter();
  bp2.type = 'bandpass'; bp2.frequency.value = 4300; bp2.Q.value = 12;

  const env = ctx.createGain();
  env.gain.value = 0.0001;
  const master = ctx.createGain();
  master.gain.value = 0.45; // quieter overall

  noise.connect(bp1).connect(bp2).connect(env).connect(master).connect(ctx.destination);

  // Chirps of soft syllables. Each syllable: fast attack, short decay, no gate click.
  const chirps = 4;        // four beats
  const syllPerChirp = 5;  // fewer syllables -> shorter beat
  const syllGap = 0.03;    // ~33 Hz trill
  const peak = 0.32;       // softer
  let t = now + 0.05;
  for (let c = 0; c < chirps; c++) {
    // A touch of per-chirp pitch drift reads as "alive", not looped.
    const f = 4150 + c * 130;
    bp1.frequency.setValueAtTime(f, t);
    bp2.frequency.setValueAtTime(f, t);
    for (let s = 0; s < syllPerChirp; s++) {
      env.gain.setValueAtTime(0.0001, t);
      env.gain.linearRampToValueAtTime(peak, t + 0.003);
      env.gain.exponentialRampToValueAtTime(0.0006, t + 0.018);
      t += syllGap;
    }
    t += 0.13; // silence between chirps
  }
  env.gain.setValueAtTime(0.0001, t);
  const stopAt = t + 0.1;
  noise.start(now); noise.stop(stopAt);
}

/* ── Community invite (default, every page) ──────────────────────────── */
function CommunityPopup({ onDismiss }: { onDismiss: (reason: string) => void }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const [soundBlocked, setSoundBlocked] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss('escape'); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onDismiss]);

  // Best-effort autoplay of the cricket. Browsers only allow it once the visitor
  // has interacted with the page; otherwise we surface a one-tap speaker button.
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let ctx: AudioContext | null = null;
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) { setSoundBlocked(true); return; }
      ctx = new AC();
      ctxRef.current = ctx;
      if (reduce) { setSoundBlocked(true); return; } // respect reduced-motion: play only on tap
      const run = () => {
        if (ctx!.state === 'running') { playCricket(ctx!); track('community_popup_sound', { auto: true }); }
        else setSoundBlocked(true);
      };
      if (ctx.state === 'suspended') ctx.resume().then(run).catch(() => setSoundBlocked(true));
      else run();
    } catch (_e) { setSoundBlocked(true); }
    return () => { try { ctxRef.current?.close(); } catch (_e) { /* noop */ } ctxRef.current = null; };
  }, []);

  const playSound = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.resume().then(() => { playCricket(ctx); setSoundBlocked(false); track('community_popup_sound', { auto: false }); }).catch(() => { /* noop */ });
  };

  return createPortal(
    <div
      className="exit-popup-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onDismiss('overlay'); }}
    >
      <div className="exit-popup-card">
        <button className="exit-popup-close" aria-label="סגירה" onClick={() => onDismiss('close')}>✕</button>
        <button
          className={`exit-popup-sound${soundBlocked ? ' is-hint' : ''}`}
          aria-label="השמעת צליל צרצרים"
          title="שמעו את הצרצרים"
          onClick={playSound}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 5 6 9H2v6h4l5 4V5z" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        </button>
        <div className="exit-popup-badge">קהילה חינם</div>

        <div className="exit-popup-header">
          <div className="exit-popup-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3 className="exit-popup-title">נמאס להעלות פוסט ולשמוע צרצרים?</h3>
          <p className="exit-popup-sub">
            קהילת הפרגונים של HELIX. מעלים פוסט אחד ביום, וכל הקהילה מפרגנת באמת.
            לייקים, תגובות, חשיפה אמיתית. בחינם.
          </p>
        </div>

        <div className="exit-popup-body">
          <ul className="exit-popup-benefits">
            <li>פרגון אמיתי מאנשים אמיתיים, לא בוטים ולא לייקים קנויים.</li>
            <li>האלגוריתם מזניק פוסטים שמקבלים תגובות בשעה הראשונה.</li>
            <li>קבוצה לכל רשת: לינקדאין, אינסטגרם, טיקטוק, פייסבוק.</li>
          </ul>
          <a
            href="/community"
            className="exit-popup-cta"
            onClick={() => { track('community_popup_join_click', { popup_mode: 'community' }); onDismiss('join'); }}
          >
            להצטרפות לקהילת הפרגונים ←
          </a>
          <button className="exit-popup-secondary" onClick={() => onDismiss('later')}>
            אולי אחר כך
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── GEO lead offer (targeted, /ai-checker only) ─────────────────────── */
// /api/lead only strips separators, then demands 0XXXXXXXX or 972XXXXXXXX. A
// visitor who typed 00972... or +972... was 400'd before anything was stored,
// so the lead vanished while the thank-you screen still showed. Normalize to
// the local 0 form here, where we still have the raw input.

// An Israeli number with the trunk 0 stripped: mobile and the 07X range are 9
// digits, geographic landlines (02/03/04/08/09) are 8.
const IL_SUBSCRIBER = /^(?:[57]\d{8}|[23489]\d{7})$/;

function normalizePhone(raw: string): string {
  const local = raw.replace(/\D/g, '').replace(/^(?:00972|972)/, '');
  if (!local) return '';
  // Some people keep the trunk 0 after +972, so do not hand back a 00 number.
  if (local.startsWith('0')) return local;
  // Only a real subscriber number gets the trunk 0 back. Adding it to anything
  // else turned 1-800-123-456 into 01800123456, which passes PHONE_RE and puts
  // a number nobody can dial in Eran's inbox. A shape we don't recognise goes
  // over as typed, so the route judges the number the visitor actually gave.
  return IL_SUBSCRIBER.test(local) ? `0${local}` : raw;
}

// The post-submit screen. We do not claim we got the details before the server
// says so: /api/lead still rejects leads (rate limit, unreachable contact) and
// the old screen said "thank you" either way.
const DONE_COPY = {
  pending: {
    icon: '',
    title: 'וואטסאפ נפתח עם ההודעה',
    sub: 'עוד רגע נאשר שהפרטים נקלטו גם אצלנו.',
  },
  ok: {
    icon: '✓',
    title: 'תודה!',
    sub: 'נחזור אליכם תוך 30 דקות בימי עסקים.',
  },
  failed: {
    icon: '',
    title: 'וואטסאפ נפתח, שלחו את ההודעה',
    sub: 'הפרטים לא נשמרו אצלנו בגלל תקלה, ההודעה בוואטסאפ היא מה שיגיע אלינו.',
  },
} as const;

type SubmitStatus = 'idle' | keyof typeof DONE_COPY;

function GeoPopup({ onDismiss }: { onDismiss: (reason: string) => void }) {
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [form, setForm] = useState({ name: '', phone: '', interest: 'בדיקת GEO / נראות ב-AI' });

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss('escape'); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onDismiss]);

  // Auto-close only on a confirmed save. On failure the popup stays up so the
  // visitor reads that the WhatsApp message is the one that has to be sent.
  useEffect(() => {
    if (status !== 'ok') return;
    const t = setTimeout(() => onDismiss('submit'), 2000);
    return () => clearTimeout(t);
  }, [status, onDismiss]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `שלום, השארתי פרטים באתר helix.co.il\nשם: ${form.name}\nטלפון: ${form.phone}\nמעניין אותי: ${form.interest || 'לא צוין'}\nמבצע: GEO שוטף, 1,500 ₪/חודש`;

    // Keep the lead even when the visitor never actually sends the WhatsApp
    // message. Fired without await and with keepalive: an awaited fetch would
    // push window.open out of the click gesture and Safari blocks it, while
    // keepalive lets the request finish after the tab hands off to WhatsApp.
    // The response still comes back, it just decides the copy instead of the
    // handoff.
    fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        phone: normalizePhone(form.phone),
        interest: form.interest,
        source: 'exit-popup',
        details: {
          'עמוד': window.location.pathname,
          'מבצע': 'GEO שוטף, 1,500 ₪/חודש',
        },
      }),
      keepalive: true,
    })
      .then((res) => setStatus(res.ok ? 'ok' : 'failed'))
      .catch(() => setStatus('failed')); /* WhatsApp is the visitor's channel, it doesn't wait for us */

    window.open(`https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
    track('geo_popup_submit', { popup_mode: 'geo' });
    setStatus('pending');
  };

  return createPortal(
    <div className="exit-popup-overlay" onClick={(e) => { if (e.target === e.currentTarget) onDismiss('overlay'); }}>
      <div className="exit-popup-card">
        <button className="exit-popup-close" aria-label="סגירה" onClick={() => onDismiss('close')}>✕</button>
        <div className="exit-popup-badge">בדיקת GEO חינם</div>

        {status !== 'idle' ? (
          <div className="exit-popup-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
            {DONE_COPY[status].icon && (
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>{DONE_COPY[status].icon}</div>
            )}
            <h3 className="exit-popup-title">{DONE_COPY[status].title}</h3>
            <p className="exit-popup-sub">{DONE_COPY[status].sub}</p>
          </div>
        ) : (
          <>
            <div className="exit-popup-header">
              <div className="exit-popup-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <h3 className="exit-popup-title">רוצים ש-ChatGPT ימליץ על העסק שלכם?</h3>
              <p className="exit-popup-sub">
                השאירו פרטים ונראה לכם בדיוק איך לגרום למנועי ה-AI למצוא ולהמליץ עליכם, אבחון GEO ראשוני חינם.
              </p>
              <div className="exit-popup-offer">
                <span className="exit-popup-offer-tag">מבצע למי שביצע בדיקה</span>
                <div className="exit-popup-offer-price">
                  <strong>1,500 ₪</strong> / חודש
                </div>
                <span className="exit-popup-offer-note">GEO שוטף, ניהול הנראות שלכם במנועי ה-AI. בלי חוזה.</span>
              </div>
            </div>

            <form className="exit-popup-body" onSubmit={handleSubmit}>
              <div className="exit-popup-field">
                <label>שם מלא *</label>
                <input type="text" placeholder="שם מלא" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="exit-popup-field">
                <label>טלפון *</label>
                <input type="tel" placeholder="050-123-4567" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} dir="ltr" />
              </div>
              <div className="exit-popup-consent">
                <input type="checkbox" id="popup-consent" required />
                <label htmlFor="popup-consent">
                  אני מסכים ל<a href="/privacy" target="_blank">מדיניות הפרטיות</a> ול<a href="/privacy" target="_blank">תנאי השימוש</a>
                </label>
              </div>
              <button type="submit" className="exit-popup-cta">קבלו אבחון GEO חינם ←</button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

// Focused single-goal pages where the global community popup would compete
// with the page's own conversion goal, suppress it there. The community page
// itself is included, no point inviting someone who's already on it.
const DISABLED_PATHS = ['/startups/readiness', '/community'];

export default function ExitPopup() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();
  const isGeo = pathname === '/ai-checker';
  const mode = isGeo ? 'geo' : 'community';

  useEffect(() => {
    // Force-show hatch for testing: ?popup=1 shows immediately, ignoring the
    // cooldown, disabled paths, and triggers. Harmless in production.
    try {
      if (new URLSearchParams(window.location.search).has('popup')) {
        setShow(true);
        return;
      }
    } catch (_e) { /* noop */ }

    if (DISABLED_PATHS.includes(pathname)) return;

    try {
      const at = Number(localStorage.getItem(STORAGE_KEY) || 0);
      if (at > 0 && Date.now() - at < COOLDOWN_MS) return;
    } catch (_e) { /* noop */ }

    let done = false;
    const trigger = () => {
      if (done) return;
      done = true;
      cleanup();
      setShow(true);
    };

    // 1) Exit-intent, desktop only: pointer leaves the viewport toward the top.
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && !e.relatedTarget) trigger();
    };
    // 2) Scroll depth: 45% of the scrollable page.
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0 && window.scrollY / scrollable >= SCROLL_TRIGGER) trigger();
    };
    // 3) Time fallback.
    const timer = setTimeout(trigger, TIME_FALLBACK_MS);

    function cleanup() {
      clearTimeout(timer);
      document.removeEventListener('mouseout', onMouseOut);
      window.removeEventListener('scroll', onScroll);
    }

    document.addEventListener('mouseout', onMouseOut);
    window.addEventListener('scroll', onScroll, { passive: true });
    return cleanup;
  }, [pathname]);

  useEffect(() => {
    if (show) track('community_popup_shown', { popup_mode: mode, path: pathname });
  }, [show, mode, pathname]);

  const dismiss = useCallback((reason: string) => {
    setShow(false);
    if (reason !== 'join' && reason !== 'submit') {
      track('community_popup_dismiss', { popup_mode: mode, reason });
    }
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch (_e) { /* noop */ }
  }, [mode]);

  // Always render a hidden marker so we know the component mounted.
  return (
    <>
      <div data-exit-popup="mounted" style={{ display: 'none' }} />
      {show && (isGeo ? <GeoPopup onDismiss={dismiss} /> : <CommunityPopup onDismiss={dismiss} />)}
    </>
  );
}
