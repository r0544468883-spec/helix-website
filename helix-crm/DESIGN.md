# HELIX CHIEF CRM — Design System

> Source of truth for design decisions inside the **software** (`helix-crm/`).
> The marketing site has its own system: `../DESIGN.md` (light theme) and `../EFFECTS.md` (the 60-effect marketing library).
> **They are not interchangeable.** The CRM is light by default, dark by choice; dense and quiet. Last updated: 2026-09-30.

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

A contact carries exactly one `status` (`lib/crm-status.ts`), and it is the **only element of a contact-list row allowed to use colour**. Before this, a row asserted two coloured signals at once — a tier-coloured score and a grey stage pill — which let a row read "cold" and "paying client" simultaneously. Since 2026-09-28 the list shows no score at all, not even the neutral number that replaced the coloured one: the drawer explains it instead.

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

### Contacts table (`components/CrmContactList.tsx`) — the work-queue list

Every value says what it is: a column header from `md` (768px), a label on a phone. Since 2026-09-28, when Eran looked at the list as his end client would ("number, name, status" meant nothing). **No score in the list**: a bare "65" in the leading column was the biggest thing on the row and explained nothing. The drawer's details show it with its tier and signals ([Contact details](#contact-details-componentscrmcontactdetailstsx)). The order is still by score, and one line says so.

