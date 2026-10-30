import type { Metadata } from 'next';
/* eslint-disable @typescript-eslint/no-explicit-any */
// Tolerant import: loadReport lives in lib/geo-report-store.ts. Its GeoReport type is
// defined in lib/geo-report-build.ts, which another agent is building. We keep a local
// GeoReport type (the frozen render contract) and cast the loader result to it, so this
// page compiles cleanly and does not depend on the exact build-side type surfacing yet.
import { cookies } from 'next/headers';
import { loadReport } from '@/lib/geo-report-store';
import { adminToken } from '@/lib/geo-admin-auth';
import { verifySession } from '@/lib/portal';
import { reportStats, type ReportStats } from '@/lib/report-events';
import { SECTION_ORDER } from '@/lib/report-sections';
import styles from '../report.module.css';
import Track from './track';
import PrintButton from './print-button';
import AccessGate from './access-gate';

/* ---------- render contract (do not change) ---------- */
type Status = 'pass' | 'partial' | 'fail';
type Sentiment = 'positive' | 'neutral' | 'negative' | 'mixed' | 'none';

interface GeoReport {
  v: 1;
  token: string;
  accessCode?: string;
  generatedAt: string;
  host: string;
  business: { name: string; category?: string; location?: string };
  scan: {
    ladder: number;
    issuesCount: number;
    signals: Array<{ key: string; label: string; status: Status; detail: string; fix?: string; category: string }>;
  };
  shareOfModel: {
    available: boolean;
    questions: string[];
    runsPerQuestion: number;
    overallShareOfModel: number;
    // Optional: recognition axis (how many engines know the brand). Absent on older reports.
    recognition?: { recognized: number; total: number };
    competitorStandings: Array<{ name: string; count: number }>;
    citedSources: Array<{ domain: string; count: number; engines: string[] }>;
    // Optional: presence confidence band. Absent on reports generated before it landed.
    presence?: { appearances: number; trials: number; rateLow: number; rateHigh: number; label: string; smallSample?: boolean };
    engines: Array<{
      id: string;
      label: string;
      // Optional: successful runs for this engine. 0 => engine failed (not measured).
      // Absent on reports generated before this field landed.
      measuredRuns?: number;
      appearanceRate: number;
      recommendationRate: number;
      avgPosition: number | null;
      shareOfModel: number;
      sentiment: Sentiment;
      accuracy: { checked: boolean; correct: boolean | null; issues: string[] };
      recognitionState?: 'recognized' | 'wrong-entity' | 'not-found' | 'not-probed';
      citedLinkedIn?: boolean;
      perQuestion: Array<{ question: string; appeared: boolean; position: number | null; topBrands: string[]; sources: string[] }>;
    }>;
    // Optional: per-person LinkedIn lookup, only when the operator enabled it.
    personLinkedIn?: Array<{
      name: string;
      perEngine: Array<{ engineId: string; label: string; found: boolean }>;
    }>;
  };
  // Optional: plain-language bottom line. Absent on reports generated before it landed.
  bottomLine?: string;
  addressableSources: Array<{ domain: string; engines: string[]; action: string }>;
  // Optional: the client's own external properties the scan detected. Absent on reports
  // generated before this layer landed.
  ownedProperties?: Array<{ url: string; platform: string; kind?: string; cited: boolean }>;
  iab4p: { presence: number; prominence: number; portrayal: number; persuasion: number };
  // Optional: the Israeli citation-graph layer. Absent on reports generated before it landed.
  israeli?: {
    relevant: boolean;
    footprint: number;
    note: string;
    citedSources: Array<{ domain: string; label: string; tier: string; engines: string[]; count: number; why: string }>;
    gaps: Array<{ domain: string; label: string; tier: string; kind: string; why: string; action: string; priority: number }>;
  };
  // Optional: the auto-generated 90-day action plan. Absent on reports generated before it landed.
  plan?: {
    note: string;
    waves: Array<{
      wave: 1 | 2 | 3;
      title: string;
      subtitle: string;
      items: Array<{
        id: string;
        wave: 1 | 2 | 3;
        stage: 'ingest' | 'structure' | 'answer' | 'cite' | 'measure';
        title: string;
        action: string;
        why: string;
        effort: 'low' | 'medium' | 'high';
        impact: 'blocker' | 'high' | 'medium' | 'slow' | 'measure';
        source: string;
        expected: string;
        question?: string;
        draft?: { passage: string; faqJsonLd: string };
      }>;
    }>;
  };
  // Optional: change versus the previous check on this brand. Absent on first check.
  trend?: {
    previousDate: string;
    previousShareOfModel: number;
    previousLadder: number;
    shareOfModelDelta: number;
    ladderDelta: number;
  };
}

/** Signed, rounded delta for display: "+5", "-3", "ללא שינוי". */
function deltaText(n: number): string {
  const r = Math.round(n * 10) / 10;
  if (r === 0) return 'ללא שינוי';
  return r > 0 ? `+${r}` : `${r}`;
}

/* ---------- SEO: never index a private per-client report ---------- */
export const metadata: Metadata = {
  title: 'דוח נראות ב-AI · HELIX',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
    googleBot: { index: false, follow: false, noarchive: true },
  },
};

