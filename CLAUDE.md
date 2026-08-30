# HELIX Monorepo — Claude Code Context

> This is the master context file. Read this first before any other file in the project.

---

## 🗂️ Monorepo Layout (read before touching paths)

This repo is the HELIX monorepo: one repo for all products, one deploy per product.
pnpm workspaces + Turborepo. `pnpm install` at the root, `pnpm run build` runs turbo.

```
apps/website/     the marketing site (Next.js). Everything below about the site
                  — app/, lib/, content/, reference/, next.config.mjs,
                  apphosting.yaml — now lives under this folder.
apps/<product>/   future products (crm, ops, sdr, dashboards…). Each app has its
                  own apphosting.yaml and its own Firebase App Hosting backend
                  (own Cloud Run service, own subdomain, own runConfig).
packages/skills/  the shared skill library — single source of truth, no more
                  vendored registry copies in product repos.
packages/helix-motion/  shared motion/design system (@helix/motion).
PRODUCTS/, docs/  business specs and brand context — shared, stay at the root.
```

Rules:
- A new product = a new folder under `apps/` with its own `apphosting.yaml`.
  Never a second deploy target inside an existing app.
- Shared code goes in `packages/*` and is imported via workspace deps
  (`"@helix/motion": "workspace:*"`) — never copy-pasted between apps.
- `firebase.json` (root) holds `apphosting.rootDir: apps/website` for the site
  backend; deploys and CI run from the repo root.

---

## ⚙️ Reuse-Before-Build Rule (every new product / major feature)

Before building any new HELIX product or significant feature, FIRST search for ready-made skills, MCP servers, subagents, and GitHub repos — do not build from scratch what already exists in open source.

