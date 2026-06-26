# HELIX — Effects & Animation Library

Reference file for all reusable animation effects across the site.
Use these components and CSS classes consistently on all pages.

---

## Dependencies

```json
{
  "gsap": "^3.15.0",
  "lenis": "^1.3.24"
}
```

---

## 1. Smooth Scroll (Lenis)

**Component:** `app/components/SmoothScroll.tsx`
**Wired in:** `app/layout.tsx` (global — applies to all pages)

Momentum-based smooth scrolling synced with GSAP ScrollTrigger.
Physics easing: `1.001 - 2^(-10t)`, duration 1.2s.

```tsx
<SmoothScroll />  // renders null, just initializes Lenis
```

---

## 2. Scroll Reveal (GSAP ScrollTrigger)

**Component:** `app/components/ScrollReveal.tsx`

Wraps any section/element — fades + slides in when scrolled into view.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| direction | 'up' \| 'down' \| 'left' \| 'right' | 'up' | Slide direction |
| delay | number | 0 | Delay in seconds |
| duration | number | 0.8 | Animation duration |
| distance | number | 60 | Slide distance in px |
| stagger | boolean | false | Stagger children elements |
| staggerDelay | number | 0.12 | Delay between children |

### Usage
```tsx
import ScrollReveal from './components/ScrollReveal';

// Single element
<ScrollReveal direction="up">
  <MySection />
</ScrollReveal>

// Staggered children (cards, grid items)
<ScrollReveal direction="up" stagger staggerDelay={0.1}>
  <MyGrid />  {/* each direct child animates separately */}
</ScrollReveal>

// From left
<ScrollReveal direction="left">
  <ServiceMarquee />
</ScrollReveal>
```

---

## 3. Scroll Text Highlight (Primora-style)

**Component:** `app/components/ScrollTextHighlight.tsx`

Text lines fade from dim/blurred to sharp/bright as you scroll.
Each line transitions independently — the line in the viewport center gets full emphasis.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| dimOpacity | number | 0.15 | Opacity of inactive lines |
| activeOpacity | number | 1 | Opacity of the active line |
| blurAmount | number | 2 | Blur px on inactive lines |

### Usage
```tsx
<ScrollTextHighlight>
  <p>שורה ראשונה שתודגש כשגוללים אליה.</p>
  <p>שורה שנייה שתודגש אחר כך.</p>
  <p>שורה שלישית.</p>
</ScrollTextHighlight>
```

---

## 4. Hero Entrance (GSAP Timeline)

**Built into:** `app/components/sections/Hero.tsx`

Staggered entrance animation:
1. Headline spans slide up + fade (stagger 0.15s)
2. Subtitle slides up (delay -0.6)
3. Subline slides up (delay -0.5)
4. CTAs slide up (delay -0.4)
5. Lottie/coin scales in with back easing (delay -0.8)

Scroll-driven:
- Content scales to 1.03x as you scroll past
- Blobs drift upward on scroll (parallax)

---

## 5. Timeline (Kudos-style)

**Built into:** `app/components/sections/HowItWorks.tsx`
**CSS:** `.timeline-*` classes in `globals.css`

Features:
- Vertical line fills with gradient on scroll (GSAP scrub)
- Dots glow on hover
- Ghost numbers (01-04) in background
- Cards slide in from the side

---

## 6. Stats Counter

**Component:** `app/components/StatsBar.tsx`
**CSS:** `.stat-card`, `.stat-value`, `.stat-divider`, `.stat-label`

Animated number counter triggered by IntersectionObserver.
Cards with subtle border hover effect and green divider line.

---

## 7. Auto Tabs (urbi-style)

**Component:** `app/components/AutoTabs.tsx`
**CSS:** `.auto-tabs__*` classes in `globals.css`

Tabs auto-switch every N ms with a progress bar animation.
Pauses on user interaction, resumes after 10s.

### Usage
```tsx
import AutoTabs from './components/AutoTabs';

<AutoTabs
  interval={4000}
  tabs={[
    { label: 'שיווק', icon: <Icon />, content: <MarketingContent /> },
    { label: 'פיתוח', icon: <Icon />, content: <DevContent /> },
  ]}
/>
```

---

## 8. Expanding Slider (urbi-style dots)

**Component:** `app/components/ExpandingSlider.tsx`
**CSS:** `.expanding-slider__*` classes in `globals.css`

Slider with navigation dots that expand horizontally when active (6px → 32px).
Auto-play with pause on hover.

### Usage
```tsx
import ExpandingSlider from './components/ExpandingSlider';

<ExpandingSlider
  interval={5000}
  slides={[
    { content: <Slide1 /> },
    { content: <Slide2 /> },
  ]}
/>
```

---

## 9. Floating Label Inputs

**CSS:** `.floating-field`, `.floating-field__input`, `.floating-field__label`

Label sits inside the input, floats up + shrinks on focus/fill.
Green glow border on focus.

### Usage
```tsx
<div className={`floating-field ${value ? 'floating-field--filled' : ''}`}>
  <input className="floating-field__input" placeholder=" " />
  <label className="floating-field__label">שם מלא</label>
</div>
```

---

## 10. Minimal CTA Button

**Variant:** `variant="minimal"` on `<Button>`
**CSS:** `.btn-minimal` in `globals.css`

Text link with arrow — underline animates in on hover.

### Usage
```tsx
<Button href="/contact" variant="minimal" arrow="left">
  בואו נדבר
</Button>
```

Arrow options: `'left'` (←), `'right'` (→), `'down'` (↓)

---

## Accessibility

All effects respect `prefers-reduced-motion: reduce`:
- GSAP animations skip
- CSS transitions set to `none`
- Lenis smooth scroll disabled

---

## Adding Effects to New Pages

1. Import `ScrollReveal` and wrap sections
2. Use `ScrollTextHighlight` for text-heavy sections
3. Use `AutoTabs` or `ExpandingSlider` for tabbed/carousel content
4. Use `variant="minimal"` for secondary CTAs
5. Use `.floating-field` for form inputs
6. SmoothScroll is global — no import needed per page
