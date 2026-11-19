'use client';

import { useState, type FormEvent } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// UNGATED guide download. The guide is a cold-audience trust + distribution asset, so we do
// NOT gate it behind a form: anyone can download free with one click. Lead capture happens
// downstream on the personalized GEO check (/ai-checker), where an email is actually earned.
// We still OFFER an optional email copy here for those who want it (never required), and after
// the download we surface the community as an opt-in next step for people who skip the check.
// Reusable across every guide: pass the guide's pdfUrl, pdfName and lead source.
export default function GuideLeadClient({
  pdfUrl,
  pdfName,
  source,
  community,
}: {
  pdfUrl: string;
  pdfName: string;
  source: string;
  /** Optional community invite shown on the success screen — an opt-in next step, never a gate. */
  community?: { heading: string; sub: string; ctaLabel: string; url: string };
}) {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState(''); // honeypot
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [emailed, setEmailed] = useState(false);
  const [error, setError] = useState('');

  function downloadPdf() {
    // The server sends Content-Disposition: attachment + the Hebrew filename
    // (next.config headers), so a plain same-origin navigation downloads the
    // correct file with the correct name in every browser. No blob, no UUID name.
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = pdfName; // hint; the server header is what actually forces it
    document.body.appendChild(a);
    a.click();
    setTimeout(() => a.remove(), 1500);
  }

  // Free path: download immediately, no details.
  function freeDownload() {
    downloadPdf();
    setStatus('done');
  }

  // Optional path: leave an email to also get a copy (best-effort capture), then download.
  async function emailAndDownload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    if (!EMAIL_RE.test(email)) {
      setError('נראה שהאימייל לא תקין, בדקו רגע');
      return;
    }
    setStatus('loading');
    try {
      await fetch('/api/content-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company /* honeypot */, source }),
      });
    } catch {
      /* ignore, still give them the guide */
    }
    setEmailed(true);
    downloadPdf();
    setStatus('done');
  }

  if (status === 'done') {
    return (
      <div className="guide-cta-done" dir="rtl">
        <p className="guide-done-title">המדריך ירד אליכם 💚</p>
        <p className="guide-done-sub">
          ההורדה התחילה. לא התחילה?{' '}
          <a href={pdfUrl} download={pdfName} className="guide-done-link">להורדה ידנית לחצו כאן</a>.
          {emailed && ' שלחנו עותק גם למייל.'}
        </p>
        {community && (
          <div className="guide-done-community">
            <p className="guide-done-community-head">{community.heading}</p>
            <p className="guide-done-sub">{community.sub}</p>
            <a className="guide-wa" href={community.url} target="_blank" rel="noopener noreferrer">
              {community.ctaLabel}
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="guide-ungated" dir="rtl">
      <button type="button" className="btn btn-primary guide-download-btn" onClick={freeDownload}>
        הורידו עכשיו, חינם (PDF)
      </button>
      <p className="guide-nospam">בלי להשאיר פרטים, בלי ספאם.</p>

      <form className="guide-optional-email" onSubmit={emailAndDownload}>
        {/* honeypot, hidden from humans */}
        <input
          type="text" name="company" tabIndex={-1} autoComplete="off"
          value={company} onChange={(e) => setCompany(e.target.value)}
          style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
          aria-hidden="true"
        />
        <span className="guide-optional-label">רוצים עותק גם למייל? (לא חובה)</span>
        <div className="guide-form-row">
          <input
            type="email" name="email" inputMode="email" autoComplete="email"
            placeholder="האימייל שלכם" aria-label="כתובת אימייל"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="btn btn-ghost" disabled={status === 'loading'}>
            {status === 'loading' ? 'שולח...' : 'שלחו גם למייל'}
          </button>
        </div>
        {error && <p className="guide-form-error">{error}</p>}
      </form>
    </div>
  );
}
