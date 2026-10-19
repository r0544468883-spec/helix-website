// OpenAI (ChatGPT) via the Responses API with the web_search tool.
// Model: gpt-6-sol, the model the ChatGPT product serves to Plus/Pro/Business
// users as of Oct 2026 (was gpt-4o, 2 years and several generations stale, which
// made our ChatGPT measurement reflect a model real users no longer get).
// Keep current: check GET /v1/models periodically and bump to what the product serves.
import { postJson, type Provider, type SearchAnswer } from './types';

export const openai: Provider = {
  id: 'openai',
  label: 'ChatGPT',
  isConfigured() {
    return !!process.env.OPENAI_API_KEY;
  },
  async ask(prompt: string): Promise<SearchAnswer | null> {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return null;
    const data = (await postJson(
      'https://api.openai.com/v1/responses',
      {
        model: 'gpt-6-sol',
        tools: [{ type: 'web_search_preview' }],
        input: prompt,
      },
      { Authorization: `Bearer ${key}` },
    )) as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> } | null;
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
    return { text, citations: [] };
  },
};
