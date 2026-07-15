# HELIX — Complete Design System & Effects Reference

Single source of truth for all visual design, colors, typography, spacing,
components, and animation effects. Use this to keep every page consistent.

---

## Table of Contents

1. [Color Palette](#1-color-palette)
2. [Typography](#2-typography)
3. [Spacing & Layout](#3-spacing--layout)
4. [RTL & Language](#4-rtl--language)
5. [Global Components](#5-global-components)
6. [Buttons](#6-buttons)
7. [Section Headers](#7-section-headers)
8. [Cards & Surfaces](#8-cards--surfaces)
9. [Navigation](#9-navigation)
10. [Hero Sections](#10-hero-sections)
11. [Service Page Hero](#11-service-page-hero)
12. [Timeline (HowItWorks)](#12-timeline-howitworks)
13. [Stats Counter](#13-stats-counter)
14. [Reviews Carousel](#14-reviews-carousel)
15. [FAQ Section](#15-faq-section)
16. [Packages Carousel](#16-packages-carousel)
17. [Floating CTA](#17-floating-cta)
18. [WhatsApp Float](#18-whatsapp-float)
19. [Exit Popup](#19-exit-popup)
20. [Animations & Effects](#20-animations--effects)
21. [Service Page Components](#21-service-page-components)
22. [Glassmorphism & Glow](#22-glassmorphism--glow)
23. [Accessibility](#23-accessibility)
24. [Adding a New Page — Checklist](#24-adding-a-new-page--checklist)

---

## 1. Color Palette

### CSS Variables (`globals.css` → `:root` + `@theme`)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#121413` | Page background |
| `--bg-surface` | `#1A1C1B` | Card / panel background |
| `--bg-soft` | `#1E201F` | Hover / subtle bg |
| `--ink` | `#E2E3E1` | Primary text |
| `--ink-secondary` | `#BBCABE` | Body text, descriptions |
| `--ink-muted` | `#869489` | Labels, metadata, muted text |
| `--ink-soft` | `#3D4A41` | Ghost elements, faint text |
| `--border` | `rgba(255,255,255,0.08)` | Subtle borders |
| `--border-strong` | `rgba(255,255,255,0.15)` | Prominent borders |
| `--brand` | `#10B981` | Primary brand green (Emerald 500) |
| `--brand-hover` | `#0CB475` | Hover state for brand |
| `--neon` | `#16FFAB` | Neon accent (glow, gradients) |

### Semantic Usage

- **Backgrounds**: Always `--bg` for page, `--bg-surface` for cards, `--bg-soft` for hover
- **Text hierarchy**: `--ink` (headings) → `--ink-secondary` (body) → `--ink-muted` (meta) → `--ink-soft` (ghosts)
- **Accents**: `--brand` for CTAs, links, icons, active states. `--neon` for glow effects only
- **Selection**: `::selection { background: var(--brand); color: white; }`
- **Error**: `#DC2626` (red) — only used in form validation
- **WhatsApp green**: `#25D366` — WhatsApp float button only

### Brand Green Transparency Scale (service pages)

```
rgba(16, 185, 129, 0.02) — faintest tint
rgba(16, 185, 129, 0.04) — bg highlight
rgba(16, 185, 129, 0.06) — subtle fill
rgba(16, 185, 129, 0.08) — badge bg, bonus pills
rgba(16, 185, 129, 0.10) — icon circle bg
rgba(16, 185, 129, 0.12) — border on cards
rgba(16, 185, 129, 0.15) — border on FAQ items, service cards
rgba(16, 185, 129, 0.20) — active border
rgba(16, 185, 129, 0.25) — tag border, popup border
rgba(16, 185, 129, 0.30) — hover border
rgba(16, 185, 129, 0.40) — strong border (center card)
```

---

## 2. Typography

### Fonts (loaded in `app/layout.tsx`)

| Font | Variable | Usage |
|------|----------|-------|
| **Heebo** 400/500/700/900 | `--font-heebo` | Body text (also `body` className) |
| **Rubik** 400/700/900 | `--font-display` | Headlines, section titles, numbers |
| **JetBrains Mono** 500 | `--font-mono` | Code-like labels, capability icons, feature numbers |

### Type Scale

| Element | Size | Weight | Font | Letter-spacing |
|---------|------|--------|------|----------------|
| Hero headline | `clamp(44px, 8vw, 88px)` | 900 | Rubik | `-0.01em` |
| Section title | `clamp(30px, 4vw, 48px)` | 900 | Rubik | `-0.01em` |
| SP Hero title | `clamp(2.4rem, 6vw, 4rem)` | 800 | — | `-0.03em` |
| SP Section title | `clamp(1.8rem, 4vw, 2.6rem)` | 800 | — | `-0.025em` |
| Card title | `22px` | 700/800 | — | `-0.02em` |
| Hero subtitle | `clamp(20px, 2.5vw, 28px)` | 500 | — | `0` |
| Body text | `16px` | 400 | Heebo | — |
| Description | `clamp(16px, 1.6vw, 18px)` | 400 | — | — |
| Small label | `12–14px` | 500/600 | — | `0.10–0.16em` |
| Eyebrow tag | `12px` | 500 | — | `0.16em` + uppercase |
| Mono label | `13px` | 500 | JetBrains Mono | `0.05em` |

### Line Heights

- Headlines: `1.05–1.12`
- Body: `1.6–1.7`
- Narrative blocks: `1.75–1.8`
- Card descriptions: `1.55–1.65`

---

## 3. Spacing & Layout

### CSS Variables

```css
--max-width: 1280px;          /* container max */
--section-padding: clamp(48px, 7vw, 80px);  /* vertical section padding */
--container-padding: clamp(20px, 4vw, 40px); /* horizontal container padding */
```

### Container

```css
.container { max-width: var(--max-width); margin: 0 auto; padding: 0 var(--container-padding); }
```

### Section Spacing Patterns

| Pattern | Value |
|---------|-------|
| Section padding (vertical) | `clamp(48px, 7vw, 80px)` |
| SP section padding | `clamp(64px, 10vw, 112px)` |
| Hero padding-top | `clamp(100px, 16vw, 180px)` |
| Hero padding-bottom | `clamp(100px, 14vw, 160px)` |
| Grid gap (cards) | `20–24px` |
| Grid gap (layout 2-col) | `48px` |
| Margin-top after header | `64–80px` |
| Card internal padding | `28–40px` |

### Border Radius

| Element | Radius |
|---------|--------|
| Cards | `16px` |
| Large cards / panels | `20px` |
| Images (about, faq) | `16–18px` |
| Buttons (pill) | `100px` / `999px` |
| Buttons (rect) | `8–12px` |
| Input fields | `8–10px` |
| Dots / circles | `50%` |
| Tags / badges | `20–100px` |

### Breakpoints

| Breakpoint | Usage |
|------------|-------|
| `768px` | Mobile layout (hamburger, stacked columns) |
| `900px` | Tablet layout (2-col → 1-col for FAQ, timeline, about) |
| `1024px` | Medium (3-col → 2-col for capabilities) |
| `600px` | Small mobile (single card) |
| `500px` | Extra small (popup adjustments) |
| `640px` | Small mobile (for-who grid → 1-col) |

---

## 4. RTL & Language

- `<html lang="he" dir="rtl">` — global RTL
- All layouts use logical properties where possible
- `.pain-row-number` and `.journey-circle` have `direction: ltr` for numbers
- Review cards: track direction `ltr`, individual cards `direction: rtl`
- Hamburger menu arrow / chevron behavior adjusted for RTL

---

## 5. Global Components (in `app/layout.tsx`)

These render on every page automatically:

| Component | File | Description |
|-----------|------|-------------|
| `SmoothScroll` | `app/components/SmoothScroll.tsx` | Lenis momentum scroll + GSAP sync |
| `FloatingLogos` | `app/components/FloatingLogos.tsx` | Background floating brand logos |
| `ExitPopup` | `app/components/ExitPopup.tsx` | Exit-intent / timed popup |
| `Nav` | `app/components/Nav.tsx` | Sticky nav, glassmorphism blur |
| `Footer` | `app/components/Footer.tsx` | Site footer |
| `FloatingCTA` | `app/components/FloatingCTA.tsx` | Sticky "לחבילות" button (bottom-left) |
| `CursorTrail` | `app/components/CursorTrail.tsx` | Custom cursor trail effect |
| `MetaPixel` | `app/components/MetaPixel.tsx` | Facebook tracking pixel |

---

## 6. Buttons

**Component:** `app/components/Button.tsx`

### Variants

| Variant | Class | Style |
|---------|-------|-------|
| `primary` | `.btn-primary` | Solid `--brand` bg, dark text, neon glow on hover |
| `text` | `.btn-text` | Transparent, muted text, no border |
| `minimal` | `.btn-minimal` | Brand color text, underline animates in on hover, arrow slides |

### Props

```tsx
<Button variant="primary" href="/contact" arrow="left">
  בואו נדבר
</Button>
```

- `variant`: `'primary'` | `'text'` | `'minimal'`
- `href`: makes it a link (internal = Next.js Link, external = `<a>`)
- `arrow`: `'left'` (←) | `'right'` (→) | `'down'` (↓) | `null`
- `type`: `'button'` | `'submit'`

### CSS Details

```css
.btn { padding: 14px 24px; border-radius: 8px; font-weight: 500; font-size: 15px; }
.btn-primary:hover { box-shadow: 0 0 24px rgba(22, 255, 171, 0.35); }
.btn-minimal::after { /* underline animation from right, 0 → 100% width */ }
.btn-minimal:hover { color: var(--neon); }
.btn:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
```

---

## 7. Section Headers

**Component:** `app/components/SectionHeader.tsx`

### Props
- `eyebrow` — small uppercase tag above title
- `title` / `titleHtml` — section title (plain or HTML)
- `description` — paragraph below title
- `as` — heading level (`h1` | `h2` | `h3`)

### CSS Classes

```css
.section-tag    { 12px, weight 500, color --ink-muted, letter-spacing 0.16em, uppercase }
.section-title  { Rubik, clamp(30px–48px), weight 900, line-height 1.08 }
.section-desc   { clamp(16px–18px), color --ink-secondary, max-width 60ch }
.section-header { max-width: 680px }
```

---

## 8. Cards & Surfaces

### Base Card Pattern

```css
background: var(--bg-surface);
border: 1px solid var(--border);
border-radius: 16px;
padding: 32px;
transition: border-color 0.3s ease, transform 0.2s ease;
```

Hover: `border-color: var(--brand); transform: translateY(-2px to -4px);`

### Card Types

| Type | Class | Specifics |
|------|-------|-----------|
| Capability | `.capability` | Icon (mono font), name, desc, price |
| Case study | `.case-card` | Sector tag, title, desc, metric number |
| Pain card (sp) | `.sp2-pain-card` | Ghost number overlay, hover lift |
| Feature card (sp) | `.sp2-feature-card` | Glow blob on hover, mono counter |
| Flip card (sp) | `.flip-card` | 3D flip on hover, front/back faces |
| Review card | `.review-card` | Quote mark, headline, text, author |
| Package card | `.pkc-card` | 3D carousel with perspective transforms |
| Glass card | `.glass` | `backdrop-filter: blur(12px)`, `3% white bg` |

---

## 9. Navigation

**Component:** `app/components/Nav.tsx`

```css
.nav {
  position: sticky; top: 0;
  background: rgba(18, 20, 19, 0.88);
  backdrop-filter: saturate(180%) blur(20px);
  z-index: 100;
}
.nav.scrolled { border-bottom-color: rgba(255,255,255,0.08); }
```

- **Logo**: weight 900, 22px, brand dot
- **Links**: 14px, weight 500, `--ink-secondary` → `--ink` on hover
- **CTA**: Pill button, `--brand` bg, `14px`, padding `10px 18px`
- **Hamburger**: 3-line → X animation, shows at `≤768px`
- **Mobile menu**: Full-screen overlay, centered links at `20px`

### Logo hover animation (`.nav-logo`)

The logo tilts and springs on hover; the brand dot spins a half-turn and grows.

```css
.nav-logo {
  display: inline-block;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.nav-logo:hover { transform: rotate(5deg) scale(1.05); }
.nav-logo .dot { display: inline-block; transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
.nav-logo:hover .dot { transform: rotate(180deg) scale(1.4); }
```

Markup: wrap the wordmark in `.nav-logo` and the dot in a `.dot` span. Disabled under `prefers-reduced-motion`.

---

## 10. Hero Sections

### Homepage Hero (`app/components/sections/Hero.tsx`)

**CSS classes**: `.hero`, `.hero-layout`, `.hero-headline`, `.hero-subtitle`, `.hero-subline`, `.hero-ctas`

- Flex layout: text left, coin/Lottie right
- Headline: `Rubik`, `clamp(44px, 8vw, 88px)`, `.accent` spans in `--brand`
- GSAP entrance: staggered slide-up timeline
- Scroll-driven: scale to 1.03x, parallax blobs
- Mobile: stacks vertically, coin centered

### Hero Bubbles (`app/components/HeroBubbles.tsx`)

CSS keyframe `helixBubble`: squares rotate while floating up, morph to circles, fade out.

---

## 11. Service Page Hero

**Component:** `app/components/service/ServiceHero.tsx`
**CSS:** `service-pages.css` → `.sp-hero-*`

### Features
- Split layout: `.sp-hero-split` — `grid-template-columns: 1fr 420px`
- Background parallax via GSAP `sp-hero-bg`
- Grain overlay `.sp-hero-grain` (SVG noise texture)
- GSAP stagger entrance: badge → title → subtitle → pricing → CTA (0.15s each)
- Accepts `children` prop for right-side visual (constellation, Lottie, etc.)

### Key Classes

| Class | Purpose |
|-------|---------|
| `.sp-hero-immersive` | Outer wrapper, centered, overflow hidden |
| `.sp-hero-content` | Content z-index 2, padding `clamp(80px–120px)` |
| `.sp-hero-eyebrow` | Green pill badge, 12px uppercase |
| `.sp-hero-title` | `clamp(2.4rem–4rem)`, weight 800 |
| `.sp-hero-subtitle` | `clamp(1rem–1.15rem)`, 65% white |
| `.sp-hero-pricing` | Flexbox: market price (strikethrough) + actual price |
| `.sp-hero-cta` | Pill button, 999px radius, hover lift + shadow |
| `.sp-hero-visual` | Right-side visual area |

---

## 12. Timeline (HowItWorks)

**Component:** `app/components/sections/HowItWorks.tsx`
**CSS:** `.timeline-*` in `globals.css`

### Layout
- `.timeline-layout`: grid `1fr 320px` (timeline + Lottie)
- Vertical line: `.timeline-line` (6% white bg) + `.timeline-line-fill` (brand→neon gradient, GSAP scrub)
- Cards: `.timeline-card` with `.timeline-dot` (24px circle, 10px inner dot)
- Ghost numbers: `.timeline-number` (4% white, Rubik 900)
- Hover: dot scales 1.4x with glow, number turns brand-tint

### Lottie
- Stairs Lottie: `app/components/StepsLottie.tsx` — plays in the 320px side column

---

## 13. Stats Counter

**Component:** `app/components/StatsBar.tsx`
**CSS:** `.stat-card`, `.stat-value`, `.stat-divider`, `.stat-label`

- Grid layout (auto-fill, 4 columns)
- Animated number counter via IntersectionObserver
- `.stat-value`: Rubik, `clamp(2.5rem–3.5rem)`, weight 900
- `.stat-divider`: 32px × 2px green line, `opacity: 0.6`
- `.stat-label`: 0.85rem, `--ink-muted`
- Hover: border turns brand-tint, bg turns brand 4%

---

## 14. Reviews Carousel

**Component:** `app/components/sections/ReviewsCarousel.tsx`
**CSS:** `.reviews-*` in `globals.css`

### Structure
- `SectionHeader` + viewport with sliding track
- Each card = `flex: 0 0 25%` (4 visible at once)
- `translateX(-N * 25%)` for sliding
- Arrow buttons: 44px circles, `--bg-surface` bg, brand on hover
- Dot indicators: 8px circles, active = brand + scale 1.3

### Card Design (`.review-card-inner`)
- `--bg-surface` bg, `--border` border, 16px radius
- Quote mark: 56px Georgia, `--brand`
- Headline: 15px bold, `--ink`
- Text: 13px, `--ink-secondary`
- Divider: 1px `--border`
- Author: name 14px bold + role 12px muted

### Responsive
- `≤900px`: 2 cards visible (`flex: 0 0 50%`)
- `≤600px`: 1 card visible (`flex: 0 0 100%`)

---

## 15. FAQ Section

**Component:** `app/components/FAQItem.tsx`
**CSS:** `.faq-*` in `globals.css`

### Layout Options

**Standard**: `.faq-list` — max-width 820px, margin-top 64px

**With image** (service pages): `.faq-with-image`
```css
display: grid;
grid-template-columns: 1fr 320px;
gap: 48px;
```
- `.faq-image-side` sticky at `top: 120px`
- Image: `border-radius: 16px`, `opacity: 0.9`
- Hides image on `≤900px`

### FAQ Item (`<details>`)
- Border: `1px solid rgba(16, 185, 129, 0.15)` (top on first, bottom on all)
- Summary: 19px, weight 600, `--ink`, hover → brand
- Icon: `+` rotates 45° to `×` on open
- Answer: 16px, line-height 1.75, `--ink-secondary`, max-width 720px

---

## 16. Packages Carousel

**CSS:** `packages-carousel.css`

### 3D Carousel (`.pkc-*`)
- Perspective: 1400px
- 7 positions: center, left/right, far-left/far-right, far-far, hidden
- Center: `scale(1)`, full opacity, strong border
- Side: `scale(0.72)`, `rotateY(±15°)`, `translateZ(-200px)`, blur 1px
- Far: `scale(0.52)`, `rotateY(±22°)`, blur 2px
- Transition: `0.6s cubic-bezier(0.25, 0.8, 0.25, 1)`

### Card Content
- Tag: 0.68rem, brand pill border
- Name: 1.15rem, weight 800
- Price: 1.5rem, weight 900, brand
- Items list: check marks in brand green
- CTA: full-width, brand bg, 10px radius

### Desktop sidebar nav
- Sticky at `top: 100px`
- Active: brand bg tint, right border line

### Mobile (≤900px)
- Tabs replace sidebar
- Single card view (no 3D)

---

## 17. Floating CTA

**Component:** `app/components/FloatingCTA.tsx`
**CSS:** `.floating-cta` in `globals.css`

```css
position: fixed;
bottom: 28px;
left: 24px;
background: var(--brand);
color: #fff;
padding: 14px 20px;
border-radius: 100px;
font-size: 15px;
font-weight: 600;
box-shadow: 0 4px 24px rgba(16, 185, 129, 0.4);
z-index: 999;
```

- Appears after 300px scroll
- Scrolls to `#packages` section
- Contains down-arrow SVG + "לחבילות" text

---

## 18. WhatsApp Float

**Component:** `app/components/WhatsAppFloat.tsx`
**CSS:** `.whatsapp-float` in `globals.css`

```css
position: fixed;
bottom: 24px;
inset-inline-end: 24px;  /* right in RTL */
width: 56px; height: 56px;
border-radius: 50%;
background: #25D366;
box-shadow: 0 8px 24px -4px rgba(37, 211, 102, 0.4);
z-index: 100;
```

---

## 19. Exit Popup

**Component:** `app/components/ExitPopup.tsx`
**CSS:** `exit-popup.css`

### Features
- Glassmorphism card with animated gradient border
- 3D perspective tilt on hover
- Badge floats with keyframe animation
- Shimmer sweep across header
- Icon pulses with box-shadow animation
- Form fields match service-page field styling
- CTA: gradient green bg with hover scale

---

## 20. Animations & Effects

### Dependencies

```json
{ "gsap": "^3.15.0", "lenis": "^1.3.24" }
```

### 20.1 Smooth Scroll (Lenis)

**Component:** `app/components/SmoothScroll.tsx`
**Scope:** Global (in `layout.tsx`)

Physics: easing `1.001 - 2^(-10t)`, duration 1.2s.
Synced with GSAP ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)`.

### 20.2 Scroll Reveal (GSAP)

**Component:** `app/components/ScrollReveal.tsx`

| Prop | Type | Default |
|------|------|---------|
| direction | `'up'` \| `'down'` \| `'left'` \| `'right'` | `'up'` |
| delay | number | 0 |
| duration | number | 0.8 |
| distance | number | 60 |
| stagger | boolean | false |
| staggerDelay | number | 0.12 |

```tsx
<ScrollReveal direction="up" stagger staggerDelay={0.1}>
  <MyGrid />
</ScrollReveal>
```

### 20.3 Scroll Text Highlight (Primora-style)

**Component:** `app/components/ScrollTextHighlight.tsx`

Lines fade from dim/blurred to sharp/bright as viewport center passes.

| Prop | Type | Default |
|------|------|---------|
| dimOpacity | number | 0.15 |
| activeOpacity | number | 1 |
| blurAmount | number | 2 |

```tsx
<ScrollTextHighlight>
  <p>שורה ראשונה.</p>
  <p>שורה שנייה.</p>
</ScrollTextHighlight>
```

### 20.4 Hero Entrance (GSAP Timeline)

Built into `Hero.tsx`. Staggered slide-up: headline spans → subtitle → subline → CTAs → coin.
Scroll: content scales to 1.03x, blobs parallax up.

### 20.5 Service Page Reveal

**Component:** `app/components/service/RevealOnScroll.tsx`
**CSS:** `.reveal-on-scroll`, `.reveal-up`, `.reveal-left`, `.reveal-right`

Simpler CSS-only reveal (no GSAP) using IntersectionObserver + `.revealed` class.
Transition: `0.8s cubic-bezier(0.16, 1, 0.3, 1)`.

### 20.6 Cursor Trail

**Component:** `app/components/CursorTrail.tsx`

Custom animated cursor trail following mouse movement.

### 20.7 CSS Keyframe Animations

| Animation | Description |
|-----------|-------------|
| `helixBubble` | Squares float up, rotate 720°, morph to circles, fade |
| `bdr-float` | Cards bob up 10px and back (6s) |
| `auto-orbit-spin` | 360° rotation (30s) for orbit icons |
| `ai-msg-in` | Chat bubble fade + slide up |
| `ai-dot-bounce` | Typing indicator dots bounce |
| `ai-pulse-dot` | Online indicator pulses |
| `heart-fall` | Hearts drop 120px, shrink, fade |
| `coin-pop` | Coins pop up, drift down, fade |
| `ep-fade-in` | Popup overlay fade in |
| `ep-scale-in` | Popup card perspective scale + rotate in |
| `ep-border-glow` | Border opacity pulses |
| `ep-shimmer` | Highlight sweep across header |
| `ep-badge-float` | Badge bobs up 4px |
| `ep-icon-pulse` | Icon shadow pulses |
| `pkc-fade-in` | Package modal fade in |
| `pkc-scale-in` | Package modal scale + slide up |

---

## 21. Service Page Components

**CSS:** `service-pages.css`

### Pain Section (`app/components/service/PainSection.tsx`)
- `.sp2-pain-grid`: auto-fit grid, min 280px
- Cards with ghost numbers, hover lift

### Features Section (`app/components/service/FeaturesSection.tsx`)
- `.sp2-features-grid`: auto-fit grid, min 300px
- Glow blob on hover, mono counter numbers

### For Who Section (`app/components/service/ForWhoSection.tsx`)
- `.sp2-for-grid`: 2-column grid
- Yes cards: brand border tint, green icon circle
- No cards: neutral bg, muted icon

### Trust Bar (`app/components/service/TrustBar.tsx`)
- `.sp2-trust-bar`: flex centered, wrapped
- Check circles: 22px, brand 10% bg

### Final CTA (`app/components/service/FinalCTA.tsx`)
- `.sp2-final-cta`: centered text, radial glow behind
- Large title + subtitle + pill CTA button

### Addons Section (`app/components/service/AddonsSection.tsx`)
- Table layout matching homepage addon style

### Sticky Pricing (`app/components/service/StickyPricing.tsx`)
- Fixed bottom bar, glass bg, shows on scroll
- Price + CTA button, max-width 700px

### Narrative Blocks (`.sp-narrative-*`)
- **MANDATORY:** First narrative (right after hero) must use `.sp-narrative-with-video` layout: text + burning money video (`/burning-money.mp4`, autoPlay loop muted playsInline)
- Video grid: `1fr + 320px` (video on the left in RTL)
- Text blocks: 1.05rem, line-height 1.8
- Highlight class: brand color, 600 weight

### Comparison Table (`.sp-compare-*`)
- Max-width 700px, centered
- Highlight column: brand bg tint + bold

### Sub-Services Grid (`.sp-services-grid`)
- 4-column grid (→ 2 on tablet → 1 on mobile)
- **MANDATORY:** All grid items must use `.flip-card` — front shows only icon + title, back reveals description on hover (3D flip)
- Never use plain `.sp-service-card` in service pages — always flip cards

### Package Card Link Rule
- When PackageCard is shown on its own service page, override `href` to an anchor (e.g. `#faq`) so "פרטים נוספים על החבילה" doesn't navigate to the same page top

### Savings Calculator (`.calc-*`)
- 2-column grid: sliders left, results right
- Brand-colored range thumb with glow

### AI Chat Simulation (`.ai-chat-*`)
- WhatsApp-style chat with brand-tinted bubbles
- Typing dots animation
- Form with floating labels

---

## 22. Glassmorphism & Glow

### Glass Utility

```css
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
```

### Neon Glow (all primary buttons)

```css
.btn-primary:hover { box-shadow: 0 0 24px rgba(22, 255, 171, 0.35); }
```

### Glass Package Cards

```css
.pk-card {
  background: rgba(26, 28, 27, 0.65);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,0.08);
}
.pk-card:hover {
  border-color: rgba(16, 185, 129, 0.35);
  box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(16,185,129,0.15);
}
```

---

## 23. Accessibility

- **Skip nav**: `.skip-nav` — hidden link, reveals on focus, jumps to `#main-content`
- **Focus visible**: `outline: 2px solid var(--brand); outline-offset: 2px;` on all buttons
- **Reduced motion**: All GSAP animations, CSS transitions, and Lenis scroll disabled when `prefers-reduced-motion: reduce`
- **Touch targets**: Arrow buttons, nav links, and interactive elements ≥44px
- **Semantic HTML**: `<main>`, `<section>`, `<details>` for FAQ, `<nav>` for navigation
- **aria-labels**: On icon buttons (arrows, close, WhatsApp)

---

## 24. Adding a New Page — Checklist

1. **SmoothScroll** is global — no import needed
2. Wrap each section in `<ScrollReveal direction="up">` for entrance animations
3. Use `<ScrollTextHighlight>` for text-heavy narrative sections
4. Use `<SectionHeader>` for section titles (eyebrow + title + description)
5. Use `<Button variant="primary">` for main CTAs, `variant="minimal"` for secondary
6. Use `<AutoTabs>` or `<ExpandingSlider>` for tabbed/carousel content
7. Use `.floating-field` classes for form inputs
8. For service pages: use `<ServiceHero>` with constellation/Lottie visual
9. Add `<ReviewsCarousel>` (or page-specific variant) for social proof
10. Add FAQ section with `<FAQItem>` — use `.faq-with-image` layout with team photo on service pages
11. All colors from CSS variables only — never hardcode hex values
12. All text in Hebrew (RTL) — verify layout direction
13. Test at 768px, 600px breakpoints
14. Test with `prefers-reduced-motion` enabled

---

## 25. AI Checker / GEO tool (`/ai-checker`)

Lead-magnet page: enter a URL → "how easily can AI find & recommend you" (GEO ladder 1–10) → gated full report + free diagnosis CTA. Public copy uses **zero jargon** ("ChatGPT ממליץ עליך?"), technical terms live only in the unlocked report.

### GEO ladder score model (`lib/geo-scan.ts`)
Two layers:
- **Layer B (free, no keys):** real HTTP checks — HTTPS, SSR/rendered text, title/description, single H1, viewport, canonical, sitemap.xml, robots.txt, JSON-LD schema, OpenGraph, `lang`, NAP, llms.txt, AI-crawler access, content depth, indexable, **Common Crawl** corpus presence, **Wikidata** entity.
- **Layer A (gated, optional API keys):** live queries to Perplexity / Claude / OpenAI / Gemini — "does AI know/recommend you" + competitor detection. Each provider degrades gracefully if its key is unset (`lib/ai-visibility.ts`, `lib/providers/*`).

Signals group into 3 categories → weighted `foundation 0.3 · structured 0.25 · ai 0.45` → ladder 1–10.

### CSS (`.geo-*` in `service-pages.css`)
- `.geo-hero` / `.geo-hero-title` — radial emerald glow + grain, huge 900-weight title with `.accent`.
- `.geo-ladder` — 10 rungs (`.geo-rung.on` = emerald→neon gradient) + big score.
- `.geo-cat` / `.geo-bar-fill` — category score bars (emerald→neon, 0.8s ease fill).
- `.geo-competitor-hint` — red = competitors appear & you don't; `.good` = you appear.
- `.geo-locked` (`.geo-locked-blur` + `.geo-locked-overlay`) — blurred placeholder gated behind `GeoLeadForm`.
- `.geo-provider` / `.geo-fix-item.{pass,partial,fail}` — unlocked report cards.

Reuses `.sp2-*` (feature cards, final CTA) and `.vc-*` (lead form) — no new global primitives.
