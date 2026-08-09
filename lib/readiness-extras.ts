// Extra FREE readiness signals — all from one page fetch + one PageSpeed call.
// No API keys required (PageSpeed works keyless, just rate-limited). These are
// shown ungated in the scan: tracker/pixel breakdown, conversion & support
// tools, legal-page presence, and full Lighthouse scores (SEO / a11y / best-practices).

const FETCH_TIMEOUT_MS = 8000;
const PSI_TIMEOUT_MS = 25000;
const UA = 'Mozilla/5.0 (compatible; HelixReadinessBot/1.0; +https://helix.co.il/startups/readiness)';

export interface Detected {
  name: string;
  found: boolean;
}
export interface ReadinessExtras {
  trackers: Detected[];
  convTools: Detected[];
  legal: Detected[];
  lighthouse: { seo: number | null; accessibility: number | null; bestPractices: number | null };
}

export interface PageContent {
  html: string;
  text: string;
  finalUrl: string;
}

/** Single page fetch, returns raw HTML + stripped text (bounded) for reuse. */
export async function fetchPage(url: string): Promise<PageContent | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': UA },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return { html, text: text.slice(0, 8000), finalUrl: res.url || url };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// name → regex signatures (matched against raw HTML).
const TRACKERS: Array<[string, RegExp]> = [
  ['Meta Pixel', /fbevents\.js|fbq\s*\(|facebook\.com\/tr\?/i],
  ['Google Analytics 4', /gtag\/js\?id=G-|gtag\(\s*['"]config['"]\s*,\s*['"]G-/i],
  ['Google Tag Manager', /googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]{4,}/i],
  ['Google Ads', /googleadservices|AW-\d{6,}/i],
  ['Hotjar', /static\.hotjar\.com|hjSetting|hotjar/i],
  ['LinkedIn Insight', /snap\.licdn\.com|_linkedin_partner_id/i],
  ['TikTok Pixel', /analytics\.tiktok\.com|ttq\.(load|page)/i],
  ['Microsoft Clarity', /clarity\.ms\/tag|clarity\(/i],
];

const CONV_TOOLS: Array<[string, RegExp]> = [
  ['Intercom', /widget\.intercom\.io|intercomSettings/i],
  ['Crisp', /client\.crisp\.chat/i],
  ['Drift', /js\.driftt\.com|drift\.com/i],
  ['Tawk.to', /embed\.tawk\.to/i],
  ['Zendesk', /static\.zdassets\.com|zopim/i],
  ['HubSpot', /js\.hs-scripts\.com|hs-analytics/i],
  ['Calendly', /assets\.calendly\.com|calendly\.com/i],
  ['Stripe', /js\.stripe\.com/i],
  ['Typeform', /embed\.typeform\.com|typeform\.com\/to\//i],
];

const LEGAL: Array<[string, RegExp]> = [
  ['מדיניות פרטיות', /privacy|מדיניות\s*פרטיות/i],
  ['תנאי שימוש', /\/terms|תנאי\s*שימוש|terms-of|תקנון/i],
  ['נגישות', /accessibility|הצהרת\s*נגישות|נגישות/i],
  ['מדיניות עוגיות', /cookie|עוגיות/i],
];

function detect(html: string, sigs: Array<[string, RegExp]>): Detected[] {
  return sigs.map(([name, re]) => ({ name, found: re.test(html) }));
}

/** Google PageSpeed — SEO / accessibility / best-practices scores in one call. */
async function lighthouseScores(
  url: string,
): Promise<ReadinessExtras['lighthouse']> {
  const miss = { seo: null, accessibility: null, bestPractices: null };
  try {
    const key = process.env.PAGESPEED_API_KEY;
    const cats = ['seo', 'accessibility', 'best-practices']
      .map((c) => `&category=${c}`)
      .join('');
    const api =
      'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?strategy=mobile' +
      cats +
      '&url=' +
      encodeURIComponent(url) +
      (key ? `&key=${key}` : '');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PSI_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(api, { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) return miss;
    const j = (await res.json()) as {
      lighthouseResult?: { categories?: Record<string, { score?: number }> };
    };
    const cat = j.lighthouseResult?.categories ?? {};
    const pct = (v?: number) => (typeof v === 'number' ? Math.round(v * 100) : null);
    return {
      seo: pct(cat['seo']?.score),
      accessibility: pct(cat['accessibility']?.score),
      bestPractices: pct(cat['best-practices']?.score),
    };
  } catch {
    return miss;
  }
}

export async function computeExtras(html: string, url: string): Promise<ReadinessExtras> {
  const lighthouse = await lighthouseScores(url);
  return {
    trackers: detect(html, TRACKERS),
    convTools: detect(html, CONV_TOOLS),
    legal: detect(html, LEGAL),
    lighthouse,
  };
}
