'use client';

import { useState } from 'react';

const STAGE_LOGIN = 'https://helix-stage.vercel.app/he/login';
const PAGE_URL = 'https://helix.co.il/startups/readiness';

type Status = 'pass' | 'partial' | 'fail';

interface Signal {
  key: string;
  label: string;
  status: Status;
  detail: string;
  fix?: string;
}
interface Category {
  key: string;
  label: string;
  score: number;
  signals: Signal[];
}
interface BusinessAnalysis {
  productSummary: string;
  targetAudience: string;
  category: string;
  messagingClarity: { verdict: 'clear' | 'partial' | 'confusing'; note: string };
  fiveSecondTest: { pass: boolean; note: string };
  pricingModel: string;
  socialProof: { verdict: 'strong' | 'some' | 'none'; note: string };
  standoutFeatures: string[];
  likelyCompetitors: string[];
  gaps: string[];
}
type BusinessResult =
  | { status: 'unconfigured' }
  | { status: 'error' }
  | { status: 'ok'; analysis: BusinessAnalysis };

interface Detected {
  name: string;
  found: boolean;
}
interface Extras {
  trackers: Detected[];
  convTools: Detected[];
  legal: Detected[];
  lighthouse: { seo: number | null; accessibility: number | null; bestPractices: number | null };
}

interface Result {
  ok: true;
  ladder: number;
  issuesCount: number;
  business: { name: string };
  extras?: Extras | null;
  businessAnalysis?: BusinessResult;
  categories: Category[];
}

const ERROR_MAP: Record<string, string> = {
  invalid_url: 'הכתובת לא תקינה. נסו שוב (למשל example.co.il).',
  unreachable: 'לא הצלחנו להגיע לאתר. בדקו את הכתובת ונסו שוב.',
  not_html: 'הכתובת לא מחזירה דף אינטרנט תקין.',
  rate_limited: 'יותר מדי בדיקות. המתינו דקה ונסו שוב.',
  scan_failed: 'הסריקה נכשלה. נסו שוב.',
};

type Launched = 'yes' | 'no' | null;

function readinessVerdict(n: number, launched: Launched): string {
  if (n >= 8)
    return launched === 'yes'
      ? 'המוצר שלך בנוי היטב. עכשיו זה עניין של משתמשים ופידבק.'
      : 'הבסיס הטכני מוכן להשקה. הצעד הבא הוא משתמשים ראשונים.';
  if (n >= 5) return 'אתה בדרך — אבל יש פערים שכדאי לסגור לפני שמזרימים אליהם תנועה.';
  return 'עדיין מוקדם. יש כמה יסודות קריטיים לסדר לפני יציאה לשוק.';
}

function statusLabel(s: Status): string {
  return s === 'pass' ? '✓' : s === 'partial' ? '~' : '✕';
}

function Dial({ value }: { value: number }) {
  const r = 72;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value / 10);
  return (
    <div className="geo-dial" role="img" aria-label={`ציון מוכנות ${value} מתוך 10`}>
      <svg viewBox="0 0 168 168">
        <defs>
          <linearGradient id="rdGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#16FFAB" />
          </linearGradient>
        </defs>
        <circle className="geo-dial-track" cx="84" cy="84" r={r} />
        <circle
          className="geo-dial-fill"
          cx="84"
          cy="84"
          r={r}
          style={
            {
              strokeDasharray: c,
              strokeDashoffset: offset,
              ['--dial-offset' as string]: `${offset}`,
              ['--dial-empty' as string]: `${c}`,
            } as React.CSSProperties
          }
        />
      </svg>
      <div className="geo-dial-center">
        <div>
          <span className="geo-dial-num">{value}</span>
          <span className="geo-dial-max">/10</span>
        </div>
      </div>
    </div>
  );
}

