---
name: seo-geo-pack
description: SEO plus GEO/AEO deep reference for getting a page found by search engines AND cited by AI answer engines (Google AI Overviews, AI Mode, ChatGPT, Perplexity, Gemini, Copilot, Claude). Use when writing or auditing a page for organic ranking, AI citability, structured data and JSON-LD, robots.txt and AI-crawler access, llms.txt, Core Web Vitals, E-E-A-T, canonical and sitemap hygiene, keyword-to-page-type intent mapping, keyword cannibalization, or Hebrew and Israeli (.co.il, he-IL, RTL) SEO. Answers "why am I not ranking", "why does no AI engine cite me", "which schema type for this page", "how do I structure a passage AI will quote". Israeli-SMB aware. Includes numeric thresholds, decision tables, worked before/after rewrites, and a robots.txt and llms.txt template.
---

# SEO + GEO/AEO Pack

Get found by classic search AND cited by AI answer engines. GEO (Generative Engine Optimization) and AEO (Answer Engine Optimization) are, per Google's own AI-optimization guide, rebranded SEO: AI Overviews and AI Mode are grounded in the same ranking and quality systems as classic Search. So the fundamentals compound. This pack is the deep layer behind the short registry entry; the operative rules below mirror that entry exactly and the deep reference expands them.

## When to use

- Writing or reviewing any public page for organic ranking or AI citability (landing, article, service, product, FAQ, local).
- Auditing why a page does not rank or why no AI engine quotes it.
- Deciding the schema type for a page, or writing JSON-LD.
- Checking robots.txt / AI-crawler access, canonical, sitemap, noindex, llms.txt.
- Mapping a keyword to the right page type by search intent.
- Diagnosing keyword cannibalization across real existing pages.
- Any Hebrew / Israeli-market page (.co.il, he-IL, RTL, +972, ₪, Shabbat hours).

## Operative rules (always-on; mirrors the registry entry)

GEO citability (why an AI engine quotes you):
- Answer-first structure. The first 40-60 words after each heading fully answer that heading's implied question, no intro fluff.
- A TL;DR / "בקצרה" up top that stands alone.
- Specific numbers WITH source attribution ("לפי X, 37%"), never a bare stat.
- A clear "what this does NOT solve" honesty section. Definitive tone; hedging, generic filler, and "water" do not get cited.
- Passage-level self-containment: each section answers one question and can be extracted without the rest of the page.

Technical:
- Consistent entities across the visible page and the JSON-LD (same brand name, category, location).
- Schema type matches the page: Product / Article / FAQPage / LocalBusiness / HowTo, not a mismatch.
- One descriptive H1 + logical heading order (no skipped levels).
- Canonical correct and self-referencing; sitemap + robots clean; NO accidental noindex.
- Internal links point to real related pages only. Add llms.txt where relevant (non-Google AI; Google Search ignores it).

Content integrity:
- Flag cannibalization ONLY against real existing pages provided; name the page and the overlap.
- Never fabricate stats or "studies". Match search intent (informational vs transactional) to page type.

CTA: restate the reader's specific pain, not a generic "sign up" / "התחל עכשיו".

## Deep reference (the on-demand layer)

### Core Web Vitals (numeric thresholds)

Judged at the 75th percentile of real-user (field) data, per URL group.

| Metric | Good | Needs work | Poor | Note |
|---|---|---|---|---|
| LCP (Largest Contentful Paint) | <= 2.5s | 2.5-4.0s | > 4.0s | Largest above-the-fold element render |
| INP (Interaction to Next Paint) | <= 200ms | 200-500ms | > 500ms | Replaced FID on 2024-03-12; never reference FID |
| CLS (Cumulative Layout Shift) | <= 0.1 | 0.1-0.25 | > 0.25 | Reserve image/embed dimensions to avoid shift |

