'use client';

import { useState, type FormEvent } from 'react';

const PDF_URL = '/guides/chatgpt-ads-guide.pdf';
const PDF_NAME = 'מדריך פרסום ב-ChatGPT - HELIX.pdf';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Email -> capture lead via the shared /api/content-lead endpoint (notifies HELIX,
// no nurture sequence, no spam) -> download the PDF immediately.
export default function GuideLeadClient() {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState(''); // honeypot
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [error, setError] = useState('');

  function triggerDownload() {
    const a = document.createElement('a');
    a.href = PDF_URL;
    a.download = PDF_NAME;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    if (!EMAIL_RE.test(email)) {
      setError('נראה שהאימייל לא תקין, בדקו רגע');
      return;
    }
    setStatus('loading');
    // Best-effort lead capture; never block the download on our own notification.
    try {
      await fetch('/api/content-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company, source: '/guides/chatgpt-ads' }),
      });
    } catch {
      /* ignore, still give them the guide */
    }
    setStatus('done');
    triggerDownload();
  }

  if (status === 'done') {
    return (
      <div className="guide-cta-done" dir="rtl">
        <p className="guide-done-title">המדריך בדרך אליכם 💚</p>
        <p className="guide-done-sub">
          ההורדה התחילה אוטומטית. לא התחילה?{' '}
          <a href={PDF_URL} download={PDF_NAME} className="guide-done-link">להורדה ידנית לחצו כאן</a>.
        </p>
        <p className="guide-nospam">מייל אחד עם המדריך. אפס ספאם.</p>
      </div>
    );
  }

  return (
    <form className="guide-form" onSubmit={onSubmit} dir="rtl">
      {/* honeypot, hidden from humans */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
        aria-hidden="true"
      />
      <div className="guide-form-row">
        <input
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          placeholder="האימייל שלכם"
          aria-label="כתובת אימייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
          {status === 'loading' ? 'שולח...' : 'שלחו לי את המדריך'}
        </button>
      </div>
      {error && <p className="guide-form-error">{error}</p>}
      <p className="guide-nospam">מייל אחד עם המדריך. אפס ספאם, אפס שטויות.</p>
    </form>
  );
}
