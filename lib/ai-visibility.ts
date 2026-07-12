// Layer A — live AI-visibility. Asks the actual models whether they know/recommend the site,
// and surfaces which competitors DO appear. Gated behind the lead form (see api/geo-report).
// Every provider is optional; with no keys set, `available` is false and callers hide this layer.

import type { BusinessGuess } from './geo-types';
import { perplexity } from './providers/perplexity';
import { claude } from './providers/claude';
import { openai } from './providers/openai';
import { gemini } from './providers/gemini';
import type { Provider } from './providers/types';

const PROVIDERS: Provider[] = [perplexity, claude, openai, gemini];

export interface ProviderVisibility {
  id: string;
  label: string;
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

function appearsIn(text: string, citations: string[], host: string, brand: string): boolean {
  const hay = `${text}\n${citations.join('\n')}`.toLowerCase();
  const bareHost = host.replace(/^www\./, '').toLowerCase();
  if (bareHost && hay.includes(bareHost)) return true;
  const b = brand.trim().toLowerCase();
  if (b && b.length >= 3 && hay.includes(b)) return true;
  return false;
}

/** Pull candidate competitor names from a numbered list + cited domains, excluding your own. */
function extractCompetitors(text: string, citations: string[], host: string, brand: string): string[] {
  const bareHost = host.replace(/^www\./, '').toLowerCase();
  const brandLc = brand.trim().toLowerCase();
  const out = new Set<string>();

  // Numbered / bulleted list items → names.
  for (const line of text.split('\n')) {
    const m = /^\s*(?:\d+[.)]|[-*•])\s*(.+)$/.exec(line);
    if (m) {
      const name = m[1].replace(/[*_`]/g, '').split(/[—\-–:|(]/)[0].trim();
      if (name && name.length >= 2 && name.length <= 60) out.add(name);
    }
  }
  // Cited domains.
  for (const c of citations) {
    try {
      const h = new URL(c).hostname.replace(/^www\./, '');
      if (h) out.add(h);
    } catch {
      /* ignore */
    }
  }

  return [...out]
    .filter((n) => {
      const lc = n.toLowerCase();
      return !lc.includes(bareHost) && !(brandLc.length >= 3 && lc.includes(brandLc));
    })
    .slice(0, 8);
}

function brandQuery(business: BusinessGuess, host: string): string {
  return `Do you know the business or website "${business.name}" (${host})? In 2 short sentences say what it is and what it does. If you do not recognize it, say clearly "I don't have information about this business."`;
}

function categoryQuery(business: BusinessGuess): string | null {
  if (!business.category) return null;
  const loc = business.location && business.location !== 'IL' ? business.location : 'ישראל';
  return `מי העסקים המומלצים ביותר בתחום "${business.category}" באזור ${loc}? החזר רשימה ממוספרת של שמות עסקים בלבד (עד 7 שמות), בלי הסברים.`;
}

/** Cheap teaser probe: one Perplexity call. Returns competitor COUNT only (no names surfaced publicly). */
export async function quickProbe(
  business: BusinessGuess,
  host: string,
): Promise<{ available: boolean; appears: boolean; competitorCount: number }> {
  if (!perplexity.isConfigured()) return { available: false, appears: false, competitorCount: 0 };
  const bareHost = bareHostOf(host);
  const catQ = categoryQuery(business);
  // If we can't build a category query we still test brand recognition.
  const q = catQ ?? brandQuery(business, bareHost);
  const ans = await perplexity.ask(q);
  if (!ans) return { available: false, appears: false, competitorCount: 0 };
  const appears = appearsIn(ans.text, ans.citations, bareHost, business.name);
  const competitors = catQ
    ? extractCompetitors(ans.text, ans.citations, bareHost, business.name)
    : [];
  return { available: true, appears, competitorCount: competitors.length };
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
  const brandQ = brandQuery(business, bareHost);
  const catQ = categoryQuery(business);

  const results = await Promise.all(
    configured.map(async (p): Promise<ProviderVisibility> => {
      const [brandAns, catAns] = await Promise.all([
        p.ask(brandQ),
        catQ ? p.ask(catQ) : Promise.resolve(null),
      ]);
      const knowsYou =
        !!brandAns &&
        !/don'?t have information|not familiar|לא מכיר|אין לי מידע/i.test(brandAns.text) &&
        appearsIn(brandAns.text, brandAns.citations, bareHost, business.name);
      const recommendsYou = catAns
        ? appearsIn(catAns.text, catAns.citations, bareHost, business.name)
        : false;
      const competitors = catAns
        ? extractCompetitors(catAns.text, catAns.citations, bareHost, business.name)
        : [];
      return {
        id: p.id,
        label: p.label,
        knowsYou,
        recommendsYou,
        answer: brandAns?.text ?? '',
        competitors,
      };
    }),
  );

  const competitors = [...new Set(results.flatMap((r) => r.competitors))].slice(0, 10);
  const appearsAnywhere = results.some((r) => r.knowsYou || r.recommendsYou);

  return { available: true, appearsAnywhere, competitors, providers: results };
}