/* ---------- helpers ---------- */
function scoreColor(n: number): string {
  if (n >= 67) return 'var(--rep-good)';
  if (n >= 34) return 'var(--rep-mid)';
  return 'var(--rep-bad)';
}

function pct(n: number): string {
  return `${Math.round(n)}%`;
}

function rate(n: number): string {
  // engine rates are 0..1
  return `${Math.round(n * 100)}%`;
}

const SENTIMENT_HE: Record<Sentiment, string> = {
  positive: 'חיובי',
  neutral: 'ניטרלי',
  negative: 'שלילי',
  mixed: 'מעורב',
  none: 'אין נתון',
};

const SENTIMENT_CLASS: Record<Sentiment, string> = {
  positive: 'pos',
  negative: 'neg',
  mixed: 'mixed',
  neutral: 'neutral',
  none: 'neutral',
};

// Hebrew labels for the engagement heatmap (which section the client reached).
const SECTION_HE: Record<string, string> = {
  hero: 'פתיח + ציון',
  scorecard: '4 מדדים',
  engines: 'מנוע מול מנוע',
  heatmap: 'שאלה מול מנוע',
  competitors: 'מתחרים',
  sources: 'מקורות',
  properties: 'הנכסים שלך',
  israeli: 'חצר ישראלית',
  plan: 'תוכנית',
  plan90: 'תוכנית 90 יום',
  developer: 'למפתחים',
};

function fmtDwell(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} שנ׳`;
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} דק׳`;
}

// Hebrew label per owned-property platform. Unknown keys fall back to "פרופיל נוסף".
const PLATFORM_HE: Record<string, string> = {
  'linkedin-company': 'לינקדין (עמוד חברה)',
  'linkedin-personal': 'לינקדין (פרופיל אישי)',
  youtube: 'יוטיוב',
  facebook: 'פייסבוק',
  instagram: 'אינסטגרם',
  x: 'X / טוויטר',
  tiktok: 'טיקטוק',
  other: 'פרופיל נוסף',
};

