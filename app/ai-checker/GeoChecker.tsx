'use client';

import { useState } from 'react';
import { SITE } from '@/lib/site';
import GeoLeadForm from './GeoLeadForm';

type Status = 'pass' | 'partial' | 'fail';

interface TeaserSignal {
  key: string;
  label: string;
  status: Status;
  detail: string;
}
interface TeaserCategory {
  key: string;
  label: string;
  score: number;
  signals: TeaserSignal[];
}
interface Teaser {
  ok: true;
  ladder: number;
  issuesCount: number;
  business: { name: string };
  categories: TeaserCategory[];
  ai: { available: boolean; appears: boolean; competitorCount: number };
}

interface FullSignal extends TeaserSignal {
  fix?: string;
}
interface FullCategory {
  key: string;
  label: string;
  score: number;
  signals: FullSignal[];
}
interface ProviderVisibility {
  id: string;
  label: string;
  knowsYou: boolean;
  recommendsYou: boolean;
  answer: string;
  competitors: string[];
}
interface Report {
  ladder: number;
  issuesCount: number;
  business: { name: string; category?: string; location?: string };
  categories: FullCategory[];
  visibility: {
    available: boolean;
    appearsAnywhere: boolean;
    competitors: string[];
    providers: ProviderVisibility[];
  };
}

const ERROR_MAP: Record<string, string> = {
  invalid_url: 'הכתובת לא תקינה. נסו שוב (למשל example.co.il).',
  unreachable: 'לא הצלחנו להגיע לאתר. בדקו את הכתובת ונסו שוב.',
  not_html: 'הכתובת לא מחזירה דף אינטרנט תקין.',
  rate_limited: 'יותר מדי בדיקות. המתינו דקה ונסו שוב.',
  scan_failed: 'הסריקה נכשלה. נסו שוב.',
};

function ladderVerdict(n: number): string {
  if (n >= 8) return 'ה-AI מוצא אותך בקלות. יש עוד מה למקסם.';
  if (n >= 5) return 'ה-AI מוצא אותך חלקית — מפספס אותך ברגעים החשובים.';
  return 'ה-AI כמעט לא מוצא אותך. המתחרים מקבלים את הפנייה.';
}

