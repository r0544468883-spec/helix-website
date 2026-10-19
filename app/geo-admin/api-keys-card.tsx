'use client';

import { useEffect, useState } from 'react';
import styles from './admin.module.css';

interface ApiKey {
  id: string;
  label: string;
  createdAt: string;
  maxUsdPerRun: number;
  disabled: boolean;
  lastUsedAt: string | null;
}

function fmtDate(iso: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Example snippets for the 3 self-serve access methods. Kept as plain strings so the
// admin can copy them straight into docs / a client email.
const CURL_ACCESS = `curl "https://helix.co.il/api/geo-access-check?url=example.co.il"`;
const CURL_AUDIT = `curl -X POST "https://helix.co.il/api/v1/audit" \\
  -H "Authorization: Bearer <API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"example.co.il"}'`;

export default function ApiKeysCard() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState('');
  const [maxUsd, setMaxUsd] = useState('5');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [newKey, setNewKey] = useState('');
  const [copied, setCopied] = useState(false);

  async function load() {
    try {
      const res = await fetch('/api/geo-reports/keys');
      const data = (await res.json().catch(() => ({ ok: false }))) as {
        ok?: boolean;
        keys?: ApiKey[];
      };
      if (res.ok && data.ok && Array.isArray(data.keys)) setKeys(data.keys);
    } catch {
      // network error, leave the list empty
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || busy) return;
    setBusy(true);
    setError('');
    setNewKey('');
    setCopied(false);

    const cap = Number(maxUsd);
    try {
      const res = await fetch('/api/geo-reports/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: label.trim(),
          maxUsdPerRun: Number.isFinite(cap) && cap > 0 ? cap : undefined,
        }),
      });
      const data = (await res.json().catch(() => ({ ok: false }))) as {
        ok?: boolean;
        key?: string;
      };
      if (res.ok && data.ok && data.key) {
        setNewKey(data.key);
        setLabel('');
        load();
      } else {
        setError('יצירת המפתח נכשלה. נסו שוב.');
      }
    } catch {
      setError('שגיאה בחיבור, נסו שוב.');
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked, ignore
    }
  }

  return (
    <section className={styles.card}>
      <h2 className={styles.cardHead}>מפתחי API וגישת מפתחים</h2>

      <form onSubmit={submit}>
        <label className={styles.field}>
          <span className={styles.label}>שם המפתח (למי הוא שייך)</span>
          <input
            className={styles.input}
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="לדוגמה: סוכנות X"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>תקרת עלות להרצה (דולר)</span>
          <input
            className={styles.input}
            type="number"
            min="0"
            step="0.5"
            value={maxUsd}
            onChange={(e) => setMaxUsd(e.target.value)}
            placeholder="5"
            dir="ltr"
          />
        </label>
        <button className={styles.btn} type="submit" disabled={busy}>
          {busy ? 'יוצר...' : 'צור מפתח'}
        </button>
      </form>

      {error && <div className={styles.errorMsg}>{error}</div>}

      {newKey && (
        <div className={styles.result}>
          <div className={styles.warn}>
            שמרו את המפתח עכשיו, הוא מוצג פעם אחת בלבד ולא יוצג שוב. אנחנו שומרים רק גיבוב (hash) שלו.
          </div>
          <code className={styles.keyValue}>{newKey}</code>
          <div className={styles.resultActions}>
            <button type="button" className={styles.btnGhost} onClick={copy}>
              {copied ? 'הועתק' : 'העתק'}
            </button>
          </div>
        </div>
      )}

      {/* existing keys */}
      <div className={styles.tableWrap} style={{ marginTop: 24 }}>
        <table className={styles.tbl}>
          <thead>
            <tr>
              <th>שם</th>
              <th>נוצר</th>
              <th>תקרה ($)</th>
              <th>שימוש אחרון</th>
              <th>סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className={styles.empty}>
                  טוען...
                </td>
              </tr>
            ) : keys.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.empty}>
                  עדיין אין מפתחות.
                </td>
              </tr>
            ) : (
              keys.map((k) => (
                <tr key={k.id}>
                  <td className={styles.brandCell}>{k.label}</td>
                  <td>{fmtDate(k.createdAt)}</td>
                  <td>{k.maxUsdPerRun}</td>
                  <td>{fmtDate(k.lastUsedAt)}</td>
                  <td>
                    {k.disabled ? (
                      <span className={styles.disabledTag}>מושבת</span>
                    ) : (
                      <span className={styles.sharedTag}>פעיל</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* usage */}
      <div className={styles.usage}>
        <div className={styles.usageHead}>דרכים לשימוש</div>
        <p className={styles.usageNote}>
          שלוש דרכים להריץ את הבדיקה: GitHub Action שרץ בכל דחיפה, שורת פקודה (CLI) דרך npx,
          או קריאה ישירה ל-API. בדיקת הגישה חינמית ולא דורשת מפתח. הדוח המלא דורש מפתח.
        </p>

        <div className={styles.snippetLabel}>בדיקת גישה חינמית (curl, בלי מפתח)</div>
        <pre className={styles.snippet}>{CURL_ACCESS}</pre>

        <div className={styles.snippetLabel}>CLI (npx)</div>
        <pre className={styles.snippet}>npx helix-geo access example.co.il</pre>

        <div className={styles.snippetLabel}>API מלא (curl, עם מפתח)</div>
        <pre className={styles.snippet}>{CURL_AUDIT}</pre>
      </div>
    </section>
  );
}