// Hebrew labels for the 90-day plan pills.
const EFFORT_HE: Record<string, string> = {
  low: 'נמוך',
  medium: 'בינוני',
  high: 'גבוה',
};
const IMPACT_HE: Record<string, string> = {
  blocker: 'חוסם',
  high: 'גבוה',
  medium: 'בינוני',
  slow: 'איטי',
  measure: 'מדידה',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

const PS = [
  { key: 'presence', label: 'נוכחות', meaning: 'האם המותג בכלל מופיע כשהקהל מתייעץ עם ה-AI' },
  { key: 'prominence', label: 'בולטות', meaning: 'כמה גבוה ומודגש המותג מופיע בתוך התשובה' },
  { key: 'portrayal', label: 'ייצוג', meaning: 'האם ה-AI מתאר אתכם נכון ובאור חיובי' },
  { key: 'persuasion', label: 'שכנוע', meaning: 'עד כמה ה-AI ממליץ עליכם בפועל, לא רק מזכיר' },
] as const;

/* ---------- page ---------- */
export default async function GeoReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const report = (await loadReport(token)) as GeoReport | null;

  if (!report) {
    return (
      <main className={styles.page}>
        <div className={styles.empty}>
          <h1>הדוח לא נמצא, או שפג תוקפו</h1>
          <p>
            ייתכן שהקישור שגוי, או שהדוח כבר לא זמין. דוחות נראות ב-AI נשמרים לזמן מוגבל. אם אתם
            חושבים שזו טעות, אפשר לפנות אלינו ונפיק דוח עדכני.
          </p>
          <a className={styles.emptyCta} href="https://helix.co.il/ai-checker">
            לבדיקת נראות חדשה
          </a>
        </div>
      </main>
    );
  }

  // Access gate: admins (geo_admin cookie) bypass; a client needs a valid per-report
  // session cookie, otherwise they get the code-entry screen. Reports without an
  // accessCode (older ones) stay open.
  const jar = await cookies();
  const want = adminToken();
  const isAdmin = !!want && jar.get('geo_admin')?.value === want;
  const hasClientSession = verifySession(jar.get(`grpt_${token}`)?.value) === token;
  if (report.accessCode && !isAdmin && !hasClientSession) {
    return <AccessGate token={token} business={report.business.name} />;
  }
  // Admin-only engagement analytics (who viewed, how far, dwell) for the admin view.
  const stats: ReportStats | null = isAdmin ? await reportStats(token) : null;

  // 90-day plan: admins see the FULL plan; a client (prospect) gets only a TASTE —
  // the first wave, first couple of steps — so the full plan stays the paid deliverable.
  const planWaves = (report.plan?.waves ?? []).filter((w) => w.items.length > 0);
  const planTotalItems = planWaves.reduce((n, w) => n + w.items.length, 0);
  const TASTE_ITEMS = 2;
  const shownPlanWaves = isAdmin
    ? planWaves
    : planWaves.slice(0, 1).map((w) => ({ ...w, items: w.items.slice(0, TASTE_ITEMS) }));
  const shownPlanItems = shownPlanWaves.reduce((n, w) => n + w.items.length, 0);

  const { business, shareOfModel, iab4p, addressableSources, scan } = report;
  const som = shareOfModel;

  // WhatsApp CTA for the client: opens a chat to HELIX with a pre-filled message that
  // names their business. Only shown in the client (non-admin) view.
  const waMsg = `אהלן רון כאן ${business.name} ראיתי את דוח הנראות ב-AI שלי, ואשמח לשמוע איך הופכים את העסק שלי מ'מוכר' ל'מומלץ', מתי נוח לך לדבר?`;
  const waHref = `https://wa.me/972544468883?text=${encodeURIComponent(waMsg)}`;
  // `israeli` is optional: reports generated before this layer landed won't have it.
  const israeli = report.israeli;
  // `ownedProperties` is optional for the same reason (older stored reports lack it).
  const ownedProperties = report.ownedProperties ?? [];
  const topCompetitor = som.competitorStandings[0]?.name ?? '';
  const maxStanding = Math.max(1, ...som.competitorStandings.map((c) => c.count));

  // An engine counts as "tested" only if it returned at least one successful run.
  // measuredRuns is authoritative on new reports; fall back to perQuestion for old ones.
  const engineTested = (e: GeoReport['shareOfModel']['engines'][number]) =>
    e.measuredRuns !== undefined ? e.measuredRuns > 0 : e.perQuestion.length > 0;

  // Heatmap: rows = questions, columns = engines that actually ran.
  const activeEngines = som.engines.filter(engineTested);
  const questions = som.questions;

  return (
    <main className={styles.page}>
      <PrintButton />
      {/* Admin-only engagement panel: who viewed, how far they got, dwell time. */}
      {isAdmin && stats && (
        <section className={styles.adminBar}>
          <div className={styles.wrap}>
            <span className={styles.adminKick}>תצוגת אדמין · מעורבות הלקוח</span>
            {report.accessCode && (
              <div className={styles.adminCode}>
                קוד גישה ללקוח: <strong>{report.accessCode}</strong>
              </div>
            )}
            <div className={styles.adminStats}>
              <span><strong>{stats.views}</strong> צפיות</span>
              <span><strong>{stats.uniqueVisitors}</strong> מבקרים ייחודיים</span>
              <span>זמן שהייה ממוצע <strong>{fmtDwell(stats.avgDwellMs)}</strong></span>
              <span>הגיעו עד <strong>{stats.maxSectionReached ? (SECTION_HE[stats.maxSectionReached] ?? stats.maxSectionReached) : '—'}</strong></span>
              {stats.likelyShared && <span className={styles.adminFlag}>כנראה שותף הלאה</span>}
            </div>
            <div className={styles.adminHeat}>
              {SECTION_ORDER.filter((s) => s !== 'developer').map((s) => {
                const reach = stats.sectionReach[s] ?? 0;
                const max = Math.max(1, ...Object.values(stats.sectionReach));
                const pct = Math.round((reach / max) * 100);
                return (
                  <div key={s} className={styles.adminHeatRow}>
                    <span className={styles.adminHeatLabel}>{SECTION_HE[s] ?? s}</span>
                    <span className={styles.adminHeatBar}>
                      <span style={{ width: `${pct}%` }} />
                    </span>
                    <span className={styles.adminHeatVal}>{reach}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
      {/* 1. Executive summary */}
      <header className={styles.hero} data-track-section="hero">
        <div className={styles.wrap}>
          <span className={styles.eyebrow}>דוח נראות ב-AI · HELIX</span>
          <h1>
            {topCompetitor ? (
              <>
                כשלקוח מתייעץ עם ה-AI על {business.category || 'התחום שלכם'},{' '}
                <span className={styles.accent}>{topCompetitor}</span> עולה בשיחה. ו-{business.name}?
              </>
            ) : (
              <>
                מה ה-AI עונה כשלקוח מתייעץ איתו על <span className={styles.accent}>{business.name}</span>?
              </>
            )}
          </h1>
          <p className={styles.heroSub}>
            בדקנו את {business.name}
            {business.location ? ` (${business.location})` : ''} מול מנועי ה-AI המובילים: שאלנו שאלות
            אמיתיות שהקהל שלכם שואל, וספרנו מי עולה בתשובה. זה החלק של {business.name} בתוך השיחות שבהן
            ה-AI ממליץ על מותג.
          </p>

          <div className={styles.bigRow}>
            <div className={styles.bigStat}>
              <div className={styles.num}>{pct(som.overallShareOfModel)}</div>
              <div className={styles.lbl}>נתח השיחה (Share of Model): מכלל האזכורים בקטגוריה, כמה הם שלכם</div>
            </div>
            <div className={`${styles.bigStat} ${styles.plain}`}>
              <div className={styles.num}>{scan.ladder}/10</div>
              <div className={styles.lbl}>מוכנות טכנית: עד כמה ה-AI מצליח לקרוא ולהבין את האתר שלכם</div>
            </div>
            <div className={`${styles.bigStat} ${styles.plain}`}>
              <div className={styles.num}>{scan.issuesCount}</div>
              <div className={styles.lbl}>ליקויים שמצאנו וניתנים לתיקון כדי להעלות את הנראות</div>
            </div>
          </div>

          {som.recognition && som.recognition.total > 0 && (
            <p className={styles.recognitionLine}>
              {som.recognition.recognized === 0
                ? `אף אחד מ-${som.recognition.total} מנועי ה-AI לא מכיר את ${business.name} כשמתארים אותו בשם. ה-AI עדיין לא יודע מי אתם.`
                : som.recognition.recognized === som.recognition.total
                  ? `כל ${som.recognition.total} מנועי ה-AI מכירים את ${business.name}, אבל לא ממליצים עליכם מיוזמתם כשלקוח שואל שאלה כללית. המודעות קיימת, ההמלצה לא.`
                  : `${som.recognition.recognized} מתוך ${som.recognition.total} מנועי ה-AI מכירים את ${business.name}, אבל לא ממליצים עליכם כשלקוח שואל באופן כללי.`}
            </p>
          )}
          <p className={styles.ctaLine}>
            החלון הזה פתוח עכשיו. מי שה-AI לומד להכיר ראשון, נשאר ברירת המחדל שלו גם מול המתחרים.
          </p>
          <p className={styles.trustLine}>
            שאלנו כל שאלה 3 פעמים בכל מנוע וחישבנו ממוצע, כדי שהתוצאה תהיה יציבה ולא מקרית.
          </p>
        </div>
      </header>

      {/* 1b. Trend vs. the previous check on this brand. Only when a prior check exists. */}
      {report.trend && (
        <section className={styles.section} aria-labelledby="trend-head">
          <div className={styles.wrap}>
            <div className={styles.trendCallout}>
              <div className={styles.trendHead} id="trend-head">
                שינוי מאז הבדיקה הקודמת ({formatDate(report.trend.previousDate)})
              </div>
              <div className={styles.trendRow}>
                <span className={styles.trendItem}>
                  נתח השיחה: <strong>{deltaText(report.trend.shareOfModelDelta)}</strong>
                  {report.trend.shareOfModelDelta !== 0 ? ' נק׳' : ''}
                  <small> (מ-{pct(report.trend.previousShareOfModel)})</small>
                </span>
                <span className={styles.trendItem}>
                  מוכנות טכנית: <strong>{deltaText(report.trend.ladderDelta)}</strong>
                  <small> (מ-{report.trend.previousLadder}/10)</small>
                </span>
              </div>
              <div className={styles.trendNote}>
                הבדיקה שלנו נקייה וזהה בכל פעם, בלי חשבון, בלי זיכרון ובלי מיקום אישי, ולכן
                השינוי משקף תנועה אמיתית בנראות שלכם ולא הטיה.
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 1a. Fixed notice: why the client's own test disagrees with this report.
             Constant copy on every report, framed as caution (amber), placed before
             the results so the reader has it in hand before doubting the numbers. */}
      <section className={styles.section} aria-labelledby="selftest-head">
        <div className={styles.wrap}>
          <div className={styles.selfTestNote}>
            <h3 id="selftest-head">
              למה כשאתם בודקים בעצמכם אתם מופיעים, וכאן התמונה שונה
            </h3>
            <p>
              קרוב לוודאי שכבר ניסיתם לשאול את ה-AI על העסק שלכם, וראיתם שהוא כן מכיר אתכם
              וממליץ עליכם. חשוב שתדעו: הבדיקה שאתם עושים בעצמכם אינה נקייה, והיא מטעה. הנה למה.
            </p>
            <p>
              מנוע ה-AI שאתם משתמשים בו באופן קבוע <strong>זוכר אתכם</strong>. אם בעבר התייעצתם
              איתו, ביקשתם ממנו לכתוב לכם תוכן, או חיפשתם את השם שלכם, הוא שומר את ההקשר הזה דרך
              הזיכרון שלו, היסטוריית השיחות והחשבון האישי שלכם. לכן הוא נוטה להחזיר לכם דווקא את
              העסק שלכם, גם בשאלה כללית. זו תשובה מותאמת אישית אליכם, לא התשובה שלקוח חדש מקבל.
            </p>
            <p>בקיצור, הבדיקה העצמית שלכם מוטה בגלל שלושה דברים שאין ללקוח חדש:</p>
            <ul>
              <li>
                <strong>זיכרון והיסטוריה:</strong> המנוע כבר דיבר איתכם על העסק, אז הוא מקדים אותו.
              </li>
              <li>
                <strong>החשבון האישי:</strong> אתם מחוברים, והמנוע מכיר את ההעדפות וההקשר שלכם.
              </li>
              <li>
                <strong>המיקום שלכם:</strong> כששואלים מהמכשיר שלכם, המנוע יודע איפה אתם ומראה עסקים
                מקומיים לידכם.
              </li>
            </ul>
            <p>
              הבדיקה שלנו, לעומת זאת, <strong>נקייה</strong>: בלי חשבון, בלי היסטוריה, בלי מיקום אישי.
              שאלנו כל שאלה כמה פעמים בכמה מנועים וחישבנו ממוצע, כדי לראות בדיוק את מה שלקוח חדש, שעוד
              לא מכיר אתכם, מקבל כשהוא מתייעץ עם ה-AI. זה המספר שקובע אם תגיעו ללקוחות חדשים, והוא מה
              שהדוח הזה מודד.
            </p>
          </div>
        </div>
      </section>

      {/* 2. IAB 4 Ps scorecard */}
      <section className={styles.section} aria-labelledby="ps-head" data-track-section="scorecard">
        <div className={styles.wrap}>
          <div className={styles.sectionHead}>
            <span className={styles.kick}>כרטיס ניקוד</span>
            <h2 id="ps-head">ארבעת ממדי הנראות (IAB 4Ps)</h2>
            <p>
              מסגרת מקובלת למדידת נוכחות מותג בתוך תשובות של AI. כל ממד בציון 0 עד 100, ככל שגבוה יותר,
              כך המותג שלכם חזק יותר בשיחה.
            </p>
          </div>
          {som.presence && som.presence.trials > 0 && (
            <div className={styles.bandCallout}>
              <div className={styles.bandLabel}>{som.presence.label}</div>
              <div className={styles.bandRange}>
                המותג הופיע ב-{som.presence.appearances} מתוך {som.presence.trials} בדיקות.
                רמת נוכחות מוערכת: {som.presence.rateLow}%–{som.presence.rateHigh}%
              </div>
              <div className={styles.bandNote}>
                מוצג כטווח ביטחון (95%) ולא כמספר בודד, כי תשובות ה-AI משתנות בין הרצות. זהו טווח
                אמיתי, לא הבטחה.
              </div>
              {som.presence.smallSample && (
                <div className={styles.bandNote}>
                  מדגם קטן ({som.presence.trials} בדיקות): הטווח רחב יחסית. הרצה חוזרת שתשלים מנועים
                  נוספים תחדד את ההערכה.
                </div>
              )}
            </div>
          )}
          <div className={styles.psGrid}>
            {PS.map((p) => {
              const val = Math.round((iab4p as Record<string, number>)[p.key] ?? 0);
              const color = scoreColor(val);
              return (
                <div
                  key={p.key}
                  className={styles.psTile}
                  style={{ ['--tile-accent' as any]: color }}
                >
                  <div className={styles.score}>
                    {val}
                    <small> / 100</small>
                  </div>
                  <h3>{p.label}</h3>
                  <p>{p.meaning}</p>
                  <div className={styles.psBar} role="img" aria-label={`${p.label}: ${val} מתוך 100`}>
                    <span style={{ width: `${val}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Per-engine */}
      <section className={styles.section} aria-labelledby="eng-head" data-track-section="engines">
        <div className={styles.wrap}>
          <div className={styles.sectionHead}>
            <span className={styles.kick}>מנוע מול מנוע</span>
            <h2 id="eng-head">איך כל מנוע AI רואה אתכם</h2>
            <p>
              לכל מנוע יש קהל ואופי משלו. מנוע שמסומן &quot;לא נבדק&quot; לא היה זמין במדידה הזו.
            </p>
          </div>
          {report.bottomLine && (
            <div className={styles.bottomLine}>
              <span className={styles.bottomLineKick}>השורה התחתונה</span>
              <p>{report.bottomLine}</p>
            </div>
          )}
          <div className={styles.engineGrid}>
            {som.engines.map((e) => {
              const tested = engineTested(e);
              return (
                <article key={e.id} className={`${styles.engineCard} ${tested ? '' : styles.off}`}>
                  <div className={styles.engineTop}>
                    <span className={styles.engineName}>{e.label}</span>
                    {tested ? (
                      <span className={styles.engineShare}>{pct(e.shareOfModel)}</span>
                    ) : (
                      <span className={styles.notTested}>לא נבדק</span>
                    )}
                  </div>
                  {tested && (
                    <>
                      <div className={styles.engineStats}>
                        <div className={styles.engineStat}>
                          <div className={styles.v}>{rate(e.appearanceRate)}</div>
                          <div className={styles.k}>הופעה בתשובות</div>
                        </div>
                        <div className={styles.engineStat}>
                          <div className={styles.v}>{rate(e.recommendationRate)}</div>
                          <div className={styles.k}>המלצה ישירה</div>
                        </div>
                        <div className={styles.engineStat}>
                          <div className={styles.v}>{e.avgPosition != null ? e.avgPosition.toFixed(1) : '-'}</div>
                          <div className={styles.k}>מיקום ממוצע</div>
                        </div>
                      </div>
                      <div className={styles.pillRow}>
                        <span className={`${styles.pill} ${styles[SENTIMENT_CLASS[e.sentiment]] ?? ''}`}>
                          טון: {SENTIMENT_HE[e.sentiment]}
                        </span>
                        {e.accuracy.checked && (
                          <span
                            className={`${styles.pill} ${
                              e.accuracy.correct ? styles.pos : e.accuracy.correct === false ? styles.neg : ''
                            }`}
                          >
                            דיוק: {e.accuracy.correct ? 'מדויק' : e.accuracy.correct === false ? 'אי-דיוקים' : 'לא נבדק'}
                          </span>
                        )}
                      </div>
                      {(() => {
                        const rs = e.recognitionState;
                        let txt = '';
                        if (rs === 'recognized')
                          txt =
                            e.appearanceRate > 0
                              ? '✓ המנוע מכיר אתכם וגם ממליץ עליכם בחלק מהשאלות.'
                              : '✓ המנוע מכיר אתכם ומתאר אתכם נכון, אך עדיין לא ממליץ עליכם כשנשאל על התחום.';
                        else if (rs === 'wrong-entity')
                          txt =
                            '⚠ המנוע בלבל אתכם עם ישות אחרת בשם דומה — הוא לא באמת מכיר אתכם. סימן ששם המותג גנרי.';
                        else if (rs === 'not-found')
                          txt = '✗ המנוע לא מכיר אתכם — לא מצא מידע על העסק.';
                        return txt ? <p className={styles.engineReco}>{txt}</p> : null;
                      })()}
                      {e.citedLinkedIn !== undefined && (
                        <p className={styles.engineReco}>
                          {e.citedLinkedIn ? '🔗 ציטט לינקדאין במדידה הזו.' : '🔗 לא ציטט לינקדאין.'}
                        </p>
                      )}
                      {e.accuracy.checked && e.accuracy.issues.length > 0 && (
                        <div className={styles.accuracy}>
                          <strong>מה ה-AI טועה לגביכם:</strong>
                          <ul>
                            {e.accuracy.issues.map((iss, i) => (
                              <li key={i}>{iss}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </article>
              );
            })}
          </div>
          {som.personLinkedIn && som.personLinkedIn.length > 0 && (
            <div className={styles.personLi}>
              <h3>האנשים שמאחורי המותג — חיפוש בלינקדאין</h3>
              <p className={styles.personLiNote}>
                האם כל מנוע מצא את האדם בלינקדאין. לינקדאין הוא מקור ציטוט עולה ל-AI, ולכן
                נוכחות חזקה שם יכולה לחזק את הזיהוי שלכם.
              </p>
              <div className={styles.personLiGrid}>
                {som.personLinkedIn.map((p) => (
                  <div key={p.name} className={styles.personLiRow}>
                    <span className={styles.personLiName}>{p.name}</span>
                    <div className={styles.personLiEngines}>
                      {p.perEngine.map((pe) => (
                        <span
                          key={pe.engineId}
                          className={`${styles.pill} ${pe.found ? styles.pos : styles.neg}`}
                        >
                          {pe.label}: {pe.found ? 'נמצא' : 'לא נמצא'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. Query x Engine heatmap */}
      {som.available && questions.length > 0 && activeEngines.length > 0 && (
        <section className={styles.section} aria-labelledby="heat-head" data-track-section="heatmap">
          <div className={styles.wrap}>
            <div className={styles.sectionHead}>
              <span className={styles.kick}>שאלה מול מנוע</span>
              <h2 id="heat-head">באילו שאלות אתם עולים, ובאיזה מנוע</h2>
              <p>כל שורה היא שאלה שהקהל שלכם שואל. ✓ עם מספר = הופעתם ובאיזה מיקום. ✗ = לא הופעתם.</p>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.tbl}>
                <caption>מפת הופעות {business.name} לפי שאלה ומנוע AI</caption>
                <thead>
                  <tr>
                    <th scope="col">השאלה</th>
                    {activeEngines.map((e) => (
                      <th key={e.id} scope="col">{e.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, qi) => (
                    <tr key={qi}>
                      <td className={styles.q}>{q}</td>
                      {activeEngines.map((e) => {
                        const pq = e.perQuestion.find((x) => x.question === q) ?? e.perQuestion[qi];
                        const appeared = pq?.appeared;
                        return (
                          <td key={e.id}>
                            {appeared ? (
                              <span className={styles.cellYes}>
                                ✓{pq?.position != null && <span className={styles.pos}> #{pq.position}</span>}
                              </span>
                            ) : (
                              <span className={styles.cellNo} aria-label="לא הופיע">✗</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* 5. Competitors + cited sources */}
      {(som.competitorStandings.length > 0 || som.citedSources.length > 0) && (
        <section className={styles.section} aria-labelledby="comp-head" data-track-section="competitors">
          <div className={styles.wrap}>
            <div className={styles.sectionHead}>
              <span className={styles.kick}>מי עוד בשיחה</span>
              <h2 id="comp-head">המתחרים שה-AI מזכיר, והמקורות שהוא שאב מהם</h2>
            </div>
            <div className={styles.twoCol}>
              {som.competitorStandings.length > 0 && (
                <div className={styles.board}>
                  <h3>המתחרים שה-AI מזכיר הכי הרבה</h3>
                  {som.competitorStandings.map((c, i) => (
                    <div className={styles.standing} key={c.name}>
                      <span className={styles.rank}>{i + 1}</span>
                      <span className={styles.name}>{c.name}</span>
                      <span className={styles.meter} role="img" aria-label={`${c.name}: ${c.count} אזכורים`}>
                        <span style={{ width: `${(c.count / maxStanding) * 100}%` }} />
                      </span>
                      <span className={styles.count}>{c.count}</span>
                    </div>
                  ))}
                </div>
              )}
              {som.citedSources.length > 0 && (
                <div className={styles.board} data-track-section="sources">
                  <h3>מאיפה ה-AI שאב</h3>
                  {som.citedSources.map((s) => (
                    <div className={styles.srcItem} key={s.domain}>
                      <div className={styles.dom}>{s.domain}</div>
                      <div className={styles.meta}>
                        {s.count} אזכורים · מופיע ב: {s.engines.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 5a. The client's own properties and whether the AI already cites them */}
      {ownedProperties.length > 0 && (
        <section className={styles.section} aria-labelledby="prop-head" data-track-section="properties">
          <div className={styles.wrap}>
            <div className={styles.sectionHead}>
              <span className={styles.kick}>הנכסים שלך</span>
              <h2 id="prop-head">הקישורים שלך שה-AI מכיר (ומה שהוא עדיין לא)</h2>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.tbl}>
                <caption>הנכסים החיצוניים שזיהינו שמקושרים מהאתר, והאם ה-AI כבר מצטט אותם</caption>
                <thead>
                  <tr>
                    <th scope="col">הפלטפורמה</th>
                    <th scope="col">הקישור</th>
                    <th scope="col">סטטוס</th>
                  </tr>
                </thead>
                <tbody>
                  {ownedProperties.map((p) => (
                    <tr key={p.url}>
                      <td>
                        {PLATFORM_HE[p.platform] ?? PLATFORM_HE.other}
                        {p.kind ? ` (${p.kind})` : ''}
                      </td>
                      <td className={styles.q}>{p.url}</td>
                      <td>
                        <span className={`${styles.pill} ${p.cited ? styles.pos : styles.neutral}`}>
                          {p.cited ? 'ה-AI כבר מצטט' : 'לא מצוטט עדיין'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* 5b. Israeli citation graph — the local moat */}
      {israeli?.relevant && (
        <section className={styles.section} aria-labelledby="il-head" data-track-section="israeli">
          <div className={styles.wrap}>
            <div className={styles.sectionHead}>
              <span className={styles.kick}>החצר הישראלית</span>
              <h2 id="il-head">מאיפה ה-AI שואב עובדות על עסקים בישראל</h2>
              <p>{israeli.note}</p>
            </div>

            {israeli.citedSources.length > 0 && (
              <div className={styles.board}>
                <h3>מקורות ישראליים שה-AI כבר ציטט בתחום שלכם</h3>
                {israeli.citedSources.map((s) => (
                  <div className={styles.srcItem} key={s.domain}>
                    <div className={styles.dom}>{s.label}</div>
                    <div className={styles.meta}>
                      {s.count} אזכורים · מופיע ב: {s.engines.join(', ') || 'מנועים שונים'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {israeli.gaps.length > 0 && (
              <div className={styles.tableWrap}>
                <table className={styles.tbl}>
                  <caption>
                    המקומות הישראליים לכבוש, לפי סדר עדיפות. אלה המקורות שמנועי ה-AI שואבים מהם עובדות
                    על עסקים בישראל, ושעדיין לא ראינו מזינים את התשובות עליכם.
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">המקור</th>
                      <th scope="col">למה זה חשוב</th>
                      <th scope="col">הפעולה</th>
                    </tr>
                  </thead>
                  <tbody>
                    {israeli.gaps.map((g) => (
                      <tr key={g.domain}>
                        <td>{g.priority}</td>
                        <td className={styles.q}>{g.label}</td>
                        <td>{g.why}</td>
                        <td>{g.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 6. Addressable sources */}
      {addressableSources.length > 0 && (
        <section className={styles.section} aria-labelledby="addr-head" data-track-section="plan">
          <div className={styles.wrap}>
            <div className={styles.sectionHead}>
              <span className={styles.kick}>תוכנית הפעולה</span>
              <h2 id="addr-head">המקורות שאפשר להשפיע עליהם</h2>
              <p>
                אלה האתרים שה-AI כבר סומך עליהם בקטגוריה שלכם. נוכחות בהם מזיזה את המחט ישירות על מה
                שה-AI עונה.
              </p>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.tbl}>
                <caption>מקורות בני-השפעה והפעולה המומלצת לכל אחד</caption>
                <thead>
                  <tr>
                    <th scope="col">המקור</th>
                    <th scope="col">מצוטט במנועים</th>
                    <th scope="col">הפעולה</th>
                  </tr>
                </thead>
                <tbody>
                  {addressableSources.map((s) => (
                    <tr key={s.domain}>
                      <td className={styles.q}>{s.domain}</td>
                      <td>{s.engines.join(', ')}</td>
                      <td>{s.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* 6b. Auto-generated 90-day GEO plan, derived from the report's own findings. */}
      {shownPlanWaves.length > 0 && (
        <section className={styles.section} aria-labelledby="plan90-head" data-track-section="plan90">
          <div className={styles.wrap}>
            <div className={styles.sectionHead}>
              <span className={styles.kick}>תוכנית הפעולה</span>
              <h2 id="plan90-head">
                {isAdmin ? 'תוכנית 90 יום להפוך לנראים ל-AI' : 'טעימה מתוכנית ה-90 יום שלכם'}
              </h2>
              <p>{report.plan?.note}</p>
            </div>

            {shownPlanWaves.map((w) => (
                <div className={styles.waveBlock} key={w.wave}>
                  <div className={styles.waveHead}>
                    <h3>{w.title}</h3>
                    <p>{w.subtitle}</p>
                  </div>
                  <div className={styles.planList}>
                    {w.items.map((it) => (
                      <article className={styles.planItem} key={it.id}>
                        <div className={styles.planItemHead}>
                          <h4>{it.title}</h4>
                          <div className={styles.pillRow}>
                            <span className={styles.pillEffort}>מאמץ: {EFFORT_HE[it.effort] ?? it.effort}</span>
                            <span className={styles.pillImpact}>השפעה: {IMPACT_HE[it.impact] ?? it.impact}</span>
                          </div>
                        </div>
                        <p className={styles.planAction}>{it.action}</p>
                        <p className={styles.planWhy}>{it.why}</p>
                        {it.draft && (
                          <div className={styles.planDraft}>
                            <div className={styles.planDraftNote}>טיוטה אוטומטית, מומלץ להגיה</div>
                            <pre className={styles.planDraftText}>{it.draft.passage}</pre>
                          </div>
                        )}
                        {it.expected && <p className={styles.planExpected}>{it.expected}</p>}
                      </article>
                    ))}
                  </div>
                </div>
              ))}

            {!isAdmin && (
              <div className={styles.planLock}>
                <h3>זו טעימה — וזה הליווי החודשי שהופך אתכם לנראים</h3>
                <p>
                  הצגנו כאן {shownPlanItems} הצעדים הראשונים. התוכנית המלאה ({planTotalItems}{' '}
                  צעדים, 90 יום) היא חלק מליווי ה-GEO החודשי שלנו:
                </p>
                <ul className={styles.offerList}>
                  <li>ניטור חודשי של הנראות שלכם ב-4 מנועי ה-AI + דוח התקדמות</li>
                  <li>תיקון תשתית GEO (schema, זהות, קריאוּת ל-AI)</li>
                  <li>יצירת תוכן שמנועי ה-AI מצטטים (מאמרים, תשובות, נכסים)</li>
                  <li>חיזוק הזהות הדיגיטלית — שלא יבלבלו אתכם עם ישות אחרת</li>
                  <li>ייעוץ PR לקישורים חיצוניים לחיזוק ה-GEO</li>
                  <li>מעקב מול מתחרים + אופטימיזציה שוטפת</li>
                  <li>פגישת מעקב שבועית — מה עשינו ומה הצעדים לשבוע הבא</li>
                </ul>
                <p className={styles.offerPrice}>
                  מחיר קבוע <strong>₪2,500 לחודש</strong>, בלי התחייבות ל-3 חודשים.
                </p>
                <a className={styles.waCta} href={waHref} target="_blank" rel="noreferrer">
                  דברו איתנו בוואטסאפ
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 6a. Developers: run the check yourself. Admin-only — not part of the client's area. */}
      {isAdmin && (
      <section className={styles.section} aria-labelledby="dev-head" data-track-section="developer">
        <div className={styles.wrap}>
          <div className={styles.sectionHead}>
            <span className={styles.kick}>למפתחים</span>
            <h2 id="dev-head">רוצים להריץ את הבדיקה בעצמכם?</h2>
            <p>אותה בדיקה, גם בתוך הפייפליין שלכם. בדיקת הגישה חינמית, הדוח המלא דורש מפתח.</p>
          </div>
          <div className={styles.devGrid}>
            <div className={styles.devCard}>
              <h3>בדיקת גישה (GitHub Action)</h3>
              <p>
                מריצים בדיקת גישה חינמית בכל דחיפה: האם סורקי ה-AI מצליחים לקרוא את האתר. בלי מפתח,
                בלי עלות.
              </p>
            </div>
            <div className={styles.devCard}>
              <h3>CLI</h3>
              <p>בדיקה מהירה משורת הפקודה, בלי התקנה.</p>
              <code>npx helix-geo access example.co.il</code>
            </div>
            <div className={styles.devCard}>
              <h3>API</h3>
              <p>
                קריאה אחת ל-API מחזירה דוח נראות מלא. דורש מפתח עם תקרת עלות, שמופק אצלנו.
              </p>
              <code>POST /api/v1/audit</code>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* 7. Footer / disclosure */}
      <footer className={styles.section}>
        <div className={styles.wrap}>
          <div className={styles.disclosure}>
            <p>
              <strong>איך הופק הדוח:</strong> הדוח הופק בעזרת ChatGPT, Gemini ו-Claude שנשאלו בתאריך{' '}
              {formatDate(report.generatedAt)}, ונבדק ע&quot;י HELIX.
            </p>
            <p>
              <strong>לא התחייבות:</strong> מנועי ה-AI אינם דטרמיניסטיים, והתשובות משתנות מרגע לרגע ומקהל
              לקהל. הנתונים כאן הם צילום מצב של רגע המדידה ואינם הבטחה לתוצאה עתידית.
            </p>
            <p>
              <strong>הסרה ויצירת קשר:</strong> לא רוצים שנשמור או נציג את הדוח? כתבו לנו ל-
              <a href="mailto:hello@helix.co.il">hello@helix.co.il</a> ונסיר אותו.
            </p>
            <p>
              <strong>סטטיסטיקה:</strong> נאסף מידע סטטיסטי אנונימי על צפיות בדוח (כמה נפתח ועד
              היכן נקראו), ללא שמירת כתובת IP מזוהה.
            </p>
            <p>הדוח הופק בתאריך {formatDate(report.generatedAt)} · HELIX</p>
          </div>
        </div>
      </footer>

      <Track token={token} />
    </main>
  );
}
