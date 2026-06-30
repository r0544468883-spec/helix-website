'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SITE } from '@/lib/site';

const DELAY_MS = 5 * 1000; // TEMP 5s for testing
const STORAGE_KEY = 'helix-popup-dismissed';

function PopupContent({ onDismiss }: { onDismiss: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', interest: '' });

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onDismiss]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `שלום, השארתי פרטים באתר helix.co.il\nשם: ${form.name}\nטלפון: ${form.phone}\nמעניין אותי: ${form.interest || 'לא צוין'}`;
    window.open(`https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
    setSubmitted(true);
    setTimeout(onDismiss, 2000);
  };

  return createPortal(
    <div className="exit-popup-overlay" onClick={(e) => { if (e.target === e.currentTarget) onDismiss(); }}>
      <div className="exit-popup-card">
        <button className="exit-popup-close" onClick={onDismiss}>✕</button>
        <div className="exit-popup-badge">ייעוץ חינם</div>

        {submitted ? (
          <div className="exit-popup-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>✓</div>
            <h3 className="exit-popup-title">תודה!</h3>
            <p className="exit-popup-sub">נחזור אליכם תוך 30 דקות בימי עסקים.</p>
          </div>
        ) : (
          <>
            <div className="exit-popup-header">
              <div className="exit-popup-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <h3 className="exit-popup-title">רגע לפני שאתם הולכים — קבלו ייעוץ חינם</h3>
              <p className="exit-popup-sub">השאירו פרטים ונחזור אליכם תוך 30 דקות בימי עסקים</p>
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
              <div className="exit-popup-field">
                <label>מה מעניין אתכם? (אופציונלי)</label>
                <select value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })}>
                  <option value="">בחרו תחום</option>
                  <option value="שיווק דיגיטלי">שיווק דיגיטלי</option>
                  <option value="בניית אתר">בניית אתר</option>
                  <option value="אוטומציות וסוכני AI">אוטומציות וסוכני AI</option>
                  <option value="Growth Hacking">Growth Hacking</option>
                  <option value="תהליכי מכירה">תהליכי מכירה</option>
                  <option value="פיתוח">פיתוח</option>
                  <option value="משהו אחר">משהו אחר</option>
                </select>
              </div>
              <div className="exit-popup-consent">
                <input type="checkbox" id="popup-consent" required />
                <label htmlFor="popup-consent">
                  אני מסכים ל<a href="/privacy" target="_blank">מדיניות הפרטיות</a> ול<a href="/privacy" target="_blank">תנאי השימוש</a>
                </label>
              </div>
              <button type="submit" className="exit-popup-cta">שלח עכשיו ←</button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

export default function ExitPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Debug: confirm useEffect runs
    console.log('[ExitPopup] useEffect fired, DELAY_MS:', DELAY_MS);

    let dismissed = false;
    try { dismissed = sessionStorage.getItem(STORAGE_KEY) === '1'; } catch (_e) { /* noop */ }

    console.log('[ExitPopup] dismissed:', dismissed);
    if (dismissed) return;

    const timer = setTimeout(() => {
      console.log('[ExitPopup] SHOWING POPUP NOW');
      setShow(true);
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setShow(false);
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (_e) { /* noop */ }
  };

  // Always render a hidden marker so we know the component mounted
  return (
    <>
      <div data-exit-popup="mounted" style={{ display: 'none' }} />
      {show && <PopupContent onDismiss={dismiss} />}
    </>
  );
}
