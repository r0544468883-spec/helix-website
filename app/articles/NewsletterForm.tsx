'use client';

import { useState, type FormEvent } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

// Newsletter signups go to the shared /api/content-lead endpoint (persists to
// Supabase, then mails HELIX). No ESP yet, so the list lives in content_leads
// and Eran sends the article mail himself.
export default function NewsletterForm() {
  const [status, setStatus] = useState<Status>('idle');

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'loading') return;

    // currentTarget is nulled once the handler returns, so grab the form first.
    const el = e.currentTarget;
    const data = new FormData(el);
    const email = String(data.get('email') ?? '').trim();
    const company = String(data.get('company') ?? ''); // honeypot

    setStatus('loading');
    try {
      const res = await fetch('/api/content-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company, source: 'newsletter' }),
      });
      const payload = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !payload.ok) {
        setStatus('error');
        return;
      }
      setStatus('success');
      el.reset();
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <p className="newsletter-success">
        תודה, רשמנו אותך. המאמר הבא יגיע לאימייל.
      </p>
    );
  }

  return (
    <>
      <form className="newsletter-form" onSubmit={onSubmit}>
        {/* Honeypot */}
        <input type="text" name="company" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

        <input
          type="email"
          name="email"
          placeholder="האימייל שלך"
          autoComplete="email"
          required
          aria-label="כתובת אימייל"
        />
        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'שולח…' : 'הירשם'}
        </button>
      </form>
      {status === 'error' && (
        <p role="alert" style={{ marginTop: 12, marginBottom: 0, fontSize: 14, color: '#DC2626' }}>
          משהו השתבש. נסו שוב עוד רגע.
        </p>
      )}
    </>
  );
}
