// Layer B scan engine for /ai-checker — real HTTP checks, no API keys required.
// Answers "can an AI find and ingest this site": crawlability, structure, corpus & entity presence.
// All external calls degrade gracefully (a failed probe becomes 'partial'/'fail', never throws).

import type {
  BusinessGuess,
  CategoryKey,
  GeoCategory,
  GeoScanResult,
  GeoSignal,
  SignalStatus,
} from './geo-types';

const FETCH_TIMEOUT_MS = 8000;
const UA =
  'Mozilla/5.0 (compatible; HelixAICheckerBot/1.0; +https://helix.co.il/ai-checker)';

// AI crawlers a GEO-ready robots.txt should NOT be blocking.
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'anthropic-ai',
  'PerplexityBot',
  'Google-Extended',
  'CCBot',
];

async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': UA, ...(init?.headers ?? {}) },
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchText(url: string): Promise<{ res: Response; body: string } | null> {
  const res = await fetchWithTimeout(url);
  if (!res) return null;
  try {
    const body = await res.text();
    return { res, body };
  } catch {
    return null;
  }
}

/** Normalize user input into an absolute https URL + origin. Returns null if unusable. */
export function normalizeUrl(raw: string): { url: string; origin: string; host: string } | null {
  if (!raw || typeof raw !== 'string') return null;
  let candidate = raw.trim();
  if (!candidate) return null;
  if (!/^https?:\/\//i.test(candidate)) candidate = `https://${candidate}`;
  try {
    const u = new URL(candidate);
    if (!/^https?:$/.test(u.protocol)) return null;
    if (!u.hostname.includes('.')) return null;
    return { url: u.toString(), origin: u.origin, host: u.hostname };
  } catch {
    return null;
  }
}

// ---------- HTML signal extraction (targeted regex, dependency-free) ----------

function firstMatch(re: RegExp, html: string): string | null {
  const m = re.exec(html);
  return m ? (m[1] ?? '').trim() : null;
}

function extractHtmlSignals(html: string) {
  const head = html.slice(0, 200_000);
  const title = firstMatch(/<title[^>]*>([\s\S]*?)<\/title>/i, head);
  const metaDesc = firstMatch(
    /<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["']/i,
    head,
  );
  const viewport = /<meta[^>]+name=["']viewport["']/i.test(head);
  const langMatch = firstMatch(/<html[^>]+lang=["']([^"']+)["']/i, head);
  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  const canonical = /<link[^>]+rel=["']canonical["']/i.test(head);
  const jsonLd = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i.exec(
    html,
  );
  const ogTags = (html.match(/<meta[^>]+property=["']og:/gi) || []).length;
  const robotsMeta = firstMatch(
    /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i,
    head,
  );
  const ogSiteName = firstMatch(
    /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i,
    head,
  );

  // Rough clean-text length (strip tags/scripts/styles) — token-economy heuristic.
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // NAP heuristics: Israeli phone or an address-ish signal.
  const hasPhone = /(?:0(?:5\d|[2-4,8-9])[-\s]?\d{3}[-\s]?\d{4})|(?:\+972)/.test(text);
  const hasAddress = /(?:רחוב|רח['׳]|שדרות|כתובת|address|street)/i.test(text);

  // Schema type guess for category.
  let schemaType: string | null = null;
  if (jsonLd) {
    const t = /"@type"\s*:\s*"([^"]+)"/i.exec(jsonLd[1]);
    if (t) schemaType = t[1];
  }

  return {
    title,
    metaDesc,
    viewport,
    lang: langMatch,
    h1Count,
    canonical,
    hasJsonLd: !!jsonLd,
    schemaType,
    ogCount: ogTags,
    robotsMeta,
    ogSiteName,
    textLength: text.length,
    hasPhone,
    hasAddress,
  };
}

function guessBusiness(
  host: string,
  s: ReturnType<typeof extractHtmlSignals>,
  hasAddress: boolean,
): BusinessGuess {
  const name =
    s.ogSiteName ||
    (s.title ? s.title.split(/[|\-–—·]/)[0].trim() : '') ||
    host.replace(/^www\./, '');
  return {
    name: name || host,
    category: s.schemaType && s.schemaType !== 'WebSite' ? s.schemaType : undefined,
    location: hasAddress ? 'IL' : undefined,
  };
}

// ---------- robots.txt parsing ----------

function robotsBlocksAi(robots: string): { blocked: string[]; sitemap: boolean } {
  const lower = robots.toLowerCase();
  const sitemap = /sitemap\s*:/i.test(robots);
  const blocked: string[] = [];
  // Very rough: look for a "User-agent: <ai>" block followed by "Disallow: /".
  for (const bot of AI_CRAWLERS) {
    const re = new RegExp(
      `user-agent:\\s*${bot.toLowerCase()}[\\s\\S]*?(disallow:\\s*/\\s*(?:\\n|$))`,
      'i',
    );
    if (re.test(lower)) blocked.push(bot);
  }
  return { blocked, sitemap };
}

// ---------- corpus + entity presence (free public APIs) ----------

/** Common Crawl index — is the domain present in the corpus most LLMs train on? */
async function commonCrawlPresence(host: string): Promise<SignalStatus> {
  try {
    const collRes = await fetchWithTimeout('https://index.commoncrawl.org/collinfo.json');
    if (!collRes || !collRes.ok) return 'partial';
    const colls = (await collRes.json()) as Array<{ 'cdx-api': string }>;
    const api = colls?.[0]?.['cdx-api'];
    if (!api) return 'partial';
    const q = `${api}?url=${encodeURIComponent(host)}/*&output=json&limit=1`;
    const res = await fetchWithTimeout(q);
    if (!res) return 'partial';
    if (res.status === 200) {
      const body = await res.text();
      return body.trim().length > 0 ? 'pass' : 'fail';
    }
    if (res.status === 404) return 'fail';
    return 'partial';
  } catch {
    return 'partial';
  }
}

/** Wikidata — does an entity exist for this business name? */
async function wikidataEntity(name: string): Promise<SignalStatus> {
  if (!name) return 'fail';
  try {
    const q =
      'https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=he&limit=1&search=' +
      encodeURIComponent(name);
    const res = await fetchWithTimeout(q, { headers: { Accept: 'application/json' } });
    if (!res || !res.ok) return 'partial';
    const data = (await res.json()) as { search?: unknown[] };
    return data.search && data.search.length > 0 ? 'pass' : 'fail';
  } catch {
    return 'partial';
  }
}

// ---------- scoring ----------

function statusScore(s: SignalStatus): number {
  return s === 'pass' ? 1 : s === 'partial' ? 0.5 : 0;
}

function categoryScore(signals: GeoSignal[]): number {
  const total = signals.reduce((a, s) => a + s.weight, 0) || 1;
  const got = signals.reduce((a, s) => a + s.weight * statusScore(s.status), 0);
  return Math.round((got / total) * 100);
}

// ---------- main ----------

export async function scanSite(rawUrl: string): Promise<GeoScanResult> {
  const norm = normalizeUrl(rawUrl);
  if (!norm) {
    return emptyResult(rawUrl, 'invalid_url');
  }
  const { url, origin, host } = norm;

  const main = await fetchText(url);
  if (!main) {
    return emptyResult(url, 'unreachable');
  }
  const contentType = main.res.headers.get('content-type') || '';
  if (!/html/i.test(contentType)) {
    return emptyResult(url, 'not_html');
  }

  const finalUrl = main.res.url || url;
  const https = finalUrl.startsWith('https://');
  const html = main.body;
  const s = extractHtmlSignals(html);

  // Parallel side fetches.
  const [robotsR, llmsR, sitemapR, ccStatus, wdStatus] = await Promise.all([
    fetchText(`${origin}/robots.txt`),
    fetchWithTimeout(`${origin}/llms.txt`, { method: 'GET' }),
    fetchWithTimeout(`${origin}/sitemap.xml`, { method: 'GET' }),
    commonCrawlPresence(host),
    wikidataEntity(s.ogSiteName || (s.title ? s.title.split(/[|\-–—·]/)[0].trim() : host)),
  ]);

  const robotsInfo = robotsR ? robotsBlocksAi(robotsR.body) : { blocked: [], sitemap: false };
  const hasRobots = !!robotsR && robotsR.res.status === 200;
  const hasLlms = !!llmsR && llmsR.status === 200;
  const hasSitemap =
    (!!sitemapR && sitemapR.status === 200) || robotsInfo.sitemap;

  // SSR heuristic: real server-rendered text present (not an empty SPA shell).
  const ssr: SignalStatus =
    s.textLength > 1500 ? 'pass' : s.textLength > 400 ? 'partial' : 'fail';

  const noindex = /noindex/i.test(s.robotsMeta || '');

  const foundation: GeoSignal[] = [
    sig('https', 'האתר מאובטח (HTTPS)', https ? 'pass' : 'fail', https ? 'האתר רץ על HTTPS.' : 'האתר לא על HTTPS.', 'התקנת תעודת SSL — קריטי לאמון וגם למנועי AI.', 2),
    sig('ssr', 'התוכן נטען מיד (לא רק אחרי JavaScript)', ssr, ssr === 'pass' ? 'התוכן מוגש מוכן לקריאה.' : ssr === 'partial' ? 'חלק מהתוכן נטען מאוחר.' : 'הדף כמעט ריק בלי הרצת JavaScript — סוכני AI לא רואים אותו.', 'להגיש תוכן מרונדר משרת (SSR) כדי שה-AI יקרא אותו.', 3),
    sig('title', 'כותרת עמוד ברורה', s.title ? 'pass' : 'fail', s.title ? `הכותרת: "${truncate(s.title, 60)}"` : 'אין תגית כותרת.', 'להוסיף כותרת ממוקדת עם שם העסק והתחום.', 2),
    sig('description', 'תיאור קצר לעמוד', s.metaDesc ? 'pass' : 'fail', s.metaDesc ? 'קיים תיאור meta.' : 'אין תיאור meta — ה-AI ממציא לבד מה האתר.', 'להוסיף meta description שמסביר מה העסק עושה.', 1),
    sig('h1', 'כותרת ראשית אחת', s.h1Count === 1 ? 'pass' : s.h1Count === 0 ? 'fail' : 'partial', s.h1Count === 1 ? 'יש H1 אחד ברור.' : s.h1Count === 0 ? 'אין כותרת H1.' : `יש ${s.h1Count} כותרות H1 — מבלבל.`, 'כותרת H1 אחת שמסכמת את העמוד.', 1),
    sig('viewport', 'מותאם למובייל', s.viewport ? 'pass' : 'fail', s.viewport ? 'מוגדר viewport.' : 'אין viewport — לא מותאם למובייל.', 'להוסיף meta viewport.', 1),
    sig('sitemap', 'מפת אתר (sitemap)', hasSitemap ? 'pass' : 'fail', hasSitemap ? 'נמצאה מפת אתר.' : 'לא נמצאה sitemap.xml.', 'ליצור sitemap.xml ולהצהיר עליו ב-robots.txt.', 1),
    sig('robotstxt', 'קובץ הנחיות לרובוטים', hasRobots ? 'pass' : 'partial', hasRobots ? 'קיים robots.txt.' : 'לא נמצא robots.txt.', 'להוסיף robots.txt שמאפשר גישה.', 1),
  ];

  const structured: GeoSignal[] = [
    sig('schema', 'כרטיס ביקור דיגיטלי (Schema)', s.hasJsonLd ? 'pass' : 'fail', s.hasJsonLd ? `נמצא Schema${s.schemaType ? ` (${s.schemaType})` : ''}.` : 'אין נתונים מובנים — ה-AI לא יודע שאתה עסק.', 'להוסיף JSON-LD מסוג Organization/LocalBusiness.', 3),
    sig('og', 'תצוגה יפה בשיתוף (OpenGraph)', s.ogCount >= 3 ? 'pass' : s.ogCount > 0 ? 'partial' : 'fail', s.ogCount >= 3 ? 'תגיות OpenGraph קיימות.' : s.ogCount > 0 ? 'חלק מתגיות ה-OpenGraph חסרות.' : 'אין תגיות OpenGraph.', 'להוסיף og:title, og:description, og:image.', 1),
    sig('lang', 'שפת האתר מוגדרת', s.lang ? 'pass' : 'fail', s.lang ? `שפה: ${s.lang}` : 'לא הוגדרה שפה ל-HTML.', 'להגדיר lang="he" בתגית html.', 1),
    sig('nap', 'פרטי קשר גלויים (טלפון/כתובת)', s.hasPhone && s.hasAddress ? 'pass' : s.hasPhone || s.hasAddress ? 'partial' : 'fail', s.hasPhone || s.hasAddress ? 'נמצאו חלק מפרטי הקשר.' : 'לא נמצאו טלפון/כתובת בטקסט.', 'להציג טלפון וכתובת כטקסט (לא רק בתמונה).', 2),
  ];

  const ai: GeoSignal[] = [
    sig('llms', 'קובץ הכוונה ל-AI (llms.txt)', hasLlms ? 'pass' : 'fail', hasLlms ? 'קיים llms.txt.' : 'אין llms.txt — הסטנדרט החדש שמכוון מודלים של AI לתוכן שלך.', 'ליצור llms.txt שמפנה את מנועי ה-AI לתוכן החשוב.', 3),
    sig('ai_access', 'גישה פתוחה למנועי AI', robotsInfo.blocked.length === 0 ? 'pass' : 'fail', robotsInfo.blocked.length === 0 ? 'לא חוסמים סורקי AI.' : `חוסמים סורקי AI: ${robotsInfo.blocked.join(', ')}.`, 'להסיר את החסימה של GPTBot/ClaudeBot/PerplexityBot מ-robots.txt.', 3),
    sig('depth', 'מספיק תוכן לקריאה', ssr === 'pass' && s.textLength > 2500 ? 'pass' : s.textLength > 800 ? 'partial' : 'fail', s.textLength > 2500 ? 'יש עומק תוכן שה-AI יכול לצטט.' : 'מעט מדי תוכן טקסטואלי.', 'להוסיף תוכן טקסטואלי מהותי (שירותים, שאלות ותשובות).', 1),
    sig('indexable', 'מותר לאינדוקס', noindex ? 'fail' : 'pass', noindex ? 'הדף מסומן noindex — לא ייכלל בחיפוש/AI.' : 'הדף פתוח לאינדוקס.', 'להסיר את תגית noindex.', 2),
    sig('corpus', 'האתר נמצא במאגר האימון (Common Crawl)', ccStatus, ccStatus === 'pass' ? 'הדומיין נמצא במאגר שממנו לומדים מודלים.' : ccStatus === 'partial' ? 'לא הצלחנו לוודא נוכחות במאגר.' : 'הדומיין לא נמצא במאגר האימון של מודלי ה-AI.', 'לוודא נגישות ותוכן איכותי כדי להיסרק ל-Common Crawl.', 2),
    sig('entity', 'ישות מזוהה (Wikidata)', wdStatus, wdStatus === 'pass' ? 'נמצאה ישות מזוהה לעסק.' : wdStatus === 'partial' ? 'לא הצלחנו לוודא ישות.' : 'אין ישות Wikidata — מודלים מתקשים "לזהות" את העסק.', 'לבסס נוכחות ומקורות שמובילים לישות Wikidata/Knowledge Graph.', 1),
  ];

  const categories: GeoCategory[] = [
    { key: 'foundation' as CategoryKey, label: 'הבסיס — האם בכלל אפשר לקרוא אותך', score: categoryScore(foundation), signals: foundation },
    { key: 'structured' as CategoryKey, label: 'הזהות — האם ה-AI מבין שאתה עסק', score: categoryScore(structured), signals: structured },
    { key: 'ai' as CategoryKey, label: 'המוכנות ל-AI — האם ה-AI ימצא וימליץ', score: categoryScore(ai), signals: ai },
  ];

  // Weighted ladder: AI-readiness matters most.
  const ladderRaw =
    (categories[0].score * 0.3 + categories[1].score * 0.25 + categories[2].score * 0.45) / 100;
  const ladder = Math.max(1, Math.min(10, Math.round(ladderRaw * 10)));

  const issuesCount = categories.reduce(
    (a, c) => a + c.signals.filter((x) => x.status !== 'pass').length,
    0,
  );

  return {
    ok: true,
    url,
    finalUrl,
    https,
    ladder,
    categories,
    issuesCount,
    business: guessBusiness(host, s, s.hasAddress),
  };
}

function sig(
  key: string,
  label: string,
  status: SignalStatus,
  detail: string,
  fix: string,
  weight: number,
): GeoSignal {
  return { key, label, status, detail, fix, weight };
}

function truncate(str: string, n: number): string {
  return str.length > n ? `${str.slice(0, n)}…` : str;
}

function emptyResult(url: string, error: string): GeoScanResult {
  return {
    ok: false,
    error,
    url,
    finalUrl: url,
    https: url.startsWith('https://'),
    ladder: 0,
    categories: [],
    issuesCount: 0,
    business: { name: '' },
  };
}
