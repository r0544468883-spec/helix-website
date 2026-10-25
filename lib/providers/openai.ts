// OpenAI (ChatGPT) via the Responses API with the web_search tool.
// Model: gpt-6-sol, the model the ChatGPT product serves to Plus/Pro/Business
// users as of Oct 2026 (was gpt-4o, 2 years and several generations stale, which
// made our ChatGPT measurement reflect a model real users no longer get).
// Keep current: check GET /v1/models periodically and bump to what the product serves.
import { postJson, type AskLocation, type Provider, type SearchAnswer } from './types';

export const openai: Provider = {
  id: 'openai',
  label: 'ChatGPT',
  isConfigured() {
    return !!process.env.OPENAI_API_KEY;
  },
  async ask(prompt: string, loc?: AskLocation): Promise<SearchAnswer | null> {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return null;
    // Localize the web_search tool to the searcher's place when we have one.
    // Responses API shape: user_location.type 'approximate' + free-form fields.
    const userLocation =
      loc && (loc.country || loc.city || loc.region)
        ? {
            type: 'approximate' as const,
            ...(loc.country ? { country: loc.country } : {}),
            ...(loc.city ? { city: loc.city } : {}),
            ...(loc.region ? { region: loc.region } : {}),
            ...(loc.timezone ? { timezone: loc.timezone } : {}),
          }
        : undefined;
    const data = (await postJson(
      'https://api.openai.com/v1/responses',
      {
        model: 'gpt-6-sol',
        tools: [
          userLocation
            ? { type: 'web_search_preview', user_location: userLocation }
            : { type: 'web_search_preview' },
        ],
        input: prompt,
      },
      { Authorization: `Bearer ${key}` },
    )) as {
      output_text?: string;
      output?: Array<{
        content?: Array<{
          text?: string;
          // Inline source annotations on output_text items.
          annotations?: Array<{ type?: string; url?: string }>;
        }>;
      }>;
    } | null;
    if (!data) return null;
    // Prefer the convenience field; fall back to walking the output array.
    let text = data.output_text ?? '';
    if (!text && Array.isArray(data.output)) {
      text = data.output
        .flatMap((o) => o.content ?? [])
        .map((c) => c.text ?? '')
        .join('\n')
        .trim();
    }
    // Real citations: url_citation annotations on the output_text content items.
    const urls = new Set<string>();
    if (Array.isArray(data.output)) {
      for (const o of data.output) {
        for (const c of o.content ?? []) {
          for (const a of c.annotations ?? []) {
            if (a?.type === 'url_citation' && a.url) urls.add(a.url);
          }
        }
      }
    }
    return { text, citations: [...urls] };
  },
};
