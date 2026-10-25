'use client';

import { useState } from 'react';
import styles from './admin.module.css';

export default function GenerateCard() {
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || busy) return;
    setBusy(true);
    setError('');
    setLink('');
    setCopied(false);

    const comps = competitors
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/geo-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          category: category.trim() || undefined,
          location: location.trim() || undefined,
          competitors: comps.length > 0 ? comps : undefined,
        }),
      });
      const data = (await res.json().catch(() => ({ ok: false }))) as {
        ok?: boolean;
        url?: string;
      };
      if (res.ok && data.ok && data.url) {
        setLink(`${window.location.origin}${data.url}`);
      } else {
        setError('הפקת הדוח נכשלה. בדקו את הכתובת ונסו שוב.');
      }
    } catch {
      setError('שגיאה בחיבור, נסו שוב.');
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked, ignore
    }
  }

  return (
    <section className={styles.card}>
      <h2 className={styles.cardHead}>צור דוח חדש</h2>
      <form onSubmit={submit}>
        <label className={styles.field}>
          <span className={styles.label}>כתובת אתר</span>
          <input
            className={styles.input}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="example.co.il"
            dir="ltr"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>תחום (לא חובה)</span>
          <input
            className={styles.input}
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="לדוגמה: עורכי דין למקרקעין"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>עיר / אזור שירות (לעסק מקומי)</span>
          <input
            className={styles.input}
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="לדוגמה: תל אביב"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>מתחרים (לא חובה, מופרדים בפסיק)</span>
          <input
            className={styles.input}
            type="text"
            value={competitors}
            onChange={(e) => setCompetitors(e.target.value)}
            placeholder="מתחרה א, מתחרה ב"
          />
        </label>
        <button className={styles.btn} type="submit" disabled={busy}>
          {busy ? 'מריץ...' : 'צור דוח'}
        </button>
      </form>

      {busy && <div className={styles.running}>מריץ, זה לוקח 2-3 דקות</div>}
      {error && <div className={styles.errorMsg}>{error}</div>}

      {link && (
        <div className={styles.result}>
          <a className={styles.resultLink} href={link} target="_blank" rel="noreferrer">
            {link}
          </a>
          <div className={styles.resultActions}>
            <button type="button" className={styles.btnGhost} onClick={copy}>
              {copied ? 'הועתק' : 'העתק'}
            </button>
            <a className={styles.btnGhost} href={link} target="_blank" rel="noreferrer">
              פתח
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
