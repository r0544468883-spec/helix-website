import 'server-only';

// The auto-generated 90-day GEO plan. Given a finished GeoReport, this turns the
// report's OWN findings into an ordered, honest action plan laid out along the GEO
// flywheel: INGEST -> STRUCTURE -> ANSWER -> CITE -> MEASURE. First the AI has to be
// able to read and understand you, then it starts citing you, then you build the
// external consensus and measure the trend.
//
// buildGeoPlan is PURE, DETERMINISTIC and $0: no network, no LLM, no randomness. It
// reads only fields already present on the report. draftAnswerPassages (v2, below) is
// the ONLY thing here that spends money, and it is opt-in.

import type { GeoReport } from './geo-report-build';
// Cheapest-provider selection is replicated from lib/share-of-model.ts (CHEAPEST_ORDER
// / cheapestProvider) so v2 drafting reuses the exact same ordering without importing
// an unexported helper.
import { claude } from './providers/claude';
import { openai } from './providers/openai';
import { gemini } from './providers/gemini';
import type { Provider } from './providers/types';

export type PlanStage = 'ingest' | 'structure' | 'answer' | 'cite' | 'measure';
export type PlanEffort = 'low' | 'medium' | 'high';
export type PlanImpact = 'blocker' | 'high' | 'medium' | 'slow' | 'measure';

export interface PlanItem {
  id: string;
  wave: 1 | 2 | 3;
  stage: PlanStage;
  title: string;
  action: string;
  why: string;
  effort: PlanEffort;
  impact: PlanImpact;
  source: string;
  expected: string;
  question?: string;
  /** v2: optional auto-drafted answer passage + FAQ schema for this item. */
  draft?: { passage: string; faqJsonLd: string };
}

export interface GeoPlan {
  waves: Array<{ wave: 1 | 2 | 3; title: string; subtitle: string; items: PlanItem[] }>;
  note: string;
}

// Deterministic "expected outcome" phrasing. Layer B (ingest/structure) fixes are
// verifiable in the next scan; Layer A (answer/cite) work is a trend bet, never a
// promise; the measure item carries no expectation line.
const EXPECTED_B =
  'אחרי התיקון הסימן הזה הופך לירוק, שינוי ודאי ומדיד בסריקה הבאה.';
const EXPECTED_A =
  'אין הבטחת תוצאה. בדרך כלל לוקח שבועות עד שמנוע קולט מקור או תוכן חדש. נמדוד את המגמה בבדיקה החוזרת.';

function expectedFor(stage: PlanStage): string {
  if (stage === 'measure') return '';
  if (stage === 'ingest' || stage === 'structure') return EXPECTED_B;
  return EXPECTED_A; // answer, cite
}

const IMPACT_RANK: Record<PlanImpact, number> = {
  blocker: 0,
  high: 1,
  medium: 2,
  slow: 3,
  measure: 4,
};
const EFFORT_RANK: Record<PlanEffort, number> = { low: 0, medium: 1, high: 2 };

const WAVE_META: Record<1 | 2 | 3, { title: string; subtitle: string }> = {
  1: {
    title: 'חודש 1: שה-AI יוכל לקרוא ולהבין אתכם',
    subtitle:
      'קודם מתקנים את הבסיס הטכני ומגדירים מי אתם, כדי שהמנוע בכלל יצליח לקרוא את האתר ולייחס אותו לישות שלכם.',
  },
  2: {
    title: 'חודש 2: שה-AI יתחיל לצטט אתכם',
    subtitle:
      'עכשיו בונים תשובות ומקורות שגורמים למנוע להתחיל להזכיר ולצטט אתכם בתוך השאלות שהקהל באמת שואל.',
  },
  3: {
    title: 'חודש 3: קונצנזוס ומדידה',
    subtitle:
      'מחזקים קונצנזוס חיצוני שדורש זמן, ומודדים שוב כדי לראות אם המגמה עולה. זה מרתון, לא ספרינט.',
  },
};

