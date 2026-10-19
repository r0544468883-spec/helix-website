import 'server-only';

// The Israeli citation-graph layer — the part of the GEO report no global tool has.
//
// When an AI engine answers a buyer question about an Israeli business ("מי מומלץ
// ל... בישראל"), it grounds the answer in a SMALL, specific set of Israeli sources:
// business directories (דפי זהב, B144, זאפ), official registries (gov.il, רשם
// החברות), Israeli business media (גלובס, כלכליסט, גיקטיים), and Israeli community
// (Reddit r/Israel). Being absent from that graph is why a strong local business is
// invisible to ChatGPT in Hebrew even when it ranks fine on Google.
//
// This module does NOT assert "you are / are not listed on X" (we did not log into
// each directory to check). It measures what we can prove: which Israeli sources the
// engines ACTUALLY cited in this category, and turns the curated graph into a
// prioritized, honest action checklist. Evidence first, no fabrication.

/** Where in the Israeli answer-graph a source sits. */
export type IsraeliTier = 'directory' | 'authority' | 'media' | 'community' | 'knowledge';

/** Can you go create/claim a listing (directory/authority), or must you earn it (media/community)? */
export type SourceKind = 'claimable' | 'earned';

export interface IsraeliSource {
  /** bare hostname, lowercased, no www. */
  domain: string;
  /** Hebrew display name. */
  label: string;
  tier: IsraeliTier;
  kind: SourceKind;
  /** One-line Hebrew reason this source matters for AI answers. */
  why: string;
  /** Relative weight in the footprint score (higher = the AI leans on it more). */
  weight: number;
}

// The curated graph. Ordered roughly by how much Israeli AI answers lean on each.
// Domains are matched by suffix, so "d.co.il" also matches "www.d.co.il".
const ISRAELI_SOURCES: IsraeliSource[] = [
  // Directories — the backbone of Israeli local answers.
  { domain: 'dapey-zahav.co.il', label: 'דפי זהב', tier: 'directory', kind: 'claimable', weight: 10, why: 'ספריית העסקים הגדולה בישראל, מצוטטת תדיר בתשובות על נותני שירות מקומיים.' },
  { domain: 'd.co.il', label: 'דפי זהב (d.co.il)', tier: 'directory', kind: 'claimable', weight: 10, why: 'הדומיין הקצר של דפי זהב, מקור עובדתי מרכזי על עסקים ישראליים.' },
  { domain: 'b144.co.il', label: 'B144', tier: 'directory', kind: 'claimable', weight: 9, why: 'מדריך עסקים ותיק, רשומות NAP (שם-כתובת-טלפון) שה-AI מסתמך עליהן.' },
  { domain: 'zap.co.il', label: 'זאפ', tier: 'directory', kind: 'claimable', weight: 9, why: 'השוואת מוצרים ושירותים מובילה, מקור מרכזי לשאלות "מה הכי טוב".' },
  { domain: 'easy.co.il', label: 'איזי (easy)', tier: 'directory', kind: 'claimable', weight: 7, why: 'מדריך עסקים וכתובות, נוכחות מחזקת עקביות ישות (entity).' },
  { domain: 'rest.co.il', label: 'Rest (מסעדות)', tier: 'directory', kind: 'claimable', weight: 6, why: 'מקור מוביל לשאלות מסעדות ובתי עסק בתחום המזון.' },
  { domain: 'yad2.co.il', label: 'יד2', tier: 'directory', kind: 'claimable', weight: 6, why: 'מקור מרכזי לנדל"ן, רכב ומוצרים, מצוטט בתשובות בתחומים אלו.' },
  // Authority — official data the engines trust highly.
  { domain: 'gov.il', label: 'gov.il (ממשלתי)', tier: 'authority', kind: 'claimable', weight: 8, why: 'מקור רשמי; רישום/אזכור ממשלתי מעלה אמון המנוע בעובדות העסק.' },
  { domain: 'justice.gov.il', label: 'רשם החברות', tier: 'authority', kind: 'claimable', weight: 7, why: 'רישום רשמי של הישות המשפטית, מבסס קיום ואמינות.' },
  { domain: 'tax.gov.il', label: 'רשות המסים', tier: 'authority', kind: 'claimable', weight: 5, why: 'אזכור רשמי נוסף שמחזק את זהות העסק.' },
  // Media — Israeli business press, high authority for AI.
  { domain: 'globes.co.il', label: 'גלובס', tier: 'media', kind: 'earned', weight: 8, why: 'עיתון הכלכלה המוביל; אזכור מערכתי = איתות אמון חזק למנוע.' },
  { domain: 'calcalist.co.il', label: 'כלכליסט', tier: 'media', kind: 'earned', weight: 8, why: 'תקשורת כלכלית מובילה, מצוטטת תדיר בתשובות על חברות ישראליות.' },
  { domain: 'themarker.com', label: 'דה-מרקר', tier: 'media', kind: 'earned', weight: 7, why: 'כיסוי עסקי/כלכלי; אזכור מחזק נוכחות ומוניטין.' },
  { domain: 'geektime.co.il', label: 'גיקטיים', tier: 'media', kind: 'earned', weight: 7, why: 'מגזין הטכנולוגיה המוביל, מקור מרכזי לשאלות על חברות הייטק/סטארטאפ.' },
  { domain: 'pc.co.il', label: 'אנשים ומחשבים', tier: 'media', kind: 'earned', weight: 5, why: 'תקשורת IT ותיקה, מחזקת נוכחות בתחום הטכנולוגי.' },
  { domain: 'ynet.co.il', label: 'ynet', tier: 'media', kind: 'earned', weight: 6, why: 'אתר החדשות הגדול; אזכור מגדיל סיכוי ציטוט בתשובות כלליות.' },
  { domain: 'mako.co.il', label: 'mako', tier: 'media', kind: 'earned', weight: 5, why: 'מקור חדשות רחב-תפוצה, תורם לפוטפרינט המקומי.' },
  { domain: 'walla.co.il', label: 'וואלה', tier: 'media', kind: 'earned', weight: 5, why: 'פורטל תוכן מרכזי, אזכור מחזק קונצנזוס מקומי.' },
  // Community + knowledge — AI leans heavily on these for "real" opinions.
  { domain: 'reddit.com', label: 'Reddit (r/Israel)', tier: 'community', kind: 'earned', weight: 9, why: 'מקור הציטוט מספר 1 של מנועי AI; דיון אותנטי משפיע ישירות על המלצות.' },
  { domain: 'he.wikipedia.org', label: 'ויקיפדיה עברית', tier: 'knowledge', kind: 'earned', weight: 7, why: 'גרף הידע; ערך עברי מבסס את הישות ומצוטט כעובדה.' },
];

