# HELIX. Design System

> Single source of truth for design decisions, tokens, and component specs.
> Update this file when the design evolves. Last updated: 2026-06-04.

---

## Table of Contents

1. [Color Tokens](#color-tokens)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [Components](#components)
5. [Page Sections](#page-sections)
6. [Navigation](#navigation)
7. [Responsive Breakpoints](#responsive-breakpoints)
8. [Motion & Interaction](#motion--interaction)
9. [Iconography & Imagery](#iconography--imagery)
10. [RTL / Hebrew](#rtl--hebrew)
11. [Accessibility](#accessibility)
12. [Anti-Patterns](#anti-patterns)
13. [File Map](#file-map)
14. [Deployment](#deployment)

---

## Color Tokens

Defined in `app/globals.css` under both `@theme` (Tailwind) and `:root` (CSS variables).

| Token | Hex | Tailwind Class | Usage |
|---|---|---|---|
| `--bg` | `#FAFAF8` | `bg-bg` | Primary background (warm off-white) |
| `--bg-surface` | `#FFFFFF` | `bg-bg-surface` | Cards, elevated surfaces |
| `--bg-soft` | `#F4F2EE` | `bg-bg-soft` | Alt section backgrounds |
| `--ink` | `#1A1A1A` | `text-ink` | Headings, primary text |
| `--ink-secondary` | `#6B6B6B` | `text-ink-secondary` | Body text, descriptions |
| `--ink-muted` | `#A8A8A8` | `text-ink-muted` | Labels, metadata, captions |
| `--ink-soft` | `#C8C8C5` | `text-ink-soft` | Dividers in text |
| `--border` | `#EBEBE8` | `border-border` | Soft borders, dividers |
| `--border-strong` | `#D8D6D2` | `border-border-strong` | Hover borders, button outlines |
| `--brand` | `#10B981` | `bg-brand` / `text-brand` | Emerald accent (ACTION ONLY) |
| `--brand-hover` | `#059669` | `bg-brand-hover` | Hover state for brand elements |

### Color Rules

- **Emerald is for action only:** logo dot, primary buttons, links, CTAs, hero accent line
- **Never use green decoratively** (no green icons, dividers, or background fills)
- **No dark hero/CTA sections** (tried in v2, rejected — felt too "agency")
- **`#FAFAF8` not `#FFFFFF`** for page background — the warmth is intentional
- **Selection color:** emerald background + white text (`::selection`)

---

## Typography

### Fonts

| Font | Weights | Usage | Variable |
|---|---|---|---|
| **Heebo** | 300-900 | Everything — headings, body, UI | `--font-heebo` |
| **JetBrains Mono** | 500 | Tech stack lines, code snippets only | `--font-mono` |

Both loaded via `next/font/google` in `app/layout.tsx` with `display: swap`.

### Type Scale

| Level | Size | Weight | Letter-spacing | Line-height | Usage |
|---|---|---|---|---|---|
| Display | `clamp(44px, 8vw, 96px)` | 800 | `-0.045em` | 0.98 | Hero headline only |
| H2 | `clamp(32px, 4.5vw, 52px)` | 800 | `-0.03em` | 1.1 | Section titles |
| H3 | `22-26px` | 700-800 | `-0.015em` | 1.2 | Card titles |
| Body | `clamp(17px, 1.8vw, 20px)` | 400 | normal | 1.6-1.7 | Paragraphs |
| Small | `14-15px` | 400 | normal | 1.55 | Meta, captions |
| Label | `11-13px` | 500-600 | `0.15-0.18em` | — | Section tags (uppercase for English) |

### Typography Rules

- Hebrew has no uppercase — `text-transform: uppercase` only affects English labels
- Use **weight for emphasis**, not color (bold the key word, don't make it green)
- Numbers in tech stacks use JetBrains Mono
- Never add additional fonts

---

## Spacing & Layout

### CSS Custom Properties

```css
--max-width: 1100px;          /* Main container */
--section-padding: clamp(80px, 12vw, 140px);
--container-padding: clamp(20px, 4vw, 40px);
```

### Spacing Scale

| Context | Value |
|---|---|
| Between major sections | `var(--section-padding)` — `clamp(80px, 12vw, 140px)` |
| Between cards/items | `32-48px` |
| Inside cards | `16-24px` |
| Container max-width | `1100px` |
| Reading max-width | `680-820px` (articles) |

### Container

```css
.container {
  max-width: var(--max-width);  /* 1100px */
  margin: 0 auto;
  padding: 0 var(--container-padding);
}
```

---

## Components

### Buttons

Defined in `app/components/Button.tsx` and `globals.css`.

| Variant | Class | Background | Text | Border | Hover |
|---|---|---|---|---|---|
| Primary | `.btn-primary` | `var(--brand)` | white | none | `var(--brand-hover)` |
| Text | `.btn-text` | transparent | `var(--ink-secondary)` | none | `color: var(--ink)` |
| Nav CTA | `.nav-cta` | transparent | `var(--ink)` | `1.5px solid var(--ink)` | `bg: var(--ink)`, text white |

**Shared button styles:**
- Padding: `14px 24px`
- Border-radius: `8px`
- Font: `15px`, weight `500`
- Transition: `all 0.2s ease`
- Focus: `outline: 2px solid var(--brand), offset 2px`
- Arrow moves `-3px` on hover (RTL: moves right)

### Cards

| Property | Value |
|---|---|
| Background | `var(--bg-surface)` |
| Border | `1px solid var(--border)` |
| Border-radius | `16-20px` |
| Padding | `32-40px` |
| Hover | border → `var(--border-strong)`, no shadow |

Card types: `.path-card` (services), `.case-card` (case studies), `.method-item` (method grid).

### Section Header (`SectionHeader.tsx`)

```
.section-tag    →  Uppercase label, muted, 12px, letter-spacing 0.16em
.section-title  →  Bold heading, clamp(32px, 4.5vw, 52px)
.section-desc   →  Secondary text, max-width 640px
```

### FAQ Item (`FAQItem.tsx`)

- Native `<details>/<summary>` — no JavaScript
- `.faq-icon` rotates on open (CSS `details[open] .faq-icon`)
- Border-bottom separator between items

### WhatsApp Float (`WhatsAppFloat.tsx`)

- Fixed bottom-left (RTL), `24px` offset
- `56px` round button, emerald background
- White SVG icon, `box-shadow: 0 4px 20px rgba(0,0,0,0.15)`
- Links to `wa.me/{number}` with pre-filled message

---

## Page Sections

Homepage sections in order (defined in `app/page.tsx`):

| # | Section | Component | Layout | Background |
|---|---|---|---|---|
| 1 | Hero | `sections/Hero.tsx` | Left-aligned headline + dual CTAs | `var(--bg)` |
| 2 | Pain | `sections/Pain.tsx` | 3-column grid rows (number / promise / reality) | `var(--bg-surface)` with borders |
| 3 | Capabilities | `sections/Capabilities.tsx` | 2-column text list + mono tech stacks | `var(--bg)` |
| 4 | Method | `sections/Method.tsx` | 2x2 equal cards grid | `var(--bg)` |
| 5 | Journey | `sections/Journey.tsx` | 4-step stepper (numbered circles) | `var(--bg-soft)` |
| 6 | Services | `sections/Services.tsx` | 3-column cards (Audit / Launch / Grow) | `var(--bg)` |
| 7 | Cases | `sections/Cases.tsx` | 2x2 card grid with metrics | `var(--bg)` |
| 8 | About | `sections/About.tsx` | Photo placeholder + text blocks | `var(--bg-surface)` |
| 9 | FAQ | `sections/FAQ.tsx` | Vertical accordion list | `var(--bg)` |
| 10 | Resources | `sections/Resources.tsx` | Vertical list + right-aligned CTAs | `var(--bg)` |
| 11 | Final CTA | `sections/FinalCTA.tsx` | Centered single column, calm tone | `var(--bg-soft)` |

**Key principle:** Every section has its own visual logic. Don't homogenize layouts — this prevents the "AI template" feel.

### Additional Pages

| Page | Route | File |
|---|---|---|
| Articles | `/articles` | `app/articles/page.tsx` |
| Podcast | `/podcast` | `app/podcast/page.tsx` |
| Privacy | `/privacy` | `app/privacy/` |
| Vibe Code | `/vibe-code` | `app/vibe-code/` |

---

## Navigation

Defined in `app/components/Nav.tsx` + `lib/site.ts`.

| Property | Value |
|---|---|
| Position | `sticky`, top 0 |
| Background | `rgba(250,250,248, 0.88)` + `backdrop-filter: blur(20px)` |
| Border | Transparent → `var(--border)` on scroll (`.scrolled`) |
| Z-index | `100` |
| Logo | Heebo Black (900), `22px`, letter-spacing `-0.04em` |
| Logo dot | `color: var(--brand)` |
| Links gap | `32px` |
| Link style | `14px`, weight `500`, `var(--ink-secondary)` → `var(--ink)` on hover |

**Nav links** (from `lib/site.ts`):
1. מה אנחנו עושים → `/#capabilities`
2. שירותים → `/#paths`
3. שו"ת → `/#faq`
4. אודות → `/#about`

**Mobile (< 768px):** Nav links hidden. Only logo + CTA visible.

---

## Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| `< 768px` | Nav links hidden. Grids collapse to single column. Pain rows stack vertically. |
| `< 600px` | Pain grid → full-width stacked. Service cards → single column. |
| `768px - 1100px` | 2-column grids. Reduced section padding. |
| `> 1100px` | Full layout. Container capped at `1100px`. |

All sizing uses `clamp()` for fluid scaling — no hard breakpoint jumps for typography.

---

## Motion & Interaction

### Allowed

| Element | Effect | Duration |
|---|---|---|
| Scroll | `scroll-behavior: smooth` | native |
| Card hover | Border color → `var(--border-strong)` | `0.3s ease` |
| Button hover | Slight `translateY(-1px)` or color shift | `0.2s ease` |
| Arrow on hover | `translateX(-3px)` | `0.2s ease` |
| FAQ accordion | Native `<details>` expand | instant |
| Nav border | Appears on scroll | `0.3s ease` |
| Nav backdrop | Always-on blur | — |

### Forbidden

- No fade-in on scroll
- No parallax
- No number counters animating up
- No animated heroes (video/lottie)
- No pulsing CTAs
- No glow effects

---

## Iconography & Imagery

### Default: No Icons

The brand avoids icons. Typography is strong enough on its own.

**Exceptions only:**
- WhatsApp SVG (white, in float button)
- FAQ plus/cross (CSS-only rotation)
- Arrow characters in CTAs: `←` / `↓` (Unicode, not icon fonts)

### Photography

- Founder photo: professional-casual, warm tones, eye contact
- No stock photos. No 3D illustrations. No gradient meshes.
- Use real screenshots (Slack, dashboards) when needed

### If Icons Are Ever Needed

Use **Lucide** (lucide.dev) — lightest weight, 1.5px stroke max, never filled.

---

## RTL / Hebrew

- `<html dir="rtl" lang="he">` set in `app/layout.tsx`
- Use **logical CSS properties**: `padding-inline-start` not `padding-right`
- Hebrew has no uppercase — `text-transform: uppercase` only hits English labels
- Numbers remain LTR automatically (browser bidi algorithm)
- Code-switching is natural: "Helix Audit" stays English inside Hebrew sentences
- No em-dashes in Hebrew text (English convention — use period or comma instead)
- Arrow direction: `←` points "forward" in RTL context

---

## Accessibility

### Implemented

- Semantic HTML: `<article>`, `<section>`, `<nav>`, `<header>`, `<footer>`
- Proper heading hierarchy (h1 → h2 → h3)
- `aria-label` on icon-only buttons
- Focus-visible outlines: `2px solid var(--brand)`, offset `2px`
- Native `<details>/<summary>` for FAQ (keyboard accessible by default)

### Color Contrast (WCAG AA)

| Pair | Ratio | Status |
|---|---|---|
| `--ink` on `--bg` | 17:1 | Pass |
| `--ink-secondary` on `--bg` | 5.4:1 | Pass |
| `--brand` on `--bg` | 3.5:1 | Pass (non-text UI) |

### To Add

- `@media (prefers-reduced-motion)` — disable hover transitions
- Skip navigation link for keyboard users
- Alt text audit on all images

---

## Anti-Patterns

Things we tried and deliberately rejected:

### Visual
- Dark hero/CTA sections with glow effects
- Big green numbers on Method section
- Pulsing dots / animated indicators
- "Featured" highlighted card breaking visual rhythm
- Gradient backgrounds
- Generic SaaS card shadows (`0 4px 12px rgba(0,0,0,0.1)`)

### Copy
- "מסלולים" → use **"שירותים"**
- "מאחורי הברנד" → use **"מי אני"**
- "התחל עכשיו" / "קבל הצעה" → use **"שיחת היכרות"**
- Decorative em-dashes like "— Let's Talk —"
- Emojis as branding elements
- Buzzwords: synergy, cutting-edge, scalable solutions

### Structural
- Prices on the website (contradicts brand promise)
- Identical `[tag] → [title] → [grid]` repeated on every section
- Perfect symmetric grids on every section
- `[01] / METHOD` type technical decorations
- Testimonials with stock photos (we use real case studies)

---

## File Map

```
helix/
├── app/
│   ├── layout.tsx              # Root layout (fonts, metadata, GA, nav, footer)
│   ├── page.tsx                # Homepage (assembles all sections)
│   ├── globals.css             # All design tokens + component styles
│   ├── manifest.ts             # PWA manifest
│   ├── sitemap.ts              # Auto sitemap
│   ├── robots.ts               # Robots config
│   ├── components/
│   │   ├── Nav.tsx             # Sticky navigation
│   │   ├── Footer.tsx          # Site footer
│   │   ├── Button.tsx          # Reusable button component
│   │   ├── SectionHeader.tsx   # Tag + title + description pattern
│   │   ├── FAQItem.tsx         # Details/summary accordion
│   │   ├── WhatsAppFloat.tsx   # Floating WhatsApp button
│   │   ├── JsonLd.tsx          # Structured data
│   │   ├── MetaPixel.tsx       # Facebook Pixel (env-gated)
│   │   └── sections/
│   │       ├── Hero.tsx
│   │       ├── Pain.tsx
│   │       ├── Capabilities.tsx
│   │       ├── Method.tsx
│   │       ├── Journey.tsx
│   │       ├── Services.tsx
│   │       ├── Cases.tsx
│   │       ├── About.tsx
│   │       ├── FAQ.tsx
│   │       ├── Resources.tsx
│   │       └── FinalCTA.tsx
│   ├── articles/page.tsx       # Articles index
│   ├── podcast/page.tsx        # Podcast index
│   ├── privacy/                # Privacy policy
│   ├── vibe-code/              # Vibe Code workshop page
│   └── api/                    # API routes
├── lib/
│   ├── site.ts                 # Site config (URLs, nav links, metadata)
│   └── schema.ts               # JSON-LD structured data
├── content/
│   ├── homepage-copy.md        # Approved Hebrew copy
│   └── faq.md                  # FAQ entries
├── docs/
│   ├── BRAND.md                # Full brand guidelines
│   ├── VOICE.md                # Writing voice rules
│   ├── BUSINESS.md             # Business context
│   └── ROADMAP.md              # Development phases
├── reference/                  # Original HTML mockups (v6, approved)
├── public/                     # Static assets
├── next.config.mjs             # Next.js config
├── postcss.config.mjs          # PostCSS (Tailwind)
└── tsconfig.json               # TypeScript config
```

---

## Deployment

| Item | Value |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 |
| Styling | Tailwind CSS 4 + CSS custom properties |
| Hosting | Vercel |
| Domain | `https://helix.co.il` |
| Branch | `master` |
| Node | `>= 20.0.0` |
| Analytics | GA4 (`NEXT_PUBLIC_GA_ID`) — env-gated |
| Pixel | Meta/Facebook (`NEXT_PUBLIC_FB_PIXEL_ID`) — env-gated |
| Email | Resend (`RESEND_API_KEY`) — server-side only |

---

*When in doubt: read the mockups in `/reference/`, check `/content/` for approved copy, and refer to `/docs/BRAND.md` for visual decisions. Don't redesign — iterate.*
