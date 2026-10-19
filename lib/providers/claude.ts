// Anthropic Claude with the server-side web_search tool.
import { type Provider, type SearchAnswer } from './types';

const TIMEOUT_MS = 20000;

export const claude: Provider = {
  id: 'claude',
  label: 'Claude',
  isConfigured() {
    return !!process.env.ANTHROPIC_API_KEY;
  },
  async ask(prompt: string): Promise<SearchAnswer | null> {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return null;
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
          tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
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
