'use client';

import { useState, type FormEvent } from 'react';

export default function NewsletterForm() {
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: wire to a real provider (ConvertKit / Mailchimp / Beehiiv) — Phase 2.5
    setStatus('success');
    (e.currentTarget as HTMLFormElement).reset();
  };

  if (status === 'success') {
    return (
      <p className="newsletter-success">
        תודה! בקרוב תקבל אישור באימייל.
      </p>
    );
  }

  return (
    <form className="newsletter-form" onSubmit={onSubmit}>
      <input
        type="email"
        name="email"
        placeholder="האימייל שלך"
        autoComplete="email"
        required
        aria-label="כתובת אימייל"
      />
      <button type="submit">הירשם</button>
    </form>
  );
}
