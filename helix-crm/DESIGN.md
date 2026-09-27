# HELIX CHIEF CRM — Design System

> Source of truth for design decisions inside the **software** (`helix-crm/`).
> The marketing site has its own system: `../DESIGN.md` (light theme) and `../EFFECTS.md` (the 60-effect marketing library).
> **They are not interchangeable.** The CRM is dark, dense, and quiet. Last updated: 2026-09-27.

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

This system covers everything a signed-in user sees: `/[locale]/dashboard/**`, `/[locale]/chief`, `/[locale]/login`, `/[locale]/onboarding`. Public STAGE-era pages (`/board`, `/launches`, `/products`, `/community`) inherit the same tokens but are allowed marketing warmth.

**Principles, in priority order:**

1. **Data first, chrome second.** A screen exists to show contacts, deals, money, and what happened. Decoration that pushes data below the fold is a bug.
2. **Dark, not black.** `#121413` with a faint green cast. Surfaces separate by 6-8% borders, not by shadows.
3. **One accent.** Emerald means *action or good*. Never decorative. Never two accents on one screen.
4. **Motion explains state, it never announces.** Springs on open/sort/move. Nothing loops, pulses, or sparkles next to a table.
5. **Hebrew-native, RTL-first.** Written in Hebrew, mirrored with logical properties, verified in `he` before `en`.
6. **Numbers are monospaced.** Score, ₪, counts, percentages. It makes columns scannable and looks like software.
7. **Same brand, different register.** It's still HELIX — Heebo, emerald, restraint — but a tool, not a pitch.

---

## 2. Color Tokens

Defined once in `app/globals.css` under Tailwind v4 `@theme`. There is **no `tailwind.config.*`** in this app: the theme block *is* the config.

| Token | Value | Tailwind class | Usage |
|---|---|---|---|
| `--color-bg` | `#121413` | `bg-bg` | Page background; also the *text* color on emerald buttons |
| `--color-surface` | `#1A1C1B` | `bg-surface` | Cards, panels, rows, dropdowns |
| `--color-soft` | `#1E201F` | `bg-soft` | Skeletons, inset wells, third level |
| `--color-ink` | `#E2E3E1` | `text-ink` | Primary text, headings |
| `--color-ink-secondary` | `#BBCABE` | `text-ink-secondary` | Body, subtitles, secondary buttons |
| `--color-ink-muted` | `#869489` | `text-ink-muted` | Meta, labels, timestamps, hints |
| `--color-ink-soft` | `#3D4A41` | `text-ink-soft` | Dividers in text (rare) |
| `--color-border` | `rgba(255,255,255,.08)` | `border-border` | Default border for every surface |
| `--color-border-strong` | `rgba(255,255,255,.15)` | `border-border-strong` | Hover/emphasis border |
| `--color-brand` | `#10B981` | `bg-brand` `text-brand` | Emerald: action, positive, hot |
| `--color-brand-hover` | `#0CB475` | `bg-brand-hover` | Hover on filled brand |
| `--color-neon` | `#16FFAB` | — | **Glow only** (`.cta-glow` shadow). Never a fill or text color |

### Rules

- **Text on emerald is `text-bg`, not white.** `bg-brand text-bg` is the house primary button.
- **Brand alpha ladder:** `bg-brand/5` (resting tint) → `/10` (hover tint) → `/15` (status chip) → `/25` (rare emphasis). Nothing between.
- **Borders do the separating.** No drop shadows on in-flow cards; `shadow-xl` is allowed only on floating layers (dropdown, dialog, sheet).
- **`bg-white/5`** is the legitimate neutral tint for a hovered menu row or a cold chip, where a token would be overkill.
- Token names differ from the website on purpose: here it's `bg-surface` and `bg-soft`, not `bg-bg-surface` / `bg-bg-soft`. Don't copy classes across repos blind.

### Motion material tokens (`--hm-*`)

`lib/motion/tokens.css` is shared and product-agnostic: it ships a **light** material and only darkens inside `@media (prefers-color-scheme: dark)`. This app has no light theme, so `app/globals.css` imports it once and then pins the dark values at bare `:root`, after the import, where they beat that media query at equal specificity in both directions.

