// Anthropic Claude with the server-side web_search tool.
import { type AskLocation, type Provider, type SearchAnswer } from './types';

// Claude runs a server-side web_search per call, and the report fires many calls
// concurrently. To keep each call fast enough to finish before the timeout (instead
// of aborting and showing "not measured"), we cap the search budget low and give a
// generous per-call timeout. Runs stay parallel so the whole report fits the server
// request limit.
const TIMEOUT_MS = 55000;
const WEB_SEARCH_MAX_USES = 2;

export const claude: Provider = {
  id: 'claude',
  label: 'Claude',
  isConfigured() {
    return !!process.env.ANTHROPIC_API_KEY;
  },
  async ask(prompt: string, loc?: AskLocation): Promise<SearchAnswer | null> {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return null;
    // Localize the web_search tool to the searcher's place when we have one.
    // Anthropic shape: user_location.type 'approximate' + city/region/country/timezone.
    const userLocation =
      loc && (loc.country || loc.city || loc.region)
        ? {
            type: 'approximate' as const,
            ...(loc.city ? { city: loc.city } : {}),
            ...(loc.region ? { region: loc.region } : {}),
            ...(loc.country ? { country: loc.country } : {}),
            ...(loc.timezone ? { timezone: loc.timezone } : {}),
          }
        : undefined;
    const webSearchTool: Record<string, unknown> = {
      type: 'web_search_20250305',
      name: 'web_search',
      max_uses: WEB_SEARCH_MAX_USES,
    };
    if (userLocation) webSearchTool.user_location = userLocation;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-5',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
          tools: [webSearchTool],
        }),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as {
        content?: Array<{
          type: string;
          text?: string;
          // Per-text-block inline citations (web_search_result_location items).
          citations?: Array<{ url?: string }>;
          // web_search_tool_result blocks carry the raw results here.
          content?: Array<{ type?: string; url?: string }>;
        }>;
      };
      const blocks = data.content ?? [];
      const text = blocks
        .filter((b) => b.type === 'text' && b.text)
        .map((b) => b.text)
        .join('\n')
        .trim();
      // Real citations: inline per-text-block citations + web_search_tool_result URLs.
      const urls = new Set<string>();
      for (const b of blocks) {
        if (Array.isArray(b.citations)) {
          for (const c of b.citations) if (c?.url) urls.add(c.url);
        }
        if (b.type === 'web_search_tool_result' && Array.isArray(b.content)) {
          for (const r of b.content) if (r?.url) urls.add(r.url);
        }
      }
      return { text, citations: [...urls] };
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  },
};
