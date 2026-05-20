# Helix Brand Guidelines

The visual and verbal system that defines Helix. This document is the source of truth for any design decision.

---

## Brand Personality

### What Helix feels like
- **Calm.** Not aggressive, not flashy, not "trying hard"
- **Confident.** Quietly sure, never desperate to convince
- **Direct.** Says what it means, no decorative language
- **Transparent.** Shows the seams, names the trade-offs
- **Premium but accessible.** Not corporate-stuffy, not startup-trendy

### Reference brands (for inspiration, not imitation)
- **Linear** (calm SaaS, strong typography)
- **Stripe Docs** (clarity, hierarchy, professionalism)
- **Anthropic** (warm restraint, intelligent design)
- **Refactoring (Luca Rossi)** (founder-led premium personal brand)
- **Tikal** (Israeli boutique consultancy aesthetic)

### Brands to NOT feel like
- **Cluely / Vercel** (too aggressive / startup-trendy)
- **Wix templates** (too generic)
- **Big consultancy firms** (too corporate)
- **Most marketing agencies** (too "salesy")

---

## Logo

### Primary wordmark
```
HELIX.
```
- Letters: Heebo Black (weight 900)
- Letter-spacing: -0.04em
- The period after HELIX is in brand emerald `#10B981`
- No tagline locked up with the logo

### Logo sizing
- Minimum legible size: 16px (footer)
- Default in nav: 22-24px
- Hero: clamp(80px, 14vw, 200px)

### Logo on dark backgrounds
- Wordmark: white
- Period: still brand emerald (it pops on dark)

### Don't
- ❌ Don't add a tagline to the wordmark itself
- ❌ Don't add an icon/mark next to the wordmark (for now)
- ❌ Don't outline the wordmark
- ❌ Don't use gradients on the logo
- ❌ Don't make the period larger or animated

---

## Color System

### The palette

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#FAFAF8` | Primary background (warm off-white) |
| `--bg-surface` | `#FFFFFF` | Elevated surfaces, cards |
| `--bg-soft` | `#F4F2EE` | Alt section background, subtle variation |
| `--ink` | `#1A1A1A` | Primary text, headings |
| `--ink-secondary` | `#6B6B6B` | Body text, descriptions |
| `--ink-muted` | `#A8A8A8` | Labels, metadata, captions |
| `--ink-soft` | `#C8C8C5` | Text dividers, very subtle |
| `--border` | `#EBEBE8` | Soft borders, dividers |
| `--border-strong` | `#D8D6D2` | Stronger borders, button outlines |
| `--brand` | `#10B981` | Brand accent (emerald) |
| `--brand-hover` | `#059669` | Brand hover state |

### Color usage rules