const bareHost = (h: string) => h.replace(/^www\./, '').toLowerCase();

/** True when `domain` is, or is a subdomain of, `suffix`. */
function matchesDomain(domain: string, suffix: string): boolean {
  const d = bareHost(domain);
  const s = suffix.toLowerCase();
  return d === s || d.endsWith(`.${s}`);
}

/** Find the curated Israeli source a cited domain belongs to, or null. */
function classify(domain: string): IsraeliSource | null {
  for (const src of ISRAELI_SOURCES) {
    if (matchesDomain(domain, src.domain)) return src;
  }
  return null;
}

/** A cited-source row as it reaches us (shape is tolerant; see geo-report-build). */
type CitedLike = { domain?: string; url?: string; engines?: unknown; count?: unknown };

function citedDomain(c: CitedLike): string | null {
  const raw = (c.domain || c.url || '').trim();
  if (!raw) return null;
  try {
    const u = raw.includes('://') ? new URL(raw) : new URL(`https://${raw}`);
    return bareHost(u.hostname);
  } catch {
    return null;
  }
}

/** One Israeli source the engines actually cited in this category (evidence we have). */
export interface IsraeliCitedSource {
  domain: string;
  label: string;
  tier: IsraeliTier;
  engines: string[];
  count: number;
  why: string;
}

/** One curated Israeli source the brand should go win, with a concrete Hebrew action. */
export interface IsraeliGap {
  domain: string;
  label: string;
  tier: IsraeliTier;
  kind: SourceKind;
  why: string;
  action: string;
  /** Lower number = do this first. */
  priority: number;
}

export interface IsraeliPresence {
  /** False when the business is not Israeli-relevant (then the report hides this section). */
  relevant: boolean;
  /** 0-100 observed footprint in the Israeli citation graph (evidence-based, not asserted). */
  footprint: number;
  /** Israeli sources the engines cited while answering in this category. */
  citedSources: IsraeliCitedSource[];
  /** Curated Israeli sources we did NOT see feeding the answers, as a prioritized to-do. */
  gaps: IsraeliGap[];
  /** One honest Hebrew sentence summarizing the finding. */
  note: string;
}

/** Heuristic: is this business Israeli / Hebrew-market, so the Israeli layer applies? */
export function detectIsraeliLocale(input: {
  host: string;
  location?: string;
  hebrewSignal?: boolean;
}): boolean {
  const host = bareHost(input.host);
  if (host.endsWith('.co.il') || host.endsWith('.org.il') || host.endsWith('.net.il') || host.endsWith('.ac.il') || host.endsWith('.gov.il') || host === 'il' || host.endsWith('.il')) {
    return true;
  }
  const loc = (input.location || '').toLowerCase();
  if (loc.includes('israel') || loc.includes('ישראל') || loc === 'il') return true;
  if (input.hebrewSignal) return true;
  return false;
}

