'use client';

import { useRef, useState } from 'react';
import { requestSignInLink } from '@/app/auth-actions';
import { withTimeout } from '@/lib/use-status-change';

type Props = {
  locale: string;
  labels: {
    emailPlaceholder: string;
    button: string;
    sending: string;
    sent: string;
    error: string;
    timeout: string;
  };
};

/**
 * "Send me a sign-in link". The CRM makes the link and emails it (app/auth-actions.ts),
 * so it opens on any device; the server's answer is shown as it comes: not invited,
 * too soon, a limit, or a send that failed. The typed address stays on any failure.
 */
export default function MagicLinkForm({ locale, labels }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const inFlight = useRef(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) || inFlight.current) return;
    inFlight.current = true;
    setStatus('sending');
    setMessage(null);
    try {
      const res = await withTimeout(requestSignInLink({ email: trimmed, locale }));
      if ('ok' in res && res.ok) return setStatus('sent');
      setMessage('error' in res && res.error === 'timeout' ? labels.timeout : 'message' in res ? res.message : labels.error);
      setStatus('error');
    } catch {
      setMessage(labels.error);
      setStatus('error');
    } finally {
      inFlight.current = false;
    }
  }

  if (status === 'sent') {
    return (
      <p role="status" className="text-brand-ink font-semibold text-[15px] text-center max-w-xs">{labels.sent}</p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 w-full max-w-xs">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={labels.emailPlaceholder}
        aria-label={labels.emailPlaceholder}
        dir="ltr"
        className="w-full bg-surface border border-border rounded-[10px] px-4 py-3 text-[15px] outline-none focus:border-brand transition-colors text-center"
      />
      <button
        type="submit"
        disabled={status === 'sending'}
        className="cta-glow bg-brand hover:bg-brand-hover disabled:opacity-50 text-on-brand font-bold px-5 py-3 rounded-[10px]"
      >
        {status === 'sending' ? labels.sending : labels.button}
      </button>
      {status === 'error' && message && (
        <p role="alert" className="text-danger text-[13px] text-center">{message}</p>
      )}
    </form>
  );
}
