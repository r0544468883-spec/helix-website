// Layer A, live AI-visibility. Asks the actual models whether they know/recommend the site,
// and surfaces which competitors DO appear. Gated behind the lead form (see api/geo-report).
// Every provider is optional; with no keys set, `available` is false and callers hide this layer.

import type { BusinessGuess } from './geo-types';
import { claude } from './providers/claude';
import { openai } from './providers/openai';
import { gemini } from './providers/gemini';
import type { Provider } from './providers/types';

// The live check queries only the three engines we hold keys for: ChatGPT,
// Gemini, Claude. Each provider is optional: with no key set, it is simply skipped.
const PROVIDERS: Provider[] = [claude, openai, gemini];

// Preference order for the FREE teaser probe (quickProbe). This endpoint is
// public and ungated, so cost per call dominates the choice: Gemini Flash is the
// cheapest and has a real free tier. Claude and OpenAI are fallbacks.
const PROBE_ORDER: Provider[] = [gemini, claude, openai];

/** The cheapest configured provider for the free probe, or null if none are set. */
function probeProvider(): Provider | null {
  return PROBE_ORDER.find((p) => p.isConfigured()) ?? null;
}

export interface ProviderVisibility {
  id: string;
  label: string;
  /** False when the API call itself failed (timeout/error), i.e. we could not check. */
  checked: boolean;
  knowsYou: boolean;
  recommendsYou: boolean;
  /** The model's own words when asked about the business (for the report money-shot). */
  answer: string;
  competitors: string[];
}

export interface VisibilitySummary {
  /** True when at least one provider is configured. */
  available: boolean;
  appearsAnywhere: boolean;
  /** Distinct competitor names/domains that DID surface, across providers. */
  competitors: string[];
  providers: ProviderVisibility[];
}

export function anyProviderConfigured(): boolean {
  return PROVIDERS.some((p) => p.isConfigured());
}

function bareHostOf(host: string): string {
  return host.replace(/^www\./, '');
}

// Refusal / "I don't know this" phrasings across English and Hebrew. A match means
// the model does NOT recognize the brand, even if it echoed the domain from the question.
export const REFUSAL_RE =
  /don'?t have (?:any )?(?:information|info|details)|not familiar|couldn'?t find|could not find|unable to find|no information|not aware|don'?t recognize|do not recognize|not certain|no record|לא מכיר|איני מכיר|לא מצאתי|לא ידוע לי|אין לי מידע|לא נתקלתי|לא הצלחתי למצוא/i;

/** The strings that count as "the brand" in prose: the name, the bare host, and the domain label. */
export function brandAliases(business: BusinessGuess, host: string): string[] {
  const out = new Set<string>();
  const add = (s?: string) => {
    const v = (s || '').trim().toLowerCase();
    if (v.length >= 3) out.add(v);
  };
  add(business.name);
  const bare = bareHostOf(host).toLowerCase();
  add(bare); // full bare host, e.g. "helix.co.il"
  add(bare.split('.')[0]); // domain label, e.g. "helix"
  return [...out];
}

/**
 * Does the text (or any citation) mention a brand alias as a STANDALONE token?
 * Word-ish boundaries (not flanked by Latin letters/digits or Hebrew letters) so
 * "helix" does NOT match "helixtech" or "plugin", killing substring false positives.
 */
