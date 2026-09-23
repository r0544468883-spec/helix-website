# HELIX CHIEF CRM — Design System

> Source of truth for design decisions inside the **software** (`helix-crm/`).
> The marketing site has its own system: `../DESIGN.md` (light theme) and `../EFFECTS.md` (the 60-effect marketing library).
> **They are not interchangeable.** The CRM is dark, dense, and quiet. Last updated: 2026-09-23.

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
| Metric | `font-mono text-[24px] font-bold` | stat tile value |

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
| `max-w-[1280px]` | nav bar only |
| `max-w-[1100px]` | CRM workspace: pipeline, index + board (`dashboard/crm`) |
| `max-w-[900px]` | command center (`dashboard`) |
| `max-w-[820px]` | single record, reading-shaped screens (`dashboard/crm/[id]`) |
| `max-w-3xl` | CHIEF chat |
| `max-w-[680px]` | empty / setup-pending / gate states, centered |

Horizontal padding is always `px-5 md:px-10`. Vertical is `pt-12 pb-16` on workspace screens (`pt-20` on centered empty states).

### Rhythm

- Title → subtitle: `mb-2` then `mb-8` under the subtitle.
- Between major sections: `mb-12`.
- Inside a card: `p-4` (dense) / `p-5` (standard) / `p-10` (empty state).
- Grid and stack gaps: `gap-2` (rows in a list) / `gap-3` (tiles, toolbar) / `gap-4` (cards).
- Closing back-link on a sub-screen: `mt-10 pt-6 border-t border-border`.

### Grids

- Stat row: `grid grid-cols-2 md:grid-cols-5 gap-3` (three tiles: `grid-cols-3 gap-4`).
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

### Stat tile

```txt
<div class="bg-surface border border-border rounded-2xl p-4 text-center">
  <div class="font-mono text-[24px] font-bold text-ink">…</div>   (accent metric: text-brand)
  <div class="text-[12px] text-ink-secondary mt-1">label</div>
</div>
```
At most **one** accent metric per stat row. If everything is emerald, nothing is.

### Record row (the CRM workhorse)

```txt
<Link class="flex items-center gap-3 bg-surface border border-border rounded-xl p-3
             hover:border-brand transition-colors">
  score chip (font-mono font-bold text-[15px] w-12 text-center rounded-lg py-1 + tier chip classes)
  tier label (text-[11px] font-bold uppercase w-14)
  <div class="min-w-0 flex-1">  name text-[15px] font-semibold
                               meta text-ink-secondary text-[13px] truncate  (joined with " · ")
  stage pill (text-[12px] text-ink-muted border border-border rounded-full px-2.5 py-0.5)
```
Fixed-width leading columns (`w-12`, `w-14`) are what makes a stack of rows scan like a table. Keep them.

### Kanban column & card

```txt
Column  bg-bg border border-border rounded-xl p-2 min-h-[120px]
        head:  text-[12px] font-bold text-ink-secondary + count font-mono text-[11px] text-ink-muted
        total: text-[11px] text-brand font-mono
Card    bg-surface border border-border rounded-lg p-2.5
        title text-[13px] font-semibold leading-snug · sub text-[11px] text-ink-muted
        value text-[11px] text-brand font-mono
        controls: ‹ › advance/retreat + quiet lose action pushed out with ms-auto
```

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
                  of the screen (title bar, stat row, N rows) in app/[locale]/dashboard/loading.tsx
