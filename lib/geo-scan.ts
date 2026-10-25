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

/** One external profile/property the audited site links to as its own (page hrefs +
 *  JSON-LD sameAs), tagged by platform. 'other' is a real external profile declared in
 *  sameAs that doesn't match a known platform. The client's own bare host is excluded. */
export interface OwnedLink {
  url: string;
  platform:
    | 'linkedin-company'
    | 'linkedin-personal'
    | 'youtube'
    | 'facebook'
    | 'instagram'
    | 'x'
    | 'tiktok'
    | 'other';
}

const FETCH_TIMEOUT_MS = 8000;
// A realistic modern-browser UA avoids WAF/bot blocks that cascaded into false failures.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const ACCEPT_LANGUAGE = 'he,en';
// Official GPTBot UA, used to verify real (CDN/WAF-level) access, not just robots.txt.
const GPTBOT_UA = 'Mozilla/5.0 (compatible; GPTBot/1.1; +https://openai.com/gptbot)';

// Social networks are not "authoritative external sources" for citation counting.
const SOCIAL_HOSTS = [
  'facebook.com',
  'fb.com',
  'instagram.com',
  'twitter.com',
  'x.com',
  'linkedin.com',
  'youtube.com',
  'youtu.be',
  'tiktok.com',
  'pinterest.com',
  'whatsapp.com',
  'wa.me',
  't.me',
  'telegram.org',
  'snapchat.com',
  'threads.net',
  'reddit.com',
];

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
      headers: {
        'User-Agent': UA,
        'Accept-Language': ACCEPT_LANGUAGE,
        ...(init?.headers ?? {}),
      },
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

/** Clean-text (strip scripts/styles/tags) of an HTML blob, returned as a string. */
function cleanText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Fetch the page a second time posing as GPTBot, to confirm a CDN/WAF does not block
 *  AI bots in practice (robots.txt can say "allow" while Cloudflare still returns 403). */