Only CWV feeds ranking directly. HTTPS is a confirmed but light signal (<~1% of queries). Page experience overall is guidance, not a single ranking system; relevance can still win. Field data (CrUX / PageSpeed Insights) beats lab data (Lighthouse); low-traffic pages often have no CrUX data, use lab as a proxy and say so. Keep critical content + JSON-LD inside the first 2MB of HTML (Googlebot's fetch cap; 64MB for PDFs).

### Title / meta / heading limits

| Element | Limit | Rule |
|---|---|---|
| Title tag | ~50-60 chars (~600px) | Primary keyword near the front; unique per page; brand at end |
| Meta description | ~150-160 chars | Not a ranking factor; it is the SERP click pitch. Restate the value |
| H1 | 1 per page | Descriptive, contains the primary entity/keyword; distinct from title is fine |
| H2/H3 | logical, no skipped levels | Prefer question-form headings ("מה זה X", "כמה עולה") to match query patterns |
| URL | < ~100 chars | Lowercase, hyphenated, descriptive, no query params for content |
| Paragraph | 2-4 sentences | Short paragraphs extract better into AI answers and snippets |

Word counts are topical-coverage floors, NOT targets (word count is not a direct ranking factor): homepage ~500, service ~800, blog ~1,500, product 300+ (400+ complex), location 500-600. A tight page that fully answers the query beats a padded one.

### Schema type per page type (decision table)

Pick the type that matches the page's actual purpose. Mismatched or false schema is a trust risk, same class of error as keyword stuffing. Prefer JSON-LD in server-rendered HTML.

| Page type | schema.org @type | Required / key fields |
|---|---|---|
| Article / blog / guide | `Article` (or `BlogPosting`) | `headline`, `author` (Person w/ credentials), `datePublished`, `dateModified`, `publisher`, `image` |
| Service page | `Service` + `Organization` | `serviceType`, `provider`, `areaServed`, `offers` |
| Product | `Product` | `name`, `image`, `description`, `offers` (`price`, `priceCurrency` = ILS, `availability`), `aggregateRating` if real |
| Local business | `LocalBusiness` (or subtype) | `name`, `address` (`addressCountry: IL`), `telephone` (+972), `openingHoursSpecification`, `geo` |
| Genuine Q&A | `QAPage` | user-asked question + answers. NOTE: `FAQPage` no longer yields Google FAQ rich results; use FAQPage only as structure/AEO signal, QAPage for real user Q&A |
| Step-by-step | `HowTo` | `step` list with `name` + `text` per step |
| Site-wide identity | `Organization` (once) | `name`, `logo`, `url`, `sameAs` (Wikipedia, LinkedIn, socials), `contactPoint` |
| Breadcrumb trail | `BreadcrumbList` | ordered `itemListElement` |

Combine multiple types on one page with a single `@graph` array. A full JSON-LD cookbook (Article, LocalBusiness with Shabbat hours, FAQ, Product, HowTo, combined @graph, SpeakableSpecification) lives in `references/jsonld-cookbook.md`.

Minimal Article example (server-rendered):

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "כמה עולה בניית אתר לעסק קטן",
  "author": { "@type": "Person", "name": "רון קלי", "url": "https://example.co.il/about" },
  "publisher": { "@type": "Organization", "name": "HELIX", "logo": { "@type": "ImageObject", "url": "https://example.co.il/logo.png" } },
  "datePublished": "2026-08-01",
  "dateModified": "2026-08-28",
  "image": "https://example.co.il/cover.jpg"
}
```

JavaScript / rendering (Google, Dec 2025 clarifications): serve canonical, meta robots, structured data, title, and meta description in the INITIAL server-rendered HTML. If a raw-HTML canonical differs from a JS-injected one, Google may use either. If raw HTML says `noindex` and JS removes it, Google may still honor the noindex. Non-200 pages are not JS-rendered at all. AI crawlers do NOT execute JavaScript, so SSR is critical for GEO.

### GEO citability checklist (with worked before/after)

Optimal citable passage length is ~134-167 words, self-contained. About 44% of AI citations come from the first 30% of the page, so front-load the answer. Multi-modal pages (text + image/video/table) see materially higher selection. Recency matters: content under ~3 months old is far more likely to be cited; stale 6+ months loses eligibility, so run a scheduled refresh with a visible `dateModified`.

Checklist per section:
1. Direct answer in the first 40-60 words (definition pattern: "X היא...", "X refers to...").
2. One claim per sentence; attribute every number to a named source.
3. Question-form heading matching real queries (People Also Ask, "מה זה", "איך", "כמה עולה").
4. Add a table or list where the content is comparative or sequential.
5. Name the entity explicitly (brand + what it is + who it is for) so the AI can attribute the claim.
6. Include an honest "what this does NOT solve" block.

Worked example:

Before (buried, hedgeable, uncitable):
> "There are many factors that can influence how much a website might cost, and it really depends on a variety of considerations that vary from business to business..."

After (answer-first, citable, ~1 claim/sentence):
> "בקצרה: אתר תדמית לעסק קטן בישראל עולה בדרך כלל ₪3,000-₪12,000 לפרויקט חד-פעמי, לפי סקר מחירים של [מקור] 2026. חנות איקומרס עולה יותר, ₪12,000-₪40,000, בגלל אינטגרציית תשלומים ומלאי. מה זה לא פותר: תחזוקה שוטפת ופרסום ממומן הם עלות נפרדת."

The "after" gets quoted because the answer, the number, the source, and the honesty are all in one extractable passage.

### E-E-A-T signals (Trust weighted highest)

Google publishes no numeric weights beyond "Trust is most important". Order: Trust > Expertise = Authoritativeness > Experience.

- Experience: original research, case studies, before/after, first-hand photos/video, proprietary data.
- Expertise: named author with credentials + bio page, technical depth appropriate to audience, accurate sourced claims.
- Authoritativeness: external citations to primary sources, brand mentions, industry recognition, being cited by other experts.
- Trust: contact info + physical address, privacy policy + terms, real testimonials/reviews, visible date stamps + corrections, HTTPS.

Run Google's Who/How/Why test on every page: Who created it (visible byline, non-negotiable for YMYL), How (process disclosure, especially AI-assisted), Why (to help people, not to catch clicks). Weak on all three = at risk under core helpfulness signals. Note in reports that these scores are heuristics, not Google-internal signals; Search Console is the first-party source.

Brand mentions correlate ~3x more strongly with AI visibility than backlinks (Ahrefs 2025, 75K brands). Strongest signals: YouTube mentions, Reddit, Wikipedia/Wikidata presence, LinkedIn. Only ~11% of domains are cited by both ChatGPT and Google AIO for the same query, so optimize per platform (ChatGPT leans Wikipedia+Reddit; Perplexity leans Reddit+community).

### AI-crawler robots.txt block

Allow the search-time crawlers or AI engines cannot cite you. Blocking training crawlers is a separate, optional choice. Note: `OAI-SearchBot` is distinct from `GPTBot` (training), allow SearchBot even if you block GPTBot. `Google-Extended` opts out of Gemini training only and does NOT affect Google Search ranking or AI Overview citation. User-triggered fetchers (`ChatGPT-User`, `Perplexity-User`, `Google-Agent`, `Google-NotebookLM`) ignore robots.txt by design; gate them server-side if needed.

```
# Search-time AI crawlers - allow for citability
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Perplexity-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: anthropic-ai
Allow: /