/** Pull a bare hostname out of a URL or domain string, or null. */
function hostnameOf(raw: string): string | null {
  const s = (raw || '').trim();
  if (!s) return null;
  try {
    const u = s.includes('://') ? new URL(s) : new URL(`https://${s}`);
    return u.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Build the deterministic 90-day plan from the report's own findings. Pure: no
 * network, no LLM, no randomness. Same report in, same plan out.
 */
export function buildGeoPlan(report: GeoReport): GeoPlan {
  const items: PlanItem[] = [];
  let seq = 0;
  const nextId = (stage: PlanStage) => `${stage}-${seq++}`;

  const push = (it: Omit<PlanItem, 'id' | 'expected'>) => {
    items.push({ ...it, id: nextId(it.stage), expected: expectedFor(it.stage) });
  };

  const signals = report.scan?.signals ?? [];

  // --- INGEST: foundation signals that are failing or partial ---
  for (const s of signals) {
    if (s.category !== 'foundation') continue;
    if (s.status === 'fail') {
      push({
        wave: 1,
        stage: 'ingest',
        title: s.label,
        action: s.fix || s.detail,
        why: s.detail,
        effort: 'low',
        impact: 'blocker',
        source: 'סריקת הבסיס הטכני',
      });
    } else if (s.status === 'partial') {
      push({
        wave: 1,
        stage: 'ingest',
        title: s.label,
        action: s.fix || s.detail,
        why: s.detail,
        effort: 'low',
        impact: 'high',
        source: 'סריקת הבסיס הטכני',
      });
    }
  }

  // --- STRUCTURE: structured-data signals (fail or partial) ---
  for (const s of signals) {
    if (s.category !== 'structured') continue;
    if (s.status === 'fail' || s.status === 'partial') {
      push({
        wave: 1,
        stage: 'structure',
        title: s.label,
        action: s.fix || s.detail,
        why: s.detail,
        effort: 'medium',
        impact: 'medium',
        source: 'סריקת הנתונים המובנים',
      });
    }
  }

  // --- STRUCTURE: the entity anchor. Always present, the single highest-leverage move. ---
  push({
    wave: 1,
    stage: 'structure',
    title: 'עוגן הישות (Organization schema + NAP + sameAs)',
    action:
      'הוסיפו לכל עמודי האתר JSON-LD מסוג Organization או LocalBusiness עם שם עסק אחיד, קטגוריה, כתובת וטלפון (NAP), ושדה sameAs שמקשר לפרופילים האמיתיים של המותג (לינקדאין, פייסבוק, גוגל לעסק). שמרו על אותו שם מדויק בכל מקום.',
    why: 'כדי שה-AI ידע מי אתם ויוכל לייחס לכם המלצה. זהו המנוף שהכי הרבה אתרים מפספסים.',
    effort: 'medium',
    impact: 'high',
    source: 'מתודולוגיית GEO',
  });

  // --- ANSWER: unique buyer questions where the brand did not appear ---
  const som = report.shareOfModel;
  const answerMap = new Map<string, { question: string; competitorTaken: boolean }>();
  for (const e of som?.engines ?? []) {
    for (const pq of e.perQuestion ?? []) {
      if (pq.appeared) continue;
      const taken = Array.isArray(pq.topBrands) && pq.topBrands.length > 0;
      const cur = answerMap.get(pq.question);
      if (cur) cur.competitorTaken = cur.competitorTaken || taken;
      else answerMap.set(pq.question, { question: pq.question, competitorTaken: taken });
    }
  }
  // Competitor-taken slots first, then cap at the 8 highest-priority answer items.
  const answerQuestions = [...answerMap.values()]
    .sort((a, b) => Number(b.competitorTaken) - Number(a.competitorTaken))
    .slice(0, 8);
  for (const q of answerQuestions) {
    const why = q.competitorTaken
      ? 'סלוט שנלקח ע"י מתחרה: זו שאלה אמיתית שהקהל שואל את ה-AI ואתם לא מופיעים בתשובה.'
      : 'זו שאלה אמיתית שהקהל שואל את ה-AI ואתם לא מופיעים בתשובה.';
    push({
      wave: 2,
      stage: 'answer',
      title: `כתבו תשובה לשאלה: ${q.question}`,
      action:
        'פסקת תשובה-ראשונה בעברית (40 עד 60 מילים) שעונה ישירות על השאלה, מזכירה את שם המותג כישות, ועוטפים אותה ב-FAQPage schema.',
      why,
      effort: 'medium',
      impact: q.competitorTaken ? 'high' : 'medium',
      source: 'מדידת נתח-התשובה',
      question: q.question,
    });
  }

  // Track domains we already act on, so addressable sources don't duplicate them.
  const covered = new Set<string>();

  // --- CITE: Israeli claimable gaps (top ~5 by priority) ---
  const israeli = report.israeli;
  const gaps = israeli?.gaps ?? [];
  const claimable = gaps
    .filter((g) => g.kind === 'claimable')
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5);
  for (const g of claimable) {
    covered.add(g.domain.toLowerCase());
    push({
      wave: 2,
      stage: 'cite',
      title: g.label,
      action: g.action,
      why: g.why,
      effort: 'low',
      impact: 'high',
      source: 'גרף המקורות הישראלי',
    });
  }

  // --- CITE: owned properties the AI does not cite yet ---
  for (const p of report.ownedProperties ?? []) {
    if (p.cited) continue;
    const h = hostnameOf(p.url);
    if (h) covered.add(h);
    push({
      wave: 2,
      stage: 'cite',
      title: `חזקו נכס שלא מצוטט: ${p.platform}`,
      action:
        'ודאו שהפרופיל פעיל, עקבי לשם/כתובת/טלפון שבאתר, ומקושר מהאתר (sameAs), כדי שהמנוע יקלוט אותו.',
      why: 'יש לכם כבר את הנכס הזה, אבל המנוע עוד לא מצטט אותו. חיבור עקבי לאתר מכניס אותו לגרף של המותג.',
      effort: 'low',
      impact: 'medium',
      source: 'הנכסים שלכם',
    });
  }

  // --- CITE (wave 3): Israeli earned gaps (top ~3 by priority) ---
  const earned = gaps
    .filter((g) => g.kind === 'earned')
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);
  for (const g of earned) {
    covered.add(g.domain.toLowerCase());
    push({
      wave: 3,
      stage: 'cite',
      title: g.label,
      action: g.action,
      why: g.why,
      effort: 'high',
      impact: 'slow',
      source: 'גרף המקורות הישראלי',
    });
  }

  // --- CITE (wave 3): addressable off-site sources not already covered (top ~3) ---
  const addressable = (report.addressableSources ?? [])
    .filter((s) => !covered.has(s.domain.toLowerCase()))
    .slice(0, 3);
  for (const s of addressable) {
    covered.add(s.domain.toLowerCase());
    push({
      wave: 3,
      stage: 'cite',
      title: s.domain,
      action: s.action,
      why: `מקור שה-AI כבר סומך עליו בקטגוריה שלכם (מצוטט ב: ${s.engines.join(', ') || 'מנועים שונים'}). נוכחות בו מזיזה את מה שהמנוע עונה.`,
      effort: 'medium',
      impact: 'medium',
      source: 'מקורות בני-השפעה',
    });
  }

  // --- MEASURE: always the closing item ---
  push({
    wave: 3,
    stage: 'measure',
    title: 'מדידה חוזרת (30 / 60 / 90 יום)',
    action:
      'נריץ את הבדיקה הזו שוב ונשווה את נתח-התשובה. הצלחת GEO נמדדת כמגמה לאורך זמן, לא כמספר יחיד.',
    why: 'מנועי AI לא דטרמיניסטיים. המדד האמיתי הוא שהמגמה עולה.',
    effort: 'low',
    impact: 'measure',
    source: 'מתודולוגיית GEO',
  });

  // Group into the 3 waves, each sorted by impact then effort.
  const byWave = (w: 1 | 2 | 3) =>
    items
      .filter((it) => it.wave === w)
      .sort(
        (a, b) =>
          IMPACT_RANK[a.impact] - IMPACT_RANK[b.impact] ||
          EFFORT_RANK[a.effort] - EFFORT_RANK[b.effort],
      );

  const waves = ([1, 2, 3] as const).map((w) => ({
    wave: w,
    title: WAVE_META[w].title,
    subtitle: WAVE_META[w].subtitle,
    items: byWave(w),
  }));

  return {
    waves,
    note: 'התוכנית הזו נגזרת ישירות מהממצאים של הדוח שלכם, ומסודרת לפי מסלול ה-GEO: קודם שהמנוע יקרא ויבין אתכם, אחר כך שיצטט אתכם, ולבסוף קונצנזוס ומדידה חוזרת.',
  };
}

