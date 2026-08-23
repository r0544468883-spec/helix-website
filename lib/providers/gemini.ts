// Google Gemini with the google_search grounding tool.
//
// WATCH THE MODEL NAME. Google retires these, and the failure is silent: a
// retired model returns 404, postJson swallows it and returns null, ask()
// returns null, and quickProbe reports { available: false } — so the entire
// AI-visibility section of /ai-checker just renders empty with no error
// anywhere. gemini-2.0-flash was retired and did exactly that.
// To see what this key can actually call:
//   GET https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY
import { postJson, type Provider, type SearchAnswer } from './types';

const MODEL = 'gemini-3.6-flash';

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
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
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