export default function GeoChecker() {
  const [url, setUrl] = useState('');
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const [teaser, setTeaser] = useState<Teaser | null>(null);
  const [report, setReport] = useState<Report | null>(null);

  async function scan(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setPhase('scanning');
    setError('');
    setTeaser(null);
    setReport(null);
    try {
      const res = await fetch('/api/geo-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = (await res.json()) as Teaser | { ok: false; error: string };
      if ('ok' in data && data.ok) {
        setTeaser(data);
        setPhase('done');
      } else {
        setError(ERROR_MAP[(data as { error: string }).error] ?? 'משהו השתבש. נסו שוב.');
        setPhase('error');
      }
    } catch {
      setError('תקלת רשת. נסו שוב.');
      setPhase('error');
    }
  }

  return (
    <section className="geo-tool" id="tool">
      <div className="container">
        <form className="geo-input-row" onSubmit={scan}>
          <input
            type="text"
            className="geo-url-input"
            placeholder="הכניסו כתובת אתר — לדוגמה: example.co.il"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            dir="ltr"
            aria-label="כתובת האתר לבדיקה"
          />
          <button type="submit" className="btn btn-primary geo-scan-btn" disabled={phase === 'scanning'}>
            {phase === 'scanning' ? 'סורק…' : 'בדקו בחינם'}
          </button>
        </form>
        <p className="geo-input-note">ללא הרשמה · תוצאות תוך שניות</p>

        {phase === 'error' && <p className="geo-error">{error}</p>}

        {phase === 'scanning' && (
          <div className="geo-scanning" aria-live="polite">
            <div className="geo-spinner" />
            <p>בודקים אם הבינה המלאכותית מוצאת אותך…</p>
          </div>
        )}

        {phase === 'done' && teaser && (
          <div className="geo-results">
            <TeaserView teaser={teaser} />
            {!report ? (
              <LockedReport url={url} ai={teaser.ai} onUnlock={(r) => setReport(r as Report)} />
            ) : (
              <UnlockedReport report={report} />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function Ladder({ value }: { value: number }) {
  return (
    <div className="geo-ladder" role="img" aria-label={`ציון ${value} מתוך 10`}>
      <div className="geo-ladder-score">
        <span className="geo-ladder-num">{value}</span>
        <span className="geo-ladder-max">/10</span>
      </div>
      <div className="geo-ladder-rungs">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className={`geo-rung ${i < value ? 'on' : ''}`} />
        ))}
      </div>
    </div>
  );
}

function TeaserView({ teaser }: { teaser: Teaser }) {
  const { ai } = teaser;
  return (
    <div className="geo-teaser">
      <div className="geo-ladder-wrap">
        <Ladder value={teaser.ladder} />
        <div className="geo-ladder-verdict">
          <h3>כמה קל ל-AI למצוא ולהמליץ עליך</h3>
          <p>{ladderVerdict(teaser.ladder)}</p>
          {teaser.business.name && <span className="geo-domain">{teaser.business.name}</span>}
        </div>
      </div>

      <div className="geo-cats">
        {teaser.categories.map((c) => (
          <div key={c.key} className="geo-cat">
            <div className="geo-cat-head">
              <span className="geo-cat-label">{c.label}</span>
              <span className="geo-cat-score">{c.score}%</span>
            </div>
            <div className="geo-bar">
              <span className="geo-bar-fill" style={{ width: `${c.score}%` }} />
            </div>
          </div>
        ))}
      </div>

      {ai.available && ai.competitorCount > 0 && !ai.appears && (
        <div className="geo-competitor-hint">
          <strong>{ai.competitorCount} מהמתחרים שלך כבר מופיעים</strong> כשה-AI ממליץ על עסק
          בתחום שלך — ואתה לא. מי הם? זה בדוח המלא.
        </div>
      )}
      {ai.available && ai.appears && (
        <div className="geo-competitor-hint good">
          ה-AI כבר מזכיר אותך — אבל {ai.competitorCount} מתחרים מופיעים לצידך. איך לעקוף אותם? בדוח המלא.
        </div>
      )}
    </div>
  );
}

function LockedReport({
  url,
  ai,
  onUnlock,
}: {
  url: string;
  ai: Teaser['ai'];
  onUnlock: (r: unknown) => void;
}) {
  return (
    <div className="geo-locked">
      <div className="geo-locked-blur" aria-hidden="true">
        <div className="geo-locked-line" />
        <div className="geo-locked-line" />
        <div className="geo-locked-line short" />
        <div className="geo-locked-line" />
        <div className="geo-locked-line short" />
      </div>
      <div className="geo-locked-overlay">
        <h3>הדוח המלא + תוכנית הפעולה</h3>
        <ul className="geo-unlock-list">
          <li>בדיוק מה לתקן — לפי סדר עדיפויות</li>
          {ai.available && <li>מה ChatGPT, Claude, Gemini ו-Perplexity ענו כששאלנו עליך</li>}
          {ai.available && ai.competitorCount > 0 && <li>שמות המתחרים שכבר מופיעים — ומה יש להם שאין לך</li>}
          <li>איך HELIX סוגרת את הפער — אבחון ראשוני חינם</li>
        </ul>
        <GeoLeadForm url={url} onUnlock={onUnlock} />
      </div>
    </div>
  );
}

function statusLabel(s: Status): string {
  return s === 'pass' ? '✓' : s === 'partial' ? '~' : '✕';
}

function UnlockedReport({ report }: { report: Report }) {
  const v = report.visibility;
  return (
    <div className="geo-report">
      <div className="geo-report-badge">✓ הדוח נפתח — שלחנו את הפרטים לצוות HELIX</div>

      {v.available && (
        <div className="geo-ai-answers">
          <h3>מה הבינה המלאכותית באמת אומרת עליך</h3>
          <div className="geo-provider-grid">
            {v.providers.map((p) => (
              <div key={p.id} className={`geo-provider ${p.knowsYou ? 'knows' : 'unknown'}`}>
                <div className="geo-provider-head">
                  <span className="geo-provider-name">{p.label}</span>
                  <span className="geo-provider-verdict">
                    {p.knowsYou ? 'מכיר אותך' : 'לא מכיר אותך'}
                    {p.recommendsYou ? ' · ממליץ' : ''}
                  </span>
                </div>
                {p.answer && <p className="geo-provider-answer">{p.answer}</p>}
              </div>
            ))}
          </div>
          {v.competitors.length > 0 && (
            <div className="geo-competitors">
              <h4>המתחרים שכבר מופיעים ב-AI:</h4>
              <div className="geo-competitor-chips">
                {v.competitors.map((c) => (
                  <span key={c} className="geo-chip">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="geo-fixes">
        <h3>תוכנית הפעולה — מה לתקן</h3>
        {report.categories.map((c) => (
          <div key={c.key} className="geo-fix-cat">
            <div className="geo-fix-cat-head">
              <span>{c.label}</span>
              <span className="geo-cat-score">{c.score}%</span>
            </div>
            <ul className="geo-fix-list">
              {c.signals.map((s) => (
                <li key={s.key} className={`geo-fix-item ${s.status}`}>
                  <span className="geo-fix-icon">{statusLabel(s.status)}</span>
                  <div>
                    <strong>{s.label}</strong>
                    <span className="geo-fix-detail">{s.detail}</span>
                    {s.status !== 'pass' && s.fix && <span className="geo-fix-todo">→ {s.fix}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="geo-report-cta">
        <p>רוצה ש-HELIX תסגור את הפערים האלה במקומך?</p>
        <a
          href={`https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('היי, בדקתי את הנראות שלי ב-AI ואשמח לאבחון')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          קבלו אבחון ראשוני חינם
        </a>
        <a href="/#packages" className="geo-report-packages">או צפו בחבילות של HELIX ←</a>
      </div>
    </div>
  );
}