| Token | Value here | Tracks |
|---|---|---|
| `--hm-accent` | `var(--color-brand)` | brand |
| `--hm-surface` | `rgba(26, 28, 27, .86)` | `--color-surface`, translucent |
| `--hm-surface-solid` | `#1A1C1B` | `--color-surface` (reduced-transparency fallback) |
| `--hm-border` | `rgba(255,255,255,.08)` | `--color-border` |
| `--hm-shadow` | `0 12px 44px rgba(0,0,0,.5), 0 2px 10px rgba(0,0,0,.4)` | floating layers |
| `--hm-scrim` | `18, 20, 19` | rgb of `--color-bg` |

Never set `--hm-accent` per component with a hardcoded hex — that was drift, and it is gone.

---

## 3. Status & Semantic Colors

Status is the one place a non-emerald hue is allowed. Use Tailwind palette steps directly, always as a tinted chip: `bg-<hue>-500/15 text-<hue>-400`.

| Meaning | Chip classes | Used for |
|---|---|---|
| Positive / done / hot | `bg-brand/15 text-brand` | action done, `hot` lead tier, won deal |
| Waiting on a human / warm | `bg-amber-500/15 text-amber-400` | `pending_approval`, `warm` lead tier |
| Informational / suggested | `bg-sky-500/15 text-sky-400` | agent suggestion, neutral hint |
| Needs upgrade / entitlement | `bg-fuchsia-500/15 text-fuchsia-400` | `blocked_entitlement` |
| Failure / destructive / lost | `bg-red-500/15 text-red-400` | error, lost deal, delete affordance |
| Neutral / cold | `bg-white/5 text-ink-muted` | `cold` tier, inactive |

Chip shape: `rounded px-2 py-0.5 text-[11px] font-bold` (or `rounded-full px-2.5 py-0.5 text-[12px]` for an outlined meta pill: `text-ink-muted border border-border`).

