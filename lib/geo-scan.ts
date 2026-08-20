// Layer B scan engine for /ai-checker, real HTTP checks, no API keys required.
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

// Firecrawl (optional): JS-rendered fetch so signal extraction works on SPA/JS sites.
// Set FIRECRAWL_API_KEY to enable; FIRECRAWL_BASE_URL points at a self-hosted instance.
// Without a key the scanner degrades gracefully to the raw (no-JS) fetch below.
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || '';
const FIRECRAWL_BASE_URL = (
  process.env.FIRECRAWL_BASE_URL || 'https://api.firecrawl.dev'
).replace(/\/+$/, '');
const FIRECRAWL_TIMEOUT_MS = 20000; // rendering needs more headroom than a raw fetch

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

type FirecrawlResult = { html: string; markdown: string; finalUrl: string };

/**
 * JS-rendered fetch via Firecrawl. Returns rendered rawHtml + markdown so the scanner
 * sees the real content of SPA/JS sites. Returns null (graceful) when unconfigured or on error.
 */
async function fetchViaFirecrawl(url: string): Promise<FirecrawlResult | null> {
  if (!FIRECRAWL_API_KEY) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FIRECRAWL_TIMEOUT_MS);
  try {
    const res = await fetch(`${FIRECRAWL_BASE_URL}/v2/scrape`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        url,
        formats: ['markdown', 'rawHtml'],
        onlyMainContent: false,
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: {
        rawHtml?: string;
        html?: string;
        markdown?: string;
        metadata?: { sourceURL?: string; url?: string };
      };
    };
    const d = json?.data;
    if (!d) return null;
    const html = d.rawHtml || d.html || '';
    const markdown = d.markdown || '';
    if (!html && !markdown) return null;
    return { html, markdown, finalUrl: d.metadata?.sourceURL || d.metadata?.url || url };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Clean-text length of an HTML blob (strip scripts/styles/tags). */
function cleanTextLen(html: string): number {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim().length;
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

  // Rough clean-text length (strip tags/scripts/styles), token-economy heuristic.
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

  // FAQPage schema anywhere in the doc (not just the first JSON-LD block), +40% AI citation.
  const hasFaqSchema = /"@type"\s*:\s*"FAQPage"/i.test(html);

  // hreflang tags, bidirectional language targeting. he-IL matters for google.co.il.
  const hreflangs = [
    ...html.matchAll(/<link[^>]+rel=["']alternate["'][^>]+hreflang=["']([^"']+)["']/gi),
  ].map((m) => m[1].toLowerCase());
  const hasHeIL = hreflangs.some((h) => h === 'he-il' || h === 'he');

  // Image alt coverage (accessibility + image SEO + AI understanding).
  const imgTags = html.match(/<img\b[^>]*>/gi) || [];
  const imgTotal = imgTags.length;
  const imgWithAlt = imgTags.filter((t) => /\balt\s*=\s*["'][^"']*\S[^"']*["']/i.test(t)).length;

  // Analytics/measurement present (GA4/UA/GTM), post-launch checklist item.
  const hasAnalytics =
    /googletagmanager\.com\/gtag\/js|www\.google-analytics\.com|gtag\s*\(|\bG-[A-Z0-9]{6,}\b|\bUA-\d{4,}-\d\b/i.test(
      html,
    );

  return {
    title,
    metaDesc,
    viewport,
    lang: langMatch,
    h1Count,
    canonical,
    hasJsonLd: !!jsonLd,
    schemaType,
    hasFaqSchema,
    hreflangs,
    hasHeIL,
    imgTotal,
    imgWithAlt,
    hasAnalytics,
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

/** Common Crawl index, is the domain present in the corpus most LLMs train on? */
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

/** Wikidata, does an entity exist for this business name? */
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

/** Wikipedia, is there an article for this business (he first, then en)? A
 *  Wikipedia page is one of the strongest entity signals LLMs are trained on. */
async function wikipediaEntity(name: string): Promise<SignalStatus> {
  if (!name) return 'fail';
  const langs = ['he', 'en'];
  let sawResponse = false;
  for (const lang of langs) {
    try {
      const q =
        `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&format=json` +
        '&srlimit=1&srprop=&origin=*&srsearch=' +
        encodeURIComponent(name);
      const res = await fetchWithTimeout(q, { headers: { Accept: 'application/json' } });
      if (!res || !res.ok) continue;
      sawResponse = true;
      const data = (await res.json()) as { query?: { search?: unknown[] } };
      if (data.query?.search && data.query.search.length > 0) return 'pass';
    } catch {
      /* try next language */
    }
  }
  return sawResponse ? 'fail' : 'partial';
}

// ---------- performance, links, bing (technical SEO) ----------

/** Google PageSpeed Insights (mobile), Lighthouse performance + Core Web Vitals.
 *  Slow API, so it uses its own longer timeout. Optional PAGESPEED_API_KEY raises quota. */
async function pageSpeed(
  url: string,
): Promise<{ status: SignalStatus; perf: number | null; lcp: number | null; cls: number | null }> {
  const miss = { status: 'partial' as SignalStatus, perf: null, lcp: null, cls: null };
  try {
    const key = process.env.PAGESPEED_API_KEY;
    const api =
      'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?strategy=mobile&category=performance&url=' +
      encodeURIComponent(url) +
      (key ? `&key=${key}` : '');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    let res: Response;
    try {
      res = await fetch(api, { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) return miss;
    const j = (await res.json()) as {
      lighthouseResult?: {
        categories?: { performance?: { score?: number } };
        audits?: Record<string, { numericValue?: number }>;
      };
    };
    const score = j.lighthouseResult?.categories?.performance?.score;
    const audits = j.lighthouseResult?.audits;
    const perf = typeof score === 'number' ? Math.round(score * 100) : null;
    const lcp = audits?.['largest-contentful-paint']?.numericValue ?? null;
    const cls = audits?.['cumulative-layout-shift']?.numericValue ?? null;
    const status: SignalStatus =
      perf === null ? 'partial' : perf >= 90 ? 'pass' : perf >= 50 ? 'partial' : 'fail';
    return { status, perf, lcp: typeof lcp === 'number' ? lcp : null, cls: typeof cls === 'number' ? cls : null };
  } catch {
    return miss;
  }
}

/** Sample internal links and HEAD-check them for 404s (broken links hurt crawl + trust). */
async function checkBrokenLinks(
  html: string,
  baseUrl: string,
): Promise<{ status: SignalStatus; broken: number; checked: number }> {
  try {
    const origin = new URL(baseUrl).origin;
    const hrefs = [...html.matchAll(/<a\b[^>]*href=["']([^"'#][^"']*)["']/gi)].map((m) => m[1]);
    const internal: string[] = [];
    const seen = new Set<string>();
    for (const h of hrefs) {
      if (/^(mailto:|tel:|javascript:|data:)/i.test(h)) continue;
      let abs: string;
      try {
        abs = new URL(h, baseUrl).toString();
      } catch {
        continue;
      }
      if (!abs.startsWith(origin)) continue; // internal links only
      if (seen.has(abs)) continue;
      seen.add(abs);
      internal.push(abs);
      if (internal.length >= 15) break; // bound latency
    }
    if (internal.length === 0) return { status: 'partial', broken: 0, checked: 0 };
    let broken = 0;
    await Promise.all(
      internal.map(async (u) => {
        const res = await fetchWithTimeout(u, { method: 'HEAD' });
        if (!res) return; // network/timeout, don't blame the target
        if (res.status >= 400 && res.status !== 405) broken++; // 405 = HEAD not allowed, not broken
      }),
    );
    const status: SignalStatus = broken === 0 ? 'pass' : broken <= 2 ? 'partial' : 'fail';
    return { status, broken, checked: internal.length };
  } catch {
    return { status: 'partial', broken: 0, checked: 0 };
  }
}

/** Best-effort Bing index check (Bing powers Copilot). Degrades to 'partial' if uncertain. */
async function bingIndexed(host: string): Promise<SignalStatus> {
  try {
    const res = await fetchWithTimeout(
      `https://www.bing.com/search?q=${encodeURIComponent('site:' + host)}&setlang=en`,
    );
    if (!res || !res.ok) return 'partial';
    const body = (await res.text()).toLowerCase();
    if (/there are no results|no results for|לא נמצאו תוצאות/i.test(body)) return 'fail';
    if (body.includes(host.toLowerCase())) return 'pass';
    return 'partial'; // blocked/challenge page, don't assert a false negative
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

  // Raw (no-JS) fetch + optional Firecrawl (JS-rendered) fetch, in parallel.
  // Raw = what an AI crawler sees WITHOUT running JS. Firecrawl = the fully-rendered
  // content, so signal extraction (schema/OG/NAP/business) works on SPA/JS sites too.
  const [main, fc] = await Promise.all([fetchText(url), fetchViaFirecrawl(url)]);
  if (!main && !fc) {
    return emptyResult(url, 'unreachable');
  }
  if (main && !fc) {
    const contentType = main.res.headers.get('content-type') || '';
    if (!/html/i.test(contentType)) {
      return emptyResult(url, 'not_html');
    }
  }

  const rawHtml = main?.body ?? '';
  const renderedHtml = fc?.html ?? '';
  // Prefer rendered HTML for extraction (complete on SPA sites); fall back to raw.
  const html = renderedHtml || rawHtml;
  const finalUrl = fc?.finalUrl || main?.res.url || url;
  const https = finalUrl.startsWith('https://');
  const s = extractHtmlSignals(html);

  // Content depth measured two ways: what AI sees without JS (raw) vs. fully rendered.
  const rawTextLen = cleanTextLen(rawHtml);
  const renderedTextLen = fc
    ? Math.max(cleanTextLen(renderedHtml), (fc.markdown || '').trim().length)
    : 0;
  const bestTextLen = Math.max(rawTextLen, renderedTextLen);

  // Parallel side fetches.
  const entityName = s.ogSiteName || (s.title ? s.title.split(/[|\-–—·]/)[0].trim() : host);
  const [robotsR, llmsR, sitemapR, ccStatus, wdStatus, wpStatus, psi, broken, bingStatus] =
    await Promise.all([
      fetchText(`${origin}/robots.txt`),
      fetchWithTimeout(`${origin}/llms.txt`, { method: 'GET' }),
      fetchWithTimeout(`${origin}/sitemap.xml`, { method: 'GET' }),
      commonCrawlPresence(host),
      wikidataEntity(entityName),
      wikipediaEntity(entityName),
      pageSpeed(finalUrl),
      checkBrokenLinks(html, finalUrl),
      bingIndexed(host),
    ]);

  const robotsInfo = robotsR ? robotsBlocksAi(robotsR.body) : { blocked: [], sitemap: false };
  const hasRobots = !!robotsR && robotsR.res.status === 200;
  const hasLlms = !!llmsR && llmsR.status === 200;
  const hasSitemap =
    (!!sitemapR && sitemapR.status === 200) || robotsInfo.sitemap;

  // SSR: does an AI crawler see real text WITHOUT running JavaScript? Measured on the
  // raw (un-rendered) fetch. If Firecrawl rendered rich content the raw fetch missed,
  // the content is hidden behind JS, invisible to non-JS AI crawlers → hard fail.
  const jsHidden = !!fc && rawTextLen < 400 && renderedTextLen > 1500;
  const ssr: SignalStatus = jsHidden
    ? 'fail'
    : rawTextLen > 1500
      ? 'pass'
      : rawTextLen > 400
        ? 'partial'
        : 'fail';
  const ssrDetail = jsHidden
    ? 'התוכן קיים, אבל נטען רק אחרי הרצת JavaScript. סוכני AI שלא מריצים JS לא רואים אותו כלל.'
    : ssr === 'pass'
      ? 'התוכן מוגש מוכן לקריאה גם בלי JavaScript.'
      : ssr === 'partial'
        ? 'חלק מהתוכן נטען מאוחר.'
        : 'הדף כמעט ריק, אין מספיק טקסט קריא לסוכני AI.';

  const noindex = /noindex/i.test(s.robotsMeta || '');

  // Derived statuses for the new technical/structured signals.
  const altStatus: SignalStatus =
    s.imgTotal === 0
      ? 'partial'
      : s.imgWithAlt / s.imgTotal >= 0.9
        ? 'pass'
        : s.imgWithAlt / s.imgTotal >= 0.5
          ? 'partial'
          : 'fail';
  const hreflangStatus: SignalStatus =
    s.hreflangs.length === 0 ? 'partial' : s.hasHeIL ? 'pass' : 'partial';
  const psiDetail =
    psi.perf === null
      ? 'לא הצלחנו למדוד מהירות (PageSpeed).'
      : `ציון מהירות מובייל: ${psi.perf}/100${psi.lcp !== null ? ` · LCP ${(psi.lcp / 1000).toFixed(1)}s` : ''}${psi.cls !== null ? ` · CLS ${psi.cls.toFixed(2)}` : ''}.`;

  const foundation: GeoSignal[] = [
    sig('https', 'האתר מאובטח (HTTPS)', https ? 'pass' : 'fail', https ? 'האתר רץ על HTTPS.' : 'האתר לא על HTTPS.', 'התקנת תעודת SSL, קריטי לאמון וגם למנועי AI.', 2),
    sig('pagespeed', 'מהירות טעינה (PageSpeed)', psi.status, psiDetail, 'לשפר מהירות: דחיסת תמונות (WebP), CDN, מיעוט JS. יעד: 90+ במובייל, LCP<2.5ש׳.', 3),
    sig('broken_links', 'קישורים לא שבורים', broken.status, broken.checked === 0 ? 'לא נמצאו קישורים פנימיים לבדיקה.' : broken.broken === 0 ? `נבדקו ${broken.checked} קישורים, כולם תקינים.` : `${broken.broken} קישורים שבורים מתוך ${broken.checked} שנבדקו.`, 'לתקן/להסיר קישורים שמחזירים 404, פוגעים בסריקה ובאמון.', 2),
    sig('analytics', 'מדידת תנועה (Analytics)', s.hasAnalytics ? 'pass' : 'fail', s.hasAnalytics ? 'מותקן קוד מדידה (GA4/GTM).' : 'לא זוהה קוד מדידה, בלי זה אי אפשר לדעת מה עובד.', 'להתקין Google Analytics 4 (או GTM) כדי למדוד תנועה והמרות.', 1),
    sig('ssr', 'התוכן נטען מיד (לא רק אחרי JavaScript)', ssr, ssrDetail, 'להגיש תוכן מרונדר משרת (SSR) כדי שה-AI יקרא אותו.', 3),
    sig('title', 'כותרת עמוד ברורה', s.title ? 'pass' : 'fail', s.title ? `הכותרת: "${truncate(s.title, 60)}"` : 'אין תגית כותרת.', 'להוסיף כותרת ממוקדת עם שם העסק והתחום.', 2),
    sig('description', 'תיאור קצר לעמוד', s.metaDesc ? 'pass' : 'fail', s.metaDesc ? 'קיים תיאור meta.' : 'אין תיאור meta, ה-AI ממציא לבד מה האתר.', 'להוסיף meta description שמסביר מה העסק עושה.', 1),
    sig('h1', 'כותרת ראשית אחת', s.h1Count === 1 ? 'pass' : s.h1Count === 0 ? 'fail' : 'partial', s.h1Count === 1 ? 'יש H1 אחד ברור.' : s.h1Count === 0 ? 'אין כותרת H1.' : `יש ${s.h1Count} כותרות H1, מבלבל.`, 'כותרת H1 אחת שמסכמת את העמוד.', 1),
    sig('viewport', 'מותאם למובייל', s.viewport ? 'pass' : 'fail', s.viewport ? 'מוגדר viewport.' : 'אין viewport, לא מותאם למובייל.', 'להוסיף meta viewport.', 1),
    sig('sitemap', 'מפת אתר (sitemap)', hasSitemap ? 'pass' : 'fail', hasSitemap ? 'נמצאה מפת אתר.' : 'לא נמצאה sitemap.xml.', 'ליצור sitemap.xml ולהצהיר עליו ב-robots.txt.', 1),
    sig('robotstxt', 'קובץ הנחיות לרובוטים', hasRobots ? 'pass' : 'partial', hasRobots ? 'קיים robots.txt.' : 'לא נמצא robots.txt.', 'להוסיף robots.txt שמאפשר גישה.', 1),
  ];

  const structured: GeoSignal[] = [
    sig('schema', 'כרטיס ביקור דיגיטלי (Schema)', s.hasJsonLd ? 'pass' : 'fail', s.hasJsonLd ? `נמצא Schema${s.schemaType ? ` (${s.schemaType})` : ''}.` : 'אין נתונים מובנים, ה-AI לא יודע שאתה עסק.', 'להוסיף JSON-LD מסוג Organization/LocalBusiness.', 3),
    sig('og', 'תצוגה יפה בשיתוף (OpenGraph)', s.ogCount >= 3 ? 'pass' : s.ogCount > 0 ? 'partial' : 'fail', s.ogCount >= 3 ? 'תגיות OpenGraph קיימות.' : s.ogCount > 0 ? 'חלק מתגיות ה-OpenGraph חסרות.' : 'אין תגיות OpenGraph.', 'להוסיף og:title, og:description, og:image.', 1),
    sig('lang', 'שפת האתר מוגדרת', s.lang ? 'pass' : 'fail', s.lang ? `שפה: ${s.lang}` : 'לא הוגדרה שפה ל-HTML.', 'להגדיר lang="he" בתגית html.', 1),
    sig('nap', 'פרטי קשר גלויים (טלפון/כתובת)', s.hasPhone && s.hasAddress ? 'pass' : s.hasPhone || s.hasAddress ? 'partial' : 'fail', s.hasPhone || s.hasAddress ? 'נמצאו חלק מפרטי הקשר.' : 'לא נמצאו טלפון/כתובת בטקסט.', 'להציג טלפון וכתובת כטקסט (לא רק בתמונה).', 2),
    sig('canonical', 'כתובת מועדפת (Canonical)', s.canonical ? 'pass' : 'fail', s.canonical ? 'קיים תגית canonical.' : 'אין canonical, מנועי חיפוש ו-AI עלולים לצטט כתובת שגויה/כפולה.', 'להוסיף <link rel="canonical"> לכתובת הנכונה של כל עמוד.', 1),
    sig('faq', 'סכמת שאלות ותשובות (FAQ)', s.hasFaqSchema ? 'pass' : 'fail', s.hasFaqSchema ? 'קיים FAQPage schema, מגדיל ציטוט ב-AI עד 40%.' : 'אין FAQPage schema, אחד השדרוגים החזקים ביותר לנראות ב-AI.', 'להוסיף FAQPage JSON-LD עם שאלות ותשובות אמיתיות.', 2),
    sig('alt', 'טקסט חלופי לתמונות (alt)', altStatus, s.imgTotal === 0 ? 'לא נמצאו תמונות בעמוד.' : `${s.imgWithAlt} מתוך ${s.imgTotal} תמונות עם alt.`, 'להוסיף alt תיאורי לכל תמונה, נגישות, קידום תמונות, והבנת AI.', 1),
    sig('hreflang', 'תגיות שפה (hreflang)', hreflangStatus, s.hreflangs.length === 0 ? 'לא נמצאו תגיות hreflang, נדרש רק לאתר דו-לשוני.' : s.hasHeIL ? 'קיים hreflang כולל he-IL.' : `נמצאו hreflang (${s.hreflangs.join(', ')}) אך ללא he-IL.`, 'לאתר דו-לשוני: להוסיף hreflang="he-IL" ו-x-default, דו-כיווני בין הגרסאות.', 1),
  ];

  const ai: GeoSignal[] = [
    sig('llms', 'קובץ הכוונה ל-AI (llms.txt)', hasLlms ? 'pass' : 'fail', hasLlms ? 'קיים llms.txt.' : 'אין llms.txt, הסטנדרט החדש שמכוון מודלים של AI לתוכן שלך.', 'ליצור llms.txt שמפנה את מנועי ה-AI לתוכן החשוב.', 3),
    sig('ai_access', 'גישה פתוחה למנועי AI', robotsInfo.blocked.length === 0 ? 'pass' : 'fail', robotsInfo.blocked.length === 0 ? 'לא חוסמים סורקי AI.' : `חוסמים סורקי AI: ${robotsInfo.blocked.join(', ')}.`, 'להסיר את החסימה של GPTBot/ClaudeBot/PerplexityBot מ-robots.txt.', 3),
    sig('depth', 'מספיק תוכן לקריאה', bestTextLen > 2500 ? 'pass' : bestTextLen > 800 ? 'partial' : 'fail', bestTextLen > 2500 ? 'יש עומק תוכן שה-AI יכול לצטט.' : 'מעט מדי תוכן טקסטואלי.', 'להוסיף תוכן טקסטואלי מהותי (שירותים, שאלות ותשובות).', 1),
    sig('indexable', 'מותר לאינדוקס', noindex ? 'fail' : 'pass', noindex ? 'הדף מסומן noindex, לא ייכלל בחיפוש/AI.' : 'הדף פתוח לאינדוקס.', 'להסיר את תגית noindex.', 2),
    sig('corpus', 'האתר נמצא במאגר האימון (Common Crawl)', ccStatus, ccStatus === 'pass' ? 'הדומיין נמצא במאגר שממנו לומדים מודלים.' : ccStatus === 'partial' ? 'לא הצלחנו לוודא נוכחות במאגר.' : 'הדומיין לא נמצא במאגר האימון של מודלי ה-AI.', 'לוודא נגישות ותוכן איכותי כדי להיסרק ל-Common Crawl.', 2),
    sig('entity', 'ישות מזוהה (Wikidata)', wdStatus, wdStatus === 'pass' ? 'נמצאה ישות מזוהה לעסק.' : wdStatus === 'partial' ? 'לא הצלחנו לוודא ישות.' : 'אין ישות Wikidata, מודלים מתקשים "לזהות" את העסק.', 'לבסס נוכחות ומקורות שמובילים לישות Wikidata/Knowledge Graph.', 1),
    sig('wikipedia', 'ערך ויקיפדיה', wpStatus, wpStatus === 'pass' ? 'נמצא ערך ויקיפדיה שמזכיר את העסק, מקור סמכות שמודלים לומדים ומצטטים.' : wpStatus === 'partial' ? 'לא הצלחנו לוודא ערך ויקיפדיה.' : 'אין ערך ויקיפדיה, אחד המקורות החזקים ביותר שמנועי AI מצטטים חסר.', 'לבסס בולטות (סיקור עצמאי במקורות אמינים) ולהגיש ערך דרך AfC עם גילוי ניגוד-עניינים.', 1),
    sig('bing', 'מאונדקס ב-Bing (ל-Copilot)', bingStatus, bingStatus === 'pass' ? 'האתר מופיע ב-Bing, בסיס לנראות ב-Microsoft Copilot.' : bingStatus === 'partial' ? 'לא הצלחנו לוודא אינדוקס ב-Bing.' : 'האתר לא נמצא ב-Bing, Copilot לא יצטט אותך.', 'לאמת את האתר ב-Bing Webmaster Tools ולהגיש sitemap.', 1),
  ];

  const categories: GeoCategory[] = [
    { key: 'foundation' as CategoryKey, label: 'הבסיס, האם בכלל אפשר לקרוא אותך', score: categoryScore(foundation), signals: foundation },
    { key: 'structured' as CategoryKey, label: 'הזהות, האם ה-AI מבין שאתה עסק', score: categoryScore(structured), signals: structured },
    { key: 'ai' as CategoryKey, label: 'המוכנות ל-AI, האם ה-AI ימצא וימליץ', score: categoryScore(ai), signals: ai },
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
