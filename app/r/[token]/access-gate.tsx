'use client';

// Client access screen for a gated GEO report. The visitor enters the per-report
// code; on success the server sets a signed session cookie and we reload into the
// report. Mirrors the /portal code-entry UX.

import { useState } from 'react';
import styles from '../report.module.css';

export default function AccessGate({ token, business }: { token: string; business: string }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/geo-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, code: code.trim() }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        setError('קוד שגוי. בדקו ונסו שוב.');
        setBusy(false);
      }
    } catch {
      setError('שגיאת חיבור, נסו שוב.');
      setBusy(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.gate}>
        <div className={styles.gateCard}>
          <span className={styles.gateKick}>דוח נראות ב-AI · HELIX</span>
          <h1>האזור האישי של {business}</h1>
          <p>הזינו את קוד הגישה שקיבלתם כדי לצפות בדוח הנראות שלכם במנועי ה-AI.</p>
          <form onSubmit={submit}>
            <input
              className={styles.gateInput}
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="קוד גישה"
              dir="ltr"
              autoFocus
            />
            <button className={styles.gateBtn} type="submit" disabled={busy}>
              {busy ? 'בודק...' : 'כניסה לדוח'}
            </button>
          </form>
          {error && <div className={styles.gateError}>{error}</div>}
        </div>
      </div>
    </main>
  );
}