// ---------------------------------------------------------------------------
// v2: optional, PAID answer-passage drafting.
// ---------------------------------------------------------------------------
// This is the one function in this file that spends money: it makes one live LLM
// call per drafted answer item (cheapest configured engine). It must only run under
// the cost cap enforced by the generating route, and the Hebrew it returns should
// ideally be proofed with the baldiga skill before a human sends it anywhere.

// Cheapest-first order, mirroring lib/share-of-model.ts CHEAPEST_ORDER.
const CHEAPEST_ORDER: Provider[] = [gemini, claude, openai];

/** The cheapest configured engine, or null if none are set. */
function cheapestProvider(): Provider | null {
  return CHEAPEST_ORDER.find((p) => p.isConfigured()) ?? null;
}

/**
 * Draft an answer-first passage + FAQPage JSON-LD for each wave-2 'answer' item that
 * carries a question, up to `limit`, highest-priority first (the plan already orders
 * competitor-taken slots first inside wave 2). Returns a map keyed by PlanItem.id.
 *
 * Costs API calls: one cheapest-engine call per drafted item. Runs only when the
 * caller opted in and the pre-flight cost estimate accounted for it. Never throws;
 * any single failure just skips that item.
 */
export async function draftAnswerPassages(
  plan: GeoPlan,
  business: { name: string; category?: string },
  limit = 5,
): Promise<Record<string, { passage: string; faqJsonLd: string }>> {
  const provider = cheapestProvider();
  if (!provider) return {};

  const wave2 = plan.waves.find((w) => w.wave === 2);
  const candidates = (wave2?.items ?? [])
    .filter((it) => it.stage === 'answer' && !!it.question)
    .slice(0, Math.max(0, limit));

  const out: Record<string, { passage: string; faqJsonLd: string }> = {};

  await Promise.all(
    candidates.map(async (it) => {
      const question = it.question as string;
      try {
        const entity = business.category
          ? `"${business.name}" (${business.category})`
          : `"${business.name}"`;
        const prompt =
          `כתוב פסקת תשובה אחת בעברית טבעית, באורך 40 עד 60 מילים, שעונה ישירות ומיד על השאלה הבאה, ` +
          `ומזכירה את ${entity} כישות שעונה על הצורך. ` +
          `בלי מקף ארוך, בלי מילות מילוי, בלי כותרת ובלי הקדמה. החזר רק את הפסקה עצמה.\n\n` +
          `השאלה: ${question}`;
        const ans = await provider.ask(prompt);
        const passage = (ans?.text ?? '').trim();
        if (!passage) return;
        const faq = {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: question,
              acceptedAnswer: { '@type': 'Answer', text: passage },
            },
          ],
        };
        out[it.id] = { passage, faqJsonLd: JSON.stringify(faq, null, 2) };
      } catch {
        // Never throw: a failed draft just means no draft for this item.
      }
    }),
  );

  return out;
}
