# HELIX CHIEF CRM — Design System

> Source of truth for design decisions inside the **software** (`helix-crm/`).
> The marketing site has its own system: `../DESIGN.md` (light theme) and `../EFFECTS.md` (the 60-effect marketing library).
> **They are not interchangeable.** The CRM is light by default, dark by choice; dense and quiet. Last updated: 2026-09-28.

### How this doc is used (standing rule)

**Read it before the first edit. Update it in the same commit.** A UI change that leaves this file behind is an incomplete change.

- Building a component? It's probably already specified in [§8](#8-components) — copy the class string instead of inventing a variant.
- Adding something the doc doesn't cover — a token, a variant, a spacing rule, a radius, a status color, a screen pattern, motion? You're extending the system: write the spec in here as part of the change.
- Found a deviation in existing code? Add a row to [§15 Known Drift](#15-known-drift). Fixed one? Delete its row.
- Always bump `Last updated:` above.
- Doc and code disagree? The doc wins — fix the code. To change the system instead: Eran signs off, doc first with the reason, then the code.

Enforced by `helix-crm/CLAUDE.md` (rule #1) and `../CLAUDE.md` (Design-Doc Rule).

---

## Table of Contents

1. [Scope & Principles](#1-scope--principles)
2. [Color Tokens](#2-color-tokens)
3. [Status & Semantic Colors](#3-status--semantic-colors)
4. [White-Label Accent](#4-white-label-accent)
5. [Typography](#5-typography)
6. [Layout & Spacing](#6-layout--spacing)
7. [Radii & Elevation](#7-radii--elevation)
8. [Components](#8-components)
9. [Screen Patterns](#9-screen-patterns)
10. [Motion](#10-motion)
11. [RTL & Bilingual](#11-rtl--bilingual)
12. [Accessibility](#12-accessibility)
13. [Icons & Emoji](#13-icons--emoji)
14. [Anti-Patterns](#14-anti-patterns)
15. [Known Drift](#15-known-drift)
16. [Open Decisions](#16-open-decisions)
17. [File Map](#17-file-map)
18. [New Screen Checklist](#18-new-screen-checklist)

---

## 1. Scope & Principles

This system covers everything a signed-in user sees: `/[locale]/dashboard/**`, `/[locale]/chief`, `/[locale]/login`, `/[locale]/onboarding`. Public STAGE-era pages (`/board`, `/launches`, `/products`, `/community`) inherit the same tokens but are allowed marketing warmth. Their layout locks them to the dark theme, because their ambience was drawn for dark; that includes `/login` and `/onboarding` while they live in that group ([§16](#16-open-decisions)).

**Principles, in priority order:**

1. **Data first, chrome second.** A screen exists to show contacts, deals, money, and what happened. Decoration that pushes data below the fold is a bug.
2. **Light by default, dark by choice** (Eran, 2026-09-28). Light is HELIX's own `#FAFAF8` with `#EBEBE8` borders; dark is `#121413` with a faint green cast, never black. In both, surfaces separate by borders, not by shadows.
3. **One accent.** Emerald means *action or good*. Never decorative. Never two accents on one screen.
4. **Motion explains state, it never announces.** Springs on open/sort/move. Nothing loops, pulses, or sparkles next to a table.
5. **Hebrew-native, RTL-first.** Written in Hebrew, mirrored with logical properties, verified in `he` before `en`.
6. **Numbers are monospaced.** Score, ₪, counts, percentages. It makes columns scannable and looks like software.
7. **Same brand, different register.** It's still HELIX — Heebo, emerald, restraint — but a tool, not a pitch.

---

## 2. Color Tokens

Defined once in `app/globals.css`: the **light** values under Tailwind v4 `@theme` (the default), the **dark** values in a `[data-theme="dark"]` block after it. `<html data-theme>` is set by the server from the `crm-theme` cookie, so a page arrives already in its theme. There is **no `tailwind.config.*`** in this app: the theme block *is* the config.

| Token | Light (default) | Dark | Tailwind class | Usage |
|---|---|---|---|---|
| `--color-bg` | `#FAFAF8` | `#121413` | `bg-bg` | Page background |
| `--color-surface` | `#FFFFFF` | `#1A1C1B` | `bg-surface` | Cards, panels, rows, dropdowns |
| `--color-soft` | `#F4F2EE` | `#1E201F` | `bg-soft` | Skeletons, inset wells, third level |
| `--color-ink` | `#1A1A1A` | `#E2E3E1` | `text-ink` | Primary text, headings |
| `--color-ink-secondary` | `#555555` | `#BBCABE` | `text-ink-secondary` | Body, subtitles, secondary buttons |
| `--color-ink-muted` | `#6E6E6E` | `#869489` | `text-ink-muted` | Meta, labels, timestamps, hints |
| `--color-ink-soft` | `#C8C8C5` | `#3D4A41` | `text-ink-soft` | Decorative separators only, never text |
| `--color-border` | `#EBEBE8` | `rgba(255,255,255,.08)` | `border-border` | Default border for every surface |
| `--color-border-strong` | `#D8D6D2` | `rgba(255,255,255,.15)` | `border-border-strong` | Hover/emphasis border; the status path's track |
| `--color-brand` | `#10B981` | `#10B981` | `bg-brand` | Emerald **fills**: buttons, tints, the path's bars |
| `--color-brand-hover` | `#059669` | `#0CB475` | `bg-brand-hover` | Hover on filled brand |
| `--color-on-brand` | `#121413` | `#121413` | `text-on-brand` | The label on an emerald fill |
| `--color-brand-ink` | `#047857` | `#10B981` | `text-brand-ink` | Emerald as **text**: links, ₪ values, "on" chips |
| `--color-danger` | `#B91C1C` | `#F87171` | `text-danger` `bg-danger` | Error text; the destructive fill |
| `--color-on-danger` | `#FFFFFF` | `#121413` | `text-on-danger` | The label on a danger fill |
| `--color-focus` | `#047857` | `#10B981` | (the focus ring) | The keyboard focus outline |
| `--color-neon` | `#16FFAB` | `#16FFAB` | — | **Glow only** (`.cta-glow`, STAGE). Never a fill or text colour |

**Every pair is measured, not eyeballed** (a script over these hexes and Tailwind's OKLCH palette, 2026-09-28):
- Body, secondary, muted, link and error text are ≥ 4.5:1 on `bg`, `surface` and `soft` in both themes. The tightest is light muted on soft, at 4.56.
- A label on a fill is ≥ 4.5:1: 7.3 on-brand, 4.9 on light brand-hover, 6.5 on danger.
- The focus ring is ≥ 3:1: 5.3 in light.

The website's own light greys don't pass here. Its `#A8A8A8` measures 2.4:1 on white, which is why muted is `#6E6E6E`.

### Rules

- **The label on emerald is `text-on-brand`**, dark in both themes. Never `text-bg`: in light that is near-white on green, 2.5:1. Never white.
- **Emerald as text is `text-brand-ink`, never `text-brand`.** `#10B981` is a fill colour, and as text on light it measures 2.5:1. The logo's period is the one exception ([§13](#13-icons--emoji)).
- **Brand alpha ladder** for tints: `bg-brand/5` (resting) → `/10` (hover, "on" chips) → `/15` (status chip) → `/25` (rare emphasis). Nothing between.
- **The neutral tint is `bg-ink/5`** (a hovered row, a cold chip, the score chip). It follows the theme: a trace of black on light, of white on dark. Never `bg-white/…` or `bg-black/…`.
- **A palette hue always comes with its `dark:` pair**, as in `bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400`. `dark:` is bound to `[data-theme=dark]`, not to the OS setting.
- **Borders do the separating.** No drop shadows on in-flow cards. `shadow-xl` is allowed only on floating layers (dropdown, dialog, sheet).
- Token names differ from the website on purpose: here it's `bg-surface` and `bg-soft`, not `bg-bg-surface` / `bg-bg-soft`. Don't copy classes across repos blind.

### Motion material tokens (`--hm-*`)

`lib/motion/tokens.css` is shared and product-agnostic: it ships a cream light material and darkens inside `@media (prefers-color-scheme: dark)`. The CRM's theme is the user's choice, not the OS's. So `app/globals.css` imports that file once and then sets both materials after it, where they beat its media query at equal specificity: light at `:root`, dark under `[data-theme="dark"]`.

| Token | Light | Dark | Tracks |
|---|---|---|---|
| `--hm-accent` | `var(--color-brand)` | same | brand |
| `--hm-surface` | `rgba(255,255,255,.86)` | `rgba(26,28,27,.86)` | `--color-surface`, translucent |
| `--hm-surface-solid` | `#FFFFFF` | `#1A1C1B` | reduced-transparency fallback |
| `--hm-border` | `rgba(26,26,26,.08)` | `rgba(255,255,255,.08)` | `--color-border` |
| `--hm-shadow` | `0 12px 40px rgba(26,26,26,.12), 0 2px 8px rgba(26,26,26,.06)` | `0 12px 44px rgba(0,0,0,.5), 0 2px 10px rgba(0,0,0,.4)` | floating layers |
| `--hm-scrim` | `26, 26, 26` | `18, 20, 19` | the dimming behind an overlay, dark in both themes |
| `--hm-ink-muted` | `var(--color-ink-secondary)` | `var(--color-ink-muted)` | the ⌘K palette's hint text. It fell back to `#888` (3.5:1 on light) until it was defined. On light the panel sits at 86% over a dimmed page, so hints take the secondary ink |

Never set `--hm-accent` per component with a hardcoded hex — that was drift, and it is gone.

---

## 3. Status & Semantic Colors

Status is the one place a non-emerald hue is allowed. Use Tailwind palette steps directly, always as a tinted chip that carries **both themes**: a `-50` fill with a `-700` label in light, the `-500/15` tint with a `-400` label in dark (`bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400`). Where a token already means the thing, the token is used instead.

| Meaning | Chip classes (light, then `dark:`) | Used for |
|---|---|---|
| Positive / done / hot | `bg-emerald-50 text-brand-ink dark:bg-brand/15` | action done, `hot` lead tier, won deal |
| Waiting on a human / warm | `bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400` | `pending_approval`, `warm` lead tier |
| Informational / suggested | `bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400` | agent suggestion, neutral hint |
| Needs upgrade / entitlement | `bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-400` | `blocked_entitlement` |
| Failure / destructive / lost | `bg-red-50 text-danger dark:bg-red-500/15` | error, lost deal, delete affordance |
| Neutral / cold | `bg-ink/5 text-ink-muted` | `cold` tier, inactive (tokens: both themes) |

Chip shape: `rounded px-2 py-0.5 text-[11px] font-bold` (or `rounded-full px-2.5 py-0.5 text-[12px]` for an outlined meta pill: `text-ink-muted border border-border`).

**Amber, not yellow.** `yellow-500` on `#121413` reads acidic; `amber-400` holds up, and on light `amber-700` on `amber-50` measures 4.9:1. Existing `yellow-500` usages are drift ([§15](#15-known-drift)).

### Contact status — the nine chips

A contact carries exactly one `status` (`lib/crm-status.ts`), and it is the **only element of a contact-list row allowed to use colour**. Before this, a row asserted two coloured signals at once — a tier-coloured score and a grey stage pill — which let a row read "cold" and "paying client" simultaneously.

Nine hues cannot be told apart on either background, so two of the nine are distinguished by **treatment** instead: `new` is the only chip with no fill, and `frozen` is the only chip with a dashed border, in both themes.

| Status | Hebrew | Light | Dark (`dark:`) | Light label on its fill |
|---|---|---|---|---|
| `new` | ליד חדש | `border border-border text-ink-muted` | same (tokens) | 5.1 on surface |
| `contacted` | יצרנו קשר | `bg-sky-50 text-sky-700` | `bg-sky-500/15 text-sky-400` | 5.5 |
| `talking` | בשיחה | `bg-indigo-50 text-indigo-700` | `bg-indigo-500/15 text-indigo-400` | 7.2 |
| `proposal` | הצעה נשלחה | `bg-amber-50 text-amber-700` | `bg-amber-500/15 text-amber-400` | 4.9 |
| `signed` | חתם | `bg-violet-50 text-violet-700` | `bg-violet-500/15 text-violet-400` | 6.6 |
| `paid` | שולם | `bg-emerald-50 text-brand-ink` | `bg-brand/15` (label: `brand-ink`) | 5.1 |
| `client` | לקוח פעיל | `bg-teal-50 text-teal-700` | `bg-teal-500/20 text-teal-300` | 5.2 |
| `declined` | נדחה | `bg-red-50 text-danger` | `bg-red-500/15` (label: `danger`) | 5.9 |
| `frozen` | בהקפאה | `bg-slate-100 text-slate-600 border border-dashed border-slate-400` | `bg-slate-500/15 text-slate-400 border-slate-500/40` | 6.9 |

Chip shape: `text-[12px] font-semibold rounded-full px-2.5 py-0.5 whitespace-nowrap`.

**Three rules.**
1. **No hover state on a status chip.** That is what keeps it from reading as a button.
2. **The Hebrew label always travels with the chip.** Hue is redundant reinforcement, never the only carrier of meaning ([§12](#12-accessibility)).
3. **`paid` is the one status allowed to use emerald.** Elsewhere in the CRM emerald means *action*; money arriving is the one state that means what the brand colour means. Never extend this to a second status.

The `hot`/`warm`/`cold` tier chips above are still correct — they just no longer appear in a contact-list row. They remain in use on the contact page and in CHIEF.

**On the status path, one step carries a hue** (added 2026-09-28). The current step is a solid bar in its status's hue (`STATUS_BAR` in `lib/crm-status.ts`). In light the bars are `-600` (`bg-sky-600`, `bg-indigo-600`, `bg-amber-600`, `bg-violet-600`, `bg-emerald-600`, `bg-teal-600`), each ≥ 3:1 against white. In dark they are `bg-sky-400`, `bg-indigo-400`, `bg-amber-400`, `bg-violet-400`, `bg-brand` and `bg-teal-300`. `new` has no hue, so its bar is `bg-ink-secondary`. Passed steps all share `bg-ink-muted`. Steps ahead are the `bg-border-strong` track (`bg-border`, at 8% white, disappears on the drawer's material). Colouring each passed step in its own hue would put six colours in one line and fight the chip beside the name. `declined` and `frozen` are never steps on the path; their dots in the phone list use `bg-red-600` / `bg-slate-500` in light and `bg-red-400` / `bg-slate-400` in dark. See [§8](#8-components).

---

## 4. White-Label Accent

Agency and client workspaces carry their own accent (`branding.primary_color`), so the accent is **a variable, not a constant**. `components/Nav.tsx` sets it inline on the `<header>` from the active workspace's branding, and everything in that subtree is meant to follow.

> ⚠️ **It doesn't work yet.** Nav writes `--brand` / `--brand-hover`, but this app declares its palette only in Tailwind v4's `@theme`, so `bg-brand` compiles to `var(--color-brand)` and `--brand` is defined nowhere. The override is inert today — a branded workspace still renders HELIX emerald. Fix: write `--color-brand` / `--color-brand-hover` in `headerStyle`, and lift the override from the `<header>` to the shell element that wraps the whole screen, since the accent belongs to the page, not the nav bar. Drift #10.

**Consequences for every new component:**

- Use `bg-brand` / `text-brand-ink` / `border-brand`. Never `#10B981` in a `className` or a `style` object.
- A component that needs the accent in JS (canvas, inline SVG, a third-party prop) reads it from CSS: `getComputedStyle(el).getPropertyValue('--color-brand')`, or accepts an `accent` prop. Hardcoding it breaks white-label silently — the screen just looks un-branded to a paying agency's client.
- `lib/motion` components are accent-agnostic by design: they read `--hm-accent`. Set it once on the wrapper, from the token, not from a literal.

---

## 5. Typography

Three fonts, loaded with `next/font/google` in `app/[locale]/layout.tsx`, `display: swap`.

| Font | Weights | Class | Usage |
|---|---|---|---|
| **Heebo** | 400, 500, 700, 900 | (default on `<body>`) | All UI text, body, labels, buttons |
| **Rubik** | 400, 700, 900 | `font-display` | Page titles `h1`, product/brand names, the logo |
| **JetBrains Mono** | 500 | `font-mono` | Every number a user compares: score, ₪, counts, % |

`--font-display` resolves to Rubik with Heebo as the fallback, so a missing Rubik degrades gracefully.

### Scale (as shipped)

| Level | Spec | Usage |
|---|---|---|
| Page title | `font-display text-[clamp(28px,5vw,40px)] font-extrabold tracking-tight` | one `h1` per screen |
| Detail title | `font-display text-[clamp(24px,4vw,34px)] font-extrabold tracking-tight` | record pages |
| Section title | `font-bold text-[18px]` (detail pages: `text-[16px]`) | "לידים מתועדפים", "צינור עסקאות" |
| Body / input | `text-[15px]` | paragraphs, inputs, nav links |
| Control | `text-[14px]` | buttons, selects, dense rows |
| Meta | `text-[13px]` | row subtitles, secondary meta |
| Micro | `text-[11px]` – `text-[12px]` | labels, chips, timestamps, column heads |
| Metric | `font-mono text-[24px] font-bold` | stat tile value (not used on the CRM home; see the figures line in [§8](#8-components)) |

### Rules

- Pixel sizes in brackets, not `text-sm`/`text-base`. The scale is tuned for Hebrew at these exact sizes; the Tailwind defaults drift off it.
- Hebrew has no uppercase. `uppercase` is for English-only micro labels (activity type, tier).
- Emphasis is weight (`font-semibold` / `font-bold`), never color. Emerald text is a link or a positive value, not a highlight.
- Truncate with `truncate` + a `min-w-0 flex-1` parent. Hebrew names overflow at unexpected places.

---

## 6. Layout & Spacing

### Containers

| Width | Where |
|---|---|
| `max-w-[1280px]` | nav bar, and the (crm) side menu + screen row |
| `w-[220px]` | CRM side menu column (≥lg) |
| `max-w-[1100px]` | CRM workspace: pipeline, index + board (`dashboard/crm`) |
| `max-w-[900px]` | command center (`dashboard`) |
| `max-w-[820px]` | single record, reading-shaped screens (`dashboard/crm/[id]`) |
| `max-w-3xl` | CHIEF chat |
| `max-w-[680px]` | empty / setup-pending / gate states, centered |

Horizontal padding is always `px-5 md:px-10`. Vertical is `pt-12 pb-16` on workspace screens, `pt-8 pb-16` on the CRM home (the work queue starts high), `pt-20` on centered empty states.

### Rhythm

- Title → subtitle: `mb-2` then `mb-8` under the subtitle.
- Between major sections: `mb-12`.
- Inside a card: `p-4` (dense) / `p-5` (standard) / `p-10` (empty state).
- Grid and stack gaps: `gap-2` (rows in a list) / `gap-3` (tiles, toolbar) / `gap-4` (cards).
- Closing back-link on a sub-screen: `mt-10 pt-6 border-t border-border`.

### Grids

- Stat row: `grid grid-cols-2 md:grid-cols-5 gap-3` (three tiles: `grid-cols-3 gap-4`). Retired on the CRM home in favour of the figures line.
- Pipeline: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3` — six stages, never a horizontal scroller.
- Lists are `flex flex-col gap-2`, not a grid. Records are rows.

---

## 7. Radii & Elevation

| Radius | Class | Applies to |
|---|---|---|
| 10px | `rounded-[10px]` | **buttons, inputs, selects** (the single most-used radius, ~112 usages) |
| 12px | `rounded-xl` | list rows, kanban columns, dropdown panels |
| 16px | `rounded-2xl` | cards, panels, stat tiles, chat bubbles, skeletons |
| 8px | `rounded-lg` | nested cards (a deal card inside a column), menu rows |
| full | `rounded-full` | pills, badges, dots, suggestion chips |

Keep `rounded-[10px]` for controls even though `rounded-xl` is close. Controls reading tighter than their container is what makes the UI feel like an app.

**Elevation** is border + background step, in this order: `bg-bg` → `bg-surface` → `bg-soft`. Shadow only when a layer floats above the page (`shadow-xl` on dropdowns; `lib/motion` handles dialogs and sheets).

---

## 8. Components

Copy these class strings. If a new screen needs a variant, add it here first.

### Buttons

```txt
Primary      bg-brand hover:bg-brand-hover text-on-brand font-bold px-4 py-2 rounded-[10px] text-[14px]
                 disabled:opacity-50
Primary lg   bg-brand hover:bg-brand-hover text-on-brand font-bold px-5 py-2.5 rounded-[10px]
Secondary    border border-border hover:border-brand text-ink-secondary hover:text-ink
                 font-semibold px-4 py-2.5 rounded-[10px] transition-colors
Brand-tinted border border-brand/40 bg-brand/5 hover:bg-brand/10 text-brand-ink
                 font-semibold px-4 py-2 rounded-[10px] text-[14px]        ← additive ("+ עסקה חדשה")
Outline      border border-brand text-brand-ink hover:bg-brand hover:text-on-brand
                 font-semibold px-4 py-2 rounded-[10px] transition-colors text-[14px]
Text         text-ink-secondary hover:text-ink px-3 py-2 text-[14px]       ← cancel, dismiss
Destructive  text-ink-muted hover:text-danger text-[11px] px-1            ← quiet until hovered
Danger fill  bg-danger hover:bg-danger/90 text-on-danger font-semibold px-5 py-2.5 rounded-[10px]
                 min-h-[44px]                                          ← the confirm in a "lose it?" dialog
```

Disabled is `disabled:opacity-50` (`disabled:opacity-40` on icon-sized controls). Never remove the element; never swap in a spinner that resizes the button.

### Inputs

```txt
Input   bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand
Select  (same as input)
Wide    w-full ... px-4 py-3 text-[15px] transition-colors     ← login, single-field forms
Label   text-[12px] text-ink-muted     (wrap input in <label class="block">, input gets mt-1)
```

Inside a `bg-surface` card, inputs are `bg-bg` — the field sits *below* the card. Focus is a `border-brand` swap plus the global `focus-visible` ring; don't add a glow.

### Card

```txt
bg-surface border border-border rounded-2xl p-5
+ card-hover        → border→brand and -2px lift (use on linked cards only)
```

### Figures line (replaces the stat tiles on the CRM home)

```txt
<p class="flex flex-wrap gap-x-2 gap-y-1 text-[13px] text-ink-secondary mt-3 mb-6">
  <span class="whitespace-nowrap">30 אנשי קשר</span>
  <span class="whitespace-nowrap"><span aria-hidden class="text-ink-soft me-2">·</span>4 חמים</span> …
```
One line of text under the header, not five `rounded-2xl` tiles. **With no deals it shows only the contact count.** A "₪0 / 0%" reads like a result, so money figures appear only once a deal exists, and win rate only once a deal is won or lost. No accent colour: these are figures, not actions. Each item is `whitespace-nowrap`, so on a phone whole figures wrap, never half of one.

The five-tile stat row it replaced (`grid grid-cols-2 md:grid-cols-5 gap-3`, `font-mono text-[24px]`) is retired on the CRM home. Don't reintroduce tiles for a figure that is usually zero.

### Record row (the CRM workhorse) — the work-queue row

```txt
<Link class="flex items-start gap-3 bg-surface border border-border rounded-xl p-3 min-h-[44px]
             hover:border-brand transition-colors"
      href="…/dashboard/crm?c=<id>" scroll={false} data-contact-row="<id>">
  score chip   (font-mono font-bold text-[15px] w-12 text-center rounded-lg py-1
                bg-ink/5 text-ink-secondary shrink-0)          ← neutral, not tier-coloured
  <div class="min-w-0 flex-1">
    <div class="flex items-center gap-2 min-w-0">
      name         text-[15px] font-semibold truncate
      status chip  text-[12px] font-semibold rounded-full px-2.5 py-0.5 shrink-0
                   whitespace-nowrap + STATUS_BADGE[status]      ← beside the name, the row's only colour
    meta   text-ink-secondary text-[13px] truncate   (role · company · email; omitted when empty)
    task   flex items-center gap-1.5 text-[13px] mt-1   lucide ListChecks 13 text-ink-muted
           title text-ink truncate · due text-ink-muted ("עד 30/9")
           overdue → "באיחור · עד 26/9" in text-ink font-semibold  ← text, not colour
  <div class="flex flex-col items-end gap-1 shrink-0 text-end">
    last touch   text-[12px] text-ink-muted whitespace-nowrap   ("לפני 3 ימים" · "טרם")
    needs touch  flex items-center gap-1 text-[11px] font-semibold text-ink
                 border border-border-strong rounded-full px-2 py-0.5   lucide Clock 11  "צריך מגע"
```
The fixed-width leading column (`w-12`) is what makes a stack of rows scan like a table. Keep it. **The status chip sits beside the name**, not at the far edge: on a 1100px row the eye had to cross the whole width to pair a person with where they stand. Status still owns colour ([§3](#3-status--semantic-colors)). The overdue and needs-touch marks are therefore weight and a neutral border, never red or amber. `data-contact-row` is what the drawer focuses on close.

**Needs a touch** = an active status (`new`…`signed`) quiet for `STALL_DAYS` (14) or more, counting from creation when never touched (`needsTouch()` in `lib/crm-status.ts`, the same threshold as the stalled-deal sweep). Last touch and due dates are computed on the server, so there are no two clocks.

**Needs-touch filter chip** (beside the search field, only when the count is above 0):
```txt
flex items-center gap-1.5 text-[13px] font-semibold rounded-full px-3 min-h-[44px] border
  off: border-border text-ink-secondary hover:text-ink      on: border-brand text-brand-ink bg-brand/10
  aria-pressed · lucide Clock 14 · "צריך מגע (3)"
```
It narrows the in-memory rows and composes with the text filter; the count line then reads against the narrowed set.

### Contact drawer

A contact opens **beside** the list, never instead of it. `Drawer` from `lib/motion` with `side="start"` (right in Hebrew, left in English) and `width={420}`.

```txt
<Drawer open side="start" dir={dirOf(locale)} width={420}>
  <div class="h-full flex flex-col">
    header (shrink-0 pb-3 border-b border-border): it stays put while the body scrolls
      row    name (font-display text-[22px] font-extrabold truncate, dir=auto)
             + status chip (STATUS_BADGE, shrink-0) + days in status (text-[12px] text-ink-muted,
             plural(): "12 ימים", "יום אחד", "מהיום"; omitted when there is no honest count)
             close button (min-w-[44px] min-h-[44px], lucide X, aria-label)
      meta   role · company (BidiParts, truncate) + neutral score chip at the end
             (font-mono text-[12px] text-ink-secondary bg-ink/5 rounded-md px-1.5 py-0.5)
      path   CrmStatusPath, mt-3                 ← the only status control; see Status path
      line   CrmStatusFeedback                   ← undo · exit question · deal prompt
    <div class="flex-1 min-h-0 overflow-y-auto pt-4" style="overscroll-behavior: contain">
      email / phone / LinkedIn   (dir="ltr" on the address and the number)
      action row + one open box  ← WhatsApp · email · call · meeting · note (Drawer action row)
      next step                  ← CrmNextStep
      deals                      ← CrmDrawerDeals: always there for a writer, even when empty
      timeline                   ← newest first, status and task rows included, or "no activity yet"
```

Days in status count Israeli calendar days from the newest `status` row a signed-in user wrote (`statusDays()` in `lib/crm-dates.ts`, computed on the server), or from creation for a `new` contact never moved.

**Closing asks before discarding any unsent text**: a box, the next step, or a new deal. **Escape belongs to an overlay that is open over the drawer** (the phone status list, the lost confirmation): they all listen on `window`, so the drawer ignores Escape while one is open.

Two things are load-bearing:
- **`dir={dirOf(locale)}` is required.** The drawer used to read `document.dir` during render. The server has no `document`, so it anchored the panel to one edge while the browser hid it toward the other, and React keeps the server's style on a mismatch. On 2026-09-27 that parked both the contact drawer and the "עוד" menu mid-screen at 86% opacity, eating clicks. Direction comes from the locale, which both renders know.
- **The scroll container is the inner div, not the panel.** `flex-1 min-h-0 overflow-y-auto` with `overscroll-behavior: contain`, so a long timeline scrolls without the page behind it moving.

### Status path (`components/CrmStatusPath.tsx`)

The seven progress statuses as a row of steps, in funnel order from the start edge: `ליד חדש` at the right in Hebrew. It is the status control in the drawer header and on the full contact page. One tap on a step sets that status. There is no dropdown anywhere.

```txt
≥sm   <div role="toolbar" aria-label="שלבי הסטטוס" class="hidden sm:flex gap-1">
        Step  <button class="flex-1 min-w-0 min-h-[44px] flex flex-col gap-1.5 pt-1.5 pb-1 px-0.5
                             rounded-lg text-center transition-colors hover:bg-ink/5">
                bar    h-1.5 rounded-full w-full
                         current  STATUS_BAR[status]            ← the only hue on the path
                         passed   bg-ink-muted
                         ahead    bg-border-strong
                label  text-[11px] leading-tight break-words   (wraps to two lines, never clips)
                         current  font-semibold text-ink  · aria-current="step"
                         passed   text-ink-secondary      · ahead  text-ink-muted
              English uses csShort_* ("Reached", "Proposal"…); Hebrew uses the status labels.
      Exits  <div class="flex justify-end gap-1">   (their own line, at the end edge)
              <button class="inline-flex items-center min-h-[44px] px-2 text-[12px] rounded-lg
                             text-ink-muted hover:text-ink transition-colors">
              active (the contact is declined / frozen): font-semibold + STATUS_TEXT[status],
              aria-pressed. While a contact is in an exit, no step is current and every
              bar is the bg-border-strong track.
<sm   <button class="sm:hidden w-full min-h-[44px] flex items-center gap-1 rounded-lg px-1"
              aria-label="שינוי סטטוס: {status}">
        seven bars (flex-1 h-1.5 rounded-full, same three fills), then ▾ text-ink-muted text-[11px]
      → lib/motion/Sheet, portaled to <body> after mount (.hm-material's backdrop-filter
        would otherwise trap a fixed child inside the drawer panel)
        title  font-bold text-[16px] mb-2 "שינוי סטטוס"
        Row    w-full flex items-center gap-3 min-h-[48px] px-4 rounded-xl text-[15px] text-start
                 dot w-2 h-2 rounded-full + STATUS_BAR[status]
                 idle     text-ink-secondary hover:bg-ink/5
                 current  bg-ink/5 text-ink font-semibold + lucide Check 16 at the end, aria-current
        seven steps · <div class="border-t border-border my-1"> · the two exits
viewer  <ol aria-label="שלבי הסטטוס" class="flex gap-1"> of the same bars and labels, no buttons
```

Colour transitions only (`transition-colors`): nothing on the path moves spatially.

### Header feedback line (undo · prompt · exit question)

One line under the path, in the drawer's fixed header, holding whatever the last action wants to say. It renders only when there is something to say, and it clears when the contact changes or the drawer closes.

```txt
<div role="status" aria-live="polite" class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[13px] text-ink-secondary">
  Undo      "הסטטוס עודכן: חתם" + <button class="font-semibold text-ink hover:underline min-h-[44px] px-2">ביטול</button>
            8 seconds, then gone. Only the last change can be undone.
  Prompt    the sentence, then
            yes  border border-brand/40 bg-brand/5 hover:bg-brand/10 text-brand-ink font-semibold
                 px-3 rounded-[10px] text-[13px] min-h-[44px]          ← brand-tinted, additive
            no   text-ink-secondary hover:text-ink px-3 min-h-[44px]    ← "לא עכשיו"
  Question  label, then chips:
            text-[13px] rounded-full px-3 min-h-[44px] border transition-colors
              off  border-border text-ink-secondary hover:text-ink
              on   border-brand text-brand-ink bg-brand/10               ← same pair as the needs-touch filter
  Error     text-danger, role="alert"
```

The line never blocks: ignoring an undo, a prompt or a question leaves things as they are. A prompt asks, and nothing moves by itself ([§16](#16-open-decisions)).

**The drawer's four prompts.** They appear where status and deals meet. The full contact page has none.

| After | When | The line says | Yes does |
|---|---|---|---|
| status → `הצעה נשלחה` | no open deal | "נשלחה הצעה ואין עסקה פתוחה. לפתוח עסקה?" | opens the new-deal form, title focused |
| status → `חתם` | exactly one open deal | "לסמן את {title} כעסקה שנסגרה?" | marks that deal won |
| status → `חתם` | two or more open deals | "יש {n} עסקאות פתוחות…" | (no yes: each deal is marked below) |
| a deal marked won | the person is not yet `חתם`, `שולם` or `לקוח פעיל` | "העסקה נסגרה. להעביר את {name} ל״חתם״?" | moves the person to `חתם`, with its own undo |

The exit questions (`נדחה` → a reason, `בהקפאה` → when to come back) live in the shared `useStatusChange`, so the full page asks them too.

### Drawer action row (reach and log)

Five buttons, each opening its own box in place, **one box open at a time**: WhatsApp, email, call, meeting, note. This replaced two compose boxes that were always open and pushed deals and the timeline about 380px down.

```txt
<div role="group" aria-label="יצירת קשר ותיעוד" class="flex flex-wrap gap-2">
  Button  inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-[10px] text-[13px] font-semibold
          border transition-colors + lucide icon 15 (MessageCircle · Mail · Phone · CalendarDays · StickyNote)
            closed  border-border text-ink-secondary hover:text-ink hover:border-brand
            open    border-brand text-brand-ink bg-brand/10        aria-expanded, aria-controls the box
Unavailable  one muted line under the row: text-ink-muted text-[13px]   ("לא שמור טלפון…")
Box     mt-3 · the WhatsApp message + brand link button · the email subject/body/send ·
        or, for call / meeting / note, a textarea rows=3 + Primary "שמירה" (disabled while empty)
```

- **Drafts survive switching.** Each box keeps its text while another is open. Closing the drawer with text in any box asks first (`draftDiscardAsk`).
- **A missing number or address hides its button** and the reason is said once, in words. It is never a disabled button.
- **Call, meeting and note are touches:** they refresh last touch and the score through `crmLogActivity`. `crmLogActivity` accepts only the five manual types, so `status` and `task` rows come only from their own actions.
- **A viewer gets no row at all.**
- At 390px the five buttons wrap onto at most two rows.

### Next step (`components/CrmNextStep.tsx`)

The person's earliest-due open `crm_tasks` row. The drawer and the home row use the same order (`due_date asc nulls last, created_at asc`) and the same due and overdue words, so they always name the same step.

```txt
<section aria-label="הצעד הבא" class="mb-6">
  h3   font-bold text-[14px] mb-2
  Row  flex items-center gap-2 bg-bg border border-border rounded-xl ps-3 pe-1.5 py-1.5 min-h-[44px]
       lucide ListChecks 14 text-ink-muted · title text-[14px] text-ink truncate flex-1 (dir=auto)
       due  text-[12px] text-ink-muted "עד 30/9" · overdue "באיחור · עד 26/9" text-ink font-semibold
       Edit Text button min-h-[44px] · Done brand-tinted px-3 text-[13px] min-h-[44px]
  More text-[12px] text-ink-muted mt-1   plural(): "ועוד משימה פתוחה אחת" · "ועוד שתי משימות פתוחות"
  Form flex flex-wrap gap-2: title input flex-1 min-w-[160px] · date input dir=ltr · Primary save
       (disabled while the title is empty) · Cancel when editing. Inputs are min-h-[44px].
```

- **Done leaves at once**, and the step comes back with a message if the save fails. It writes a `task` row ("בוצע: …") to the timeline.

### Drawer deals (`components/CrmDrawerDeals.tsx`)

A person's deals, worked from the person. **A writer always sees the region**, even with no deals: one line with the title and the brand-tinted "+ עסקה חדשה". A viewer sees plain rows, and no region at all when there are none.

```txt
<section aria-label="עסקאות קשורות" class="mb-6">
  head  flex flex-wrap items-center justify-between gap-2 mb-2: h3 font-bold text-[14px] · add button
        (brand-tinted px-3 text-[13px] min-h-[44px])
  New   bg-surface border border-border rounded-2xl p-3 mb-2: title (flex-1, dir=auto) · value (w-28,
        dir=ltr, inputMode numeric) · Primary save · Text cancel. The title takes focus on open.
        Empty title → "צריך כותרת לעסקה." · "18k" → "הערך צריך להיות מספר" (nothing is stored)
  Row   <button aria-expanded> w-full flex items-center justify-between gap-2 bg-bg border p-2.5
        min-h-[44px] text-start: title text-[13px] font-semibold truncate (dir=auto) ·
        ₪value text-brand-ink font-mono (dir=ltr) · stage pill text-ink-muted border rounded-full px-2 py-0.5
          closed  border-border rounded-xl hover:border-brand
          open    border-brand rounded-t-xl, then the panel below it:
  Panel bg-bg border border-t-0 border-brand rounded-b-xl p-3 flex flex-col gap-3
        stage Select (the six board stages; "נסגרה" for won) · title + value + Secondary save ·
        brand-tinted "סימון כנסגרה" (open deals) · quiet lost "סימון כאבוד" pushed out with ms-auto
```

- **One deal is open at a time.**
- **A stage change shows at once** and is reverted with a message if it is not stored. The board is updated by the same revalidation.
- **Lost asks first, by name**, in `lib/motion/Dialog`, portaled to `<body>` like the status list. While it is open, the drawer leaves Escape to it.
- **Won and lost deals stay listed** with "נסגרה" or "אבודה", never `st_won`'s ✓ glyph ([§15](#15-known-drift) row 3).
- Opening, winning and losing a deal rescore its person (`lib/crm-rescore.ts`).
- **Setting, changing and completing a step are not touches.**
- **A viewer sees the step without Edit or Done.** With no open task, the viewer sees nothing.

### Kanban column & card

**Section header** (the board owns it): `flex flex-wrap items-center justify-between gap-2` with `h2 font-bold text-[18px]` "צינור עסקאות" at the start and the brand-tinted "+ עסקה חדשה" at the end (omitted for a viewer). **With zero deals, that line is the whole section**: no empty columns. The first deal added brings the grid in on revalidation.

```txt
Column  bg-bg border border-border rounded-xl p-2 min-h-[120px]
        head:  text-[12px] font-bold text-ink-secondary + count font-mono text-[11px] text-ink-muted
        total: text-[11px] text-brand-ink font-mono
Card    bg-surface border border-border rounded-lg p-2.5
        title text-[13px] font-semibold leading-snug · sub text-[11px] text-ink-muted
        value text-[11px] text-brand-ink font-mono
        controls: ‹ › advance/retreat + quiet lose action pushed out with ms-auto
Column (drop target, while a card is over it)
        bg-brand/10 border-brand   ← replaces bg-bg border-border, transition-colors
Card (armed, being dragged)
        relative shadow-lg border-brand/60 · cursor grab → grabbing
        style: touch-action pan-y at rest, none once armed; z-index 40 while dragging
```

**Dragging a card** is the primary way to change a stage; the `‹ › ` buttons stay as the keyboard and assistive path and are never removed. Rules:

- Pointer Events only (mouse, trackpad, touch, pen through one path). No drag library, no HTML5 drag-and-drop.
- Arm on a **200ms press or 8px of travel across the columns** — never on `pointerdown`. At rest a card carries `touch-action: pan-y` so a vertical swipe still scrolls the board on a phone; it becomes `none` only once armed.
- Hit-test columns by `getBoundingClientRect()`, never by column index — that is what makes RTL correct with no arithmetic inversion.
- Released outside every column: the card springs home (`SPRINGS.reflow`) and nothing is sent.
- The move is optimistic (`useOptimistic`): the card lands on release and the server reconciles. **No control goes to reduced opacity to signal pending** — the board stays live.
- A failed move unwinds itself when the transition ends; surface the reason (`moveFailed`, or `sessionExpired` when the action returns `auth`).
- Every server action gets a 15s timeout race. A dropped connection must not leave a card optimistically moved forever.
- **A card leads to its person** (added 2026-09-28). The title is a `<Link href="?c=<contact_id>" scroll={false}>` (`block text-[13px] font-semibold leading-snug hover:underline`), which gives keyboard, middle-click and copy-link. A tap on the card body opens the same drawer. The click that follows an armed drag is swallowed in the capture phase, and a vertical swipe ends in `pointercancel`, which produces no click. A deal with no person has a plain title and opens nothing. `pointerdown` ignores the link as it ignores the buttons, so a drag starts anywhere else on the card.

### Header: one primary action

A screen header carries **exactly one filled `bg-brand text-on-brand` action**. Occasional screens (team, API, automations) are not header buttons: they live in the CRM side menu below. There is no "עוד" overflow control any more (removed 2026-09-27 at Eran's request).

### CRM side menu (`components/CrmNavMenu.tsx`)

One list of CRM screens, on the **start edge**: the right in Hebrew, the left in English. Items, in order: אנשי קשר (the home, also active on `/crm/[id]`), אוטומציות, צוות, API. Autonomy and CHIEF are hidden from it and still work by direct URL.

```txt
≥lg   <aside class="hidden lg:block w-[220px] shrink-0 border-e border-border">
        <nav class="sticky top-16 flex flex-col gap-1.5 px-4 pt-8">
<lg   nav button  lg:hidden min-h-[44px] min-w-[44px] + lucide Menu, first thing in the nav row
      → lib/motion/Drawer side="start" width={300}, portaled to <body>
        (the nav's backdrop-blur would otherwise be the fixed panel's containing block)
Row   flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] min-h-[44px] + lucide icon
      idle    text-ink-secondary hover:text-ink hover:bg-ink/5
      active  bg-ink/5 text-ink font-semibold, aria-current="page"
```

The one consumer duty the `Drawer` does not cover: **return focus to the trigger** on every close path (scrim, Escape, close button). Children can stay mounted: a closed `Drawer` is `visibility:hidden` + `inert` on its own.

### CRM home header (the work queue)

```txt
<div class="flex items-center justify-between flex-wrap gap-3">
  <div class="flex items-center gap-2 min-w-0">
    h1  workspace name — font-display text-[20px] font-extrabold tracking-tight truncate
        (sr-only when the workspace switcher is shown, since the switcher already names it)
    workspace switcher
  primary action  "ליד חדש"   (omitted for a viewer)
then the figures line, then the contact list, then the pipeline section.
```
No product headline, no marketing subtitle. The person opening their CRM for the fiftieth time needs who to call, not the product name, which the nav logo already shows.

### Dropdown / menu

```txt
Trigger  flex items-center gap-2 border border-border hover:border-brand text-ink-secondary
         hover:text-ink font-semibold px-4 py-2.5 rounded-[10px] transition-colors
         + 2px brand dot, truncate max-w-[140px], ▾ in text-ink-muted text-[11px]
Panel    absolute z-20 mt-2 end-0 w-64 bg-surface border border-border rounded-xl shadow-xl p-1.5
         max-h-[70vh] overflow-auto     (+ a fixed inset-0 z-10 click-catcher behind it)
Row      w-full text-start px-3 py-2 rounded-lg text-[14px] transition-colors
         active: bg-brand/10 text-brand-ink font-semibold · idle: text-ink-secondary hover:bg-ink/5 hover:text-ink
Group    text-[11px] text-ink-muted px-3 py-1.5
```
`end-0` and `text-start`, never `right-0` / `text-left`.

### Chat (CHIEF)

```txt
User     bg-brand text-on-brand rounded-2xl rounded-br-sm px-4 py-2.5     self-end max-w-[85%]
Agent    bg-ink/5 border border-border rounded-2xl rounded-bl-sm px-4 py-3   self-start w-full
         + speaker label: text-[11px] font-bold text-brand-ink mb-1
Action   flex items-center gap-2 text-[13px] border-t border-border/60 pt-2
         status chip (§3) + "agent · tool" in text-ink-secondary truncate + approve/deny pushed with mr-auto
Composer sticky bottom-4 flex gap-2 bg-bg/90 backdrop-blur-md p-2 rounded-2xl border border-border
Chips    text-[14px] border border-border rounded-full px-4 py-2 hover:border-brand hover:text-brand-ink
```
The corner tell (`rounded-br-sm` / `rounded-bl-sm`) is physical and does **not** mirror per locale — it marks the speaker, not the reading direction.

### Empty state, loading, gate

```txt
Empty (in place)  bg-surface border border-border rounded-2xl p-10 text-center
                  text-ink-secondary text-[16px] + one primary CTA mt-4
Empty (inline)    a single line: text-ink-muted text-[15px]   ← for a section, not a screen
Loading           Skeleton: animate-pulse bg-soft rounded-2xl, laid out in the real shape
                  of the screen (title bar, stat row, N rows) in app/[locale]/(crm)/dashboard/loading.tsx
Gate / pending    max-w-[680px] mx-auto px-5 md:px-10 pt-20 text-center, one sentence, one exit
```
A skeleton must match the layout it replaces. A generic three-box shimmer that then reflows is worse than nothing.

---

## 9. Screen Patterns

### App shell & route groups

`app/[locale]/` splits into two route groups. Groups do not appear in URLs, so every path is unchanged.

```txt
app/[locale]/
├── layout.tsx          document shell ONLY: <html>/<body>, 3 fonts, globals.css, skip-nav
├── page.tsx            redirect → /[locale]/dashboard/crm
├── (crm)/
│   ├── layout.tsx      Nav · [CrmSideNav | <main id="main-content">] · Footer · HelixCommandBar
│   ├── dashboard/**
│   └── chief/
└── (stage)/
    ├── layout.tsx      the directory chrome, unchanged
    ├── loading.tsx     marketing-shaped skeleton
    └── 20 legacy page dirs
```

**Nav** (`components/Nav.tsx`, shared with `(stage)`): logo (or the workspace's white-label logo) · `CRM` · the account-portal link (`t.shell.portal`, opens https://my.helix.co.il in a new tab and says so in its `aria-label`) · language switch · **theme switch** (the CRM shell only, `components/ThemeToggle.tsx`: lucide `Moon` / `Sun`, `min-h-[44px] min-w-[44px]`, and its name says what it turns on, "מצב כהה" / "מצב בהיר"; it moves into the sidebar's footer with the next redesign change) · sign-out. Every control is `min-h-[44px]`. No primary button for a signed-in user: it used to be "הכניסה שלי", which linked to the page you are on. **CHIEF is hidden** from the nav and the ⌘K routes since 2026-09-27; `/chief` still works by direct URL, and restoring it is one line in `Nav.tsx` and one in `HelixCommandBar.tsx`.

**Side menu**: `(crm)/layout.tsx` wraps the screen in `flex w-full max-w-[1280px] mx-auto` with `CrmSideNav` as the first child, so it lands on the start edge. Below `lg` it collapses to the menu button at the start of the nav (`<Nav crmMenu />`, signed-in only). See [§8](#8-components).

**Footer** (`components/Footer.tsx`): `HELIX CHIEF CRM.` + "part of HELIX." linking to https://helix.co.il. No STAGE name or tagline.

**A CRM screen renders nav, screen, footer, and nothing else.** `CursorTrail`, `FloatingBackground`, `SmoothScroll` (lenis), `CompareTray` and `ReferFloatingBadge` belong to `(stage)` and must never be imported from anything under `(crm)`. The ⌘K bar is the exception that lives in `(crm)`: it renders nothing until opened and it is the CRM's search surface, so it is off the public pages.

Next.js allows one root layout per path and every page sits under `[locale]`, so `<html>`/`<body>` stay at `app/[locale]/layout.tsx`. Neither group layout may render them.

**Workspace screen** (`dashboard/crm`): title + toolbar on one wrapping flex row → subtitle → stat row → filter + prioritized list → pipeline. Toolbar order: workspace switcher, then the one primary action last. No link out of a CRM screen may point at `/[locale]/dashboard` — that is the STAGE launch dashboard, a different product.

**Record screen** (`dashboard/crm/[id]`): back link → header (score chip + name + meta + contact links) → editable panel → related records → timeline. The panel sets the status with the same **status path** as the drawer (`CrmStatusPath` + `CrmStatusFeedback`, sharing `useStatusChange`), with its undo and exit questions but without the drawer's deal prompts. There is no status dropdown anywhere in the product. Timeline rows are a fixed-width uppercase type label plus `border-s border-border ps-3` body — a logical-property spine, not an icon rail.

**Chat screen** (`chief`): full-height column, centered `max-w-3xl`, sticky composer, suggestion chips as the empty state, and a graceful "not configured yet" panel when the API returns 503. Every agent-facing screen needs that third state.

**Forms**: inline expansion over modals. `+ הוסף` swaps the button for a `bg-surface border border-border rounded-2xl p-4 flex flex-wrap gap-2` row with save and cancel in place. Reach for `lib/motion/Dialog` only when the task genuinely blocks.

---

### Overlay state lives in the URL

A screen-level overlay that shows **a record** is addressed by a query parameter on the screen that owns it, and rendered by the server:

```
/[locale]/dashboard/crm?c=<contact-id>     the contact drawer over the contact list
```

The page reads `searchParams`, fetches the record inside the active-workspace check, and hands it to the client component. Back closes the overlay, the address is shareable, there is no client fetch layer, and the workspace check exists in exactly one place. An id that is not a uuid is rejected before it reaches Postgres; an id outside the workspace renders the list with a Hebrew not-found notice and HTTP 200, never a 500. Closing uses `router.replace`, not `push`, so back does not reopen what was just closed.

The full record page (`dashboard/crm/[id]`) stays as the directly linkable surface and what works with no JavaScript. **The command palette opens the drawer** (`?c=<id>`) for a contact, and for a deal's person, since 2026-09-28. The drawer is where a person is worked. A deal with no person lands on the board.

Transient overlays that are not a record — a menu, a confirm, an intake form — stay in component state (`Drawer`, `Dialog`, `Sheet`). The URL is for *what you are looking at*, not for *what you are doing*.

### Roles: a read-only screen, not a disabled one

Four roles (`lib/crm-roles.ts`, enforced by RLS in `supabase/migration-v20-role-enforcement.sql`): `viewer` reads, `member` also creates and edits, `admin` / `agency_admin` also delete, manage the team and change autonomy.

- **Omit, never disable.** A control the role cannot use is not rendered. A disabled control still takes space and invites a click, so the screen reads as broken instead of read-only. Pages resolve the role server-side through `getWorkspace` and pass `readOnly` down; no client fetch.
- **Say why, once.** A viewer's CRM home carries one notice line under the subtitle:
  ```txt
  Read-only notice  text-ink-secondary text-[13px] bg-surface border border-border rounded-xl px-4 py-3 mb-6   role="status"
  ```
  Same class string as the drawer's not-found notice. The automation page shows it in place of the builder (the builder has no read-only mode, [§15](#15-known-drift)); the autonomy page shows the admin-only line and each switch collapses to its label plus the current mode as text.
- **What a viewer loses:** add-contact, the deal board's add / drag / `‹ ›` / lose controls, the status select (the chip stays), the activity logger, the drawer's WhatsApp and email blocks, new-automation, and every CHIEF write tool.
- **Refusals carry a Hebrew message.** Server actions return `{ ok: false, error: 'readonly' | 'forbidden' | 'role', message }` before touching the database; a component shows `res.message` when present and falls back to its own line. RLS stays the enforcement, the message is the courtesy.
- **Team screen:** role select offers `חבר · צפייה בלבד · מנהל` (`OFFERED_ROLES`), plus the inherited `מנהל סוכנות` label when a row already holds it. Role select and remove are `min-h-[44px]`; the member row wraps (`flex-wrap`) so a 390px screen never scrolls sideways; the email stays `dir="ltr"`. One muted hint line under the invite form explains the three roles.

---

## 10. Motion

`lib/motion/` is the shared in-app motion system (ported from Apple's *Designing Fluid Interfaces*, zero dependencies). Read `lib/motion/README.md` before animating anything. Springs take `(damping, response)` — **never a duration**.

| Use | Primitive |
|---|---|
| List/table reorders, stage moves | `useFlip` — items flow to their new position on **both axes** (on `CrmDealBoard`) |
| ⌘K navigation | `CommandPalette` via `components/HelixCommandBar.tsx` |
| Record detail without losing context | `Drawer` |
| Blocking task | `Dialog` (scales from its trigger origin) |
| Mobile secondary surface | `Sheet` (the status list below `sm`, portaled to `<body>` in a `z-index: 70` wrapper so it sits over a drawer) |
| Press feedback | `Pressable` |
| Frosted floating surface | `Material` + `Scrim` |

Set `--hm-accent` on the wrapper from the brand token so motion surfaces follow white-label.

**Overlays follow the theme through the `--hm-*` materials** ([§2](#2-color-tokens)): a light frosted surface in light and today's dark one in dark. The dimming behind them (`--hm-scrim`) is dark in both. React Flow is the one surface that styles itself, so the automation page passes the theme to its `colorMode` (server value first, then `lib/use-theme.ts` follows the switch).

**Global CSS effects** (`app/globals.css`), and where each belongs:

| Class | Effect | Allowed on |
|---|---|---|
| `.card-hover` | border→brand, `-2px` lift | linked cards |
| `.cta-glow` | neon box-shadow on hover | primary CTAs on public pages |
| `.nav-logo` | logo rotate, dot spins | nav only |
| `.reveal` | fade+rise on scroll | public/marketing pages only |
| `.vote-pop` | spring pop on vote | STAGE vote buttons |
| `.stage-bg*` | floating logos and blurred blobs | public pages only |

**Amplitude matters when you reach into `createSpring` directly.** Its rest test is absolute (`|x − target| < 0.1`), so animate **pixels**, one spring per axis. A normalized 0→1 progress spring settles while the element is still 10% of the distance from home — on a 300px move that is 30px short. `useFlip` runs one `SPRINGS.reflow` spring per axis for this reason; both start at rest and the equation is linear, so they stay in step.

**The status path recolours; it never moves.** Steps change colour with `transition-colors` (a recolour is not spatial motion), and the undo line and prompts appear in place. Nothing slides.

Closed state is **the primitive's** job: a closed `Drawer` or `Sheet` is `visibility:hidden` + `inert` from the server render onward (set when the close spring rests, cleared before the open one starts), and `Dialog` is `display:none`. Focus return after a close is **the consumer's**.

Rules: animate `transform` / `opacity` only. Nothing loops in a data view. `prefers-reduced-motion` is collapsed globally *and* per component — every new animation must survive that media query with the state still legible.

---

## 11. RTL & Bilingual

`he` (default, RTL) and `en`. `isRtl(locale)` is `locale !== 'en'`; `dir` is set on `<html>` in the locale layout.

- **Logical properties only:** `ms-*` `me-*` `ps-*` `pe-*` `start-*` `end-*` `border-s` `text-start` `inset-inline-start`. A `left`/`right`/`ml-`/`pl-` in app code is a bug.
- **Direction and alignment do not change with the theme.** Light and dark differ only in colour. A row reads in the same order, and aligns to the same edge, in both.
- **A Hebrew screen is right-aligned end to end** (Eran, 2026-09-27). Nothing on an RTL page renders left-aligned, including an English name, an empty input's placeholder and caret, or an email field.
- **`dir="auto"` on a field that renders one user value** — a name, a deal title, an activity body, a workspace name — so a Latin value keeps its punctuation. `app/globals.css` (base layer) right-aligns `[dir="auto"]` and `input/textarea[dir="ltr"]` under `[dir="rtl"]`, so the value keeps its order without moving to the left edge.
- **A line that joins several values** ("role · company · email") takes no `dir`: it follows the locale, and each value is a `<bdi>` via `components/BidiParts.tsx`. `dir="auto"` on the whole line would pick its direction from the first value and reorder the rest.
- **`dir="ltr"` on email, phone, URLs, and numeric inputs**, including the ones inside an RTL form.
- Strings live in `lib/i18n/he.ts` and `en.ts` (typed by `Dict`) — never inline a user-visible string in a component. Existing hardcoded Hebrew in `CrmWorkspaceSwitcher` is drift.
- Dates go through `formatDate(value, locale)`; currency is `₪${n.toLocaleString()}` in `font-mono`.
- Verify a new screen in Hebrew first. Drawers resolve their physical edge from the `dir` prop (`dirOf(locale)`), never from `document.dir`: anything read from the DOM during render differs between server and browser.

---

## 12. Accessibility

Baseline is Israeli standard ת"י 5568, and it's already wired — don't regress it.

- **Focus:** a global `:focus-visible` rule paints a 2px `--color-brand` outline with 2px offset on every interactive element. Never `outline: none` without a replacement.
- **Skip link:** `.skip-nav` → `#main-content`, visible on keyboard focus only.
- **Reduced motion:** honored globally and inside every `lib/motion` primitive.
- **Targets:** ≥44px on touch. A `py-1 px-1` icon button needs padding or a larger hit area on mobile.
- **Semantics:** real `<button>` / `<Link>`; grouped controls get `role="radiogroup"` + `aria-checked` (see `AutonomySwitch`); `<label>` wraps its input.
- **Status path:** `role="toolbar"` with a roving `tabindex`, so it is one tab stop, not nine. Arrow keys move focus in the reading direction: in Hebrew, ArrowLeft is the next step. Home and End jump to the ends, and Enter or Space commits. The current step carries `aria-current="step"`. It is **not** a radiogroup: arrow keys there would commit a status, and write a history row, on every press.
- **Contrast:** `text-ink-muted` is the floor in both themes (`#6E6E6E` light, `#869489` dark), and it is for meta only. Never use it for body copy or a value the user must read. Every text pair in [§2](#2-color-tokens) is measured at ≥ 4.5:1 in both themes, and a new pair is measured before it ships.
- **Focus ring:** `--color-focus` (`#047857` light, `#10B981` dark), 2px with a 2px offset. It measures ≥ 3:1 against the page in both themes, whereas bright emerald on light would measure 2.4.
- **No color-only meaning.** Every status chip carries a word next to its hue.

---

## 13. Icons & Emoji

- `lucide-react` is the icon set (already used across 27 components). Default `w-4 h-4`, `currentColor`, `strokeWidth` default.
- Typographic glyphs are fine for pure affordances: `‹ › ▾ ← ↗ ·`.
- **No emoji in new work.** The brand rule (no 🚀 💡 ✨ 🎯) applies inside the product too. Existing emoji in `ChiefChat`, `AutonomySwitch`, and the dashboard's Guard card are drift, not precedent.
- Logo: `HELIX CHIEF CRM` in `font-display font-black` with the period in `text-brand`: the one place bright green stays as text, because the period is the mark, not something to read. In a branded workspace the logo image replaces the wordmark at `h-7 w-auto object-contain`.

---

## 14. Anti-Patterns

- ❌ Marketing ambience over a data view: cursor trails, floating logos, blurred blobs, scroll reveals, smooth-scroll hijacking.
- ❌ Hardcoded `#10B981` (breaks white-label), or any second accent hue.
- ❌ A colour that only works on one background:
  - `text-bg` as a label on green (use `text-on-brand`)
  - `text-brand` as text (use `text-brand-ink`)
  - `bg-white/…` or `bg-black/…` overlays (use `bg-ink/…`)
  - a palette hue without its `dark:` pair
- ❌ Emerald as decoration — a green icon, a green divider, three green stat values in one row.
- ❌ `text-sm` / `text-base` instead of the bracket scale.
- ❌ Physical direction utilities (`ml-`, `pl-`, `left-`, `text-left`).
- ❌ Generic SaaS shadows (`0 4px 12px rgba(0,0,0,.1)`) on in-flow cards.
- ❌ `window.prompt` / `window.alert` / `confirm` as UI. Use an inline form or `lib/motion/Dialog`.
- ❌ A modal where an inline form works.
- ❌ Duration-based CSS transitions for spatial movement. Springs move things; transitions only recolor.
- ❌ Skeletons that don't match the layout they replace.
- ❌ A number that a user compares, set in Heebo instead of `font-mono`.
- ❌ User-visible strings outside `lib/i18n`.

---

## 15. Known Drift

Real deviations in the current code. Each is a small, safe cleanup — not a redesign.

| # | Where | Drift | Fix |
|---|---|---|---|
| 1 | `components/ReferFloatingBadge.tsx:11`, `GtmSettingsForm.tsx:57,88` | `#10B981` hardcoded | read `--color-brand`, or accept an `accent` prop |
| 2 | `components/AutonomySwitch.tsx` | full inline-style system with its own `--panel/--line/--ink-2` light-theme fallbacks | port to app tokens + Tailwind classes |
| 3 | `components/ChiefChat.tsx`, `AutonomySwitch.tsx`, `dashboard/page.tsx`, `lib/i18n` (`prioritized` 🔥, `st_won` ✓, `apiSecretOnce` ⚠️) | emoji as UI | lucide icons; strip them from dict strings |
| 4 | `components/CrmWorkspaceSwitcher.tsx` | `window.prompt` + `window.alert` for creating a client workspace | inline form + inline error |
| 5 | `components/CrmWorkspaceSwitcher.tsx` | hardcoded Hebrew ("הוסף לקוח") | move into `lib/i18n` |
| 6 | `components/Skeleton.tsx` consumers | some `loading.tsx` shapes don't match their screen; `(crm)` has no loading state at all | match the real layout |
| 7 | `components/Nav.tsx:29` | white-label accent override writes the undefined `--brand`; Tailwind v4 reads `--color-brand`, so branded workspaces never re-accent | write `--color-brand`/`--color-brand-hover`, and move the override up to the screen wrapper ([§4](#4-white-label-accent)) |
| 8 | `app/[locale]/(stage)/login` | the CRM's own sign-in page sits in the STAGE group, so it still renders the directory chrome | decide whether `login`/`onboarding` are CRM surfaces and move them into `(crm)` |
| 10 | `lib/i18n/he.ts` (`ls_*`, `lsx_*`) | the lifecycle and lead-status labels are now unreachable from any screen — `status` replaced both controls — but the keys are still in both dictionaries | remove once nothing reads `lifecycle_stage`/`lead_status` for display; the columns themselves stay ([§3](#3-status--semantic-colors)) |
| 11 | `components/AutomationBuilder.tsx` | no read-only mode, so a viewer gets a name + trigger summary instead of the graph | add a `readOnly` prop (React Flow: `nodesDraggable`/`nodesConnectable`/`elementsSelectable` false, hide the save/toggle/test controls) and show the graph |
| 12 | `components/Nav.tsx` (branded workspaces) | a white-label logo drawn white for a dark nav disappears on the light theme; no branded workspace could be checked on 2026-09-28 (production reads are blocked from the dev machine) | if one appears, set the logo on a neutral chip (`bg-ink/5 rounded-lg p-1`) or ask the workspace for a dark variant |

---

## 16. Open Decisions

**Resolved 2026-09-24 — the shell split shipped.** `app/[locale]/` is two route groups: `(crm)` gets a clean shell, `(stage)` keeps the ambience. See [§9](#9-screen-patterns). This removed a canvas `requestAnimationFrame` loop, ~26 floating images and the lenis scroll hijack from every CRM page. `lib/motion/README.md` drew the line itself: *"Scope: inside the software, not marketing pages."*

**Still open: are `login` and `onboarding` CRM surfaces?** `helix-crm/CLAUDE.md` lists both as signed-in surfaces, which argues for `(crm)`; the shell split left them in `(stage)`, so the CRM sign-in page still renders a cursor trail. Eran's call — it is one `git mv` each. Tracked as [§15](#15-known-drift) row 8.

**Resolved 2026-09-24 — one status per contact, set by hand.** `crm_contacts.status` is the single field that describes a person, and `lifecycle_stage`/`lead_status` became derived mirrors kept truthful for the public `/api/v1` routes, CHIEF, and stored automation graphs ([§3](#3-status--semantic-colors)). Deliberately **not** derived from the contact's deals: a badge that moves by itself surprises the person reading it. The consequence Eran accepted is that a client who buys a second time gets a new deal while their badge stays at the furthest point the relationship reached.

**Still open: does the deal board stay the primary pipeline?** The status ladder makes a people-by-status kanban the natural view, and the drag/optimistic/spring code in `CrmDealBoard` would port to one. For now status is a chip in the list and the drawer, and the deal board is untouched. Revisit only if Eran finds himself wanting to drag people.

**Deleting the 20 `(stage)` page directories** is deliberately not decided here. They are quarantined and working; deletion needs separate evidence about what still links in and which Supabase tables are still read.

Second, smaller: **`--color-neon` has no consumer** beyond `.cta-glow`'s shadow. Either keep it documented as glow-only (as above) or drop it.

---

## 17. File Map

```
helix-crm/
├── DESIGN.md                     ← this file
├── app/
│   ├── globals.css               tokens (@theme), focus, skip-nav, effect classes
│   ├── carousel.css              STAGE carousel only
│   ├── crm-actions.ts            server actions (⌘K index, status + history + undo + reason,
│   │                             next step, deals, WhatsApp log, 1:1 email)
│   └── [locale]/
│       ├── layout.tsx            document shell only: html/body, fonts, globals.css
│       ├── page.tsx              redirect → dashboard/crm
│       ├── (crm)/                see §9 — Nav · main · Footer · ⌘K, no ambience
│       │   ├── layout.tsx
│       │   ├── chief/page.tsx    CHIEF chat screen
│       │   └── dashboard/
│       │       ├── page.tsx      STAGE command center (legacy, still here)
│       │       ├── loading.tsx   skeleton shape
│       │       └── crm/…         board, [id], team, api, autonomy
│       └── (stage)/              the 20 legacy directory pages + their chrome
│           ├── layout.tsx
│           └── loading.tsx
├── components/
│   ├── Nav.tsx                   nav + white-label accent override (see §15 row 7)
│   ├── HelixCommandBar.tsx       ⌘K — routes + contacts + open deals
│   ├── CrmNavMenu.tsx            CRM side menu + its <lg drawer button
│   ├── ThemeToggle.tsx           the light/dark switch: flips <html data-theme>, keeps the cookie
│   ├── BidiParts.tsx             "a · b · c" meta line, each part a <bdi>
│   ├── CrmContactList.tsx        client-side contact filter (name · company · role · email · status)
│   ├── CrmContactDrawer.tsx      the ?c=<id> lead drawer: header, reach and log, next step, deals, timeline
│   ├── CrmStatusPath.tsx         the seven-step status path + exits; below sm, a Sheet list
│   ├── CrmStatusFeedback.tsx     the line under the path: undo · exit question · (drawer) prompts
│   ├── CrmNextStep.tsx           the person's next step: set, reschedule, done
│   ├── CrmDrawerDeals.tsx        a person's deals: open one, work it in place, win or lose it
│   ├── Crm*.tsx                  CRM surfaces (board, panel, switcher, team, keys)
│   ├── ChiefChat.tsx             chat + action trace
│   └── Skeleton.tsx
└── lib/
    ├── motion/                   spring engine + primitives + tokens.css (README inside)
    ├── crm-score.ts              0..100 lead score (from status) + tier thresholds (pure: clients import it)
    ├── crm-rescore.ts            loadScoreInputs / rescoreContact: every signal, open deal included
    ├── crm-dates.ts              next-step dates and days in status, in Israeli calendar days
    ├── theme.ts                  the theme cookie, its event, themeFrom(): read by the layout and nav
    ├── use-theme.ts              the theme on the client, following the switch (React Flow)
    ├── use-status-change.ts      one status control's state: save, revert, undo, exit questions
    ├── crm-status.ts             the nine statuses: order, path/exits, legacy mirror, score weights,
    │                             chip and bar classes, decline reasons
    ├── crm-tier.ts               TIER_BADGE / TIER_TEXT — the one tier styling map
    ├── phone-il.ts               Israeli phone → wa.me international form
    └── i18n/{he,en}.ts           every user-visible string
```

Related: `../DESIGN.md` (website, light), `../EFFECTS.md` (marketing effects, `§25` is the in-app motion entry), `../docs/BRAND.md` (brand system), `../docs/VOICE.md` (Hebrew voice), `../CLAUDE.md` (project rules).

> `helix-crm/` is a git subtree of `r0544468883-spec/helix-crm`. Edits here travel upstream on the next subtree push.

---

## 18. New Screen Checklist

- [ ] Placed in the right route group — `(crm)` for an app screen, `(stage)` for a legacy directory page ([§9](#9-screen-patterns)). Never import `CursorTrail`, `FloatingBackground`, `SmoothScroll`, `CompareTray` or `ReferFloatingBadge` from anything under `(crm)`
- [ ] Container width from [§6](#6-layout--spacing); `px-5 md:px-10 pt-12 pb-16`
- [ ] One `h1` in `font-display`, subtitle in `text-ink-secondary text-[15px] mb-8`
- [ ] Tokens only — no hex, no second accent, one accent metric per stat row
- [ ] Controls `rounded-[10px]`, cards `rounded-2xl`, rows `rounded-xl`
- [ ] Numbers in `font-mono`; `₪` via `toLocaleString()`
- [ ] All strings in `lib/i18n`; `dir="auto"` on user data, `dir="ltr"` on email/phone/numbers
- [ ] Logical properties only; screen verified in `he` **and** `en`
- [ ] Empty state, loading skeleton matching the real layout, and error/not-configured state
- [ ] Motion from `lib/motion` (springs, not durations); reduced-motion checked
- [ ] Keyboard: tab order sane, focus ring visible, targets ≥44px on mobile
- [ ] One filled primary action per header; a new occasional screen goes in the CRM side menu ([§8](#8-components))
- [ ] If a row shows a contact's state, the **status chip is its only coloured element** ([§3](#3-status--semantic-colors)) — no second coloured signal on the same row
- [ ] An overlay showing a record is addressed in the URL and rendered by the server ([§9](#9-screen-patterns)); one that is merely transient stays in component state
- [ ] Every `Drawer` gets `dir={dirOf(locale)}`; closed overlays are inert via the primitive, so no `inert`/`{open && …}` workaround in the consumer ([§8](#8-components))
- [ ] Every mutation is optimistic with a 15s timeout and a stated failure, and no control dims to signal pending
- [ ] Route added to `components/HelixCommandBar.tsx` `ROUTES` (CRM screens only)
- [ ] Nothing from [§14](#14-anti-patterns)
- [ ] **This doc updated in the same commit** — new specs written in, drift rows added or removed, `Last updated:` bumped