```txt
Order   <p class="text-[12px] text-ink-muted mb-2">  "מסודרים לפי עדיפות: הכי מבטיחים למעלה"
<div role="table" aria-label="אנשי קשר">
  Head  <div role="row" class="hidden md:grid grid-cols-[minmax(0,1fr)_132px_minmax(0,1fr)_120px]
             gap-x-4 px-3 pb-2 border border-transparent text-[12px] font-semibold text-ink-muted">
          role="columnheader" × 4: איש קשר · סטטוס · תזכורת · מגע אחרון
  Row   <div role="row" class="relative grid grid-cols-[minmax(0,1fr)_auto]
             md:grid-cols-[minmax(0,1fr)_132px_minmax(0,1fr)_120px] gap-x-4 gap-y-1 items-start
             bg-surface border border-border rounded-xl p-3 min-h-[44px] hover:border-brand transition-colors">
    Link   <Link class="absolute inset-0 rounded-xl" aria-label={name} data-contact-row="<id>"
                 href="…/dashboard/crm?c=<id>" scroll={false}>   ← empty, over the whole card: one keyboard
                                                                  stop, the global focus ring outlines the card
    Contact cell  min-w-0: name text-[15px] font-semibold truncate (dir=auto)
                  meta text-ink-secondary text-[13px] truncate  (role · company · email; omitted when empty)
    Status cell   status chip text-[12px] font-semibold rounded-full px-2.5 py-0.5 whitespace-nowrap
                  + STATUS_BADGE[status]                        ← the row's only colour
    Reminder cell col-span-2 md:col-span-1 flex items-center gap-1.5 min-w-0 text-[13px]
                  phone label  md:hidden text-ink-muted shrink-0 "תזכורת:"
                  set    lucide Bell 13 text-ink-muted · title text-ink truncate · due text-ink-muted ("עד 30/9")
                         overdue → "באיחור · עד 26/9" in text-ink font-semibold  ← text, not colour
                  none   text-ink-muted "אין"
    Touch cell    col-span-2 md:col-span-1 flex flex-wrap items-center gap-x-2 gap-y-1
                  md:flex-col md:items-start text-[13px]
                  phone label  md:hidden text-ink-muted "מגע אחרון:"
                  value  text-ink-secondary ("לפני 3 ימים" · "היום" · "טרם")
                  needs touch  flex items-center gap-1 text-[11px] font-semibold text-ink
                         border border-border-strong rounded-full px-2 py-0.5   lucide Clock 11  "צריך מגע"
```
- **One DOM for both widths.** From `md` the row is four columns aligned with the head, because the status and touch columns have fixed widths. Below it, the same row is a card: the name and chip on the first line, then the labelled reminder and last touch. The head is `hidden` there, so the labels do its job.
- **The link is an empty layer over the card, not the name.** The global `a:focus-visible` ring is unlayered CSS, which beats any utility. An empty `absolute inset-0` link takes that ring around the whole card, and it is still one link per contact, named by the person. `data-contact-row` is what the drawer focuses on close.
- **Status owns colour** ([§3](#3-status--semantic-colors)), so the overdue and needs-touch marks are weight and a neutral border, never red or amber. The head's `border-transparent` matches the row's 1px border, so the columns line up.
- **With no contacts there is no head**: the empty line stands alone.

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
      meta   role · company (BidiParts, truncate)   ← no score here: it lives in the details, explained
      path   CrmStatusPath, mt-3                 ← the only status control; see Status path
      line   CrmStatusFeedback                   ← undo · exit question · deal prompt
    <div class="flex-1 min-h-0 overflow-y-auto pt-4" style="overscroll-behavior: contain">
      details                    ← CrmContactDetails: labelled rows, edited in place (Contact details)
      action row + one open box  ← WhatsApp · email · call · meeting · note (Drawer action row)
      reminder                   ← CrmNextStep (Reminder)
      deals                      ← CrmDrawerDeals: always there for a writer, even when empty
      timeline                   ← newest first, status and task rows included, or "no activity yet"
```

The details come first because they answer "who is this" before "what do I do". The bare email / phone / LinkedIn lines they replaced said nothing about what each value was, and the score beside the name was a number nobody could read (2026-09-28).

Days in status count Israeli calendar days from the newest `status` row a signed-in user wrote (`statusDays()` in `lib/crm-dates.ts`, computed on the server), or from creation for a `new` contact never moved.

**Closing asks before discarding any unsent text**: a box, the reminder, a new deal, or edited details. A form that was opened and left untouched is not unsent text. **Escape belongs to an overlay that is open over the drawer** (the phone status list, the lost confirmation): they all listen on `window`, so the drawer ignores Escape while one is open.

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
      → lib/motion/Sheet nested (it portals itself, so .hm-material's backdrop-filter can't
        trap it inside the drawer panel, and nested puts it a layer above the drawer)
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

### Contact details (`components/CrmContactDetails.tsx`)

The first region of the drawer's body: who the lead is, under labels, like HubSpot's "About this contact". Read by default, edited in place with one form and one save.

```txt
<section aria-label="פרטים" class="mb-5">
  head  flex items-center justify-between gap-2 mb-2: h3 font-bold text-[14px] "פרטים"
        · Edit  Text button text-[13px] min-h-[44px] "עריכה"          ← writer only
  Read  <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px]">
          dt  text-ink-muted whitespace-nowrap
          dd  text-ink min-w-0 break-words
              dir="ltr"   phone · email · LinkedIn · a source the CRM has no name for
              dir="auto"  company · role · background (whitespace-pre-line: line breaks kept)
          phone, email  <a href="tel:…|mailto:…" class="text-brand-ink hover:underline">
          LinkedIn      a link (target=_blank rel="noopener noreferrer") only when safeHttpUrl() passes;
                        any other stored value is plain text, never an href
          score         font-mono text-ink · tier word text-ink-secondary · signals text-ink-muted, " · "
                        ← the tier word is text, never a tier colour: status owns colour (§3)
  Add   <button class="block text-start text-[13px] text-ink-secondary hover:text-ink min-h-[44px]">
        "+ הוספת טלפון, תפקיד, LinkedIn"   ← writer only; opens the form on the first empty field
  Form  flex flex-col gap-3, each field a Label wrap (text-[12px] text-ink-muted) + Input w-full min-h-[44px]
        company   Select: the workspace's companies + "ללא חברה" (no new company from here)
        background  textarea rows=4 resize-y
        error     text-danger text-[13px] mt-1 role="alert", under its own field
        actions   flex flex-wrap gap-2: Primary "שמירה" (disabled while the name is empty) · Text "ביטול"
```

- **Only filled fields are rows.** The empty editable ones are named once, in the add line, so a sparse lead doesn't read as a column of dashes. A viewer gets the rows and nothing else.
- **Rows:** phone, email, company, role, LinkedIn, source, background (`רקע`, the stored `notes`), added (the date and how long ago, in Israeli days), last touch (the home row's words, or `טרם`), score.
- **`רקע`, not `הערות`.** The action row's `הערה` writes a timeline entry; two things called "note" that behave differently would be read as one.
- **Source names:** `manual` הוזן ידנית · `api` API · `chief` CHIEF · `import` ייבוא. Anything else shows as stored.
- **The score row is the stored score with the signals computed now** (`scoreSignals()` in `lib/crm-score.ts`, named by the dictionary). Recency can disagree until the next rescore, which every touch, status change and deal event does. No points per signal: they would not add up whenever recency is stale.
- **One save, the server decides.** `lib/crm-contact-fields.ts` holds the limits and the rules (name 120, role 120, source 60, phone 30, email 254, LinkedIn 300, background 2,000; an email address; LinkedIn `http(s)` only). The form runs them before sending and `crmUpdateContactDetails` runs them again. A refusal names its field.
- **An edit is not a touch.** It writes no timeline entry and leaves last touch alone. It rescores, since phone, LinkedIn, company and a business email feed the score.
- 15s timeout, an in-flight guard against a double press, typed values kept on any failure, cancel restores the stored values.

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

### Reminder (`components/CrmNextStep.tsx`)

The person's earliest-due open `crm_tasks` row, called **תזכורת** on screen since 2026-09-28 (it was "הצעד הבא", which Eran read as meaningless). The dictionary keys are still `nextStep*`. The drawer and the home row use the same order (`due_date asc nulls last, created_at asc`), the same due and overdue words and the same `Bell` mark, so they always name the same reminder.

```txt
<section aria-label="תזכורת" class="mb-6">
  Empty  one brand-tinted "+ תזכורת" (border border-brand/40 bg-brand/5 hover:bg-brand/10 text-brand-ink
         font-semibold px-3 rounded-[10px] text-[13px] min-h-[44px])   ← no heading, no empty form
  h3     font-bold text-[14px] mb-2 "תזכורת", or "מה הלאה?" when offered after a call or meeting
  Row    flex items-center gap-2 bg-bg border border-border rounded-xl ps-3 pe-1.5 py-1.5 min-h-[44px]
         lucide Bell 14 text-ink-muted · title text-[14px] text-ink truncate flex-1 (dir=auto)
         due  text-[12px] text-ink-muted "עד 30/9" · overdue "באיחור · עד 26/9" text-ink font-semibold
         Edit Text button min-h-[44px] · Done brand-tinted px-3 text-[13px] min-h-[44px]
  More   text-[12px] text-ink-muted mt-1   plural(): "ועוד תזכורת פתוחה אחת" · "ועוד שתי תזכורות פתוחות"
  Form   flex flex-col gap-2:
         title  input w-full min-h-[44px], dir=auto, focused on open ("מה לעשות? למשל: להתקשר לגבי ההצעה")
         when   flex flex-wrap gap-2: three picks, then the date input (dir=ltr, min-h-[44px])
                pick  text-[13px] rounded-full px-3 min-h-[44px] border transition-colors, aria-pressed
                      off border-border text-ink-secondary hover:text-ink · on border-brand text-brand-ink bg-brand/10
                      ← the header feedback line's chip pair
         acts   flex flex-wrap gap-2: Primary save (disabled while the title is empty) · Text "ביטול",
                or "לא עכשיו" when offered
```

- **Quick picks:** מחר, בעוד 3 ימים, בעוד שבוע: 1, 3 and 7 days after today's date in Israel (`addDaysIso(todayInIsrael(), n)`). "בעוד שבוע", not "בשבוע הבא", which can also mean next Sunday. The chosen pick is derived (the one whose date is in the field), so typing another date unmarks it.
- **The offer.** A call or meeting saved on a person with no open reminder opens the form under "מה הלאה?". "לא עכשיו" closes it with nothing stored, and an untouched offer never makes closing ask. A note, WhatsApp or email doesn't offer: a note is often a mid-conversation jotting, and a sent message has no known outcome yet. The CRM asks; it never creates a reminder by itself.
- **Done leaves at once**, and the reminder comes back with a message if the save fails. It writes a `task` row ("בוצע: …") to the timeline.
- **Setting, changing and completing a reminder are not touches.**
- **A viewer sees the reminder without Edit or Done.** With no open task, the viewer sees nothing.

### Drawer meetings (`components/CrmDrawerMeetings.tsx`)

The lead's meetings from the workspace's Google Calendar, right after the reminder. **With no Google connection there is no region at all.** The block loads after the drawer opens (`crmContactMeetings`), so the drawer never waits for Google, and nothing from the calendar is stored.

```txt
<section aria-label="פגישות" class="mb-6">
  h3       font-bold text-[14px] mb-2 "פגישות"
  Loading  h-11 bg-bg border border-border rounded-xl animate-pulse · role=status, sr-only "טוענים פגישות…"
  Row      <a target=_blank> flex items-center gap-2 bg-bg border border-border rounded-xl p-2.5 min-h-[44px]
           text-start hover:border-brand transition-colors            ← the quote row's shape
           tag "הבאה" text-[12px] text-ink-muted (the next one only) · when text-[12px] text-ink-secondary
           whitespace-nowrap "שבת, 3.10 · 14:00" ("כל היום" for an all-day event) · title text-[13px]
           truncate flex-1 (dir=auto; font-semibold on the next one) · sr-only "פתיחה ב-Google Calendar"
  Recent   caption text-[12px] text-ink-muted mt-1 "אחרונות", then up to 3 rows, newest first
  Lines    text-ink-muted text-[13px]: none in the window · no email · lapsed, + "למסך החיבורים"
           (text-brand-ink hover:underline font-semibold) for an admin
  Error    role=alert, the same line style: "הפגישות לא נטענו." + Text button "לנסות שוב" min-h-[44px]
```

- **5 seconds, then the error line with a retry.** That limit is the drawer's own, so it holds however long the server takes; the server's calls have their own limits (the token refresh 8 s, the events call 4.5 s).
- **Only events where the lead is an attendee or the organizer.** Google's search also matches an address in a description; those are dropped (`lib/crm-meetings.ts`). Cancelled events are dropped too. Days and hours are Israel time.
- **The "Next" tag is neutral, not emerald.** `text-brand-ink` is for links, ₪ values and "on" chips ([§2](#2-color-tokens)); the next meeting stands out by its tag and its bold title.
- **Keyed by lead and email** in the drawer, so another lead, or an edited email, loads afresh. A late answer from an earlier try is dropped.
- **A lapsed connection says so to everyone**; only an admin gets the link, since only an admin can reconnect.

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
- **Lost asks first, by name**, in `lib/motion/Dialog`, which portals itself and sits a layer above the drawer ([§9 Overlay stacking](#overlay-stacking)). While it is open, the drawer leaves Escape to it.
- **Won and lost deals stay listed** with "נסגרה" or "אבודה", never `st_won`'s ✓ glyph ([§15](#15-known-drift) row 3).
- Opening, winning and losing a deal rescore its person (`lib/crm-rescore.ts`).

### Drawer quotes (`components/CrmDrawerQuotes.tsx`)

The person's price quotes, after the deals. Newest first. A writer always sees `+ הצעת מחיר`; a viewer sees the list with `פתיחה` only (a draft opens as the editor's read-only preview), and no region when there are none.

```txt
<section aria-label="הצעות מחיר" class="mb-6">
  head  flex flex-wrap items-center justify-between gap-2 mb-2: h3 font-bold text-[14px] · brand-tinted
        "+ הצעת מחיר" (px-3 text-[13px] min-h-[44px])
  Row   <button aria-expanded> w-full flex items-center gap-2 bg-bg border p-2.5 min-h-[44px] text-start
        number font-mono text-[13px] (or "טיוטה" text-ink-muted) · subject text-[13px] truncate flex-1 (dir=auto)
        · ₪total font-mono text-[12px] text-ink-secondary (dir=ltr) · state text-[12px] text-ink-muted
        ("נשלחה 28.9" · "נפתחה 29.9" · "בוטלה"; none on a draft, its number slot already says it)
        closed border-border rounded-xl · open border-brand rounded-t-xl
  Panel bg-bg border border-t-0 border-brand rounded-b-xl p-3 flex flex-wrap gap-2:
        draft → Secondary "פתיחה" (the editor) · sent → Secondary "פתיחה" (the page, new tab) +
        Secondary "העתקת קישור" · Secondary "שכפול" · quiet "ביטול הצעה" pushed out with ms-auto (sent only)
```
- **Cancel asks first, by number**, in `lib/motion/Dialog`. It is the only thing that changes a sent quote. While it is open the drawer ignores Escape (the `overlays` ref, like the lost-deal question).
- **A sent quote has no editor.** Opening it opens its page; to change it, duplicate it into a new draft.
- **"נפתחה" is the latest open**, from `last_viewed_at`, so a client coming back shows as a new day. Dates are the Israeli day, formatted on the server.
- **A refused clipboard** gives the editor's copy-by-hand field under the row: `t.quoteCopyManual` and a read-only `dir="ltr"` input that selects itself on focus.

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

### Business details (`components/CrmBusinessForm.tsx`, `dashboard/crm/business`)

What a quote carries about the business: set once, used on every quote. An admin edits; every other role reads the same values as a `<dl>` (the Contact details read style), with no field and no save.

```txt
Page    max-w-[760px] mx-auto px-5 md:px-10 pt-12 pb-16 · h1 + subtitle (§18)
Card    bg-surface border border-border rounded-2xl p-5 flex flex-col gap-5
Logo    flex items-center gap-4: preview w-24 h-24 rounded-xl border border-border bg-bg flex items-center
        justify-center overflow-hidden (<img class="max-w-full max-h-full object-contain">, or "אין לוגו"
        text-[12px] text-ink-muted) · Secondary "העלאת לוגו" / "החלפה" (a <label> over a hidden file input,
        accept="image/png,image/jpeg,image/webp") · Text "הסרה" · hint text-[12px] text-ink-muted
Fields  grid gap-4 md:grid-cols-2: Label wrap + Input w-full min-h-[44px] (phone, email, website, number: dir=ltr)
        VAT status  Select "עוסק מורשה / חברה" · "עוסק פטור"      notes  textarea rows=3, md:col-span-2
Error   text-danger text-[13px] mt-1 role="alert", under its field
Save    Primary "שמירה" · the saved / failed line under it
```
- **The document logo is not the top bar's logo.** It lives in `crm_workspaces.business.logo_url`; `branding.logo_url` still drives the nav.
- PNG, JPEG or WebP, 1 MB at most, checked by content, not only by the file's name. No SVG: opened on its own, an SVG runs script.

### Quote editor (`components/CrmQuoteEditor.tsx`, `dashboard/crm/quotes/[id]`)

A draft, edited beside the document it becomes. Sent quotes have no editor.

```txt
Page    max-w-[1100px] mx-auto px-5 md:px-10 pt-8 pb-16 · back link "← {lead}" (to the drawer, ?c=<id>)
Layout  lg: grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6, the preview sticky top-20
        <lg: a two-button switch "עריכה · תצוגה מקדימה" (the feedback line's chip pair, aria-pressed)
Form    subject Input · deal Select (the lead's open deals + "עסקה חדשה")
Line    flex flex-wrap items-start gap-2 border-b border-border pb-3:
        description Input flex-1 min-w-[200px] · qty Input w-20 dir=ltr · unit price Input w-28 dir=ltr
        · line total font-mono text-[13px] w-24 text-end (dir=ltr) · remove (lucide X 16, min-w-[44px] min-h-[44px])
        errors under the line: text-danger text-[13px] role="alert"
Add     brand-tinted "+ שורה"   (at 50 lines: gone, and one text-ink-muted line says why)
Totals  ms-auto w-full sm:w-72 text-[14px]: rows flex justify-between; total font-bold; amounts font-mono dir=ltr
Send    see Send bar
```

**Send bar.** Two actions and what they will do, said before they do it:
```txt
flex flex-wrap items-center gap-2: Primary "שליחה בווטסאפ" (lucide MessageCircle 16) · Secondary "העתקת קישור"
  (lucide Link 16) · Secondary "שמירת טיוטה"
under   text-[12px] text-ink-muted "בשליחה הסטטוס של {name} יעבור ל״הצעה נשלחה״"   (only when it will move)
notice  no business name → text-[13px] + link to פרטי העסק, and both send actions disabled
        no WhatsApp number → only "העתקת קישור", and one line saying why
after   role="status" line: "הצעה 2026-004 נשלחה · הסטטוס עבר ל״הצעה נשלחה״" + "ביטול" (8 seconds, reverts
        the status only) · "פתיחת ווטסאפ" fallback link · "לצפייה בהצעה"
```
The WhatsApp window is opened on the click, before anything is awaited, and pointed at WhatsApp once the send is stored ([§9](#9-screen-patterns)).

### Quote document (`components/QuoteDocument.tsx`)

The one rendering of a quote: the editor's preview, the public page and the printed PDF are all this component, so they can't drift. It is paper in every theme: `.doc-paper` pins the light tokens ([§10](#10-motion)).

```txt
<article class="doc-paper bg-surface text-ink rounded-2xl border border-border p-6 md:p-10
                print:border-0 print:rounded-none print:p-0" dir={dirOf(locale)} lang={locale}>
  head      flex items-start justify-between gap-6: logo (max-h-16 w-auto object-contain) or the business name
            (text-[20px] font-extrabold) · block text-end: "הצעת מחיר" text-[22px] font-extrabold · number
            font-mono (or "טיוטה") · date text-[13px] text-ink-secondary
  business  text-[13px] text-ink-secondary leading-relaxed: name · ח.פ. · address · phone · email · website
  to        "לכבוד" text-[12px] text-ink-muted · client name font-semibold · company
  subject   h2 text-[17px] font-bold mt-6 mb-3
  lines     sm+: <table class="w-full text-[14px]"> head text-[12px] text-ink-muted border-b border-border;
            rows border-b border-border; qty, price, total font-mono dir=ltr text-end
            <sm: each line a block: description, then "2 × ₪1,500.00" and the line total on one row
  totals    ms-auto w-full sm:w-72 mt-4: before VAT · VAT 18% (or "עוסק פטור") · total font-bold text-[16px]
  validity  text-[13px] "ההצעה בתוקף עד 12.10.2026"
  notes     text-[13px] whitespace-pre-line
```
Amounts are ₪ with two decimals, `he-IL` grouping (`₪7,080.00`), `dir=ltr` inside the RTL page.

### Auth emails (`lib/auth-emails.ts`)

The invite and the sign-in link, the only emails the CRM sends about access (since 2026-09-29; Supabase's mailer is no longer used). A mail app has no CSS variables and drops `<style>`, so the light tokens are written out inline. They are always light, whatever the reader's theme, like the quote document.

```txt
page      bg #FAFAF8, a centred 560px table: bg #FFFFFF, 1px #EBEBE8, radius 16px, padding 32px 24px,
          Arial, dir and lang from the locale, text-align start
logo      "HELIX" 20px weight 900 + an emerald (#10B981) "." — text, never an image; dir=ltr
heading   22px weight 800
body      16px / 1.6, ink #1A1A1A
button    a table cell, bg #10B981 radius 10px, holding the <a>: padding 14px 28px, 16px weight 700,
          label #121413 (on-brand, dark: #10B981 fails as a text colour and under white text)
notes     14px #555555: "works once, from any device, how to get a new one" · the reply or ignore line
fallback  13px #6E6E6E: "paste this link" + the link as dir=ltr text, word-break:break-all
footer    12px #6E6E6E outside the card: "HELIX CRM · crm.helix.co.il"
```
- **The button's link is the only `href`.** No tracking pixel and no rewritten links (unlike campaigns, `lib/email.ts`). The login address inside the notes is text.
- **Every Hebrew paragraph opens with a Hebrew word**, and the plain-text part starts each line with a right-to-left mark, so an app that guesses direction from the first letter still reads it right to left. Names sit in `<span dir="auto">`.
- **No duration is promised.** A link's lifetime is Supabase's "Email OTP Expiration", which the CRM doesn't own; the copy says it works once and how to get another.

### Pending invite row and invite form (`components/CrmTeamManager.tsx`, Team screen)

Since 2026-09-29 the CRM sends the invite itself and says what happened to it ([§8 Auth emails](#auth-emails-libauth-emailsts)).

```txt
Form     the invite Card: email input (dir=ltr, min-h-[44px]) · role select · Primary lg "הזמנת חבר צוות"
         result line under it: text-[13px] mt-2; text-ink-secondary role=status when sent or "too soon",
         text-danger role=alert when refused or saved-but-not-sent; the typed address stays on a refusal
         or a timeout, clears once the invite is saved
         hint lines: text-ink-muted text-[12px] — what an invite does (30 days, a resend extends it) · the roles
Row      bg-surface border border-border border-dashed rounded-xl p-3 flex flex-wrap items-center gap-x-3 gap-y-2
  email  flex-1 min-w-[180px] truncate text-[14px] text-ink-secondary dir=ltr
  role   text-[12px] text-ink-muted
  state  basis-full sm:basis-auto text-[12px]: text-ink-secondary, or text-danger for חזרה · סומנה כספאם · לא נשלחה
  manage flex flex-wrap gap-2 ms-auto, on the invites this viewer may manage (an admin: all; a member:
         their own): Secondary "שליחה שוב" (px-3 text-[13px] min-h-[44px]) ·
         quiet "ביטול ההזמנה" (text-ink-muted hover:text-danger text-[13px] min-h-[44px] px-2)
  line   under the row, text-[13px] mt-1: the resend's outcome
```
- **One state per invite**, from `lib/crm-invite-state.ts`: `נשלחה 29.9 14:05` · `נמסרה` · `מתעכבת` · `חזרה: כנראה שהכתובת שגויה` · `סומנה כספאם` · `לא נשלחה: {reason}` · `פג תוקף 29.10` · `הוזמנה 29.9` (sent before the CRM sent its own). Expiry wins. Only the three failures are danger; green is never a state colour.
- **Delivery comes from Resend** when an admin opens the screen: at most 3 lookups within 3 seconds, each invite at most once a minute (`lib/crm-invite-delivery.ts`). When any invite shows `נמסרה`, one muted line under the list says to check spam.
- **One action at a time** (an in-flight ref), each through the 15-second `withTimeout`: a double press never sends two emails.
- **Removing a member asks first**, by name, in `lib/motion/Dialog`: Danger fill "הסרה מהצוות" and the bordered "לא עכשיו". Cancelling an invite doesn't ask: inviting again undoes it.

### Header: one primary action

A screen header carries **exactly one filled `bg-brand text-on-brand` action**. Occasional screens (team, API, automations) are not header buttons: they live in the CRM side menu below. There is no "עוד" overflow control any more (removed 2026-09-27 at Eran's request).

### CRM side menu (`components/CrmNavMenu.tsx`)

One list of CRM screens, on the **start edge**: the right in Hebrew, the left in English. Items, in order: אנשי קשר (the home, also active on `/crm/[id]` and the quote editor), אוטומציות, צוות, פרטי העסק, חיבורים (lucide `Plug`, every role, since 2026-09-30), API, workspace חדש (lucide `Plus`, every role: anyone signed in may have a workspace of their own, since 2026-09-29). Autonomy and CHIEF are hidden from it and still work by direct URL.

```txt
≥lg   <aside class="hidden lg:block w-[220px] shrink-0 border-e border-border">
        <nav class="sticky top-16 flex flex-col gap-1.5 px-4 pt-8">
<lg   nav button  lg:hidden min-h-[44px] min-w-[44px] + lucide Menu, first thing in the nav row
      → lib/motion/Drawer side="start" width={300}; the Drawer portals itself into <body>,
        so the nav's backdrop-blur is never the fixed panel's containing block
Row   flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] min-h-[44px] + lucide icon
      idle    text-ink-secondary hover:text-ink hover:bg-ink/5
      active  bg-ink/5 text-ink font-semibold, aria-current="page"
```

The one consumer duty the `Drawer` does not cover: **return focus to the trigger** on every close path (scrim, Escape, close button). Children can stay mounted: a closed `Drawer` is `visibility:hidden` + `inert` on its own.

### Connections screen (`components/CrmConnections.tsx`, `dashboard/crm/connections`)

Where a workspace connects its outside data (since 2026-09-30, crm-connect-google-and-make). The page shell is the Team screen's: `max-w-[760px]`, back link, h1, subtitle. Two Cards follow, Google first:

```txt
note     text-[13px] bg-surface border border-border rounded-xl px-4 py-3: the ?google= message
         (text-ink-secondary role=status, text-danger role=alert for a failure)
Card     bg-surface border border-border rounded-2xl p-5: h2 font-bold text-[16px] · p text-ink-secondary
         text-[14px] mt-1 mb-4 (what it reads, "read-only")
Google   state line text-[14px]: "לא מחובר" · "מחובר: " + the address (dir=ltr, font-semibold) + " · מאז {date}"
         (text-ink-muted) · "צריך לחבר מחדש" text-danger + the testing-mode hint (admin)
         actions flex flex-wrap gap-2 mt-4: Primary "חיבור Google" / "חיבור מחדש" (admin, a plain link to
         /api/connections/google/start) · Secondary "ייבוא אנשי קשר" (canWrite) · quiet "ניתוק" (admin, asks
         in a Dialog). Not set up on the server: one muted line instead of all of it.
Make     ordered steps list-decimal ps-5 text-[14px] · a muted "more questions" line · Secondary download of
         /integrations/make-facebook-lead-ads.json · two Code boxes (the address, the fields) ·
         Primary "יצירת מפתח ל-Make" (admin) → the key in the new-key card, shown once
Code box label text-[12px] text-ink-muted · <code> text-[13px] font-mono text-ink bg-bg border border-border
         rounded-lg px-3 py-2 overflow-x-auto whitespace-pre dir=ltr · Secondary "העתקה" beside it (a refused
         clipboard selects the text instead)
New key  border-2 border-brand/60 bg-brand/5 rounded-2xl p-4 (the API screen's card): "shown once" + a Code box
```
- **Everyone sees what is connected; only an admin changes it.** Connecting, disconnecting and the Make key are `isAdminRole`. Importing contacts is `canWrite`. Everyone else gets one muted line saying who can.
- **The addresses and the JSON are code, left to right.** A long address scrolls inside its box, never the page.

### Google import list (`components/CrmGoogleImport.tsx`, `connections/google/import`)

Picking Google contacts to become leads (since 2026-09-30). The page reads up to 2,000 contacts from the connected account within 10 seconds, with a `loading.tsx` skeleton meanwhile, then shows:

```txt
counts   text-ink-secondary text-[13px]: "{total} אנשי קשר ב-Google · {known} כבר ב-CRM" (+ "the first 2,000")
search   Input w-full text-[15px] min-h-[44px], type=search
actions  Secondary "בחירת כל המוצגים" · Text "ניקוי הבחירה" (when something is picked)
row      <label> flex items-center gap-3 bg-surface border border-border hover:border-brand rounded-xl px-3 py-2
         min-h-[44px]: checkbox w-5 h-5 (accent brand) · name text-[14px] font-semibold truncate dir=auto
         (+ " · company" text-ink-muted) · "email · phone" text-[12px] text-ink-secondary truncate dir=ltr
known    the same row as a <div> on bg-bg, opacity-70, no checkbox, "כבר ב-CRM" text-[12px] text-ink-muted
bar      sticky bottom-0 bg-bg/95 backdrop-blur border-t border-border (full-bleed to the page padding) py-3:
         Primary "ייבוא {n} אנשי קשר" (disabled at 0) · the result or error line text-[13px]
```
- **The whole row is the checkbox's target**, so a 390px screen gets 44px rows.
- **Matching is the server's call:** `כבר ב-CRM` means the same email, or the same phone on digits (`lib/crm-contact-match.ts`). The action re-reads the picked people from Google and re-checks them before creating anyone.
- **After an import the page refreshes,** so what was just imported turns `כבר ב-CRM`. The result line says how many came in and how many were skipped.
- **Not connected, lapsed, or no write role:** the page shows one notice with the way forward (retry, or the Connections screen) instead of a list.

### New workspace form (`components/CrmNewWorkspaceForm.tsx`)

A workspace of your own (since 2026-09-29). It is on `/{locale}/dashboard/crm/workspaces/new`, reached from the side menu, and on the CRM home of someone with no workspace.

```txt
page     max-w-[640px] mx-auto px-5 md:px-10 pt-12 pb-16: back link text-brand-ink "← אנשי קשר" ·
         h1 font-display text-[clamp(26px,4vw,36px)] font-extrabold · p text-ink-secondary text-[15px] mb-8
card     bg-surface border border-border rounded-2xl p-5
form     flex flex-col gap-3: Label "שם ה-workspace" + Input (w-full text-[15px] min-h-[44px], dir=auto,
         placeholder "למשל: שם העסק") · Primary lg self-start "יצירת workspace" ("יוצרים..." while pending) ·
         text-danger text-[13px] role=alert under it
```
- **Validated before it is sent**, and again on the server: a name is required, at most 80 characters. The typed name stays on any failure.
- **One press, one workspace:** an in-flight guard, and the 15-second `withTimeout`. A timeout says to refresh and check before trying again.
- **It opens the new workspace:** the action sets the active-workspace cookie, and the form goes to the CRM home.
- **No workspace at all:** the CRM home shows "עוד אין לכם workspace", one line, and this form in the same card, instead of the old "ask for an invite" notice. An invite that joined nothing (`?invite=unusable`) says so above it.

### CRM home header (the work queue)

```txt
<div class="flex items-center justify-between flex-wrap gap-3">
  <div class="flex items-center gap-2 min-w-0">
    h1  workspace name — font-display text-[20px] font-extrabold tracking-tight truncate, dir=auto
        (sr-only when the workspace switcher is shown, since the switcher already names it)
    workspace switcher   ← only with two or more workspaces to choose between
  primary action  "ליד חדש"   (omitted for a viewer)
then the figures line, then the contact list, then the pipeline section.
```
**The switcher appears only when there is a choice** (2026-09-28). With one workspace it was a menu with one row that also hid the title, so one workspace gets its name as the visible `h1` and nothing else. Adding a client workspace lives on the Team screen ([§9](#9-screen-patterns)), not in the switcher. The figures line counts people with Hebrew agreement: "איש קשר אחד", "שני אנשי קשר", "30 אנשי קשר".
No product headline, no marketing subtitle. The person opening their CRM for the fiftieth time needs who to call, not the product name, which the nav logo already shows.

### Dropdown / menu

```txt
Trigger  flex items-center gap-2 border border-border hover:border-brand text-ink-secondary
         hover:text-ink font-semibold px-4 py-2.5 rounded-[10px] transition-colors
         + 2px brand dot, truncate max-w-[140px], ▾ in text-ink-muted text-[11px]
Panel    absolute z-20 mt-2 end-0 w-64 bg-surface border border-border rounded-xl shadow-xl p-1.5
         max-h-[70vh] overflow-auto     (+ a fixed inset-0 z-10 click-catcher behind it)
Row      w-full flex items-center text-start px-3 py-2 min-h-[44px] rounded-lg text-[14px] transition-colors
         active: bg-brand/10 text-brand-ink font-semibold · idle: text-ink-secondary hover:bg-ink/5 hover:text-ink
         workspace switcher: dot · name truncate flex-1 min-w-0 (dir=auto) · role text-[11px] text-ink-muted
         font-normal shrink-0 whitespace-nowrap · the client tag
Group    text-[11px] text-ink-muted px-3 py-1.5
```
`end-0` and `text-start`, never `right-0` / `text-left`. The workspace switcher is this menu: the workspaces the person belongs to, then a "לקוחות" group. Each row names the role held there (`מנהל` · `חבר` · `צפייה בלבד` · `מנהל סוכנות`), because since 2026-09-29 one person can hold a different role in each (crm-multi-workspace). The role stays whole while the name truncates. It lists and switches, nothing else: it holds no create action ("workspace חדש" is in the side menu).

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

`app/[locale]/` splits into two route groups. Groups do not appear in URLs, so every path is unchanged. One route sits beside them on purpose: the public quote page, which gets the document shell and no chrome at all.

```txt
app/[locale]/
├── layout.tsx          document shell ONLY: <html>/<body>, 3 fonts, globals.css, skip-nav
├── page.tsx            redirect → /[locale]/dashboard/crm
├── q/[token]/          the public quote page: no login, no chrome (see A public document page)
├── auth/confirm/       the page an emailed sign-in link opens: one button, no chrome (see A page opened from an email link)
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

**Workspace screen** (`dashboard/crm`): title + toolbar on one wrapping flex row → figures line → filter + prioritized list → pipeline. Toolbar order: workspace switcher (only with two or more workspaces), then the one primary action last. No link out of a CRM screen may point at `/[locale]/dashboard` — that is the STAGE launch dashboard, a different product.

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

### Overlay stacking

**Every overlay primitive portals itself into `<body>`** (`Drawer`, `Sheet`, `Dialog`, `CommandPalette`), and the server renders nothing for them. A consumer never adds its own `createPortal` or a `z-index` wrapper. Until 2026-09-28 each consumer had to remember to portal; four of seven didn't, and the contact drawer opened under the sticky nav with its name, status and close button hidden, because the `(crm)` layout's `relative z-10` wrapper held it in a layer below the nav. That wrapper is gone too: nothing in the CRM sits beneath the page.

| Layer | Scrim | Panel | Who |
|---|---|---|---|
| Nav (sticky top bar) | — | 50 | `components/Nav.tsx` |
| `Drawer`, `Sheet` | 60 | 61 | the contact drawer, the side menu below `lg`, the add-contact sheet |
| `Dialog`, and a `Drawer` / `Sheet` with `nested` | 70 | 71 | the discard and lost-deal questions, the status list opened from the drawer |
| `CommandPalette` | 80 | 81 | ⌘K, which can open over anything |

- **`nested`** is for an overlay opened from inside another. The order never depends on which one mounted first: a `?c=` page load mounts the drawer and everything in it in one commit.
- **The scrim covers the nav.** A click on the dimmed nav is a click outside the panel: it closes, it never follows the nav's link.
- **In-page menus** (the switcher, the new-automation menu) are not overlays: an `absolute` panel over a `fixed inset-0 z-10` click-catcher, below the nav.

### A public document page (`app/[locale]/q/[token]`)

A page a client opens from a link, with no login, is **outside both route groups**. It gets the document shell and nothing else: no nav, no side menu, no footer, no ⌘K. It renders the frozen quote through `QuoteDocument` on `bg-bg`, `max-w-[820px] mx-auto px-4 py-6 md:py-10`, with one Secondary "שמירה כ-PDF" (`window.print()`, `print:hidden`) above it.
- **Its address is its key:** a 32-byte random token. A draft or an unknown token is `notFound()`, and a cancelled quote says `ההצעה בוטלה` with nothing else.
- **Not indexed:** `robots: { index: false }` and an `X-Robots-Tag: noindex` header (`next.config.mjs`). The link preview names the business and "הצעת מחיר", never an amount.
- **Printing is the PDF.** `@page { size: A4; margin: 16mm }`, everything but the document is `print:hidden`, and the document drops its border and padding.

### A page opened from an email link (`app/[locale]/auth/confirm`)

Every invite and sign-in email's button opens `/{locale}/auth/confirm?token_hash=…&type=…` (since 2026-09-29). Like the quote page it sits **outside both route groups**: the document shell, `bg-bg`, and nothing else.

```txt
main     min-h-screen bg-bg
column   max-w-[480px] mx-auto px-4 pt-24 pb-10 flex flex-col items-center text-center
mark     "HELIX" font-display text-[20px] font-black + "." text-brand-ink, dir=ltr
h1       font-display text-[clamp(24px,5vw,32px)] font-extrabold tracking-tight mt-6 mb-3 "כניסה ל-HELIX CRM"
form     w-full max-w-xs mt-3 flex flex-col gap-4: text-ink-secondary text-[16px] line ·
         Primary w-full py-3 min-h-[44px] "כניסה" ("נכנסים..." while pending) · text-danger text-[13px] on failure
used     a bordered bg-surface rounded-[10px] px-4 py-3 text-[14px] font-semibold role=alert line
         "הקישור כבר נוצל או שפג תוקפו." · text-ink-secondary text-[14px] hint · Secondary "לדף הכניסה"
```
- **The press signs in, never the load.** Mail scanners (Outlook's Safe Links especially) fetch links before the person does; a page that verified on load would spend the one-time code on the scanner. The button posts to `confirmAccessLink` (`useActionState`), which calls `verifyOtp` and redirects to `/{locale}/dashboard/crm`, where a first sign-in claims its invite. It never goes to the STAGE onboarding.
- **A code of the wrong shape never reaches Supabase**: it gets the "used" state straight away, with no button.
- **Not indexed, not leaked:** `robots: { index: false }`, and `X-Robots-Tag: noindex, nofollow` plus `Referrer-Policy: no-referrer` from `next.config.mjs`, because the address carries the code.

### Sending that opens another app

A button that stores something **and then** opens WhatsApp must open the window on the click itself: browsers block a window opened after an `await`. So `window.open('', '_blank')` runs first, the action is awaited, and the window is pointed at `wa.me` once the send is stored, or closed if it failed. A plain link to the same `wa.me` address stays on screen after a successful send, for the browser that blocked even that.

### Counting a view

A view is counted by the page's **script**, never by the request: one `POST /api/q/{token}/view` after the page mounts. Link-preview robots (WhatsApp, Telegram, Slack) fetch the HTML and run no script, so they never count. The route returns 204 for everything and records only a sent quote, opened by someone who is not a signed-in member of its workspace. The first view writes one timeline row, guarded in the `UPDATE … WHERE first_viewed_at IS NULL` so two opens at once can't write two.

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
- **Team screen:** role select offers `חבר · צפייה בלבד · מנהל` (`OFFERED_ROLES`), plus the inherited `מנהל סוכנות` label when a row already holds it. Role select and remove are `min-h-[44px]`; the member row wraps (`flex-wrap`) so a 390px screen never scrolls sideways; the email stays `dir="ltr"`. Two muted hint lines under the invite form: what an invite does, and the three roles. Pending invites, their states and the remove question: [§8 Pending invite row](#pending-invite-row-and-invite-form-componentscrmteammanagertsx-team-screen). Since 2026-09-29 any member invites (crm-multi-workspace): the form shows to every role but viewer, and its role select offers what `offeredInviteRoles(role)` allows: `חבר · צפייה בלבד` for a member, all three for an admin. `שליחה שוב` and `ביטול ההזמנה` show on the invites that viewer may manage (`canManageInvite`: an admin on every invite, a member on the ones they sent). The role select and remove stay `isAdminRole` (`admin` / `agency_admin`), with one muted line for everyone else. A viewer gets the lists.
- **Team screen, client workspaces** (`components/CrmClientWorkspaces.tsx`, since 2026-09-28): a Card shown only to the admin (`admin` / `agency_admin`) of a workspace that is not itself a client. A client can't hold clients, and `crmCreateClientWorkspace` refuses it too.
  ```txt
  Card    bg-surface border border-border rounded-2xl p-5
  head    h2 font-bold text-[16px] mb-1 "סביבות לקוחות" · p text-ink-secondary text-[14px] mb-4
  List    ul flex flex-col gap-2 mb-4 → li flex items-center justify-between gap-2 bg-bg border border-border
          rounded-xl ps-3 pe-1.5 py-1.5 min-h-[44px]: name text-[14px] truncate (dir=auto) ·
          Outline "מעבר" px-3 text-[13px] min-h-[44px]   (none yet: one line text-ink-muted text-[14px] mb-4)
  Form    flex flex-wrap gap-2: Input flex-1 min-w-[180px] min-h-[44px] · Primary "הוספת לקוח" min-h-[44px]
          (disabled while empty; 80 characters at most, refused with a message, never cut)
  Error   text-danger text-[13px] mt-2 role="alert"
  ```
  No `window.prompt` / `alert`: they were how this was done in the switcher, and they can't be styled, translated or tested.

---

## 10. Motion

`lib/motion/` is the shared in-app motion system (ported from Apple's *Designing Fluid Interfaces*, zero dependencies). Read `lib/motion/README.md` before animating anything. Springs take `(damping, response)` — **never a duration**.

| Use | Primitive |
|---|---|
| List/table reorders, stage moves | `useFlip` — items flow to their new position on **both axes** (on `CrmDealBoard`) |
| ⌘K navigation | `CommandPalette` via `components/HelixCommandBar.tsx` |
| Record detail without losing context | `Drawer` |
| Blocking task | `Dialog` (scales from its trigger origin) |
| Mobile secondary surface | `Sheet` (the status list below `sm`, `nested` so it sits over the drawer: [§9 Overlay stacking](#overlay-stacking)) |
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
| `.doc-paper` | pins the light values of `bg`, `surface`, `ink`, `ink-secondary`, `ink-muted`, `border` for its subtree | the quote document only: a client's paper looks the same in a dark CRM |

**Amplitude matters when you reach into `createSpring` directly.** Its rest test is absolute (`|x − target| < 0.1`), so animate **pixels**, one spring per axis. A normalized 0→1 progress spring settles while the element is still 10% of the distance from home — on a 300px move that is 30px short. `useFlip` runs one `SPRINGS.reflow` spring per axis for this reason; both start at rest and the equation is linear, so they stay in step.

**The status path recolours; it never moves.** Steps change colour with `transition-colors` (a recolour is not spatial motion), and the undo line and prompts appear in place. Nothing slides.

Closed state is **the primitive's** job: the server renders no overlay at all (each portals itself into `<body>` once mounted), and from the first client render a closed `Drawer` or `Sheet` is `visibility:hidden` + `inert` (set when the close spring rests, cleared before the open one starts), and `Dialog` is `display:none`. Layering is the primitive's job too ([§9 Overlay stacking](#overlay-stacking)). Focus return after a close is **the consumer's**.

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
│   │                             reminder, deals, contact details, client workspaces,
│   │                             WhatsApp log, 1:1 email, invites: send · resend · cancel)
│   ├── auth-actions.ts           the two signed-out actions: request a sign-in link, confirm one
│   ├── auth/callback, signout    route handlers (Google's return, sign-out); origin from lib/public-origin.ts
│   └── [locale]/
│       ├── layout.tsx            document shell only: html/body, fonts, globals.css
│       ├── page.tsx              redirect → dashboard/crm
│       ├── q/[token]/page.tsx    the public quote page (no chrome, noindex)
│       ├── auth/confirm/page.tsx the page an emailed link opens: one button signs in (no chrome, noindex)
│       ├── (crm)/                see §9 — Nav · main · Footer · ⌘K, no ambience
│       │   ├── layout.tsx
│       │   ├── chief/page.tsx    CHIEF chat screen
│       │   └── dashboard/
│       │       ├── page.tsx      STAGE command center (legacy, still here)
│       │       ├── loading.tsx   skeleton shape
│       │       └── crm/…         board, [id], team, api, autonomy, business, quotes/[id], workspaces/new,
│       │                         connections (+ google/import)
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
│   ├── CrmContactDrawer.tsx      the ?c=<id> lead drawer: header, details, reach and log, reminder,
│   │                             deals, timeline
│   ├── CrmContactDetails.tsx     the lead's details under labels, edited in place with one save
│   ├── CrmStatusPath.tsx         the seven-step status path + exits; below sm, a nested Sheet list
│   ├── CrmStatusFeedback.tsx     the line under the path: undo · exit question · (drawer) prompts
│   ├── CrmNextStep.tsx           the reminder (תזכורת): set with quick picks, reschedule, done, offered
│   │                             after a call or meeting
│   ├── CrmClientWorkspaces.tsx   Team screen card: list client workspaces, add one, switch to one
│   ├── CrmTeamManager.tsx        Team screen: invite form, members (remove asks), pending invites + states
│   ├── CrmNewWorkspaceForm.tsx   a workspace of your own: name → create → open it
│   ├── CrmConnections.tsx        the Connections screen: Google's state and actions, Facebook leads through Make
│   ├── CrmGoogleImport.tsx       picking Google contacts to import: search, checkboxes, one import button
│   ├── CrmDrawerMeetings.tsx     the drawer's meetings from Google Calendar: next + last 3, read live
│   ├── MagicLinkForm.tsx         sign-in page: "send me a link", answered by the server
│   ├── AccessConfirmForm.tsx     the confirm page's one button, and its "used or expired" state
│   ├── CrmBusinessForm.tsx       פרטי העסק: the document logo and the business details
│   ├── CrmQuoteEditor.tsx        a draft quote beside its preview, and the send bar
│   ├── CrmDrawerQuotes.tsx       the drawer's quotes: list, open, copy link, duplicate, cancel
│   ├── QuoteDocument.tsx         the quote itself: preview, public page and print are all this
│   ├── QuotePrintButton.tsx      "שמירה כ-PDF" on the public page
│   ├── QuoteViewBeacon.tsx       one POST after the public page mounts: how a view is counted
│   ├── CrmDrawerDeals.tsx        a person's deals: open one, work it in place, win or lose it
│   ├── Crm*.tsx                  CRM surfaces (board, panel, switcher, team, keys)
│   ├── ChiefChat.tsx             chat + action trace
│   └── Skeleton.tsx
└── lib/
    ├── motion/                   spring engine + primitives + tokens.css (README inside)
    ├── crm-score.ts              0..100 lead score (from status) + tier thresholds + scoreSignals()
    │                             (pure: clients import it)
    ├── crm-rescore.ts            loadScoreInputs / rescoreContact: every signal, open deal included
    ├── crm-contact-fields.ts     contact detail limits + validateContactDetails() + safeHttpUrl(),
    │                             shared by the form and the server action
    ├── crm-business.ts           business details: limits, validateBusiness(), the logo's allowed types
    ├── crm-quote.ts              quote lines, totals and VAT, number format, what a send moves: pure
    ├── auth-emails.ts            the invite and sign-in emails: subject, inline-styled HTML, plain text
    ├── crm-access-link.ts        server-only: limits → link (Supabase generateLink) → Resend → log
    ├── crm-access-rules.ts       the pure rules: limits, addresses, link type, a link's shape
    ├── crm-invite-state.ts       an invite's one state and its words: pure
    ├── crm-invite-delivery.ts    server-only: asks Resend what happened to unsettled invite emails
    ├── public-origin.ts          the public origin behind App Hosting's proxy, allowlisted
    ├── crm-google.ts             server-only: the Google connection (consent URL, code exchange, tokens
    │                             in Vault, lapsed) and the People and Calendar reads
    ├── crm-oauth-state.ts        the signed state cookie for Google's consent round trip
    ├── crm-google-map.ts         a Google person → an import row (name, email, phone, company): pure
    ├── crm-meetings.ts           a lead's meetings from calendar events: match, next + last 3: pure
    ├── crm-contact-match.ts      email and phone keys for "already in the CRM": pure
    ├── crm-contact-keys.ts       every email and phone in a workspace as keys: the import's "כבר ב-CRM"
    │                             and its re-check on the server
    ├── crm-dates.ts              reminder dates (addDaysIso, addMonthsIso) and days in status, in
    │                             Israeli calendar days
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
- [ ] Every value in a list says what it is: a column header on a wide screen, a label on a phone. No bare number or word the user has to learn ([§8 Contacts table](#contacts-table-componentscrmcontactlisttsx--the-work-queue-list))
- [ ] An overlay showing a record is addressed in the URL and rendered by the server ([§9](#9-screen-patterns)); one that is merely transient stays in component state
- [ ] Every `Drawer` gets `dir={dirOf(locale)}`; closed overlays are inert via the primitive, so no `inert`/`{open && …}` workaround in the consumer ([§8](#8-components))
- [ ] Overlays portal and stack themselves: no `createPortal` or `z-index` wrapper around a `Drawer`, `Sheet` or `Dialog`; an overlay opened from inside another passes `nested` ([§9 Overlay stacking](#overlay-stacking))
- [ ] Every mutation is optimistic with a 15s timeout and a stated failure, and no control dims to signal pending
- [ ] Route added to `components/HelixCommandBar.tsx` `ROUTES` (CRM screens only)
- [ ] Nothing from [§14](#14-anti-patterns)
- [ ] **This doc updated in the same commit** — new specs written in, drift rows added or removed, `Last updated:` bumped