function ShareRow({ ladder }: { ladder: number }) {
  const msg = `בדקתי את מוכנות ההשקה של הסטארטאפ שלי ב-HELIX וקיבלתי ${ladder}/10. בדקו גם אתם:`;
  const wa = `https://wa.me/?text=${encodeURIComponent(`${msg} ${PAGE_URL}`)}`;
  const li = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(PAGE_URL)}`;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(PAGE_URL)}`;
  return (
    <div className="rd-share">
      <span className="rd-share-label">שתפו את הציון שלכם</span>
      <div className="rd-share-btns">
        <a className="rd-share-btn wa" href={wa} target="_blank" rel="noopener noreferrer">וואטסאפ</a>
        <a className="rd-share-btn li" href={li} target="_blank" rel="noopener noreferrer">לינקדאין</a>
        <a className="rd-share-btn fb" href={fb} target="_blank" rel="noopener noreferrer">פייסבוק</a>
      </div>
    </div>
  );
}

/** Full, ungated results — score + every category with fixes. Shown on the first scan. */
function ResultView({ result, launched }: { result: Result; launched: Launched }) {
  return (
    <>
      <div className="geo-teaser">
        <div className="geo-score-card geo-db-3d">
          <Dial value={result.ladder} />
          <div className="geo-score-verdict">
            <span className="geo-score-eyebrow">מדד מוכנות-השקה · HELIX</span>
            <h3>כמה הסטארטאפ שלך מוכן לצאת לשוק</h3>
            <p>{readinessVerdict(result.ladder, launched)}</p>
            <div className="geo-scale" aria-hidden="true">
              <span className={result.ladder <= 3 ? 'on' : ''}>1–3 מוקדם</span>
              <span className={result.ladder >= 4 && result.ladder <= 6 ? 'on' : ''}>4–6 כמעט</span>
              <span className={result.ladder >= 7 ? 'on' : ''}>7–10 מוכן</span>
            </div>
            {result.business.name && <span className="geo-domain">{result.business.name}</span>}
          </div>
        </div>
      </div>

      <div className="geo-fixes">
        <h3>מה בדקנו — והפערים שזיהינו</h3>
        {result.categories.map((c) => (
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
    </>
  );
}

const CLARITY = {
  clear: { label: 'ברור', cls: 'pass' },
  partial: { label: 'חלקי', cls: 'partial' },
  confusing: { label: 'מבלבל', cls: 'fail' },
} as const;

const SOCIAL = {
  strong: { label: 'חזקה', cls: 'pass' },
  some: { label: 'חלקית', cls: 'partial' },
  none: { label: 'חסרה', cls: 'fail' },
} as const;

function DetectRow({ title, items }: { title: string; items: Detected[] }) {
  return (
    <div className="rd-biz-block">
      <span className="rd-biz-k">{title}</span>
      <div className="rd-detect">
        {items.map((d) => (
          <span key={d.name} className={`rd-detect-chip ${d.found ? 'on' : 'off'}`}>
            {d.found ? '✓' : '✕'} {d.name}
          </span>
        ))}
      </div>
    </div>
  );
}

/** FREE extra signals — pixels, Lighthouse, conversion tools, legal. No key needed. */
function ExtrasSection({ extras }: { extras?: Extras | null }) {
  if (!extras) return null;
  const lh = extras.lighthouse;
  const lhRow: Array<[string, number | null]> = [
    ['SEO', lh.seo],
    ['נגישות', lh.accessibility],
    ['Best-Practices', lh.bestPractices],
  ];
  const anyLh = lhRow.some(([, v]) => v !== null);
  return (
    <div className="geo-fixes rd-biz">
      <h3>בדיקות נוספות — שיווק, מדידה ומוכנות</h3>

      {anyLh && (
        <div className="rd-biz-block">
          <span className="rd-biz-k">ציוני Lighthouse (מובייל)</span>
          <div className="rd-lh">
            {lhRow.map(([label, v]) => (
              <div key={label} className="rd-lh-cell">
                <div className={`rd-lh-num ${v === null ? '' : v >= 90 ? 'pass' : v >= 50 ? 'partial' : 'fail'}`}>
                  {v === null ? '—' : v}
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <DetectRow title="פיקסלים ומדידה" items={extras.trackers} />
      <DetectRow title="כלי המרה ותמיכה" items={extras.convTools} />
      <DetectRow title="עמודים משפטיים" items={extras.legal} />
    </div>
  );
}

/** Layer 2 — business/product analysis (AI). Free teaser + STAGE-gated premium. */
function BusinessLayer({ result }: { result?: BusinessResult }) {
  const [unlocked, setUnlocked] = useState(false);
  if (!result || result.status === 'error') return null;

  if (result.status === 'unconfigured') {
    return (
      <div className="geo-fixes rd-biz">
        <h3>שכבה 2 — ניתוח מוצר, מסרים ומתחרים (AI)</h3>
        <p className="geo-fix-detail" style={{ margin: 0 }}>
          השכבה הזו בונה ניתוח עסקי מלא של הדף — הצעת ערך, קהל יעד, בהירות מסרים, מבחן 5 שניות,
          תמחור, פיצ'רים בולטים ומתחרים. היא מוכנה, וממתינה לחיבור מפתח <code>ANTHROPIC_API_KEY</code>.
        </p>
      </div>
    );
  }

  const a = result.analysis;
  const c = CLARITY[a.messagingClarity.verdict];
  const sp = SOCIAL[a.socialProof.verdict];

  return (
    <div className="geo-fixes rd-biz">
      <h3>שכבה 2 — ניתוח מוצר ומסרים (AI)</h3>

      {/* FREE teaser */}
      <div className="rd-biz-grid">
        <div className="rd-biz-cell">
          <span className="rd-biz-k">מה המוצר עושה</span>
          <p>{a.productSummary}</p>
        </div>
        <div className="rd-biz-cell">
          <span className="rd-biz-k">קהל היעד</span>
          <p>{a.targetAudience}</p>
        </div>
        <div className="rd-biz-cell">
          <span className="rd-biz-k">בהירות המסרים</span>
          <p><span className={`rd-biz-badge ${c.cls}`}>{c.label}</span> {a.messagingClarity.note}</p>
        </div>
        <div className="rd-biz-cell">
          <span className="rd-biz-k">מבחן 5 שניות</span>
          <p>
            <span className={`rd-biz-badge ${a.fiveSecondTest.pass ? 'pass' : 'fail'}`}>
              {a.fiveSecondTest.pass ? 'עובר' : 'נכשל'}
            </span> {a.fiveSecondTest.note}
          </p>
        </div>
      </div>

      {/* STAGE-gated premium */}
      {unlocked ? (
        <div className="rd-premium-open">
          <div className="rd-biz-block">
            <span className="rd-biz-k">מיצוב / קטגוריה</span>
            <p style={{ color: 'rgba(255,255,255,.82)' }}>{a.category}</p>
          </div>
          <div className="rd-biz-block">
            <span className="rd-biz-k">מודל תמחור</span>
            <p style={{ color: 'rgba(255,255,255,.82)' }}>{a.pricingModel}</p>
          </div>
          <div className="rd-biz-block">
            <span className="rd-biz-k">הוכחה חברתית</span>
            <p style={{ color: 'rgba(255,255,255,.82)' }}>
              <span className={`rd-biz-badge ${sp.cls}`}>{sp.label}</span> {a.socialProof.note}
            </p>
          </div>
          {a.standoutFeatures.length > 0 && (
            <div className="rd-biz-block">
              <span className="rd-biz-k">פיצ'רים בולטים</span>
              <div className="geo-competitor-chips">
                {a.standoutFeatures.map((f) => <span key={f} className="geo-chip">{f}</span>)}
              </div>
            </div>
          )}
          {a.likelyCompetitors.length > 0 && (
            <div className="rd-biz-block">
              <span className="rd-biz-k">מתחרים בשוק <em>(הצעות לאימות)</em></span>
              <div className="geo-competitor-chips">
                {a.likelyCompetitors.map((f) => <span key={f} className="geo-chip">{f}</span>)}
              </div>
            </div>
          )}
          {a.gaps.length > 0 && (
            <div className="rd-biz-block">
              <span className="rd-biz-k">פערים עסקיים לסגור</span>
              <ul className="geo-fix-list">
                {a.gaps.map((g) => (
                  <li key={g} className="geo-fix-item fail">
                    <span className="geo-fix-icon">→</span>
                    <div><span className="geo-fix-detail">{g}</span></div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="rd-premium-gate">
          <span className="geo-locked-lock" aria-hidden="true">🔒</span>
          <strong>הניתוח העסקי המלא ממתין לך</strong>
          <p>
            זיהינו <b>{a.likelyCompetitors.length}</b> מתחרים · <b>{a.standoutFeatures.length}</b> פיצ'רים
            בולטים · <b>{a.gaps.length}</b> פערים עסקיים לסגור — כולל מיצוב, תמחור והוכחה חברתית.
          </p>
          <a
            href={STAGE_LOGIN}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary rd-stage-cta"
            onClick={() => setUnlocked(true)}
          >
            הצטרפו חינם ל-STAGE כדי לפתוח
          </a>
        </div>
      )}
    </div>
  );
}

/** After the full results — explain HELIX STAGE (community). Open, not a gate. */
function StageSection() {
  return (
    <div className="rd-bridge">
      <span className="rd-bridge-eyebrow">🚀 הצעד הבא</span>
      <h3>עכשיו כשאתה יודע איפה אתה עומד — קהילת HELIX STAGE</h3>
      <p>
        את הפערים הטכניים כבר ראית. אבל השקה מנצחת תלויה במה שרובוט לא מודד — משתמשים ראשונים,
        פידבק אמיתי, ושותפים שילכו איתך. את זה סוגרים בקהילת <strong>HELIX STAGE</strong>: מקום
        לפרסם את המוצר, למצוא מאמצים ראשונים, לקבל פידבק ולמצוא co-founder. חינם ליזמים.
      </p>
      <a href={STAGE_LOGIN} target="_blank" rel="noopener noreferrer" className="btn btn-primary rd-stage-cta">
        הצטרפו חינם ל-HELIX STAGE
      </a>
      <p className="geo-lead-note">קהילה חינמית ליזמים וסטארטאפים · בלי כרטיס אשראי</p>
    </div>
  );
}

export default function ReadinessScanner({ id = 'tool' }: { id?: string }) {
  const [launched, setLaunched] = useState<Launched>(null);
  const [url, setUrl] = useState('');
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  async function runScan(target: string) {
    if (!target.trim()) return;
    setPhase('scanning');
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/readiness-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
      });
      const data = (await res.json()) as Result | { ok: false; error: string };
      if ('ok' in data && data.ok) {
        setResult(data);
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
    <section className="geo-tool" id={id}>
      <div className="container">
        {/* Step 1 — the "launched?" question */}
        <div className="rd-seg" role="group" aria-label="האם כבר השקת?">
          <span className="rd-seg-q">כבר השקת את המוצר?</span>
          <div className="rd-seg-btns">
            <button type="button" className={`rd-seg-btn ${launched === 'no' ? 'on' : ''}`} onClick={() => setLaunched('no')}>
              עדיין לא
            </button>
            <button type="button" className={`rd-seg-btn ${launched === 'yes' ? 'on' : ''}`} onClick={() => setLaunched('yes')}>
              כבר השקתי
            </button>
          </div>
        </div>

        {/* Step 2 — the URL */}
        <form
          className="geo-input-row"
          onSubmit={(e) => {
            e.preventDefault();
            void runScan(url);
          }}
        >
          <input
            type="text"
            className="geo-url-input"
            placeholder={
              launched === 'no'
                ? 'כתובת דף הנחיתה / אתר בהקמה — example.co.il'
                : 'הכניסו כתובת אתר — לדוגמה: example.co.il'
            }
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            dir="ltr"
            aria-label="כתובת האתר לבדיקה"
          />
          <button type="submit" className="btn btn-primary geo-scan-btn" disabled={phase === 'scanning'}>
            {phase === 'scanning' ? 'סורק…' : 'בדקו מוכנות בחינם'}
          </button>
        </form>
        <p className="geo-input-note">ללא הרשמה · תוצאות מלאות תוך שניות · לקריאה בלבד</p>

        {phase === 'error' && <p className="geo-error">{error}</p>}

        {phase === 'scanning' && (
          <div className="geo-scanning" aria-live="polite">
            <div className="geo-spinner" />
            <p>בודקים כמה המוצר שלך מוכן להשקה…</p>
          </div>
        )}

        {phase === 'done' && result && (
          <div className="geo-results">
            <ResultView result={result} launched={launched} />
            <ExtrasSection extras={result.extras} />
            <BusinessLayer result={result.businessAnalysis} />
            <StageSection />
            <ShareRow ladder={result.ladder} />
          </div>
        )}
      </div>
    </section>
  );
}
