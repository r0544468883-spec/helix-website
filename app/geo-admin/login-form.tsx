'use client';

import { useState } from 'react';
import styles from './admin.module.css';

export default function LoginForm() {
  const [key, setKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/geo-admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: key.trim() }),
      });
      const data = (await res.json().catch(() => ({ ok: false }))) as { ok?: boolean };
      if (res.ok && data.ok) {
        window.location.reload();
      } else {
        setError('מפתח שגוי, נסו שוב.');
        setBusy(false);
      }
    } catch {
      setError('שגיאה בחיבור, נסו שוב.');
      setBusy(false);
    }
  }

  return (
    <div className={styles.login}>
      <form className={styles.loginCard} onSubmit={submit}>
        <h1>הזינו מפתח גישה</h1>
        <label className={styles.field}>
          <input
            className={styles.input}
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="מפתח גישה"
            autoComplete="off"
            autoFocus
          />
        </label>
        <button className={styles.btn} type="submit" disabled={busy}>
          {busy ? 'בודק...' : 'כניסה'}
        </button>
        {error && <div className={styles.errorMsg}>{error}</div>}
      </form>
    </div>
  );
}
