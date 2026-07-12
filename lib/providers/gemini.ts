// Google Gemini with the google_search grounding tool.
import { postJson, type Provider, type SearchAnswer } from './types';

export const gemini: Provider = {
  id: 'gemini',
  label: 'Gemini',
  isConfigured() {
    return !!process.env.GEMINI_API_KEY;
  },
  async ask(prompt: string): Promise<SearchAnswer | null> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    const data = (await postJson(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
      },
      {},
    )) as
      | { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
      | null;
    if (!data) return null;
    const text = (data.candidates?.[0]?.content?.parts ?? [])
      .map((p) => p.text ?? '')
      .join('\n')
      .trim();
    return { text, citations: [] };
  },
};
