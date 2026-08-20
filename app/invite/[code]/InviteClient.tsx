'use client';

import { useEffect, useRef, useState } from 'react';

// Landing for a HELIX share link. Logs the click on mount (attribution, incl. channel),
// then captures the referred visitor's email — that "join" credits the referrer.

const ACCENT = '#10b981';

export default function InviteClient({ code, channel }: { code: string; channel: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'busy' | 'done'>('idle');
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current || !code) return;
    tracked.current = true;
    fetch('/api/referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'track', code, channel }),
    }).catch(() => {});
  }, [code, channel]);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setStatus('busy');
    try {
      await fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', code, email }),
      });
    } catch {
      /* best-effort */
    }
    setStatus('done');
  }

  if (status === 'done') {
    return (
      <p style={{ color: ACCENT, fontSize: 16, fontWeight: 600, textAlign: 'center' }}>
        תודה! נהיה בקשר בקרוב. 🚀
      </p>
    );
  }

  return (
    <form onSubmit={join} style={{ display: 'flex', gap: 8, maxWidth: 420, margin: '0 auto', width: '100%' }}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="האימייל שלכם"
        aria-label="כתובת אימייל"
        style={{
          flex: 1,
          padding: '12px 14px',
          borderRadius: 10,
          border: '1px solid #ffffff22',
          background: '#0f172a',
          color: '#fff',
          fontSize: 15,
        }}
      />
      <button
        type="submit"
        disabled={status === 'busy'}
        style={{
          padding: '12px 20px',
          borderRadius: 10,
          border: 'none',
          background: ACCENT,
          color: '#04150e',
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
          opacity: status === 'busy' ? 0.6 : 1,
        }}
      >
        {status === 'busy' ? '...' : 'הצטרפו'}
      </button>
    </form>
  );
}
