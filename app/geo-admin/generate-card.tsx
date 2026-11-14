'use client';

import { useState } from 'react';
import styles from './admin.module.css';
import { BUSINESS_TYPE_OPTIONS, type BusinessType } from '@/lib/geo-types';

export default function GenerateCard() {
  const [url, setUrl] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType | ''>('');
  const [category, setCategory] = useState('');
  const [people, setPeople] = useState('');
  const [searchPersonLinkedIn, setSearchPersonLinkedIn] = useState(false);
  const [fullPlan, setFullPlan] = useState(false);
  const [locations, setLocations] = useState('');
  const [country, setCountry] = useState('');
  const [competitors, setCompetitors] = useState('');
  // Optional first-party ChatGPT Business Hub numbers (manual, from the Hub dashboard).
  const [showHub, setShowHub] = useState(false);
  const [hubWindow, setHubWindow] = useState<7 | 28>(28);
  const [hubPullDate, setHubPullDate] = useState('');
  const [hubMentions, setHubMentions] = useState('');
  const [hubProfileViews, setHubProfileViews] = useState('');
  const [hubClicks, setHubClicks] = useState('');
  const [hubTopics, setHubTopics] = useState(''); // one "נושא:אחוז" per line
  const [hubNote, setHubNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [link, setLink] = useState('');
  const [accessCode, setAccessCode] = useState('');
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
    setAccessCode('');
    setSession(null);
    setCopied(false);

    const comps = competitors.split(',').map((c) => c.trim()).filter(Boolean);
    const cities = locations.split(',').map((c) => c.trim()).filter(Boolean);
    const peopleList = people.split(',').map((p) => p.trim()).filter(Boolean);

    // Optional Business Hub numbers. Empty field -> null (blank, NOT zero).
    const toNum = (s: string): number | null => {
      const n = parseInt(s.replace(/[^0-9]/g, ''), 10);
      return Number.isFinite(n) ? n : null;
    };
    const topics = hubTopics
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const m = l.match(/^(.*?)[:\-]\s*(\d+(?:\.\d+)?)\s*%?$/);
        return m ? { label: m[1].trim(), share: parseFloat(m[2]) } : { label: l };
      });
    const hubFilled =
      !!hubMentions.trim() || !!hubProfileViews.trim() || !!hubClicks.trim() || topics.length > 0;
    const officialHubData = hubFilled
      ? {
          windowDays: hubWindow,
          pullDate: hubPullDate || undefined,
          mentions: toNum(hubMentions),
          profileViews: toNum(hubProfileViews),
          websiteClicks: toNum(hubClicks),
          discoveryTopics: topics,
          note: hubNote.trim() || undefined,
        }
      : undefined;

    try {
      const res = await fetch('/api/geo-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          businessType: businessType || undefined,
          category: category.trim() || undefined,
          people: peopleList.length > 0 ? peopleList : undefined,
          searchPersonLinkedIn: searchPersonLinkedIn || undefined,
          fullPlan: fullPlan || undefined,
          locations: cities.length > 0 ? cities : undefined,
          country: country.trim() || undefined,
          competitors: comps.length > 0 ? comps : undefined,
          officialHubData,
          fresh: fresh || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({ ok: false }))) as {
        ok?: boolean;
        url?: string;
        accessCode?: string;
        sessionStatus?: { measuredEngines: string[]; totalEngines: string[]; complete: boolean };
      };
      if (res.ok && data.ok && data.url) {
        setLink(`${window.location.origin}${data.url}`);
        setAccessCode(data.accessCode ?? '');
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
          <span className={styles.label}>סוג העסק (לא חובה, אך מדייק מאוד את השאלות)</span>
          <select
            className={styles.input}
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value as BusinessType | '')}
          >
            <option value="">זיהוי אוטומטי</option>
            {BUSINESS_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
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
        <label className={styles.field}>
          <span className={styles.label}>
            שמות אנשים / צוות (לא חובה, מופרדים בפסיק)
          </span>
          <input
            className={styles.input}
            type="text"
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            placeholder="איתי חכמון, Itay Hacmon"
          />
          <span className={styles.hint}>
            אם המותג מזוהה עם אדם (מייסד / מוביל), ה-AI לרוב מצטט אותו בשם ולא את שם
            החברה. הזינו שם בעברית ובאנגלית כדי שהבדיקה תספור גם אותו. תזכורת: שאלו את
            הלקוח אם יש עוד עובדים פעילים ברשתות והוסיפו גם אותם.
          </span>
        </label>
        <label className={styles.checkField}>
          <input
            type="checkbox"
            checked={searchPersonLinkedIn}
            onChange={(e) => setSearchPersonLinkedIn(e.target.checked)}
          />
          <span>
            חפש כל אדם מהרשימה גם בלינקדאין (פר מנוע). מריץ חיפוש נוסף לכל שם — הדליקו רק
            כשרלוונטי.
          </span>
        </label>
        <label className={styles.checkField}>
          <input type="checkbox" checked={fullPlan} onChange={(e) => setFullPlan(e.target.checked)} />
          <span>
            לקוח משלם — הצג לו את תוכנית ה-90 יום המלאה (בלי טעימה/הצעת מכירה).
          </span>
        </label>
        <label className={styles.checkField}>
          <input type="checkbox" checked={showHub} onChange={(e) => setShowHub(e.target.checked)} />
          <span>הזן נתוני ChatGPT Business Hub ידנית (לא חובה) — מספרים מהדשבורד הרשמי.</span>
        </label>
        {showHub && (
          <div
            style={{
              display: 'grid',
              gap: 10,
              padding: 12,
              border: '1px solid #2a3a33',
              borderRadius: 10,
              marginBottom: 12,
            }}
          >
            <label className={styles.field}>
              <span className={styles.label}>חלון דיווח</span>
              <select
                className={styles.input}
                value={hubWindow}
                onChange={(e) => setHubWindow(Number(e.target.value) === 7 ? 7 : 28)}
              >
                <option value={28}>28 יום</option>
                <option value={7}>7 יום</option>
              </select>
            </label>
            <label className={styles.field}>
              <span className={styles.label}>תאריך שליפה מהדשבורד</span>
              <input
                className={styles.input}
                type="date"
                value={hubPullDate}
                onChange={(e) => setHubPullDate(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>זכירות (ריק = אין נתון, לא אפס)</span>
              <input
                className={styles.input}
                type="text"
                inputMode="numeric"
                value={hubMentions}
                onChange={(e) => setHubMentions(e.target.value)}
                placeholder="למשל 1834"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>צפיות בפרופיל</span>
              <input
                className={styles.input}
                type="text"
                inputMode="numeric"
                value={hubProfileViews}
                onChange={(e) => setHubProfileViews(e.target.value)}
                placeholder="למשל 1234"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>קליקים לאתר</span>
              <input
                className={styles.input}
                type="text"
                inputMode="numeric"
                value={hubClicks}
                onChange={(e) => setHubClicks(e.target.value)}
                placeholder="למשל 12"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>נושאי גילוי (שורה לכל נושא, בפורמט שם:אחוז)</span>
              <textarea
                className={styles.input}
                rows={3}
                value={hubTopics}
                onChange={(e) => setHubTopics(e.target.value)}
                placeholder={'קורס שיווק:43\nמנעולן בבת ים:20'}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>הערה (לא חובה)</span>
              <input
                className={styles.input}
                type="text"
                value={hubNote}
                onChange={(e) => setHubNote(e.target.value)}
              />
            </label>
          </div>
        )}
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
          {accessCode && (
            <div className={styles.codeBox}>
              קוד גישה ללקוח: <strong>{accessCode}</strong>
              <span className={styles.codeHint}>
                שלחו ללקוח את הקישור + הקוד. הוא יכניס אותו כדי לראות את הדוח.
              </span>
            </div>
          )}

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
