// Perplexity Sonar, search-native, returns citations. The strongest "does AI cite you" signal.
import { postJson, type AskLocation, type Provider, type SearchAnswer } from './types';

export const perplexity: Provider = {
  id: 'perplexity',
  label: 'Perplexity',
  isConfigured() {
    return !!process.env.PERPLEXITY_API_KEY;
  },
  async ask(prompt: string, loc?: AskLocation): Promise<SearchAnswer | null> {
    const key = process.env.PERPLEXITY_API_KEY;
    if (!key) return null;
    // Localize to the searcher's COUNTRY only. Perplexity's user_location reliably
    // takes `country`; sending unknown fields risks a 400 that postJson turns into a
    // null answer, silently dropping Perplexity from the whole measurement. City-level
    // localization rides on the prompt instead (the question carries the place).
    const userLocation = loc?.country ? { country: loc.country } : undefined;
    const data = (await postJson(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        ...(userLocation ? { web_search_options: { user_location: userLocation } } : {}),
      },
      { Authorization: `Bearer ${key}` },
    )) as
      | { choices?: Array<{ message?: { content?: string } }>; citations?: string[] }
      | null;
    if (!data) return null;
    const text = data.choices?.[0]?.message?.content ?? '';
    const citations = Array.isArray(data.citations) ? data.citations : [];
    return { text, citations };
  },
};
