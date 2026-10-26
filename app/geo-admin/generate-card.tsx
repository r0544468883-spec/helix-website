'use client';

import { useState } from 'react';
import styles from './admin.module.css';

export default function GenerateCard() {
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [locations, setLocations] = useState('');
  const [country, setCountry] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [session, setSession] = useState<{
    measuredEngines: string[];
    totalEngines: string[];
    complete: boolean;
  } | null>(null);

  const ENGINE_HE: Record<string, string> = {
    claude: 'Claude',
    openai: 'ChatGPT',
    gemini: 'Gemini',
    'google-aio': 'AI Overview',
  };

  async function run(fresh = false) {
    if (!url.trim() || busy) return;
    setBusy(true);
    setError('');
    setLink('');
    setSession(null);
    setCopied(false);

    const comps = competitors.split(',').map((c) => c.trim()).filter(Boolean);
    const cities = locations.split(',').map((c) => c.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/geo-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          category: category.trim() || undefined,
          locations: cities.length > 0 ? cities : undefined,
          country: country.trim() || undefined,
          competitors: comps.length > 0 ? comps : undefined,
          fresh: fresh || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({ ok: false }))) as {
        ok?: boolean;
        url?: string;
        sessionStatus?: { measuredEngines: string[]; totalEngines: string[]; complete: boolean };
      };
      if (res.ok && data.ok && data.url) {
        setLink(`${window.location.origin}${data.url}`);
        setSession(data.sessionStatus ?? null);
      } else {
        setError('הפקת הדוח נכשלה. בדקו את הכתובת ונסו שוב.');
      }
    } catch {
      setError('שגיאה בחיבור, נסו שוב.');
    } finally {
      setBusy(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    void run(false);
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
          <span className={styles.label}>ערים / אזורי שירות (לא חובה, מופרדים בפסיק)</span>
          <input
            className={styles.input}
            type="text"
            value={locations}
            onChange={(e) => setLocations(e.target.value)}
            placeholder="לדוגמה: תל אביב, רמת גן, גבעתיים"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>מדינה (לא חובה)</span>
          <input
            className={styles.input}
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="ברירת מחדל: ישראל"
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

          {session && (
            <div className={styles.sessionBox}>
              {session.complete ? (
                <>
                  <div className={styles.sessionDone}>
                    ✓ הדוח מלא — כל {session.totalEngines.length} המנועים נמדדו.
                  </div>
                  <div className={styles.sessionHint}>
                    רוצה למדוד מחדש מאפס (שאלות חדשות)?
                  </div>
                  <button type="button" className={styles.btnGhost} disabled={busy} onClick={() => run(true)}>
                    {busy ? 'מריץ...' : 'דוח חדש (מדידה טרייה)'}
                  </button>
                </>
              ) : (
                <>
                  <div className={styles.sessionPartial}>
                    דוח חלקי: נמדדו {session.measuredEngines.map((e) => ENGINE_HE[e] ?? e).join(', ') || 'אף מנוע'}{' '}
                    ({session.measuredEngines.length}/{session.totalEngines.length} מנועים).
                  </div>
                  <div className={styles.sessionHint}>
                    מנועים נכשלו (עומס/מכסה). הרץ שוב כדי להשלים — רק החסרים יימדדו, והתוצאות יצטרפו.
                  </div>
                  <button type="button" className={styles.btn} disabled={busy} onClick={() => run(false)}>
                    {busy ? 'מריץ...' : 'הרץ שוב להשלמה'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