export function mentionsBrand(text: string, citations: string[], aliases: string[]): boolean {
  const hay = `${text}\n${citations.join('\n')}`.toLowerCase();
  for (const a of aliases) {
    if (a.length < 3) continue;
    const esc = a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(^|[^a-z0-9\\u0590-\\u05ff])${esc}([^a-z0-9\\u0590-\\u05ff]|$)`, 'i');
    if (re.test(hay)) return true;
  }
  return false;
}

// Hosts that are never a "competitor": social, aggregators, search, encyclopedias.
const HOST_DENYLIST = [
  'facebook.', 'instagram.', 'linkedin.', 'youtube.', 'youtu.be', 'twitter.', 'x.com',
  'tiktok.', 'wikipedia.', 'wikidata.', 'google.', 'maps.', 'yelp.', 'reddit.',
  'pinterest.', 'medium.com', 'quora.', 'crunchbase.', 'glassdoor.', 'indeed.',
  // Directories / marketplaces: these are SOURCES the AI cites, not competitor
  // businesses, so they must never land in the competitor list (they still show
  // under "cited sources"). Israeli + general.
  'midrag.', 'zap.co.il', 'b144.', 'easy.co.il', 'rest.co.il', 'yad2.', 'pro.co.il',
  'gov.il', 'dapey', 'dundun.co.il', 'yellowpages.', 'bizportal.',
  // Multi-tenant hosting platforms: a subdomain here is one business, but the
  // registrable domain is the platform, so never treat it as a competitor.
  'myshopify.com', 'wixsite.com', 'github.io', 'blogspot.com', 'wordpress.com',
  'weebly.com', 'webflow.io',
];

/**
 * Canonical key for a competitor so the same business counts once, however it is
 * written. Collapses a domain to its registrable label and strips the TLD, and
 * removes separators/punctuation. So "mul-t-lock.com", "mul-t-lock.co.il" and
 * "business.mul-t-lock.com" all key to "multlock", and "rav bariach" matches
 * "rav-bariach.co.il". (A Hebrew name vs a Latin domain of the same company can't
 * be merged without transliteration — seed such a rival by its domain to unify it.)
 */
export function competitorKey(name: string): string {
  let s = name.trim().toLowerCase();
  if (!/\s/.test(s) && /\.[a-z]{2,}(\.[a-z]{2})?$/i.test(s)) {
    s = registrableDomain(s).split('.')[0]; // domain -> label (drop TLD)
  }
  return s.replace(/[\s\-_.'"`]/g, '');
}

/**
 * Is `host` on the denylist? Entries ending in '.' match as a prefix/substring
 * (e.g. 'facebook.' → facebook.com, 'midrag.' → midrag.co.il). Full-domain entries
 * match only as the host itself or a subdomain of it, so 'rest.co.il' does NOT
 * swallow 'forest.co.il' and 'pro.co.il' does NOT swallow 'expro.co.il'.
 */
function hostDenied(host: string): boolean {
  const h = host.toLowerCase();
  return HOST_DENYLIST.some((d) =>
    d.endsWith('.') ? h.includes(d) : h === d || h.endsWith('.' + d),
  );
}
// Words that mark a list line as prose/instruction/criterion, not a company name.
// The SERP-backed AI Overview engine returns flowing prose with bulleted CRITERIA
// lists ("estimated arrival time", "price", "availability"), which the list parser
// would otherwise grab as fake "competitors". These words never appear in a real
// business/brand name, so a candidate containing any of them is dropped.
const NAME_STOPWORDS = [
  'note', 'consider', 'however', 'there', 'please', 'example', 'disclaimer', 'ranking',
  'rankings', 'depends', 'various', 'several', 'many', 'check', 'based on', 'app', 'website',
  'כדאי', 'שימו', 'אפשר', 'למשל', 'הערה', 'בנוסף', 'חשוב', 'לדוגמה', 'תלוי', 'מומלץ לבדוק',
  // criterion / descriptive words that are not brand names
  'זמן', 'הגעה', 'משוער', 'מקצוענים', 'אפליקציה', 'אפליקציית', 'זמינות', 'אחריות',
  'תעודה', 'תעודות', 'רישיון', 'ביקורות', 'המלצות', 'חוות דעת', 'מחיר', 'מחירים', 'עלות',
  'דקות', 'שעות', 'חירום', 'אמין', 'מהיר', 'זול', 'מומלצים', 'הטובים', 'המובילים',
  // Directory / marketplace names (Hebrew): sources, not competitor businesses.
  'מידרג', 'זאפ', 'דפי זהב', 'דפי-זהב', 'איזי', 'רסט', 'יד2', 'ביזפורטל', 'המקצוענים',
  // Discourse connectors + product-attribute phrases the AI emits in lists.
  'בשורה התחתונה', 'לסיכום', 'בקיצור', 'בסופו של דבר', 'מצד אחד', 'מצד שני',
  'צילינדר', 'אריזה', 'באריזה', 'מוגן', 'קידוח', 'העתקה', 'דלת', 'כניסה', 'התקנה',
];