Per-need search order:
1. **MCP:** [Glama](https://glama.ai/mcp/servers) (first stop), [mcp.so](https://mcp.so/), [PulseMCP](https://www.pulsemcp.com/), [Smithery](https://smithery.ai/), [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)
2. **Skills:** [Composio/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills), [Skillselion](https://skillselion.com/), [SkillsClaude](https://skillsclaude.org/skills), [Skills Playground](https://skillsplayground.com/)
3. **Agents/plugins:** [wshobson/agents](https://github.com/wshobson/agents), [VoltAgent subagents](https://www.claudepluginhub.com/marketplaces/voltagent-voltagent-subagents), [aitmpl.com/plugins](https://www.aitmpl.com/plugins/), [claudemarketplaces.com](https://claudemarketplaces.com/)
4. **GitHub direct:** `awesome-<domain>`, `<need> MCP server`, `<need> claude skill`
5. **Israeli/regulatory:** [agentskills.co.il](https://agentskills.co.il/he/agents/claude-code) (ת"י 5568, tax, gov API)

Install skills: `npx skills add owner/repo`. Add MCP servers to the product's project config. Document chosen/rejected in memory.
Full source list: `Desktop/HELIX - מאגר מקורות סקילים MCP ואייגנטים.docx`.

---

## 🧠 Skill-Based Agents (STANDING RULE — applies to every product)

Every product agent that calls an LLM MUST load its capability from the **shared skill library**, not from a prompt hand-written and duplicated per product. This is not optional and not a pilot — it is the default for all agents, existing and new.

- **Agent = archetype × domain.** The archetype (role, output format, gate logic) stays in the prompt/code. The **domain knowledge** (SEO, CRO, contracts, cold-outreach, finance, brand voice) is **loaded from a skill**.
- **One skill per capability, shared across products — never a skill per agent.** ~14 horizontal skills cover all ~60 agents. See `PRODUCTS/HELIX-AGENT-SKILLS-MAP.md` for the agent→skill matrix and `PRODUCTS/HELIX-SKILLS-WIRING-CHECKLIST.md` for the wiring method.
- **Every agent that outputs text also loads the cross-cutting skills:** `helix-brand-voice` (+ Hebrew-native writing + clean-text/no-em-dash).
- **Deterministic agents (no LLM call)** — detectors, routers, fact-guards, schedulers — need no runtime skill.
- **Skill source of truth:** `packages/skills/` in this monorepo (git-versioned). Reuse ready-made from `anthropics/skills` / `ComposioHQ/awesome-claude-skills` first; security-read any third-party skill before adopting; build custom only for real gaps.

When building or editing ANY agent in ANY product, wire its skill(s) before considering the work done.

---

## What This Project Is

A marketing website for **Helix**, a one-stop product-to-market shop for Israeli SMBs. The site sells trust and transparency, not features.

- **Brand name:** HELIX. (with a green period after)
- **Founder:** Eran Lipshtain
- **Target users:** Israeli SMBs (restaurants, NGOs, B2B suppliers, wedding businesses, etc.)
- **Primary language:** Hebrew (RTL)
- **Future language:** English (LTR, for international clients)

---

## Tech Stack Decision

**Use: Astro + Tailwind CSS + TypeScript**

Reasoning:
- Content-heavy site (homepage + articles + podcast + future pages)
- Astro is purpose-built for marketing/content sites; ships zero JS by default
- Excellent SEO out of the box (critical for organic discovery)
- Easy MDX support for articles
- Eran's React knowledge transfers (Astro uses React-like islands)
- Deploy to Vercel or Netlify (both free for this scale)

**Don't use:**
- Next.js (overkill for static content)
- WordPress (too heavy, brand looks wrong)
- React SPA (bad for SEO)
- Wix/Webflow (not in spirit of the brand)

---

## Brand Identity (Critical Context)

### What Helix Is
A consulting + dev shop where ONE person handles product development AND growth marketing AND paid campaigns — under one roof, with weekly status meetings and transparent reporting.

### What Helix Is NOT
- Not a generic "digital agency"
- Not a freelancer marketplace
- Not cheap (premium pricing maintained)
- Not flashy / startup-trendy
- Not corporate / consultancy-stuffy

### Tagline
**Hebrew (primary):** מבטיחים פחות. מספקים יותר. עושים תיאום ציפיות.
**English:** Promise less. Deliver more. Align expectations.

### Positioning Sentence
חברת פיתוח-וצמיחה לעסקים ישראלים שעייפו מספקים שלא מדברים אחד עם השני, מהבטחות שלא מתממשות, ומסטטוסים שלא קורים.

---

## Voice and Tone Rules

### DO
- **Direct (dugri) Hebrew.** "אנחנו עושים X" not "Helix is committed to providing X"
- **Specific over general.** "30 דקות, יום שלישי בבוקר" not "regular check-ins"
- **Numbers and proper nouns.** "10+ שנים", "Groupon", "Node.js", "GCP" — these are anti-AI signals
- **One claim per paragraph.** Don't pile up impressive-sounding statements
- **Code-switching is natural.** "השיחה הראשונה הייתה על OCR pipeline" is fine; don't translate technical terms

### DON'T
- ❌ **Buzzwords:** "synergy", "cutting-edge", "scalable solutions", "industry-leading", "world-class"
- ❌ **Em-dashes ( — ) more than once per section.** They're a strong AI tell
- ❌ **"Excited to share"** or any version of it
- ❌ **Bullet lists where prose works.** Lists are for genuine lists (capabilities, steps), not for breaking up paragraphs
- ❌ **Emojis as branding.** No 🚀, 💡, ✨, 🎯
- ❌ **Decorative dashes** like "— Let's Talk —"
- ❌ **Generic CTAs** like "Get Started" — use specific ones like "קבע שיחת היכרות"
- ❌ **"Hot take:"**, "Plot twist:", "Let that sink in" — content theater

### When in doubt
Read the line out loud in Hebrew. If it sounds like marketing-speak or a translated SaaS landing page, rewrite.

---

## Design System

### Colors

```css
--bg: #FAFAF8;              /* warm off-white, primary background */
--bg-surface: #FFFFFF;       /* elevated surfaces (cards) */
--bg-soft: #F4F2EE;         /* slightly warmer alt background */
--ink: #1A1A1A;             /* primary text */
--ink-secondary: #6B6B6B;   /* secondary text */
--ink-muted: #A8A8A8;       /* tertiary, labels, meta */
--ink-soft: #C8C8C5;        /* dividers in text */
--border: #EBEBE8;          /* soft borders */
--border-strong: #D8D6D2;   /* stronger borders */
--brand: #10B981;           /* emerald — brand accent */
--brand-hover: #059669;     /* darker emerald — hover state */
```

### Color Rules
- The emerald (#10B981) is for **action only**: logo accent, buttons, links, CTAs
- Never use green decoratively (icons, dividers, accents on text)
- No dark hero sections (we tried and rejected them — felt too "agency")
- Maximum 2 colors on screen at any moment: ink + brand

### Typography

**Single font family: Heebo** (Google Fonts, supports Hebrew + Latin)
- Weights to load: 300, 400, 500, 600, 700, 800, 900
- Optional: JetBrains Mono (weight 500) for tech stack lines / metadata

### Type Scale
```
Display:  clamp(48px, 9vw, 112px) / weight 800-900 / letter-spacing -0.045em
H1:       clamp(40px, 7vw, 80px)  / weight 800     / letter-spacing -0.04em
H2:       clamp(36px, 5.5vw, 56px) / weight 800    / letter-spacing -0.03em
H3:       24-26px                  / weight 700-800 / letter-spacing -0.02em
Body:     17-20px                  / weight 400    / line-height 1.6-1.7
Small:    14-15px                  / weight 400
Label:    11-13px / weight 600 / letter-spacing 0.15em / uppercase (English only)
```

### Spacing System
- Section vertical padding: `clamp(80px, 12vw, 140px)`
- Container max-width: `1100px` (homepage) / `820px` (article reading)
- Container horizontal padding: `clamp(20px, 4vw, 40px)`
- Gap between cards: `20-32px`
- Gap inside cards: `16-24px`

### Border Radius
- Cards / surfaces: `16-20px`
- Buttons: `8-10px`
- Pills / badges: `100px`
- Avatar / small icons: `50%`

### Shadows (used sparingly)
- Cards: `none` by default; on hover, subtle border color change
- Buttons (primary hover): `box-shadow: 0 8px 24px -8px rgba(16, 185, 129, 0.4)`
- Avoid generic SaaS card shadows (`0 4px 12px rgba(0,0,0,0.1)`)

---

## Information Architecture

### Site Map

```
/                       Home page (the main conversion page)
/articles               Article index
/articles/[slug]        Individual article (Phase 2)
/podcast                Podcast episode index
/podcast/[slug]         Individual episode (Phase 2)
/[future] /case-studies Detailed case study pages (Phase 3)
```

### Homepage Sections (in order, top to bottom)

1. **Hero** — Tagline (3 lines), subline, CTA to discovery call
2. **The Pain** — "Promise vs Reality" (3 examples), closing line
3. **Capabilities** — What we do (4 areas: dev, organic, paid, strategy) with tech stacks
4. **Method** — How we work (4 specific behaviors)
5. **Journey** — How we start (4 steps; explicit note about no prices)
6. **Services** — Audit, Launch, Grow (engagement types, NO PRICES)
7. **Cases** — 4 client case studies (with placeholder metrics)
8. **About** — Founder story (Eran)
9. **FAQ** — 8 questions (native HTML details/summary, no JS needed)
10. **Resources** — 4 content channels (articles, podcast, YouTube, LinkedIn)
11. **Final CTA** — Discovery call, light/calm (NOT a dark dramatic section)
12. **Footer** — Minimal, light

---

## Critical Rules (DO NOT VIOLATE)

### 1. No Prices on the Website
Prices are NEVER shown on the public site. Why: the brand promises "expectation alignment together" — showing prices anchors clients before scope is understood. Prices are co-created in the discovery call + scoping meeting.

The FAQ does mention general ranges (15-25K, 30-90K, 25-45K/mo) because that's a fair answer to "how much" without anchoring on a specific number.

### 2. The "What We Do" vs "Services" Distinction
- **Capabilities** = what skills/services we offer (dev, marketing, ads, strategy)
- **Services** = engagement types / packages (Audit, Launch, Grow)
These are two different sections. Don't merge them.

### 3. Vocabulary Discipline
- Use **שירותים** (services), never **מסלולים** (paths). We tested both; שירותים won.
- Use **מי אני** (who I am), never **מאחורי הברנד** (behind the brand) for About section
- Use **שיחת היכרות** (introductory call), never **התחל עכשיו** (start now) or **קבל הצעה** (get a quote)
- Use **תהליך** (process), never **journey** in Hebrew or **rideout**

### 4. The Brand Voice Is Calm
- No "dramatic" dark sections (we removed them in v3)
- No glow effects
- No pulsing dots
- No "featured/highlighted" cards that break the visual rhythm
- Hover states are SUBTLE (border color change, slight translateY)

### 5. Avoid AI Templates
Patterns we identified as "feels AI" and removed:
- `[section-tag] → [title] → [description] → [content grid]` repeated identically 7 times
- Perfect 4-column or 3-column grids on every section
- Large uppercase labels with letter-spacing on every divider
- "[01] / METHOD" type technical decorations
- Big colored numbers (we made them subtle text instead)
- Cards-only design language (mix in editorial / list layouts)

---

## Content Source Files

The `apps/website/content/` directory has approved copy that should be used verbatim or with minor edits:

- `apps/website/content/homepage-copy.md` — All homepage section copy in Hebrew
- `apps/website/content/faq.md` — The 8 FAQ entries with full answers

The `/docs/` directory (repo root — shared brand context) has business and brand context:

- `docs/BUSINESS.md` — Business positioning, services, pricing strategy, target customers
- `docs/BRAND.md` — Visual design system in detail
- `docs/VOICE.md` — Writing voice patterns, do's and don'ts with examples
- `docs/ROADMAP.md` — What to build first, what comes later

The `apps/website/reference/` directory has working HTML mockups:

- `reference/homepage-mockup.html` — The approved v6 homepage design
- `reference/articles-mockup.html` — Articles index design
- `reference/podcast-mockup.html` — Podcast index design
- `reference/brand-mockup.html` — Visual brand guidelines

**These mockups are the visual target.** Port them faithfully to Astro components. Don't redesign — they were iterated 6+ times to reach this state.

---

## Implementation Roadmap

### Phase 1: MVP (do this first)
- [ ] Initialize Astro project with TypeScript
- [ ] Install Tailwind CSS + configure with Helix design tokens
- [ ] Set up Hebrew RTL support
- [ ] Configure Heebo font
- [ ] Build homepage (port from `reference/homepage-mockup.html`)
- [ ] Make fully responsive (mobile-first)
- [ ] Set up FAQ with native `<details>` / `<summary>` (no JS framework)
- [ ] Build Layout component (nav + footer) shared across pages
- [ ] Deploy to Vercel or Netlify
- [ ] Set up custom domain (helix.co.il)

### Phase 2: Content pages
- [ ] Build `/articles` index page (port from mockup)
- [ ] Build `/podcast` index page (port from mockup)
- [ ] Set up MDX or Markdown for individual article pages
- [ ] Build article page template
- [ ] Build podcast episode page template
- [ ] Newsletter signup integration (suggested: ConvertKit or Mailchimp)

### Phase 3: Polish + Integrations
- [ ] Calendly embed in CTA
- [ ] Analytics (Plausible or GA4 — Plausible is more on-brand)
- [ ] Sitemap.xml + robots.txt
- [ ] Open Graph images for social sharing
- [ ] Performance audit (target 95+ Lighthouse all categories)
- [ ] Add `lang="he"` and `dir="rtl"` properly throughout

### Phase 4: Future enhancements
- [ ] Individual case study pages
- [ ] English version of homepage (for international clients via Toptal/Arc.dev)
- [ ] Search functionality for articles
- [ ] Tags/categories for articles
- [ ] RSS feed for podcast

---

## Component Patterns

### Reusable components to build first
- `Layout.astro` — base layout with `<html dir="rtl" lang="he">`, nav, footer
- `Nav.astro` — sticky navigation with blur backdrop
- `Footer.astro` — minimal footer
- `Button.astro` — three variants: primary (filled emerald), secondary (outline), text (link-style)
- `SectionHeader.astro` — eyebrow + title + description pattern
- `FAQItem.astro` — wraps a details/summary block

### Component naming convention
- PascalCase for components: `FAQItem.astro`
- kebab-case for pages: `articles.astro`
- camelCase for utility functions

### Tailwind config notes
- Configure custom colors matching design tokens (use the hex values above)
- Configure custom font family (Heebo)
- Configure RTL support (consider `tailwindcss-rtl` plugin)
- Custom spacing for section-padding utility

---

## Deployment

- **Hosting:** Vercel (recommended) or Netlify
- **Domain:** helix.co.il (Eran will configure)
- **SSL:** Automatic with Vercel/Netlify
- **Performance budget:** First Contentful Paint < 1.5s, Lighthouse 95+

---

## When You Don't Know What To Do

1. Check `/reference/` HTML mockups — they're the visual source of truth
2. Check `/content/` for approved copy — don't rewrite Hebrew content from scratch
3. Check `/docs/BRAND.md` for design tokens
4. Check `/docs/VOICE.md` for writing style
5. If still stuck, ask Eran. Don't guess on brand decisions.

---

*This document is the result of 6+ iterations of design and copy work. Decisions captured here represent real trade-offs that were evaluated. Don't re-litigate them without strong reason.*
