// Perplexity Sonar — search-native, returns citations. The strongest "does AI cite you" signal.
import { postJson, type Provider, type SearchAnswer } from './types';

export const perplexity: Provider = {
  id: 'perplexity',
  label: 'Perplexity',
  isConfigured() {
    return !!process.env.PERPLEXITY_API_KEY;
  },
  async ask(prompt: string): Promise<SearchAnswer | null> {
    const key = process.env.PERPLEXITY_API_KEY;
    if (!key) return null;
    const data = (await postJson(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
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