Gate / pending    max-w-[680px] mx-auto px-5 md:px-10 pt-20 text-center, one sentence, one exit
```
A skeleton must match the layout it replaces. A generic three-box shimmer that then reflows is worse than nothing.

---

## 9. Screen Patterns

**Workspace screen** (`dashboard/crm`): title + toolbar on one wrapping flex row → subtitle → stat row → prioritized list → pipeline → back link. Toolbar order: workspace switcher, then secondary links (אוטומציות, API, צוות), then the one primary action last.

**Record screen** (`dashboard/crm/[id]`): back link → header (score chip + name + meta + contact links) → editable panel → related records → timeline. Timeline rows are a fixed-width uppercase type label plus `border-s border-border ps-3` body — a logical-property spine, not an icon rail.

**Chat screen** (`chief`): full-height column, centered `max-w-3xl`, sticky composer, suggestion chips as the empty state, and a graceful "not configured yet" panel when the API returns 503. Every agent-facing screen needs that third state.

**Forms**: inline expansion over modals. `+ הוסף` swaps the button for a `bg-surface border border-border rounded-2xl p-4 flex flex-wrap gap-2` row with save and cancel in place. Reach for `lib/motion/Dialog` only when the task genuinely blocks.

---

## 10. Motion

`lib/motion/` is the shared in-app motion system (ported from Apple's *Designing Fluid Interfaces*, zero dependencies). Read `lib/motion/README.md` before animating anything. Springs take `(damping, response)` — **never a duration**.

| Use | Primitive |
|---|---|
| List/table reorders, stage moves | `useFlip` — rows flow to their new position (already on `CrmDealBoard`) |
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

Rules: animate `transform` / `opacity` only. Nothing loops in a data view. `prefers-reduced-motion` is collapsed globally *and* per component — every new animation must survive that media query with the state still legible.

---

## 11. RTL & Bilingual

`he` (default, RTL) and `en`. `isRtl(locale)` is `locale !== 'en'`; `dir` is set on `<html>` in the locale layout.

- **Logical properties only:** `ms-*` `me-*` `ps-*` `pe-*` `start-*` `end-*` `border-s` `text-start` `inset-inline-start`. A `left`/`right`/`ml-`/`pl-` in app code is a bug.
- **`dir="auto"` on every field that renders user data** — names, company names, deal titles, activity bodies, workspace names. Mixed Hebrew/Latin content otherwise flips punctuation.
- **`dir="ltr"` on email, phone, URLs, and numeric inputs**, including the ones inside an RTL form.
- Strings live in `lib/i18n/he.ts` and `en.ts` (typed by `Dict`) — never inline a user-visible string in a component. Existing hardcoded Hebrew in `Nav`/`CrmWorkspaceSwitcher` is drift.
- Dates go through `formatDate(value, locale)`; currency is `₪${n.toLocaleString()}` in `font-mono`.
- Verify a new screen in Hebrew first. Drawers, resizers, and dropdowns resolve their physical edge from `document.dir` at runtime.

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
| 1 | `app/[locale]/dashboard/crm/page.tsx`, `dashboard/crm/[id]/page.tsx` | `warm` tier uses `yellow-500` while `ChiefChat` uses `amber-400/500` | standardize on amber ([§3](#3-status--semantic-colors)) |
| 2 | `components/HelixCommandBar.tsx:8`, `ReferFloatingBadge.tsx:11`, `GtmSettingsForm.tsx:57,88` | `#10B981` hardcoded | read `--color-brand`, or accept an `accent` prop |
| 3 | `components/AutonomySwitch.tsx` | full inline-style system with its own `--panel/--line/--ink-2` light-theme fallbacks | port to app tokens + Tailwind classes |
| 4 | `components/ChiefChat.tsx`, `AutonomySwitch.tsx`, `dashboard/page.tsx` | emoji as UI (🧠 💡 📩 🤖 🛡️) | lucide icons |
| 5 | `components/CrmWorkspaceSwitcher.tsx` | `window.prompt` + `window.alert` for creating a client workspace | inline form + inline error |
| 6 | `components/Nav.tsx`, `CrmWorkspaceSwitcher.tsx`, `dashboard/crm/page.tsx` | hardcoded Hebrew ("האיזור האישי", "הכניסה שלי", "אוטומציות", "הוסף לקוח") | move into `lib/i18n` |
| 7 | `app/[locale]/layout.tsx` | `CursorTrail`, `FloatingBackground`, `SmoothScroll`, `CompareTray`, `ReferFloatingBadge` render on `/dashboard/**` and `/chief` too | see [§16](#16-open-decisions) |
| 8 | `components/Skeleton.tsx` consumers | some `loading.tsx` shapes don't match their screen | match the real layout |
| 9 | `lib/motion/tokens.css` | `--hm-surface` defaults to a light warm surface; dark only via `prefers-color-scheme` | set the dark values explicitly for this app, which is dark regardless of OS |
| 10 | `components/Nav.tsx:29` | white-label accent override writes the undefined `--brand`; Tailwind v4 reads `--color-brand`, so branded workspaces never re-accent | write `--color-brand`/`--color-brand-hover`, and move the override up to the screen wrapper ([§4](#4-white-label-accent)) |

---

## 16. Open Decisions

**The app shell still wears STAGE's marketing clothes.** `app/[locale]/layout.tsx` wraps every route — CRM and CHIEF included — in `CursorTrail`, `FloatingBackground` (26 floating tool logos plus emerald blobs), Lenis smooth scroll, `CompareTray`, and `ReferFloatingBadge`.

`lib/motion/README.md` draws the line itself: *"Scope: inside the software, not marketing pages."* A recommendation, for Eran to confirm since it's a brand call: split the layout — public STAGE routes keep the ambience, `(app)` routes (`dashboard/**`, `chief`, `onboarding`) get a clean shell with nav, main, and the ⌘K bar. It also removes a canvas `requestAnimationFrame` loop and ~26 images from every CRM page load.

Second, smaller: **`--color-neon` has no consumer** beyond `.cta-glow`'s shadow. Either keep it documented as glow-only (as above) or drop it.

---

## 17. File Map

```
helix-crm/
├── DESIGN.md                     ← this file
├── app/
│   ├── globals.css               tokens (@theme), focus, skip-nav, effect classes
│   ├── carousel.css              STAGE carousel only
│   └── [locale]/
│       ├── layout.tsx            fonts, dir/lang, app shell (see §16)
│       ├── chief/page.tsx        CHIEF chat screen
│       └── dashboard/
│           ├── page.tsx          command center
│           ├── loading.tsx       skeleton shape
│           └── crm/…             index, [id], team, api, autonomy
├── components/
│   ├── Nav.tsx                   nav + white-label accent override
│   ├── HelixCommandBar.tsx       ⌘K
│   ├── Crm*.tsx                  CRM surfaces (board, panel, switcher, team, keys)
│   ├── ChiefChat.tsx             chat + action trace
│   └── Skeleton.tsx
└── lib/
    ├── motion/                   spring engine + primitives + tokens.css (README inside)
    └── i18n/{he,en}.ts           every user-visible string
```

Related: `../DESIGN.md` (website, light), `../EFFECTS.md` (marketing effects, `§25` is the in-app motion entry), `../docs/BRAND.md` (brand system), `../docs/VOICE.md` (Hebrew voice), `../CLAUDE.md` (project rules).

> `helix-crm/` is a git subtree of `r0544468883-spec/helix-crm`. Edits here travel upstream on the next subtree push.

---

## 18. New Screen Checklist

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
- [ ] Route added to `components/HelixCommandBar.tsx` `ROUTES`
- [ ] Nothing from [§14](#14-anti-patterns)
- [ ] **This doc updated in the same commit** — new specs written in, drift rows added or removed, `Last updated:` bumped