async function fetchAsBot(url: string): Promise<{ status: number; body: string } | null> {
  const res = await fetchWithTimeout(url, { headers: { 'User-Agent': GPTBOT_UA } });
  if (!res) return null;
  try {
    const body = await res.text();
    return { status: res.status, body };
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

/** Detect the brand's DECLARED external presence: which social/profile platforms the
 *  site itself links to. Sources: (a) every href in the page HTML, (b) the JSON-LD
 *  Organization sameAs URLs. This reflects only what the site exposes (declared presence),
 *  not a live audit of the external account (LinkedIn/YouTube block bots, so scraping them
 *  would produce false negatives). AI engines learn about brands from these off-site platforms. */
function extractExternalPresence(
  html: string,
  host: string,
): {
  linkedInCompany: boolean;
  linkedInPersonal: boolean;
  hasYouTube: boolean;
  socialCount: number;
  ownedLinks: OwnedLink[];
} {
  // Keep page hrefs and JSON-LD sameAs apart: a known-platform match counts from either,
  // but a generic "other" profile only counts when the site DECLARED it via sameAs (a
  // random external href is not the brand's own property).
  const hrefUrls: string[] = [];
  const sameAsUrls: string[] = [];
  for (const m of html.matchAll(/href=["']([^"']+)["']/gi)) hrefUrls.push(m[1]);
  // JSON-LD sameAs as an array of profile URLs (anywhere in the doc).
  for (const block of html.matchAll(/"sameAs"\s*:\s*\[([\s\S]*?)\]/gi)) {
    for (const u of block[1].matchAll(/"([^"]+)"/g)) sameAsUrls.push(u[1]);
  }
  // JSON-LD sameAs as a single string value.
  for (const m of html.matchAll(/"sameAs"\s*:\s*"([^"]+)"/gi)) sameAsUrls.push(m[1]);

  // Drop "share on X" widgets: a share/intent button is not the brand's own presence.
  const SHARE_RE = /\/(share|sharing|sharer|sharearticle|intent|dialog)[/?]|share-offsite|cws\/share|share\.php/i;
  const links = [...hrefUrls, ...sameAsUrls]
    .map((u) => u.toLowerCase())
    .filter((u) => !SHARE_RE.test(u));
  const has = (re: RegExp) => links.some((u) => re.test(u));

  // LinkedIn: distinguish a COMPANY page from a personal /in/ profile. A personal
  // founder profile is a real but weaker signal than a company page.
  const linkedInCompany = has(/linkedin\.com\/company\//);
  const linkedInPersonal = has(/linkedin\.com\/in\//);
  const hasYouTube = has(/youtube\.com\/(@|channel\/|c\/|user\/|watch|embed\/)/) || has(/youtu\.be\//);
  // Distinct platforms for the general count. x.com guarded so it does not match max.com etc.
  const platforms = [
    linkedInCompany || linkedInPersonal,
    hasYouTube,
    has(/facebook\.com\//),
    has(/instagram\.com\//),
    has(/twitter\.com\//) || links.some((u) => /(?:^|[^\w])x\.com\//.test(u)),
    has(/tiktok\.com\//),
  ];
  const socialCount = platforms.filter(Boolean).length;

  // The actual owned-property list: the same URLs, tagged by platform, deduped and
  // normalized. Internal links (the client's own host) are not an owned EXTERNAL property.
  const ownHost = host.replace(/^www\./, '').toLowerCase();
  const platformOf = (u: string): OwnedLink['platform'] | null => {
    if (/linkedin\.com\/company\//.test(u)) return 'linkedin-company';
    if (/linkedin\.com\/in\//.test(u)) return 'linkedin-personal';
    if (/youtube\.com\/(@|channel\/|c\/|user\/|watch|embed\/)/.test(u) || /youtu\.be\//.test(u))
      return 'youtube';
    if (/facebook\.com\//.test(u)) return 'facebook';
    if (/instagram\.com\//.test(u)) return 'instagram';
    if (/twitter\.com\//.test(u) || /(?:^|[^\w])x\.com\//.test(u)) return 'x';
    if (/tiktok\.com\//.test(u)) return 'tiktok';
    return null;
  };

  const ownedLinks: OwnedLink[] = [];
  const seen = new Set<string>();
  const consider = (raw: string, fromSameAs: boolean) => {
    const lower = raw.toLowerCase();
    if (SHARE_RE.test(lower)) return;
    let u: URL;
    try {
      u = new URL(raw);
    } catch {
      return; // relative/malformed href, not an external property
    }
    if (!/^https?:$/.test(u.protocol)) return;
    const h = u.hostname.replace(/^www\./, '').toLowerCase();
    if (!h.includes('.')) return;
    if (h === ownHost || h.endsWith(`.${ownHost}`)) return; // internal link
    const known = platformOf(lower);
    // A known platform counts from any source; an "other" profile only from sameAs.
    const platform: OwnedLink['platform'] | null = known ?? (fromSameAs ? 'other' : null);
    if (!platform) return;
    // Normalize for display + dedupe: scheme + bare host + path without trailing slash.
    const path = u.pathname.replace(/\/+$/, '');
    const normalized = `${u.protocol}//${h}${path}`;
    const dedupeKey = normalized.toLowerCase();
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);
    ownedLinks.push({ url: normalized, platform });
  };
  for (const raw of hrefUrls) consider(raw, false);
  for (const raw of sameAsUrls) consider(raw, true);

  return { linkedInCompany, linkedInPersonal, hasYouTube, socialCount, ownedLinks };
}

function extractHtmlSignals(html: string, host: string) {
  const head = html.slice(0, 200_000);
  const title = firstMatch(/<title[^>]*>([\s\S]*?)<\/title>/i, head);
  const metaDesc = firstMatch(
    /<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["']/i,
    head,
  );
  const viewport = /<meta[^>]+name=["']viewport["']/i.test(head);
  const langMatch = firstMatch(/<html[^>]+lang=["']([^"']+)["']/i, head);
  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  const h1Text = (firstMatch(/<h1[^>]*>([\s\S]*?)<\/h1>/i, html) || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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
  // Hebrew street/address tokens, or an English street line WITH a street number
  // (bare "address"/"street" dropped, it falsely fired on "email address").
  const hasAddress =
    /(?:רחוב|רח['׳]|שדרות|כתובת)/.test(text) ||
    /\b\d{1,4}\s+[A-Za-z][A-Za-z'.\-]+\s+(?:st\.?|street|ave\.?|avenue|rd\.?|road|blvd\.?|boulevard|ln\.?|lane|dr\.?|drive)\b/i.test(
      text,
    );

  // Declared external presence (social/profile platforms linked from the site + sameAs).
  const presence = extractExternalPresence(html, host);

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

  // Analytics/measurement present, post-launch checklist item. Covers GA4/UA, the GTM
  // container loader (gtm.js + GTM- id, so GA-via-GTM is not a false "no analytics"),
  // plus Plausible, Matomo, Fathom, Segment and Meta Pixel.
  const hasAnalytics =
    /googletagmanager\.com\/gtag\/js|googletagmanager\.com\/gtm\.js|\bGTM-[A-Z0-9]+\b|www\.google-analytics\.com|gtag\s*\(|\bG-[A-Z0-9]{6,}\b|\bUA-\d{4,}-\d\b|plausible\.io|matomo|usefathom|segment\.(?:com|io)|fbq\s*\(/i.test(
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
    h1Text,
    // Compact real-content digest for category inference (title + tagline + H1 +
    // the opening body text). This is what the business actually SAYS it does, not
    // the schema @type (which is often a meaningless "Person"/"Organization").
    contentDigest: [title, metaDesc, h1Text, text.slice(0, 1000)]
      .filter(Boolean)
      .join(' · ')
      .slice(0, 1400),
    textLength: text.length,
    hasPhone,
    hasAddress,
    linkedInCompany: presence.linkedInCompany,
    linkedInPersonal: presence.linkedInPersonal,
    hasYouTube: presence.hasYouTube,
    socialCount: presence.socialCount,
    ownedLinks: presence.ownedLinks,
  };
}

// A title/name that is really a bot-block or error page, not the business name.
// Big sites (zara.com, banks) return these to scrapers, and we were showing e.g.
// "Access Denied" as the brand. When detected, fall back to a prettified domain.
const BLOCK_PAGE_RE =
  /access denied|forbidden|^403\b|^401\b|just a moment|attention required|not acceptable|request blocked|unavailable|are you (?:a )?human|bot detection|cloudflare|error\s*4\d\d/i;

/** "mizrahi-tefahot.co.il" -> "Mizrahi Tefahot" — a readable fallback name. */
function prettifyHost(host: string): string {
  const label = host.replace(/^www\./, '').split('.')[0] || host;
  return label
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function guessBusiness(
  host: string,
  s: ReturnType<typeof extractHtmlSignals>,
  hasAddress: boolean,
): BusinessGuess {
  const titleName = s.title ? s.title.split(/[|\-–—·]/)[0].trim() : '';
  let name = s.ogSiteName?.trim() || '';
  if ((!name || BLOCK_PAGE_RE.test(name)) && titleName && !BLOCK_PAGE_RE.test(titleName)) {
    name = titleName;
  }
  // og:site_name or title was a block/error page (or empty): use the domain, not junk.
  if (!name || BLOCK_PAGE_RE.test(name)) name = prettifyHost(host);
  return {
    name: name || host,
    category: s.schemaType && s.schemaType !== 'WebSite' ? s.schemaType : undefined,
    location: hasAddress ? 'IL' : undefined,
    // Drop a block/error page's meta as "facts" too.
    description:
      s.metaDesc && !BLOCK_PAGE_RE.test(s.metaDesc) ? s.metaDesc.trim() : undefined,
  };
}

// ---------- robots.txt parsing ----------

type RobotsGroup = { agents: string[]; disallows: string[]; allows: string[] };

/** Parse robots.txt into User-agent groups. A group = consecutive User-agent lines plus
 *  the rules that follow, until the next User-agent (after a rule) or a blank-line separator. */
function parseRobotsGroups(robots: string): RobotsGroup[] {
  const groups: RobotsGroup[] = [];
  let current: RobotsGroup | null = null;
  let lastWasRule = false;

  for (const rawLine of robots.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) {
      // A blank line separates groups.
      current = null;
      lastWasRule = false;
      continue;
    }
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const field = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (field === 'user-agent') {
      // Consecutive User-agent lines share one group; a User-agent after a rule starts a new one.
      if (!current || lastWasRule) {
        current = { agents: [], disallows: [], allows: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasRule = false;
    } else if (field === 'disallow') {
      if (current) {
        current.disallows.push(value);
        lastWasRule = true;
      }
    } else if (field === 'allow') {
      if (current) {
        current.allows.push(value);
        lastWasRule = true;
      }
    }
    // Other fields (sitemap, crawl-delay, host) don't affect grouping.
  }
  return groups;
}

function robotsBlocksAi(robots: string): { blocked: string[]; sitemap: boolean } {
  const sitemap = /^\s*sitemap\s*:/im.test(robots);
  const groups = parseRobotsGroups(robots);

  // A group blocks the whole site if it Disallows "/" and no Allow of "/" re-opens it.
  const blocksRoot = (g: RobotsGroup) =>
    g.disallows.some((d) => d === '/') && !g.allows.some((a) => a === '/');

  // The wildcard group applies to any bot without a more-specific group of its own.
  const starBlocksRoot = groups.filter((g) => g.agents.includes('*')).some(blocksRoot);

  const blocked: string[] = [];
  for (const bot of AI_CRAWLERS) {
    const own = groups.filter((g) => g.agents.includes(bot.toLowerCase()));
    if (own.length > 0) {
      // Bot has its own group(s): evaluate ONLY those (most-specific match wins).
      if (own.some(blocksRoot)) blocked.push(bot);
    } else if (starBlocksRoot) {
      // No bot-specific group: fall back to "User-agent: *".
      blocked.push(bot);
    }
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

/** Wikidata, does an entity for this business exist AND claim this exact domain?
 *  A name search alone is not proof (many entities share a name), so we confirm the
 *  top candidate's official-website claim (P856) host equals the scanned domain. */
async function wikidataEntity(name: string, host: string): Promise<SignalStatus> {
  if (!name) return 'fail';
  const target = host.replace(/^www\./, '').toLowerCase();
  try {
    // Search in multiple languages (don't assume Hebrew-only labels).
    const ids = new Set<string>();
    let sawSearch = false;
    for (const lang of ['en', 'he']) {
      const q =
        'https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&limit=5' +
        `&language=${lang}&uselang=${lang}&search=` +
        encodeURIComponent(name);
      const res = await fetchWithTimeout(q, { headers: { Accept: 'application/json' } });
      if (!res) continue;
      sawSearch = true;
      if (!res.ok) continue;
      const data = (await res.json()) as { search?: Array<{ id?: string }> };
      for (const r of data.search ?? []) if (r.id) ids.add(r.id);
    }
    if (!sawSearch) return 'partial';
    if (ids.size === 0) return 'fail';

    // Confirm a candidate whose official website (P856) host matches the scanned domain.
    const q2 =
      'https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=claims&ids=' +
      [...ids].slice(0, 7).join('|');
    const res2 = await fetchWithTimeout(q2, { headers: { Accept: 'application/json' } });
    if (!res2 || !res2.ok) return 'partial';
    const data2 = (await res2.json()) as {
      entities?: Record<
        string,
        { claims?: { P856?: Array<{ mainsnak?: { datavalue?: { value?: unknown } } }> } }
      >;
    };
    for (const ent of Object.values(data2.entities ?? {})) {
      for (const claim of ent.claims?.P856 ?? []) {
        const site = claim.mainsnak?.datavalue?.value;
        if (typeof site !== 'string') continue;
        try {
          const h = new URL(site).hostname.replace(/^www\./, '').toLowerCase();
          if (h === target) return 'pass';
        } catch {
          /* ignore malformed website URL */
        }
      }
    }
    return 'fail';
  } catch {
    return 'partial';
  }
}

/** Wikipedia, is there an article for THIS business? A fuzzy full-text hit is not proof,
 *  so we require a near-exact title match to the brand AND the article referencing the
 *  scanned domain (external links or body). A Wikipedia page is one of the strongest
 *  entity signals LLMs are trained on. */
async function wikipediaEntity(name: string, host: string): Promise<SignalStatus> {
  if (!name) return 'fail';
  const target = host.replace(/^www\./, '').toLowerCase();
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/\s*\([^)]*\)\s*/g, ' ')
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim();
  const wantedName = norm(name);
  if (!wantedName) return 'fail';

  let sawResponse = false;
  for (const lang of ['he', 'en']) {
    try {
      const sq =
        `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&format=json` +
        '&srlimit=5&srprop=&origin=*&srsearch=' +
        encodeURIComponent(name);
      const res = await fetchWithTimeout(sq, { headers: { Accept: 'application/json' } });
      if (!res || !res.ok) continue;
      sawResponse = true;
      const data = (await res.json()) as { query?: { search?: Array<{ title?: string }> } };
      const match = (data.query?.search ?? []).find((h) => {
        if (!h.title) return false;
        const t = norm(h.title);
        return t === wantedName || t.startsWith(wantedName) || wantedName.startsWith(t);
      });
      if (!match?.title) continue;

      // Confirm the matched article actually references the scanned domain.
      const pq =
        `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&origin=*` +
        '&prop=extlinks|extracts&ellimit=500&explaintext=1&redirects=1&titles=' +
        encodeURIComponent(match.title);
      const pres = await fetchWithTimeout(pq, { headers: { Accept: 'application/json' } });
      if (!pres || !pres.ok) continue;
      const pdata = (await pres.json()) as {
        query?: {
          pages?: Record<
            string,
            { extract?: string; extlinks?: Array<{ ['*']?: string; url?: string }> }
          >;
        };
      };
      for (const page of Object.values(pdata.query?.pages ?? {})) {
        const links = (page.extlinks ?? [])
          .map((l) => l['*'] || l.url || '')
          .join(' ')
          .toLowerCase();
        const extract = (page.extract ?? '').toLowerCase();
        if (links.includes(target) || extract.includes(target)) return 'pass';
      }
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
        // Only genuine "gone" responses count. 401/403/429/999 are bot-challenges,
        // not broken links; 405 = HEAD not allowed. Count 404/410 (and server 5xx).
        if (res.status === 404 || res.status === 410 || res.status >= 500) broken++;
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
    const body = await res.text();
    const target = host.replace(/^www\./, '').toLowerCase();

    // Bing echoes the query everywhere, so body.includes(host) is meaningless.
    // Parse hostnames from actual result citations/anchors instead.
    const extractHost = (raw: string): string | null => {
      let s = raw.trim();
      if (!s) return null;
      if (!/^https?:\/\//i.test(s)) {
        // cite text like "example.com › page": keep the leading host token.
        s = 'http://' + s.split(/[\s›|/<]/)[0];
      }
      try {
        return new URL(s).hostname.replace(/^www\./, '').toLowerCase();
      } catch {
        return null;
      }
    };

    const hosts = new Set<string>();
    for (const m of body.matchAll(/<cite[^>]*>([\s\S]*?)<\/cite>/gi)) {
      const h = extractHost(m[1].replace(/<[^>]+>/g, ''));
      if (h) hosts.add(h);
    }
    for (const m of body.matchAll(/<a[^>]+href=["'](https?:\/\/[^"']+)["']/gi)) {
      const h = extractHost(m[1]);
      if (h) hosts.add(h);
    }

    for (const h of hosts) {
      if (h === target || h.endsWith('.' + target)) return 'pass';
    }
    if (/there are no results|no results for|לא נמצאו תוצאות/i.test(body)) return 'fail';
    // Could not confirm from real result hosts (echo/consent/challenge): stay honest.
    return 'partial';
  } catch {
    return 'partial';
  }
}

// ---------- content citability (highest-weight GEO dimension) ----------

/** From the best available page text, measure the three signals AI answer engines reward:
 *  concrete numbers/statistics, outbound citations to authoritative sources, and freshness. */
function contentCitability(
  html: string,
  text: string,
  host: string,
): {
  words: number;
  statCount: number;
  citationCount: number;
  modAge: number | null;
  pubAge: number | null;
} {
  const ownHost = host.replace(/^www\./, '').toLowerCase();

  // Word count of the clean text (density denominator).
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;

  // Numeric/statistic tokens: percentages, currency amounts, years, numbers with units.
  const statMatchers: RegExp[] = [
    /\d+(?:[.,]\d+)?\s*%/g, // 40%, 12.5%
    /\d+(?:[.,]\d+)?\s*(?:אחוז|אחוזים)/g, // Hebrew percent word
    /\b(?:19|20)\d{2}\b/g, // years 1900-2099
    /[₪$€]\s?\d/g, // currency amounts
    /\d+(?:[.,]\d+)?\s*(?:ש["'׳]?ח|שקלים|דולר|אלף|מיליון|מיליארד|ק["'׳]?מ|ק["'׳]?ג|שנים|שנה|חודשים|ימים|שעות|דקות|לקוחות|משתמשים|km|kg|mb|gb|hrs?|hours?|days?|years?|users?|customers?)\b/gi,
  ];
  let statCount = 0;
  for (const re of statMatchers) {
    const m = text.match(re);
    if (m) statCount += m.length;
  }

  // Outbound links to EXTERNAL authoritative domains (exclude own domain + social networks).
  const extDomains = new Set<string>();
  for (const m of html.matchAll(/<a\b[^>]*href=["'](https?:\/\/[^"']+)["']/gi)) {
    try {
      const h = new URL(m[1]).hostname.replace(/^www\./, '').toLowerCase();
      if (!h || h === ownHost || h.endsWith('.' + ownHost)) continue;
      if (SOCIAL_HOSTS.some((s) => h === s || h.endsWith('.' + s))) continue;
      extDomains.add(h);
    } catch {
      /* ignore malformed href */
    }
  }
  const citationCount = extDomains.size;

  // Freshness: prefer a modified date (JSON-LD dateModified / article:modified_time / <time>),
  // fall back to a published date.
  const modifiedRaw =
    firstMatch(/"dateModified"\s*:\s*"([^"]+)"/i, html) ||
    firstMatch(
      /<meta[^>]+property=["']article:modified_time["'][^>]+content=["']([^"']+)["']/i,
      html,
    ) ||
    firstMatch(
      /<meta[^>]+itemprop=["']dateModified["'][^>]+content=["']([^"']+)["']/i,
      html,
    ) ||
    firstMatch(/<time[^>]+datetime=["']([^"']+)["']/i, html);
  const publishedRaw =
    firstMatch(/"datePublished"\s*:\s*"([^"]+)"/i, html) ||
    firstMatch(
      /<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i,
      html,
    );

  const ageOf = (raw: string | null): number | null => {
    if (!raw) return null;
    const t = Date.parse(raw);
    if (Number.isNaN(t)) return null;
    return Math.floor((Date.now() - t) / 86_400_000);
  };

  return {
    words,
    statCount,
    citationCount,
    modAge: ageOf(modifiedRaw),
    pubAge: ageOf(publishedRaw),
  };
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
  const [main, fc, bot] = await Promise.all([
    fetchText(url),
    fetchViaFirecrawl(url),
    fetchAsBot(url),
  ]);
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
  const s = extractHtmlSignals(html, host);

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
      fetchText(`${origin}/llms.txt`),
      fetchText(`${origin}/sitemap.xml`),
      commonCrawlPresence(host),
      wikidataEntity(entityName, host),
      wikipediaEntity(entityName, host),
      pageSpeed(finalUrl),
      checkBrokenLinks(html, finalUrl),
      bingIndexed(host),
    ]);

  const robotsInfo = robotsR ? robotsBlocksAi(robotsR.body) : { blocked: [], sitemap: false };

  // Content validation: SPA/static hosts return 200 + index.html for ANY path, so
  // status===200 alone is a soft-404 trap. Confirm the body is really that resource.
  const looksHtml = (body: string) => /^\s*(?:<!doctype html|<html[\s>])/i.test(body);
  const isPlainTextResource = (r: { res: Response; body: string }) => {
    const ct = (r.res.headers.get('content-type') || '').toLowerCase();
    if (/html|xml/.test(ct)) return false;
    return !looksHtml(r.body);
  };

  const hasRobots =
    !!robotsR && robotsR.res.status === 200 && isPlainTextResource(robotsR);
  const hasLlms = !!llmsR && llmsR.res.status === 200 && isPlainTextResource(llmsR);
  const sitemapValid =
    !!sitemapR &&
    sitemapR.res.status === 200 &&
    /<urlset|<sitemapindex|<\?xml/i.test(sitemapR.body);
  const hasSitemap = sitemapValid || robotsInfo.sitemap;

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

  // Content citability: statistics density, outbound citations, freshness.
  const bestText = cleanText(html);
  const cit = contentCitability(html, bestText, host);

  const statsStatus: SignalStatus =
    cit.words > 0 && cit.statCount >= Math.max(3, cit.words / 200)
      ? 'pass'
      : cit.statCount >= 1
        ? 'partial'
        : 'fail';
  const statsDetail =
    statsStatus === 'pass'
      ? `נמצאו ${cit.statCount} נתונים מספריים בתוכן. מנועי AI מצטטים תוכן עם מספרים קונקרטיים הרבה יותר (מחקר פרינסטון: סטטיסטיקות +40%, ציטוטים +115%).`
      : statsStatus === 'partial'
        ? `נמצאו מעט נתונים מספריים (${cit.statCount}). מנועי AI מצטטים תוכן עם מספרים קונקרטיים הרבה יותר (מחקר פרינסטון: סטטיסטיקות +40%, ציטוטים +115%).`
        : 'כמעט אין נתונים מספריים בתוכן. מנועי AI מצטטים תוכן עם מספרים קונקרטיים הרבה יותר (מחקר פרינסטון: סטטיסטיקות +40%, ציטוטים +115%).';

  const citationsStatus: SignalStatus =
    cit.citationCount >= 2 ? 'pass' : cit.citationCount === 1 ? 'partial' : 'fail';
  const citationsDetail =
    citationsStatus === 'pass'
      ? `נמצאו ${cit.citationCount} קישורים למקורות חיצוניים מהימנים בתוכן.`
      : citationsStatus === 'partial'
        ? 'נמצא קישור אחד בלבד למקור חיצוני מהימן.'
        : 'אין קישורים למקורות חיצוניים מהימנים בתוכן, ציטוט מקורות מחזק אמינות בעיני מנועי AI.';

  const freshnessStatus: SignalStatus =
    cit.modAge !== null ? (cit.modAge < 90 ? 'pass' : 'partial') : cit.pubAge !== null ? 'partial' : 'fail';
  const freshnessDetail =
    cit.modAge !== null
      ? cit.modAge < 90
        ? `התוכן עודכן לפני ${cit.modAge} ימים. תוכן טרי (עד כ-30 יום) מצוטט הרבה יותר.`
        : `תאריך העדכון ישן (לפני ${cit.modAge} ימים), מומלץ לרענן. תוכן טרי (עד כ-30 יום) מצוטט הרבה יותר.`
      : cit.pubAge !== null
        ? `נמצא רק תאריך פרסום (לפני ${cit.pubAge} ימים), בלי תאריך עדכון (dateModified).`
        : 'לא נמצא תאריך פרסום או עדכון בתוכן. תוכן טרי (עד כ-30 יום) מצוטט הרבה יותר.';

  // Verify-as-bot: did the site actually serve content to GPTBot (past CDN/WAF)?
  const botBase = 'בדקנו גישה בפועל בתור בוט של ChatGPT, לא רק מה שכתוב ב-robots.txt.';
  let botFetchStatus: SignalStatus;
  let botFetchDetail: string;
  if (!bot) {
    botFetchStatus = 'partial';
    botFetchDetail = `${botBase} לא הצלחנו לאמת (פסק זמן או תגובה לא ברורה).`;
  } else if (bot.status === 403 || bot.status === 503) {
    botFetchStatus = 'fail';
    botFetchDetail = `${botBase} הגישה נחסמה בפועל (קוד ${bot.status}).`;
  } else if (bot.status === 200) {
    const botLen = bot.body.length;
    const normalLen = rawHtml.length;
    const comparable = normalLen === 0 ? botLen >= 1000 : botLen >= normalLen * 0.5;
    if (botLen >= 1000 && comparable) {
      botFetchStatus = 'pass';
      botFetchDetail = `${botBase} הבוט קיבל את הדף המלא (קוד 200).`;
    } else {
      botFetchStatus = 'fail';
      botFetchDetail = `${botBase} הבוט קיבל דף חסימה או אתגר במקום התוכן.`;
    }
  } else {
    botFetchStatus = 'partial';
    botFetchDetail = `${botBase} התקבלה תגובה לא חד משמעית (קוד ${bot.status}).`;
  }

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
    sig('bot_fetch', 'גישה בפועל כבוט AI', botFetchStatus, botFetchDetail, 'לוודא שה-CDN (קלאודפלייר/וכו׳) מאפשר את GPTBot/ClaudeBot בפועל.', 2),
    sig('depth', 'מספיק תוכן לקריאה', bestTextLen > 2500 ? 'pass' : bestTextLen > 800 ? 'partial' : 'fail', bestTextLen > 2500 ? 'יש עומק תוכן שה-AI יכול לצטט.' : 'מעט מדי תוכן טקסטואלי.', 'להוסיף תוכן טקסטואלי מהותי (שירותים, שאלות ותשובות).', 1),
    sig('stats', 'נתונים וסטטיסטיקות', statsStatus, statsDetail, 'להוסיף נתונים מספריים עם מקור.', 1),
    sig('citations', 'ציטוט מקורות', citationsStatus, citationsDetail, 'לקשר לכל נתון מקור ראשוני.', 1),
    sig('freshness', 'רעננות תוכן', freshnessStatus, freshnessDetail, 'להוסיף תאריך עדכון (dateModified) גלוי ובסכמה.', 1),
    sig('indexable', 'מותר לאינדוקס', noindex ? 'fail' : 'pass', noindex ? 'הדף מסומן noindex, לא ייכלל בחיפוש/AI.' : 'הדף פתוח לאינדוקס.', 'להסיר את תגית noindex.', 2),
    sig('corpus', 'האתר נמצא במאגר האימון (Common Crawl)', ccStatus, ccStatus === 'pass' ? 'הדומיין נמצא במאגר שממנו לומדים מודלים.' : ccStatus === 'partial' ? 'לא הצלחנו לאמת נוכחות במאגר.' : 'לא הצלחנו לאמת שהדומיין נמצא במאגר האימון (Common Crawl).', 'לוודא נגישות ותוכן איכותי כדי להיסרק ל-Common Crawl.', 2),
    sig('entity', 'ישות מזוהה (Wikidata)', wdStatus, wdStatus === 'pass' ? 'נמצאה ישות מזוהה לעסק.' : wdStatus === 'partial' ? 'לא הצלחנו לאמת ישות.' : 'לא הצלחנו לאמת ישות Wikidata שמקושרת לדומיין הזה.', 'לבסס נוכחות ומקורות שמובילים לישות Wikidata/Knowledge Graph.', 1),
    sig('wikipedia', 'ערך ויקיפדיה', wpStatus, wpStatus === 'pass' ? 'נמצא ערך ויקיפדיה שמזכיר את העסק, מקור סמכות שמודלים לומדים ומצטטים.' : wpStatus === 'partial' ? 'לא הצלחנו לאמת ערך ויקיפדיה.' : 'לא הצלחנו לאמת ערך ויקיפדיה שמקושר לדומיין הזה, אחד המקורות החזקים שמנועי AI מצטטים.', 'לבסס בולטות (סיקור עצמאי במקורות אמינים) ולהגיש ערך דרך AfC עם גילוי ניגוד-עניינים.', 1),
    sig('bing', 'מאונדקס ב-Bing (ל-Copilot)', bingStatus, bingStatus === 'pass' ? 'האתר מופיע ב-Bing, בסיס לנראות ב-Microsoft Copilot.' : bingStatus === 'partial' ? 'לא הצלחנו לאמת אינדוקס ב-Bing.' : 'לא הצלחנו לאמת שהאתר מאונדקס ב-Bing (בסיס לנראות ב-Copilot).', 'לאמת את האתר ב-Bing Webmaster Tools ולהגיש sitemap.', 1),
    sig('linkedin', 'נוכחות בלינקדאין', s.linkedInCompany ? 'pass' : s.linkedInPersonal ? 'partial' : 'fail', s.linkedInCompany ? 'זיהינו קישור לעמוד חברה בלינקדאין מהאתר. לינקדאין הוא מהמקורות החזקים שמנועי AI לומדים מהם על מותגים.' : s.linkedInPersonal ? 'זיהינו קישור לפרופיל לינקדאין אישי (מייסד או מנהל), אבל לא לעמוד חברה. עמוד חברה הוא אות חזק יותר ל-AI.' : 'לא זיהינו קישור לעמוד חברה בלינקדאין מהאתר, אחד המקורות החזקים ביותר שה-AI מסתמך עליהם.', 'לקשר לעמוד חברה בלינקדאין מהאתר ולהוסיף אותו ל-sameAs בסכמה.', 2),
    sig('youtube', 'נוכחות ביוטיוב', s.hasYouTube ? 'pass' : 'fail', s.hasYouTube ? 'זיהינו קישור לערוץ יוטיוב מהאתר. יוטיוב הוא מקור חזק נוסף שמנועי AI לומדים ממנו על מותגים.' : 'לא זיהינו קישור לערוץ יוטיוב מהאתר, אחד המקורות החזקים שה-AI לומד מהם על מותגים.', 'לפתוח ערוץ יוטיוב ולקשר אליו מהאתר.', 1),
    sig('social_presence', 'נוכחות ברשתות חברתיות', s.socialCount >= 2 ? 'pass' : s.socialCount === 1 ? 'partial' : 'fail', s.socialCount >= 2 ? `זיהינו קישורים ל-${s.socialCount} רשתות חברתיות מהאתר. ככל שהמותג נוכח ביותר פלטפורמות, כך ה-AI לומד עליו ממקורות רבים יותר.` : s.socialCount === 1 ? 'זיהינו קישור לרשת חברתית אחת בלבד מהאתר.' : 'לא זיהינו קישורים לרשתות חברתיות מהאתר.', 'לבנות ולקשר פרופילים ברשתות המובילות בתחום.', 1),
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
    ownedLinks: s.ownedLinks,
    content: s.contentDigest || undefined,
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
    ownedLinks: [],
  };
}