**Amber, not yellow.** `yellow-500` on `#121413` reads acidic; `amber-400` holds up. Existing `yellow-500` usages are drift ([§15](#15-known-drift)).

### Contact status — the nine chips

A contact carries exactly one `status` (`lib/crm-status.ts`), and it is the **only element of a contact-list row allowed to use colour**. Before this, a row asserted two coloured signals at once — a tier-coloured score and a grey stage pill — which let a row read "cold" and "paying client" simultaneously.

Nine hues cannot be told apart on `#121413`, so two of the nine are distinguished by **treatment** instead: `new` is the only chip with no fill, and `frozen` is the only chip with a dashed border.

| Status | Hebrew | Chip classes |
|---|---|---|
| `new` | ליד חדש | `border border-border text-ink-muted` |
| `contacted` | יצרנו קשר | `bg-sky-500/15 text-sky-400` |
| `talking` | בשיחה | `bg-indigo-500/15 text-indigo-400` |
| `proposal` | הצעה נשלחה | `bg-amber-500/15 text-amber-400` |
| `signed` | חתם | `bg-violet-500/15 text-violet-400` |
| `paid` | שולם | `bg-brand/15 text-brand` |
| `client` | לקוח פעיל | `bg-teal-500/20 text-teal-300` |
| `declined` | נדחה | `bg-red-500/15 text-red-400` |
| `frozen` | בהקפאה | `bg-slate-500/15 text-slate-400 border border-dashed border-slate-500/40` |

Chip shape: `text-[12px] font-semibold rounded-full px-2.5 py-0.5 whitespace-nowrap`.

**Three rules.**
1. **No hover state on a status chip.** That is what keeps it from reading as a button.
2. **The Hebrew label always travels with the chip.** Hue is redundant reinforcement, never the only carrier of meaning ([§12](#12-accessibility)).
3. **`paid` is the one status allowed to use emerald.** Elsewhere in the CRM emerald means *action*; money arriving is the one state that means what the brand colour means. Never extend this to a second status.

The `hot`/`warm`/`cold` tier chips above are still correct — they just no longer appear in a contact-list row. They remain in use on the contact page and in CHIEF.

---

## 4. White-Label Accent

Agency and client workspaces carry their own accent (`branding.primary_color`), so the accent is **a variable, not a constant**. `components/Nav.tsx` sets it inline on the `<header>` from the active workspace's branding, and everything in that subtree is meant to follow.

> ⚠️ **It doesn't work yet.** Nav writes `--brand` / `--brand-hover`, but this app declares its palette only in Tailwind v4's `@theme`, so `bg-brand` compiles to `var(--color-brand)` and `--brand` is defined nowhere. The override is inert today — a branded workspace still renders HELIX emerald. Fix: write `--color-brand` / `--color-brand-hover` in `headerStyle`, and lift the override from the `<header>` to the shell element that wraps the whole screen, since the accent belongs to the page, not the nav bar. Drift #10.

**Consequences for every new component:**

- Use `bg-brand` / `text-brand` / `border-brand`. Never `#10B981` in a `className` or a `style` object.
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
Primary      bg-brand hover:bg-brand-hover text-bg font-bold px-4 py-2 rounded-[10px] text-[14px]
                 disabled:opacity-50
Primary lg   bg-brand hover:bg-brand-hover text-bg font-bold px-5 py-2.5 rounded-[10px]
Secondary    border border-border hover:border-brand text-ink-secondary hover:text-ink
                 font-semibold px-4 py-2.5 rounded-[10px] transition-colors
Brand-tinted border border-brand/40 bg-brand/5 hover:bg-brand/10 text-brand
                 font-semibold px-4 py-2 rounded-[10px] text-[14px]        ← additive ("+ עסקה חדשה")
Outline      border border-brand text-brand hover:bg-brand hover:text-bg
                 font-semibold px-4 py-2 rounded-[10px] transition-colors text-[14px]
Text         text-ink-secondary hover:text-ink px-3 py-2 text-[14px]       ← cancel, dismiss
Destructive  text-ink-muted hover:text-red-400 text-[11px] px-1            ← quiet until hovered
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
                bg-white/5 text-ink-secondary shrink-0)          ← neutral, not tier-coloured
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
  off: border-border text-ink-secondary hover:text-ink      on: border-brand text-brand bg-brand/10
  aria-pressed · lucide Clock 14 · "צריך מגע (3)"
```
It narrows the in-memory rows and composes with the text filter; the count line then reads against the narrowed set.

### Contact drawer

A contact opens **beside** the list, never instead of it. `Drawer` from `lib/motion` with `side="start"` (right in Hebrew, left in English) and `width={420}`.

```txt
<Drawer open side="start" dir={dirOf(locale)} width={420}>
  <div class="h-full flex flex-col">
    header   name (font-display text-[22px] font-extrabold) + role · company
             close button (min-w-[44px] min-h-[44px], lucide X, aria-label)
    <div class="flex-1 min-h-0 overflow-y-auto" style="overscroll-behavior: contain">
      status chip + select + neutral score
      email / phone / LinkedIn   (dir="ltr" on the address and the number)
      WhatsApp: message input + brand button        (hidden, with a reason, when undialable)
      Email:    subject + body + send               (hidden, with a reason, when absent)
      deals     — region omitted entirely when there are none
      timeline  — newest first, or the Hebrew "no activity yet" line
```

Two things are load-bearing:
- **`dir={dirOf(locale)}` is required.** The drawer used to read `document.dir` during render. The server has no `document`, so it anchored the panel to one edge while the browser hid it toward the other, and React keeps the server's style on a mismatch. On 2026-09-27 that parked both the contact drawer and the "עוד" menu mid-screen at 86% opacity, eating clicks. Direction comes from the locale, which both renders know.
- **The scroll container is the inner div, not the panel.** `flex-1 min-h-0 overflow-y-auto` with `overscroll-behavior: contain`, so a long timeline scrolls without the page behind it moving.

### Kanban column & card

**Section header** (the board owns it): `flex flex-wrap items-center justify-between gap-2` with `h2 font-bold text-[18px]` "צינור עסקאות" at the start and the brand-tinted "+ עסקה חדשה" at the end (omitted for a viewer). **With zero deals, that line is the whole section**: no empty columns. The first deal added brings the grid in on revalidation.

```txt
Column  bg-bg border border-border rounded-xl p-2 min-h-[120px]
        head:  text-[12px] font-bold text-ink-secondary + count font-mono text-[11px] text-ink-muted
        total: text-[11px] text-brand font-mono
Card    bg-surface border border-border rounded-lg p-2.5
        title text-[13px] font-semibold leading-snug · sub text-[11px] text-ink-muted
        value text-[11px] text-brand font-mono
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

### Header: one primary action

A screen header carries **exactly one filled `bg-brand text-bg` action**. Occasional screens (team, API, automations) are not header buttons: they live in the CRM side menu below. There is no "עוד" overflow control any more (removed 2026-09-27 at Eran's request).

### CRM side menu (`components/CrmNavMenu.tsx`)

One list of CRM screens, on the **start edge**: the right in Hebrew, the left in English. Items, in order: אנשי קשר (the home, also active on `/crm/[id]`), אוטומציות, צוות, API. Autonomy and CHIEF are hidden from it and still work by direct URL.

```txt
≥lg   <aside class="hidden lg:block w-[220px] shrink-0 border-e border-border">
        <nav class="sticky top-16 flex flex-col gap-1.5 px-4 pt-8">
<lg   nav button  lg:hidden min-h-[44px] min-w-[44px] + lucide Menu, first thing in the nav row
      → lib/motion/Drawer side="start" width={300}, portaled to <body>
        (the nav's backdrop-blur would otherwise be the fixed panel's containing block)
Row   flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] min-h-[44px] + lucide icon
      idle    text-ink-secondary hover:text-ink hover:bg-white/5
      active  bg-white/5 text-ink font-semibold, aria-current="page"
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
         active: bg-brand/10 text-brand font-semibold · idle: text-ink-secondary hover:bg-white/5 hover:text-ink
Group    text-[11px] text-ink-muted px-3 py-1.5
```
`end-0` and `text-start`, never `right-0` / `text-left`.

### Chat (CHIEF)

```txt
User     bg-brand text-bg rounded-2xl rounded-br-sm px-4 py-2.5     self-end max-w-[85%]
Agent    bg-white/5 border border-border rounded-2xl rounded-bl-sm px-4 py-3   self-start w-full
         + speaker label: text-[11px] font-bold text-brand mb-1
Action   flex items-center gap-2 text-[13px] border-t border-border/60 pt-2
         status chip (§3) + "agent · tool" in text-ink-secondary truncate + approve/deny pushed with mr-auto
Composer sticky bottom-4 flex gap-2 bg-bg/90 backdrop-blur-md p-2 rounded-2xl border border-border
Chips    text-[14px] border border-border rounded-full px-4 py-2 hover:border-brand hover:text-brand
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

**Nav** (`components/Nav.tsx`, shared with `(stage)`): logo (or the workspace's white-label logo) · `CRM` · the account-portal link (`t.shell.portal`, opens https://my.helix.co.il in a new tab and says so in its `aria-label`) · language switch · sign-out. Every control is `min-h-[44px]`. No primary button for a signed-in user: it used to be "הכניסה שלי", which linked to the page you are on. **CHIEF is hidden** from the nav and the ⌘K routes since 2026-09-27; `/chief` still works by direct URL, and restoring it is one line in `Nav.tsx` and one in `HelixCommandBar.tsx`.

**Side menu**: `(crm)/layout.tsx` wraps the screen in `flex w-full max-w-[1280px] mx-auto` with `CrmSideNav` as the first child, so it lands on the start edge. Below `lg` it collapses to the menu button at the start of the nav (`<Nav crmMenu />`, signed-in only). See [§8](#8-components).

**Footer** (`components/Footer.tsx`): `HELIX CHIEF CRM.` + "part of HELIX." linking to https://helix.co.il. No STAGE name or tagline.

**A CRM screen renders nav, screen, footer, and nothing else.** `CursorTrail`, `FloatingBackground`, `SmoothScroll` (lenis), `CompareTray` and `ReferFloatingBadge` belong to `(stage)` and must never be imported from anything under `(crm)`. The ⌘K bar is the exception that lives in `(crm)`: it renders nothing until opened and it is the CRM's search surface, so it is off the public pages.

Next.js allows one root layout per path and every page sits under `[locale]`, so `<html>`/`<body>` stay at `app/[locale]/layout.tsx`. Neither group layout may render them.

**Workspace screen** (`dashboard/crm`): title + toolbar on one wrapping flex row → subtitle → stat row → filter + prioritized list → pipeline. Toolbar order: workspace switcher, then the one primary action last. No link out of a CRM screen may point at `/[locale]/dashboard` — that is the STAGE launch dashboard, a different product.

**Record screen** (`dashboard/crm/[id]`): back link → header (score chip + name + meta + contact links) → editable panel → related records → timeline. Timeline rows are a fixed-width uppercase type label plus `border-s border-border ps-3` body — a logical-property spine, not an icon rail.

**Chat screen** (`chief`): full-height column, centered `max-w-3xl`, sticky composer, suggestion chips as the empty state, and a graceful "not configured yet" panel when the API returns 503. Every agent-facing screen needs that third state.

**Forms**: inline expansion over modals. `+ הוסף` swaps the button for a `bg-surface border border-border rounded-2xl p-4 flex flex-wrap gap-2` row with save and cancel in place. Reach for `lib/motion/Dialog` only when the task genuinely blocks.

---

### Overlay state lives in the URL

A screen-level overlay that shows **a record** is addressed by a query parameter on the screen that owns it, and rendered by the server:

```
/[locale]/dashboard/crm?c=<contact-id>     the contact drawer over the contact list
```

The page reads `searchParams`, fetches the record inside the active-workspace check, and hands it to the client component. Back closes the overlay, the address is shareable, there is no client fetch layer, and the workspace check exists in exactly one place. An id that is not a uuid is rejected before it reaches Postgres; an id outside the workspace renders the list with a Hebrew not-found notice and HTTP 200, never a 500. Closing uses `router.replace`, not `push`, so back does not reopen what was just closed.

The full record page (`dashboard/crm/[id]`) stays as the directly linkable surface. It is what the command palette opens and what works with no JavaScript.

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
| Mobile secondary surface | `Sheet` |
| Press feedback | `Pressable` |
| Frosted floating surface | `Material` + `Scrim` |

Set `--hm-accent` on the wrapper from the brand token so motion surfaces follow white-label.

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

Closed state is **the primitive's** job: a closed `Drawer` or `Sheet` is `visibility:hidden` + `inert` from the server render onward (set when the close spring rests, cleared before the open one starts), and `Dialog` is `display:none`. Focus return after a close is **the consumer's**.

Rules: animate `transform` / `opacity` only. Nothing loops in a data view. `prefers-reduced-motion` is collapsed globally *and* per component — every new animation must survive that media query with the state still legible.

---

## 11. RTL & Bilingual

`he` (default, RTL) and `en`. `isRtl(locale)` is `locale !== 'en'`; `dir` is set on `<html>` in the locale layout.

- **Logical properties only:** `ms-*` `me-*` `ps-*` `pe-*` `start-*` `end-*` `border-s` `text-start` `inset-inline-start`. A `left`/`right`/`ml-`/`pl-` in app code is a bug.
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
- **Contrast:** `text-ink-muted` (`#869489`) on `bg-bg` is the floor, and it's for meta only. Never use it for body copy or a value the user must read.
- **No color-only meaning.** Every status chip carries a word next to its hue.

---

## 13. Icons & Emoji

- `lucide-react` is the icon set (already used across 27 components). Default `w-4 h-4`, `currentColor`, `strokeWidth` default.
- Typographic glyphs are fine for pure affordances: `‹ › ▾ ← ↗ ·`.
- **No emoji in new work.** The brand rule (no 🚀 💡 ✨ 🎯) applies inside the product too. Existing emoji in `ChiefChat`, `AutonomySwitch`, and the dashboard's Guard card are drift, not precedent.
- Logo: `HELIX CHIEF CRM` in `font-display font-black` with the period in `text-brand`. In a branded workspace the logo image replaces the wordmark at `h-7 w-auto object-contain`.

---

## 14. Anti-Patterns

- ❌ Marketing ambience over a data view: cursor trails, floating logos, blurred blobs, scroll reveals, smooth-scroll hijacking.
- ❌ Hardcoded `#10B981` (breaks white-label), or any second accent hue.
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
│   ├── crm-actions.ts            server actions (⌘K index, status write, WhatsApp log, 1:1 email)
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
│   ├── BidiParts.tsx             "a · b · c" meta line, each part a <bdi>
│   ├── CrmContactList.tsx        client-side contact filter (name · company · role · email · status)
│   ├── CrmContactDrawer.tsx      the ?c=<id> record drawer: status, WhatsApp, 1:1 email, timeline
│   ├── Crm*.tsx                  CRM surfaces (board, panel, switcher, team, keys)
│   ├── ChiefChat.tsx             chat + action trace
│   └── Skeleton.tsx
└── lib/
    ├── motion/                   spring engine + primitives + tokens.css (README inside)
    ├── crm-score.ts              0..100 lead score (from status) + tier thresholds
    ├── crm-status.ts             the nine statuses: order, legacy mirror, score weights, chip classes
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