function actionFor(src: IsraeliSource): string {
  if (src.kind === 'claimable') {
    switch (src.tier) {
      case 'authority':
        return `לוודא רישום/אזכור רשמי ב-${src.label} ולהצליב שם-כתובת-טלפון זהים לאתר.`;
      default:
        return `ליצור או לאמת רשומת עסק ב-${src.label} עם שם-כתובת-טלפון זהים לאתר (NAP עקבי).`;
    }
  }
  // earned
  if (src.tier === 'community') {
    return `להשיג אזכור/דיון אותנטי ב-${src.label} (המקור שה-AI הכי סומך עליו).`;
  }
  if (src.tier === 'knowledge') {
    return `לבסס ערך/אזכור ב-${src.label} כדי לחזק את הישות בגרף הידע.`;
  }
  return `להשיג אזכור מערכתי ב-${src.label} (יחסי ציבור/תוכן מקצועי).`;
}

/**
 * Build the Israeli citation-graph layer from the Share-of-Model cited sources.
 * `citedSources` is the aggregated list of domains the engines cited across all
 * (question, engine, run) triples. We cross-reference it with the curated graph.
 */
export function buildIsraeliPresence(args: {
  host: string;
  location?: string;
  hebrewSignal?: boolean;
  citedSources: CitedLike[];
}): IsraeliPresence {
  const relevant = detectIsraeliLocale({
    host: args.host,
    location: args.location,
    hebrewSignal: args.hebrewSignal,
  });

  // Aggregate every cited domain onto its curated Israeli source.
  const hitByDomain = new Map<string, { src: IsraeliSource; engines: Set<string>; count: number }>();
  for (const c of args.citedSources) {
    const dom = citedDomain(c);
    if (!dom) continue;
    const src = classify(dom);
    if (!src) continue;
    const engines = Array.isArray(c.engines)
      ? c.engines.filter((e): e is string => typeof e === 'string')
      : [];
    const count = typeof c.count === 'number' && c.count > 0 ? c.count : 1;
    const cur = hitByDomain.get(src.domain) ?? { src, engines: new Set<string>(), count: 0 };
    for (const e of engines) cur.engines.add(e);
    cur.count += count;
    hitByDomain.set(src.domain, cur);
  }

  const citedSources: IsraeliCitedSource[] = [...hitByDomain.values()]
    .map(({ src, engines, count }) => ({
      domain: src.domain,
      label: src.label,
      tier: src.tier,
      engines: [...engines],
      count,
      why: src.why,
    }))
    .sort((a, b) => b.count - a.count);

  // Footprint: weighted coverage of the graph that actually showed up in citations,
  // capped so a handful of strong sources already reads as solid. Evidence-based.
  const hitWeight = [...hitByDomain.values()].reduce((a, h) => a + h.src.weight, 0);
  // A pragmatic "good" footprint target: the three heaviest directories + Reddit.
  const TARGET_WEIGHT = 30;
  const footprint = relevant
    ? Math.max(0, Math.min(100, Math.round((hitWeight / TARGET_WEIGHT) * 100)))
    : 0;

  // Gaps: curated sources we did NOT see feeding the answers. Claimable first, then
  // by weight. De-duplicate the two דפי זהב domains (keep the short one).
  const seen = new Set(hitByDomain.keys());
  const gaps: IsraeliGap[] = ISRAELI_SOURCES.filter((src) => {
    if (seen.has(src.domain)) return false;
    if (src.domain === 'dapey-zahav.co.il' && seen.has('d.co.il')) return false;
    return true;
  })
    // Drop the duplicate דפי זהב long-domain if the short one is also a gap.
    .filter((src, _i, all) => !(src.domain === 'dapey-zahav.co.il' && all.some((o) => o.domain === 'd.co.il')))
    .map((src) => {
      // claimable before earned; within that, heaviest first.
      const kindRank = src.kind === 'claimable' ? 0 : 1;
      return {
        src,
        priority: kindRank * 1000 + (100 - src.weight),
      };
    })
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 10)
    .map(({ src }, i) => ({
      domain: src.domain,
      label: src.label,
      tier: src.tier,
      kind: src.kind,
      why: src.why,
      action: actionFor(src),
      priority: i + 1,
    }));

  let note: string;
  if (!relevant) {
    note = 'העסק אינו מזוהה כעסק ישראלי, לכן שכבת המקורות הישראליים אינה רלוונטית לדוח זה.';
  } else if (citedSources.length === 0) {
    note =
      'המנועים לא ציטטו אף מקור ישראלי מוכר (דפי זהב, B144, זאפ, גלובס, רדיט וכו\') כשענו על שאלות בתחום שלך. ' +
      'זו הסיבה המרכזית לכך שאתה כמעט בלתי-נראה ל-AI בעברית, וזו גם ההזדמנות: אלה בדיוק המקומות לכבוש.';
  } else {
    const names = citedSources.slice(0, 3).map((s) => s.label).join(', ');
    note =
      `המנועים כבר שואבים מתוך מקורות ישראליים בתחום שלך (${names}). ` +
      'השלמת המקומות החסרים ברשימה למטה תגדיל ישירות את הסיכוי שיזכירו וימליצו עליך בעברית.';
  }

  return { relevant, footprint, citedSources, gaps, note };
}
