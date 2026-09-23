'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { SITE } from '@/lib/site';

const DELAY_MS = 60 * 1000; // 60 seconds
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // don't nag again for 7 days after dismiss
const STORAGE_KEY = 'helix-popup-dismissed-at';

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

function PopupContent({ onDismiss, isGeo }: { onDismiss: () => void; isGeo: boolean }) {
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    interest: isGeo ? 'בדיקת GEO / נראות ב-AI' : '',
  });

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onDismiss]);

  // Auto-close only on a confirmed save. On failure the popup stays up so the
  // visitor reads that the WhatsApp message is the one that has to be sent.
  useEffect(() => {
    if (status !== 'ok') return;
    const t = setTimeout(onDismiss, 2000);
    return () => clearTimeout(t);
  }, [status, onDismiss]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `שלום, השארתי פרטים באתר helix.co.il\nשם: ${form.name}\nטלפון: ${form.phone}\nמעניין אותי: ${form.interest || 'לא צוין'}${isGeo ? '\nמבצע: GEO שוטף, 1,500 ₪/חודש' : ''}`;

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
          ...(isGeo ? { 'מבצע': 'GEO שוטף, 1,500 ₪/חודש' } : {}),
        },
      }),
      keepalive: true,
    })
      .then((res) => setStatus(res.ok ? 'ok' : 'failed'))
      .catch(() => setStatus('failed')); /* WhatsApp is the visitor's channel, it doesn't wait for us */

    window.open(`https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
    setStatus('pending');
  };

  return createPortal(
    <div className="exit-popup-overlay" onClick={(e) => { if (e.target === e.currentTarget) onDismiss(); }}>
      <div className="exit-popup-card">
        <button className="exit-popup-close" onClick={onDismiss}>✕</button>
        <div className="exit-popup-badge">{isGeo ? 'בדיקת GEO חינם' : 'ייעוץ חינם'}</div>

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
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <h3 className="exit-popup-title">
                {isGeo ? 'רוצים ש-ChatGPT ימליץ על העסק שלכם?' : 'רגע לפני שאתם הולכים, קבלו ייעוץ חינם'}
              </h3>
              <p className="exit-popup-sub">
                {isGeo
                  ? 'השאירו פרטים ונראה לכם בדיוק איך לגרום למנועי ה-AI למצוא ולהמליץ עליכם, אבחון GEO ראשוני חינם.'
                  : 'השאירו פרטים ונחזור אליכם תוך 30 דקות בימי עסקים'}
              </p>
              {isGeo && (
                <div className="exit-popup-offer">
                  <span className="exit-popup-offer-tag">מבצע למי שביצע בדיקה</span>
                  <div className="exit-popup-offer-price">
                    <strong>1,500 ₪</strong> / חודש
                  </div>
                  <span className="exit-popup-offer-note">GEO שוטף, ניהול הנראות שלכם במנועי ה-AI. בלי חוזה.</span>
                </div>
              )}
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
              {!isGeo && (
                <div className="exit-popup-field">
                  <label>מה מעניין אתכם? (אופציונלי)</label>
                  <select value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })}>
                    <option value="">בחרו תחום</option>
                    <option value="אוטומציות וסוכני AI">אוטומציות וסוכני AI</option>
                    <option value="בוטים ו-WhatsApp">בוטים ו-WhatsApp</option>
                    <option value="פיתוח אפליקציה או מערכת">פיתוח אפליקציה או מערכת</option>
                    <option value="Growth Hacking">Growth Hacking</option>
                    <option value="תהליכי מכירה">תהליכי מכירה</option>
                    <option value="ליווי והטמעת AI">ליווי והטמעת AI</option>
                    <option value="משהו אחר">משהו אחר</option>
                  </select>
                </div>
              )}
              <div className="exit-popup-consent">
                <input type="checkbox" id="popup-consent" required />
                <label htmlFor="popup-consent">
                  אני מסכים ל<a href="/privacy" target="_blank">מדיניות הפרטיות</a> ול<a href="/privacy" target="_blank">תנאי השימוש</a>
                </label>
              </div>
              <button type="submit" className="exit-popup-cta">
                {isGeo ? 'קבלו אבחון GEO חינם ←' : 'שלח עכשיו ←'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

// Focused single-goal landing pages where the global lead popup would compete
// with the page's own conversion goal, suppress it there.
const DISABLED_PATHS = ['/startups/readiness'];

export default function ExitPopup() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();
  const isGeo = pathname === '/ai-checker';

  useEffect(() => {
    if (DISABLED_PATHS.includes(pathname)) return;

    let dismissed = false;
    try {
      const at = Number(localStorage.getItem(STORAGE_KEY) || 0);
      dismissed = at > 0 && Date.now() - at < COOLDOWN_MS;
    } catch (_e) { /* noop */ }
    if (dismissed) return;

    const timer = setTimeout(() => {
      setShow(true);
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, [pathname]);

  const dismiss = () => {
    setShow(false);
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch (_e) { /* noop */ }
  };

  // Always render a hidden marker so we know the component mounted
  return (
    <>
      <div data-exit-popup="mounted" style={{ display: 'none' }} />
      {show && <PopupContent onDismiss={dismiss} isGeo={isGeo} />}
    </>
  );
}
