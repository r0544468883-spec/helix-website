'use client';

import { useState, type FormEvent } from 'react';
import { SITE } from '@/lib/site';

const PDF_URL = '/guides/chatgpt-ads-guide.pdf';
const PDF_NAME = 'הליקס - מדריך לממומן ב-ChatGPT.pdf';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Name + business field + email -> capture lead via the shared /api/content-lead
// endpoint (notifies HELIX, no nurture sequence, no spam) -> download the PDF as a
// blob (forces a real download with the correct Hebrew filename, instead of the
// browser opening the PDF inline).
export default function GuideLeadClient() {
  const [name, setName] = useState('');
  const [business, setBusiness] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState(''); // honeypot
  const [marketing, setMarketing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [captured, setCaptured] = useState(true);
  const [error, setError] = useState('');

  function downloadPdf() {
    // The server sends Content-Disposition: attachment + the Hebrew filename
    // (next.config headers), so a plain same-origin navigation downloads the
    // correct file with the correct name in every browser. No blob, no UUID name.
    const a = document.createElement('a');
    a.href = PDF_URL;
    a.download = PDF_NAME; // hint; the server header is what actually forces it
    document.body.appendChild(a);
    a.click();
    setTimeout(() => a.remove(), 1500);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('נשמח לדעת איך קוראים לכם'); return; }
    if (!business.trim()) { setError('מה תחום העיסוק שלכם?'); return; }
    if (!EMAIL_RE.test(email)) { setError('נראה שהאימייל לא תקין, בדקו רגע'); return; }

    setStatus('loading');
    // Best-effort lead capture; never block the download on our own notification.
    // But we do not ignore the answer: /api/content-lead is rate limited, so a 429
    // is reachable, and this is the richest lead on the site. If it did not land we
    // still hand over the guide and say so, instead of promising a follow-up
    // that will never happen.
    let ok = true;
    try {
      const r = await fetch('/api/content-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          company, // honeypot
          source: '/guides/chatgpt-ads',
          details: { 'תחום עיסוק': business, 'הסכמה לתוכן שיווקי': marketing ? 'כן' : 'לא' },
        }),
      });
      ok = r.ok;
    } catch {
      ok = false; // network died, still give them the guide
    }
    setCaptured(ok);

    try {
      await downloadPdf();
    } catch {
      /* fall back to a plain link in the success state */
    }
    setStatus('done');
  }

  if (status === 'done') {
    return (
      <div className="guide-cta-done" dir="rtl">
        <p className="guide-done-title">המדריך בדרך אליכם 💚</p>
        <p className="guide-done-sub">
          ההורדה התחילה אוטומטית. לא התחילה?{' '}
          <a href={PDF_URL} download={PDF_NAME} className="guide-done-link">להורדה ידנית לחצו כאן</a>.
        </p>
        {!captured && (
          <p className="guide-form-error">
            הפרטים שלכם לא הגיעו אלינו. המדריך שלכם בכל מקרה, ואם תרצו שנחזור אליכם כתבו לנו ל-{SITE.email}.
          </p>
        )}
        <p className="guide-nospam">מייל אחד עם המדריך. אפס ספאם.</p>
      </div>
    );
  }

  return (
    <form className="guide-form" onSubmit={onSubmit} dir="rtl">
      {/* honeypot, hidden from humans */}
      <input
        type="text" name="company" tabIndex={-1} autoComplete="off"
        value={company} onChange={(e) => setCompany(e.target.value)}
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
        aria-hidden="true"
      />
      <div className="guide-form-two">
        <input
          type="text" name="name" autoComplete="name" placeholder="השם שלכם"
          aria-label="שם" value={name} onChange={(e) => setName(e.target.value)} required
        />
        <input
          type="text" name="business" placeholder="תחום העיסוק שלכם"
          aria-label="תחום עיסוק" value={business} onChange={(e) => setBusiness(e.target.value)} required
        />
      </div>
      <div className="guide-form-row">
        <input
          type="email" name="email" inputMode="email" autoComplete="email"
          placeholder="האימייל שלכם" aria-label="כתובת אימייל"
          value={email} onChange={(e) => setEmail(e.target.value)} required
        />
        <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
          {status === 'loading' ? 'שולח...' : 'שלחו לי את המדריך'}
        </button>
      </div>
      <label className="guide-consent">
        <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
        <span>אשמח לקבל מ-HELIX תוכן שיווקי, טיפים ועדכונים.</span>
      </label>
      <p className="guide-legal">אנחנו לא מספימים, אבל החוק מחייב אותנו לשאול :-)</p>
      {error && <p className="guide-form-error">{error}</p>}
      <p className="guide-nospam">מייל אחד עם המדריך. אפס ספאם, אפס שטויות.</p>
    </form>
  );
}
