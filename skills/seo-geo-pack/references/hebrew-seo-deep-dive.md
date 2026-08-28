# Hebrew / Israeli SEO + GEO Deep Dive

For .co.il sites, Hebrew content, and the Israeli market. Companion to the main SKILL; the essentials are already in the main file, this is the extended version.

## .co.il domain and geo-targeting

| Setting | Value | Why |
|---|---|---|
| TLD | `.co.il` | Preferred trust/geo signal for Israeli businesses |
| Registrar | ISOC-IL accredited | Required for .co.il |
| Server / CDN | Israel or nearby (e.g. Cloudflare TLV) | Latency + local ranking |
| Search Console | Register the `google.co.il` property separately from `.com` | Distinct property |
| Sitemap | Include hreflang annotations | Bilingual sites |

## hreflang for he-IL (the recurring bug)

- Use `he-IL`, never bare `he`. The bare form weakens google.co.il geo-targeting.
- `x-default` points to the English (international) version.
- Every hreflang must be reciprocal: the Hebrew page links the English and the English links the Hebrew. One-way declarations throw "hreflang mismatch".
- Use consistent absolute URLs in every declaration.

```html
<link rel="alternate" hreflang="he-IL" href="https://example.co.il/page" />
<link rel="alternate" hreflang="en" href="https://example.co.il/en/page" />
<link rel="alternate" hreflang="x-default" href="https://example.co.il/en/page" />
```

## RTL rendering

- `dir="rtl"` and `lang="he"` on `<html>` for Hebrew pages.
- CSS logical properties: `margin-inline-start` / `padding-inline-end`, not `margin-left` / `padding-right`, so the layout mirrors correctly.
- Verify RTL loads correctly across browsers; mixed LTR/RTL blocks (Latin technical terms inside Hebrew) need `unicode-bidi`/`dir="auto"` on inline spans where numbers or code appear.

## Hebrew keyword morphology (shoresh + prefixes)

Hebrew is root-based; attached prefixes create SEPARATE search queries an agent that optimizes one form will miss.

| Prefix | Hebrew | Meaning |
|---|---|---|
| ha- | ה | the |
| ve- | ו | and |
| be- | ב | in/at |
| le- | ל | to/for |
| me- | מ | from |
| she- | ש | that/which |

For each target keyword: extract the root, generate the prefix combinations users actually type, include construct-state (smikhut) forms ("beit kafe" vs "habait shel hakafe"), and cover male/female + singular/plural. Example: "nadlan" (real estate) also lives as "hanadlan", "benadlan", "lenadlan", "dirot" (plural), "batim". Map the natural variants across the page copy, not just the H1.

## Israeli schema specifics

- Phone always `+972` international prefix (local `0X-...` fails validation for geo).
- `addressCountry: "IL"`, `priceCurrency: "ILS"`, prices shown as ₪ before the number.
- `openingHoursSpecification`: Sunday-Thursday full days, Friday early close (~14:00), Saturday omitted (closed). Do not default to Monday-Friday.
- Kosher certification via `additionalProperty` naming the certifying body (Rabbanut / Badatz).
- `SpeakableSpecification` on key passages for Hebrew voice + AI extraction.

## EEAT and YMYL in Hebrew

- Experience: real Israeli-market examples and case studies with Israeli businesses.
- Expertise: author credentials, Hebrew domain expertise, references to Israeli regulations.
- Authoritativeness: backlinks from .co.il domains, mentions in Globes / TheMarker / Calcalist.
- Trust: HTTPS, clear Hebrew authorship, contact with +972, Hebrew privacy policy.
- YMYL (medical/financial/legal) in Hebrew: reviewed by a certified Israeli professional + appropriate disclaimer.

## GEO for Hebrew (the AI-citation reality)

- Google AI Overview is widely live for he-IL on google.co.il (rollout still skips some YMYL queries). Treat AI-Overview citation as aspirational, not guaranteed.
- Pure-Hebrew SaaS pages get cited LESS by ChatGPT/Claude than equivalent EN+HE pages. Keep an English alternate URL with the same content for the AI surface, plus the Hebrew URL with `he-IL` hreflang for google.co.il ranking.
- Princeton GEO methods (visibility lift, apply in Hebrew too): cite sources (+40%), add statistics (+37%), expert quotations (+30%), authoritative tone (+25%), easy-to-understand (+20%), domain terms (+18%), unique words (+15%), fluency (+15-30%). Keyword stuffing is -10%, avoid it. Best combo: fluency + statistics.
- Answer-first format matters more than keywords: sites that rank in classic google.co.il can LOSE the AI-Overview citation to a lower-traffic competitor with a cleaner direct-answer intro paragraph. The fix is structural (rewrite the intro), not more keywords.

## Per-platform snapshot (2026)

| Platform | Index | Allow (robots.txt) | Note |
|---|---|---|---|
| Google AI Overview / AI Mode | Google index | Googlebot | he-IL live; E-E-A-T + clean answer paragraph |
| ChatGPT search | OAI-SearchBot (+Bing fallback) | OAI-SearchBot, ChatGPT-User | 30-day freshness; leans Wikipedia+Reddit |
| Perplexity | PerplexityBot (+Google fallback) | PerplexityBot, Perplexity-User | FAQ/structured data; leans Reddit/community |
| Copilot | Bing index | Bingbot | Bing Webmaster verified, LinkedIn/GitHub presence |
| Claude (web) | Brave index | ClaudeBot, anthropic-ai, Claude-Web | factual density + clean source URLs |
| Gemini | Google index + live web | Googlebot; Google-Extended = training only | same as Google Search |

## Israeli monitoring and validation

- Rich Results Test for schema; `site:domain` on google.co.il and bing.com for indexation.
- Track AI citations (Otterly.ai / Profound / SE Ranking) and referral traffic from Perplexity/ChatGPT; watch Search Console AI-Overview data.
- NAP consistency across Israeli directories (Name/Address/Phone identical everywhere).
- Reference: Academy of the Hebrew Language (hebrew-academy.org.il) for correct terminology/spelling.