/** Registrable domain: collapse subdomains so business.rav-bariach.co.il and
 *  rav-bariach.co.il count as one. Handles Israeli/second-level TLDs. */
export function registrableDomain(host: string): string {
  const parts = host.toLowerCase().replace(/^www\./, '').split('.');
  if (parts.length <= 2) return parts.join('.');
  const twoLevel = ['co.il', 'org.il', 'ac.il', 'gov.il', 'net.il', 'muni.il', 'k12.il', 'co.uk', 'com.au'];
  const lastTwo = parts.slice(-2).join('.');
  return twoLevel.includes(lastTwo) ? parts.slice(-3).join('.') : lastTwo;
}

/**
 * Competitors the AI surfaced: named rivals parsed from the answer prose PLUS the
 * external domains it cited. Prose names matter because the Share-of-Model
 * denominator counts every other brand in a run, and the chat engines routinely
 * name rivals without a per-name citation — taking domains only would undercount
 * rivals and inflate the brand's share toward 100%. Noise is held down by
 * NAME_STOPWORDS (criteria phrases / discourse connectors), directory denylisting,
 * and subdomain collapse; the operator's seeded competitors are matched separately.
 */
export function extractCompetitors(
  text: string,
  citations: string[],
  host: string,
  aliases: string[],
): string[] {
  const out = new Map<string, string>(); // normalized key -> display name
  const isSelf = (name: string) => mentionsBrand(name, [], aliases);
  const looksLikeName = (name: string) => {
    const lc = name.toLowerCase();
    if (name.length < 2 || name.length > 50) return false;
    if (name.split(/\s+/).length > 5) return false; // a sentence, not a name
    if (NAME_STOPWORDS.some((w) => lc.includes(w))) return false;
    return true;
  };
  const addName = (raw: string) => {
    // Strip descriptive prefixes so "אתר מידרג" keys the same as "מידרג".
    const name = raw
      .replace(/[*_`"']/g, '')
      .split(/[\-–—:|(]/)[0]
      .trim()
      .replace(/^(?:אתר|חברת|עסק|שירותי|סוכנות)\s+/, '')
      .trim();
    if (!name || !looksLikeName(name) || isSelf(name)) return;
    const key = name.toLowerCase();
    if (!out.has(key)) out.set(key, name);
  };

  // Numbered / bulleted list items -> names.
  for (const line of text.split('\n')) {
    const m = /^\s*(?:\d+[.)]|[-*•])\s*(.+)$/.exec(line);
    if (m) addName(m[1]);
  }
  // Cited domains (collapse subdomains, skip denied hosts and our own).
  for (const c of citations) {
    try {
      const h = new URL(c).hostname.replace(/^www\./, '');
      if (!h) continue;
      if (hostDenied(h)) continue;
      if (isSelf(h)) continue;
      const reg = registrableDomain(h);
      if (isSelf(reg)) continue;
      const key = reg.toLowerCase();
      if (!out.has(key)) out.set(key, reg);
    } catch {
      /* ignore */
    }
  }

  return [...out.values()].slice(0, 8);
}

function brandQuery(business: BusinessGuess, host: string): string {
  return (
    `האם אתה מכיר את העסק או האתר "${business.name}" (${host})? ` +
    `בשני משפטים קצרים ספר מה זה ומה הוא עושה. ` +
    `אם אינך מכיר אותו, כתוב בדיוק: "לא מכיר את העסק הזה".`
  );
}

function categoryQuery(business: BusinessGuess): string | null {
  if (!business.category) return null;
  const loc = business.location && business.location !== 'IL' ? business.location : 'ישראל';
  return `מי העסקים המומלצים ביותר בתחום "${business.category}" באזור ${loc}? החזר רשימה ממוספרת של שמות עסקים בלבד (עד 7 שמות), בלי הסברים.`;
}

/**
 * Cheap teaser probe: exactly ONE call to the cheapest configured provider.
 * Returns competitor COUNT only, never names. `competitorsMeasured` tells the UI
 * whether we actually ran the competitor (category) query, so a 0 is not shown as
 * a finding when it simply was not measured.
 */
export async function quickProbe(
  business: BusinessGuess,
  host: string,
): Promise<{
  available: boolean;
  appears: boolean;
  competitorCount: number;
  competitorsMeasured: boolean;
}> {
  const provider = probeProvider();
  if (!provider) {
    return { available: false, appears: false, competitorCount: 0, competitorsMeasured: false };
  }
  const bareHost = bareHostOf(host);
  const aliases = brandAliases(business, host);
  const catQ = categoryQuery(business);
  // If we can't build a category query we still test brand recognition.
  const q = catQ ?? brandQuery(business, bareHost);
  const ans = await provider.ask(q);
  // A null answer means the CALL FAILED, not "not known". Report as unavailable
  // rather than inventing a negative verdict.
  if (!ans) {
    return { available: false, appears: false, competitorCount: 0, competitorsMeasured: false };
  }
  const refused = !catQ && REFUSAL_RE.test(ans.text);
  const appears = !refused && mentionsBrand(ans.text, ans.citations, aliases);
  const competitors = catQ ? extractCompetitors(ans.text, ans.citations, bareHost, aliases) : [];
  return {
    available: true,
    appears,
    competitorCount: competitors.length,
    competitorsMeasured: !!catQ,
  };
}

/** Full multi-provider visibility for the gated report. */
export async function fullVisibility(
  business: BusinessGuess,
  host: string,
): Promise<VisibilitySummary> {
  const configured = PROVIDERS.filter((p) => p.isConfigured());
  if (configured.length === 0) {
    return { available: false, appearsAnywhere: false, competitors: [], providers: [] };
  }
  const bareHost = bareHostOf(host);
  const aliases = brandAliases(business, host);
  const brandQ = brandQuery(business, bareHost);
  const catQ = categoryQuery(business);

  const results = await Promise.all(
    configured.map(async (p): Promise<ProviderVisibility> => {
      const [brandAns, catAns] = await Promise.all([
        p.ask(brandQ),
        catQ ? p.ask(catQ) : Promise.resolve(null),
      ]);
      // checked=false only when BOTH calls failed, i.e. we genuinely could not check.
      const checked = brandAns !== null || catAns !== null;
      const refused = !!brandAns && REFUSAL_RE.test(brandAns.text);
      const knowsYou =
        !!brandAns && !refused && mentionsBrand(brandAns.text, brandAns.citations, aliases);
      const recommendsYou =
        !!catAns && mentionsBrand(catAns.text, catAns.citations, aliases);
      const competitors = catAns
        ? extractCompetitors(catAns.text, catAns.citations, bareHost, aliases)
        : [];
      return {
        id: p.id,
        label: p.label,
        checked,
        knowsYou,
        recommendsYou,
        answer: brandAns?.text ?? '',
        competitors,
      };
    }),
  );

  const competitors = [...new Set(results.flatMap((r) => r.competitors).map((c) => c.toLowerCase()))]
    .slice(0, 10);
  const appearsAnywhere = results.some((r) => r.checked && (r.knowsYou || r.recommendsYou));

  return { available: true, appearsAnywhere, competitors, providers: results };
}