# Training crawlers - allow for reach, or Disallow to opt out
User-agent: GPTBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: CCBot
Allow: /

# Everyone else (incl. Googlebot for Search + AI Overviews)
User-agent: *
Allow: /

Sitemap: https://example.co.il/sitemap.xml
```

Controlling AI-answer appearance is NOT done via an AI-specific file: use standard `nosnippet`, `data-nosnippet`, `max-snippet`, `noindex`. There is no AI-Overview opt-out file.

### llms.txt template

Google Search ignores llms.txt (confirmed; "won't harm nor help" Google rankings), and Mueller called the discovery use case a dead end. Keep it as a nice-to-have for non-Google AI services only; never present it as a Google ranking lever. It never replaces clean server-rendered HTML + schema. Place `/llms.txt` (short index) and optionally `/llms-full.txt` (full content) at the domain root.

```
# HELIX
> בונים ומגדלים מוצרי תוכנה ואוטומציה לעסקים קטנים בישראל.

## Key pages
- [מוצרים](https://example.co.il/products): רשימת המוצרים והסוכנים
- [מחירים](https://example.co.il/pricing): תמחור לפי מוצר
- [צור קשר](https://example.co.il/contact): +972-...

## Key facts
- מבוסס בישראל, תמיכה בעברית ו-RTL
- מתמחה ב-SMB
```

### Keyword intent to page-type mapping

Match the page type to the intent behind the query, or the page cannot rank for it.

| Intent | Query shape | Right page type |
|---|---|---|
| Informational | "מה זה X", "איך", "why", "guide" | Article / guide / FAQ, answer-first |
| Commercial investigation | "best X", "X vs Y", "X מחיר", "reviews" | Comparison / listicle / service page with table |
| Transactional | "buy X", "X near me", "הזמנת X", "קנה" | Product / checkout / booking / local page |
| Navigational | brand name, "X login" | Homepage / brand / login page |

One primary intent per URL. Serving transactional intent with a thin blog post (or informational intent with a bare product page) is the most common ranking failure.

### Hebrew / RTL + hreflang specifics

Native Israeli-market essentials (full deep dive in `references/hebrew-seo-deep-dive.md`):

- hreflang must be `he-IL` (not bare `he`) for Israeli Hebrew; set `x-default` to the English version; every hreflang must be reciprocal (A links B, B links A) with absolute URLs.
- RTL: `dir="rtl"` and `lang="he"` on `<html>`; use CSS logical properties (`margin-inline-start`, not `margin-left`).
- Hebrew morphology (shoresh + prefixes ha-/ve-/be-/le-/me-/she-) creates separate search queries; "nadlan" vs "hanadlan" vs "benadlan" are distinct. Cover the natural variants and construct-state (smikhut) forms, do not optimize a single form.
- Schema for IL: phone `+972`, `addressCountry: IL`, `priceCurrency: ILS` (₪ before the number), Shabbat-aware `openingHoursSpecification` (Fri early close ~14:00, Sat closed), kosher cert via `additionalProperty`.
- Pure-Hebrew pages get cited less by ChatGPT/Claude than EN+HE pairs. Keep an English alternate URL with the same content for the AI surface plus the Hebrew URL with `he-IL` hreflang for google.co.il.
- IL authority signals: backlinks from .co.il, mentions in Globes/TheMarker/Calcalist, Hebrew authorship + privacy policy.

hreflang example:

```html
<link rel="alternate" hreflang="he-IL" href="https://example.co.il/page" />
<link rel="alternate" hreflang="en" href="https://example.co.il/en/page" />
<link rel="alternate" hreflang="x-default" href="https://example.co.il/en/page" />
```

### Cannibalization diagnosis steps

Only diagnose against REAL existing pages provided; never invent an overlap.

1. List the pages that target the same or near-duplicate primary keyword/intent.
2. Confirm the overlap is real: same query, same intent, competing for the same SERP slot (two pages ranking for one query split authority).
3. Decide the fix: consolidate (301 the weaker into the stronger + merge content), differentiate (re-target one page to a distinct intent), or canonicalize (point duplicates at the canonical). Name the specific pages and the chosen action.
4. Distinguish true cannibalization (two pages, one intent) from legitimate coverage (a hub + spokes on distinct sub-intents), which is healthy.

## Anti-patterns / common mistakes

- Blocking AI crawlers in robots.txt while expecting AI citations.
- SPA with no SSR: the AI crawler and sometimes Googlebot see an empty shell. Verify with a rendered fetch.
- Answer buried below intro fluff; the engine extracts the first clean passage and yours is not it.
- Bare stats with no source, or fabricated stats/"studies". Both kill trust and citability.
- Stuffed H1/H2 keywords: AI Overviews de-prioritize keyword-stuffed headings; a cleaner answer-first competitor wins the citation.
- Recommending llms.txt as a Google ranking lever (it is not).
- Schema that does not match the page, or false/`aggregateRating` with no real reviews.
- Chasing an absolute AI-citation count; engines are non-deterministic, track trend and share-of-answer.
- hreflang `he` instead of `he-IL`, non-reciprocal hreflang, or local phone format instead of +972.
- Generic CTA ("Get Started" / "התחל עכשיו") instead of restating the reader's pain.
- Referencing FID (removed 2024) or treating word count as a ranking target.

## Checklist before returning

- [ ] Answer-first: first 40-60 words after each heading answer it; a standalone TL;DR / "בקצרה" up top.
- [ ] Every number attributed to a named source; zero fabricated stats.
- [ ] "What this does NOT solve" honesty block present where relevant.
- [ ] One descriptive H1; logical heading order; question-form headings where natural.
- [ ] Schema type matches the page; JSON-LD entities match the visible text; server-rendered.
- [ ] Canonical self-referencing; no accidental noindex; sitemap + robots clean; search-time AI crawlers allowed.
- [ ] Internal links point to real pages; cannibalization checked only against real pages.
- [ ] Intent matches page type.
- [ ] Hebrew: he-IL hreflang (reciprocal), RTL + logical properties, +972 / ILS / Shabbat hours, EN alternate for AI where useful.
- [ ] CTA restates the reader's pain; no em-dash anywhere.

## Sources

Distilled from the installed skills:
- `seo-god` (agentic SEO loop, data-honesty and ethics rules).
- `seo-technical` (CWV thresholds, AI-crawler taxonomy + robots.txt, 2MB fetch cap, JS/canonical/noindex rendering rules, security).
- `seo-geo` (passage citability 134-167 words + first-30% stat, brand-mention > backlink data, per-platform citation sources, llms.txt caveat, AI-crawler obey table).
- `geo-content-strategist` (INGEST-STRUCTURE-ANSWER-CITE-MEASURE flywheel, Layer A/B model, entity-over-keyword, anti-patterns).
- `seo-content` (E-E-A-T with Trust-weighted-highest, Who/How/Why test, word-count floors, AI-citation-readiness, heuristics-not-Google-signals honesty).
- `hebrew-seo-geo-toolkit` (he-IL hreflang, Hebrew morphology, Israeli schema with Shabbat/kosher/+972/ILS, Princeton GEO methods, per-platform bot table, EN+HE for AI).
- Registry: `_shared/ai-kit/skills/registry.ts` entry `seo-geo-pack` (operative layer this file supersets).