**The emerald (#10B981) is reserved for ACTION.**
Use it on:
- Logo period (signature)
- Primary buttons (filled background)
- Links (text color or underline)
- Active nav state
- "Latest" / "selected" indicators
- The third line of the hero headline ("מדברים כל שבוע")

Do NOT use emerald for:
- Decorative accents
- Section dividers
- Background fills (except `brand-soft` for very specific moments)
- Icons (we don't use icons anyway)
- Random emphasized text

**The dark (#1A1A1A) is for INK ONLY.**
- Don't use as a background for sections (we tried, didn't fit)
- Footer is fine to be slightly darker, but should still feel restrained

**The warm off-white (#FAFAF8) is critical.**
Pure white (#FFFFFF) feels colder and more "screen". The warm off-white reads like premium paper. This is a small but important detail.

### Color contrast
All text/background pairings meet WCAG AA:
- `ink` on `bg`: 17:1 contrast
- `ink-secondary` on `bg`: 5.4:1
- `brand` on `bg`: 3.5:1 (acceptable for non-text UI like buttons)

---

## Typography

### Font family
**Heebo** — the single font for everything.

Designed by Oded Ezer (Israeli typographer). Supports Hebrew + Latin at premium quality.
Available free on Google Fonts.

Load these weights:
- 300 (Light)
- 400 (Regular)
- 500 (Medium)
- 600 (Semi-Bold)
- 700 (Bold)
- 800 (Extra Bold)
- 900 (Black)

### Why a single font
- Consistency = professionalism
- Hebrew-first projects benefit from a font designed for Hebrew
- Less to load = faster site

### Optional secondary: JetBrains Mono
Used ONLY for:
- Tech stack lines on the Capabilities section
- Code snippets in articles (future)
- Metadata that should feel "system-y" (file paths, version numbers)

Never use for body copy or headings.

### Type scale (responsive)

```css
/* Display (hero only) */
font-size: clamp(48px, 9vw, 112px);
font-weight: 900;
letter-spacing: -0.045em;
line-height: 0.92;

/* H1 (page titles like /articles, /podcast) */
font-size: clamp(40px, 7vw, 80px);
font-weight: 800;
letter-spacing: -0.04em;
line-height: 1;

/* H2 (section titles on homepage) */
font-size: clamp(36px, 5.5vw, 56px);
font-weight: 800;
letter-spacing: -0.03em;
line-height: 1.05-1.1;

/* H3 (card titles, sub-section titles) */
font-size: 22-26px;
font-weight: 700-800;
letter-spacing: -0.015em to -0.02em;
line-height: 1.2-1.25;

/* Body (default paragraph) */
font-size: 17-20px;
font-weight: 400;
line-height: 1.6-1.7;
color: var(--ink-secondary);

/* Small (meta, captions, secondary info) */
font-size: 14-15px;
font-weight: 400;
line-height: 1.55;

/* Label (section eyebrows, UI labels) */
font-size: 11-13px;
font-weight: 500-600;
letter-spacing: 0.15-0.18em;
text-transform: uppercase;  /* Only effective on English */
color: var(--ink-muted);
```

### Typography rules
- **Hebrew text doesn't use uppercase** (it has no case) but letter-spacing on labels still works
- **English labels can use uppercase** for that "magazine label" feel
- **Don't mix fonts** (no serif headlines with sans body, etc.)
- **Use weight, not color, for emphasis** in body copy (bold on the key word, not green)
- **Numbers in tech stacks** look great in JetBrains Mono

---

## Spacing System

### Vertical rhythm

```css
--section-padding: clamp(80px, 12vw, 140px);  /* Between major sections */
--component-gap: 32-48px;                       /* Between cards/items */
--inner-gap: 16-24px;                           /* Inside cards */
```

### Container widths

```css
--max-width-content: 1100-1200px;  /* Main content max-width */
--max-width-reading: 680-820px;    /* Article body (better reading) */
--max-width-narrow: 560-620px;     /* Form / focused CTA areas */

--container-padding: clamp(20px, 4vw, 40px);  /* Horizontal padding */
```

### Why generous spacing
The brand is "calm and confident". Cramped layouts read as "trying to fit too much" — exactly what we don't want. Whitespace = confidence.

---

## Component Patterns

### Buttons

**Primary** (`btn btn-primary`)
- Background: `var(--brand)`
- Text: white
- Padding: 14px 24px
- Border-radius: 8-10px
- Font-weight: 500
- Hover: `var(--brand-hover)`, slight translateY(-1px)

**Secondary** (`btn btn-secondary`)
- Background: transparent
- Text: `var(--ink)`
- Border: 1.5px solid `var(--ink)`
- Hover: background `var(--ink)`, text white

**Text/Link** (`btn-text`)
- Background: transparent
- Text: `var(--brand)` (or `var(--ink-secondary)` depending on context)
- Underline appears on hover
- No padding (inline)

### Cards
- Background: `var(--bg-surface)`
- Border: 1px solid `var(--border)`
- Border-radius: 16-20px
- Padding: 32-40px
- Hover: border color shifts to `var(--border-strong)` (no shadow elevation)

### Section structure (default)
```
[Section Label - uppercase, muted]
[Section Title - large, bold]
[Section Description - mid-size, secondary color]
[Content area - varies by section]
```

But don't repeat this pattern identically on every section. Vary the layout to avoid template-feel.

---

## Layout Patterns

### Homepage section variety (intentional)
To avoid AI-template feeling, sections use different layouts:

1. **Hero**: Large headline, eyebrow text, dual CTAs, left-aligned
2. **Pain**: 3-column comparison grid (promise vs reality)
3. **Capabilities**: 2-column text list with monospace stack lines
4. **Method**: 2x2 grid of equal cards
5. **Journey**: 4-step horizontal stepper with connecting line
6. **Services**: 3-column cards (each card has internal structure)
7. **Cases**: 2x2 grid with embedded metric
8. **About**: 2-column layout (image | text)
9. **FAQ**: Vertical list with accordions
10. **Resources**: Vertical list with right-aligned CTAs
11. **CTA**: Centered single column

The pattern: **every section has its own visual logic**. Don't homogenize.

---

## Iconography

**Default: no icons.**

We avoided icons throughout the design because:
- Most stock icons feel generic / AI-templated
- The brand doesn't need decoration
- Typography is strong enough alone

**Exceptions:**
- Play button for podcast episodes (white triangle in circle)
- Plus/cross icon for FAQ accordion (CSS-only, rotates on open)
- Arrow characters in CTAs (← → using Unicode, not icon fonts)

**If we ever need a real icon set:**
- Use **Lucide** (lucide.dev) — clean line-icons
- Or **Phosphor** (phosphoricons.com) — similar
- Always use the lightest weight (1.5px stroke max)
- Never use filled/colored icons

---

## Imagery & Media

### Photography style
**For the founder photo (About section):**
- Professional but not "headshot in suit"
- Casual, real, ambient (working at desk, in conversation)
- Light, warm tone (matches brand off-white background)
- Eye contact with camera
- Slight smile, not corporate-cheerful

### Stock photography
**Don't use.** Especially:
- ❌ Suit-wearing handshakes
- ❌ Diverse-team-smiling-around-laptop
- ❌ Anyone pointing at a screen
- ❌ 3D illustrations
- ❌ Gradient meshes

### What to use instead
- Real screenshots (Slack messages, calendar invites, dashboards)
- Actual product UI from datashop.co.il or other Helix work
- Simple geometric SVG decorations (like the helix pattern in hero)
- Original photography of Eran's workspace

### Image sizing
- Hero decoration: subtle, 6-10% opacity, decorative only
- Article featured images: 4:3 or 16:9, full bleed in card
- Avatar/founder: 4:5 ratio, sticky on scroll for About

---

## Motion & Animation

**Less is more.**

### Allowed motion
- Smooth scroll (CSS `scroll-behavior: smooth`)
- Hover transitions on cards (border color, 0.3s ease)
- Button hover (slight translateY, 0.2s ease)
- FAQ accordion expand (CSS only, 0.3s)
- Nav backdrop blur appears on scroll
- Subtle pulse on availability indicator (if used)

### Forbidden motion
- ❌ Fade-in on scroll for every section
- ❌ Parallax effects
- ❌ Number counters animating up
- ❌ Big animated heroes (videos, lottie, etc.)
- ❌ "Pulsing CTAs" demanding attention

### Why
Heavy motion = attention-grabbing = aggressive. The brand is calm.

---

## RTL / Hebrew-Specific Details

### Direction
- `<html dir="rtl" lang="he">` for all pages
- Use logical properties: `padding-inline-start` not `padding-right`
- Use `margin-inline-end` not `margin-right`

### Hebrew typography quirks
- Hebrew doesn't have uppercase — `text-transform: uppercase` only affects English text
- Hebrew letter-spacing works but can be tighter than Latin (Heebo handles this well)
- Some Hebrew letters extend below baseline (ק, ץ, ן) — don't set line-height too tight
- Numbers in Hebrew text still go LTR (the browser handles this automatically)

### Mixed-language content
The brand uses code-switching naturally. "Helix Audit" is fine in Hebrew sentences. Don't translate "Audit" to "אבחון" mid-sentence unless deliberate.

### Punctuation
- Use Hebrew comma (`,`) and period (`.`) — these are the same characters
- Use Hebrew quotation marks: `"text"` (geresh + gershayim) — or straight `"text"`
- Don't use em-dash in Hebrew (` — `). It looks ugly and is an English convention. Use period + new sentence, or comma, instead.

---

## Accessibility

### Must-haves
- Semantic HTML (`<article>`, `<section>`, `<nav>`, `<header>`, `<footer>`)
- Alt text on all images
- Proper heading hierarchy (h1 → h2 → h3, no skipping)
- Focus states visible on all interactive elements
- `aria-label` on icon-only buttons (FAQ accordion icons need this)
- Color contrast WCAG AA minimum

### Nice-to-have
- Reduced motion: `@media (prefers-reduced-motion)` — disable hover transitions
- Skip navigation link for keyboard users

---

## Brand Anti-Patterns (Things We Rejected)

During design iteration we tried these and rejected them:

### Visual rejections
- ❌ Dark hero/CTA sections with glow effects (felt too "agency template")
- ❌ Big green numbers on the Method section (too loud)
- ❌ Pulsing dots / animated indicators (felt aggressive)
- ❌ "Featured" highlighted card in Service cards (broke visual rhythm)
- ❌ Emojis as branding elements (anti-Helix)
- ❌ Gradient backgrounds (too startup-trendy)

### Copy rejections
- ❌ "Codax", "Codex" (brand names — too crowded space)
- ❌ "מסלולים" instead of "שירותים" (overdressed synonym)
- ❌ "מאחורי הברנד" instead of "מי אני" (corporate-speak)
- ❌ "Let's Talk —" with decorative em-dashes
- ❌ Generic "Get Started" CTAs

### Structural rejections
- ❌ Prices on the website (anchors clients, contradicts brand promise)
- ❌ "About / Mission / Vision" 3-card pattern (too corporate)
- ❌ Testimonials section with stock photos (we have real cases instead)

---

*Brand last updated: 2026. Update this document as the brand evolves.*
