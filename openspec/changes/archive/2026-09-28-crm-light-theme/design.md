## Context

See proposal.md (Why). These facts in the code shape the approach, all checked on 2026-09-28:

- **The palette lives in one place: Tailwind v4's `@theme` in `app/globals.css`.**
  - `bg-bg`, `text-ink`, `border-border` and the other token utilities compile to `var(--color-*)`, so redefining a variable restyles every use.
  - Opacity modifiers (`bg-ink/5`) compile to `color-mix()` over the same variable, so they follow a redefinition too.
- **The code assumes dark in three patterns:**
  - `text-bg` as the label colour on green fills: 65 uses, about a third of them in STAGE components.
  - White overlays (`bg-white/5`, `hover:bg-white/5`): about 16 uses, mostly in CRM components.
  - Tailwind palette hues tuned for a dark background: 75 uses, 29 of them in `lib/crm-status.ts`, then ChiefChat, the deal board, the drawer, `lib/crm-tier.ts`, and red error text.
- **The motion material tokens (`--hm-*`)** are pinned to dark in `globals.css`, overriding `lib/motion/tokens.css`, whose own default is a cream light material with a dark variant behind `prefers-color-scheme`.
- **Every locale route already renders dynamically** (`ƒ` in the build). Only `/_not-found` and two image routes are static. There is no Content-Security-Policy header (`next.config.mjs`, `middleware.ts`).
- **The STAGE routes share the same tokens and the same root layout.** They include the sign-in page, and their ambience (floating logos, neon glow) was drawn for dark.
- **The automation builder uses React Flow with its default light styles** and does not pass `colorMode`.
- **`Nav.tsx` renders the language switch and sign-out**, and gets a `crmMenu` prop only in the CRM shell.

## Goals / Non-Goals

**Goals:**
- One attribute on `<html>` decides the theme, and the server renders it, so there is no flash.
- The tokens carry the theme. After the sweep, the CRM contains no colour that only works on one background: every theme-dependent colour is a token or has a `dark:` pair.
- Every text pair meets 4.5:1 in both themes, and focus rings meet 3:1, checked by a script rather than by eye.
- Nothing visible changes until the step that flips the default (task 4), so the site can deploy after every task.

**Non-Goals:**
- Following the OS setting, or saving the choice to the account (proposal, Non-goals).
- Tuning each screen's layout for light. Layout is the next six changes.
- The STAGE pages' own styling.

## Decisions

### 1. `<html data-theme>`, set by the server from a cookie

`app/[locale]/layout.tsx` reads the `crm-theme` cookie with `cookies()`. It renders `data-theme="dark"` when the value is `dark`, and `data-theme="light"` otherwise. Every locale route is already dynamic, so reading a cookie there changes no route's rendering mode.

*Rejected: an inline script that reads localStorage before paint.* This is the next-themes approach. It needs a script in `<head>` and `suppressHydrationWarning` on `<html>`, because the server renders one theme and the script swaps it. With the cookie, the server already knows.

*Rejected: following `prefers-color-scheme` when there is no choice.* Eran chose light by default.

*Rejected: saving the choice on the user's profile.* It would need a column and a read in the root layout on every request. It can come later, without changing this mechanism, by seeding the cookie at sign-in.

### 2. Light values on `@theme`, dark values under `[data-theme="dark"]`

`@theme` holds the light values, so light is the default. A plain CSS block `[data-theme="dark"] { --color-…: … }` after it restores today's values.

| Token | Light (default) | Dark (today's) | Note |
|---|---|---|---|
| `bg` | `#FAFAF8` | `#121413` | the site's background |
| `surface` | `#FFFFFF` | `#1A1C1B` | |
| `soft` | `#F4F2EE` | `#1E201F` | |
| `ink` | `#1A1A1A` | `#E2E3E1` | 16.7:1 on `bg` |
| `ink-secondary` | `#555555` | `#BBCABE` | 7.1:1 on `bg` |
| `ink-muted` | `#6E6E6E` | `#869489` | 4.9 / 5.1 / 4.6:1 on bg / surface / soft; the site's `#A8A8A8` measures 2.4:1 |
| `ink-soft` | `#C8C8C5` | `#3D4A41` | decorative separators only, never text |
| `border` | `#EBEBE8` | `rgba(255,255,255,.08)` | |
| `border-strong` | `#D8D6D2` | `rgba(255,255,255,.15)` | also the status path's "ahead" track |
| `brand` | `#10B981` | `#10B981` | fills only: buttons, the status path's `paid` bar |
| `brand-hover` | `#059669` | `#0CB475` | |
| **`on-brand`** (new) | `#121413` | `#121413` | label on green: 7.3:1 on `brand`, 4.9:1 on light `brand-hover` |
| **`brand-ink`** (new) | `#047857` | `#10B981` | green as text or a link: 5.3:1 on light `bg` |
| **`danger`** (new) | `#B91C1C` | `#F87171` | error text and the destructive fill: 6.2:1 on light `bg` |
| **`on-danger`** (new) | `#FFFFFF` | `#121413` | label on `danger`: 6.4:1 / 6.7:1 |
| **`focus`** (new) | `#047857` | `#10B981` | focus ring: 5.3:1 on light `bg` |

*Rejected: keeping `text-bg` as the button label and hoping the theme works out.* In light, `bg` is `#FAFAF8`, and a near-white label on `#10B981` measures 2.5:1. The label colour is its own role, so it gets its own token.

### 3. A `dark:` variant bound to the attribute, for hues with no token

`@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));` in `globals.css`. The status and tier maps carry both values on one line, for example `bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400`. Light chips are a `-50` fill with a `-700` label. `frozen` is `bg-slate-100 text-slate-600` with a dashed `slate-400` border, and `paid` is `bg-emerald-50 text-emerald-700`. On the status path, light bars step up to `-600`, so a bar holds 3:1 against white.

*Rejected: a CSS variable per status (18 or more tokens).* It moves each chip's look away from the one map that defines it. The `dark:` pair keeps each status on one readable line.

### 4. A mechanical sweep with fixed rules, before any visible change

| Today | Becomes | Why |
|---|---|---|
| `text-bg` on a green fill | `text-on-brand` | the label on green is dark in both themes |
| `bg-red-500/90 hover:bg-red-500 text-bg` (lost confirm) | `bg-danger hover:bg-danger/90 text-on-danger` | |
| `text-red-400` (errors) | `text-danger` | |
| `text-brand` (green as text or a link) | `text-brand-ink` | `#10B981` as text is 2.5:1 on light; `brand-ink` is `#047857` there and unchanged in dark |
| `bg-white/5`, `hover:bg-white/5`, `bg-white/10` | `bg-ink/5`, `hover:bg-ink/5`, `bg-ink/10` | `ink` flips with the theme, so the overlay reads in both |
| a raw hue in the status or tier maps | its light value + `dark:` pair | decision 3 |

With the dark values in place, the sweep renders exactly as today. That is what lets it land and deploy before the default flips.

### 5. The material tokens (`--hm-*`) per theme

The block in `globals.css` that pins `--hm-*` becomes two blocks. `:root` gets a light material: `rgba(255,255,255,.86)` surface, `#FFFFFF` solid, `rgba(26,26,26,.08)` border, a soft light shadow and a `26,26,26` scrim. `[data-theme="dark"]` keeps today's values.

Both come after the `tokens.css` import at equal specificity. So they still beat that file's `prefers-color-scheme` block in either OS mode, which is the reason the override exists.

### 6. STAGE is locked dark by a marker its own layout renders

`app/[locale]/(stage)/layout.tsx` renders `<span data-theme-lock="dark" hidden />`. Two rules key off it:
- The dark token block also matches `:root:has([data-theme-lock="dark"])`.
- The `dark:` variant also matches `:root:has([data-theme-lock="dark"]) *`.

The layout that knows its pages were drawn for dark is the one that says so, and `<html>` and `<body>` go dark with it, so no light edge shows on overscroll.

*Rejected: a middleware header per route group.* Middleware would need its own copy of which paths are STAGE, a second routing table that drifts.

*Rejected: letting STAGE go light.* Its ambience was drawn for dark, and redesigning it is out of scope.

**Consequence:** a browser without `:has()` (Firefox before 121) shows STAGE pages light. They are legacy, and that is acceptable.

### 7. The switch writes the cookie and flips the attribute; nothing reloads

`components/ThemeToggle.tsx` (client):
- It reads the current theme from `document.documentElement.dataset.theme`, which the server set.
- A press sets the new value on `<html>` and writes `crm-theme=<value>; Path=/; Max-Age=31536000; SameSite=Lax`, adding `Secure` on https.
- It dispatches a `crm-theme` window event.
- Its accessible name says what it turns on ("מצב כהה" / "מצב בהיר"), with lucide `Moon` / `Sun`, at `min-h-[44px] min-w-[44px]`.
- `Nav.tsx` renders it beside the language switch only when `crmMenu` is set, so STAGE never shows it.

If the browser refuses the cookie, the attribute still flips for the open page and the next load is light (the spec's unhappy path). No error is shown, because nothing is broken.

`lib/use-theme.ts` returns the current theme and follows that event. The automation builder passes it to React Flow's `colorMode`, and its minimap and background take the same tokens.

### 8. Contrast is checked by a script, including Tailwind's palette

Tailwind v4 defines its palette in OKLCH (`node_modules/tailwindcss/theme.css`). A scratch `npx tsx` script converts each value OKLCH → OKLab → linear sRGB, computes WCAG relative luminance, and prints every pair the spec names:
- text tokens on `bg`, `surface` and `soft`
- labels on `brand`, `brand-hover` and `danger`
- each status chip's label on its own fill
- the focus ring on `bg`

In both themes. Any pair under its threshold fails the task.

## Risks / Trade-offs

- **[Risk] A colour the sweep missed shows dark on dark, or light on light, in one theme.** → Two gates. A grep run in the verification task finds no `text-bg`, no `white/` or `black/` overlay, and no raw hue without a `dark:` pair in CRM code. Then a pass over every CRM screen in both themes.
- **[Risk] A branded workspace's logo drawn white for dark disappears on light.** → The logo image sits on the nav without a backdrop. No branded workspace could be checked from here, since production database reads are blocked. If one appears, give the logo a neutral chip. It is noted in DESIGN.md §15.
- **[Trade-off] Sign-in stays dark while the CRM is light.** → It lives in the STAGE group. Moving it into the CRM group is DESIGN.md §16's open question, and it follows the theme once it moves.
- **[Trade-off] The STAGE command center at `/dashboard` sits in the CRM group and turns light with it.** → It is legacy, and no CRM screen links to it (DESIGN.md §9). Accepted.
- **[Trade-off] The autonomy screen keeps its inline light-theme colours** (§15 row 2). → It already falls back to light values, so it looks right in light and wrong in dark, as it did before. The port stays its own cleanup.

## Migration Plan

There is no data migration and no build or pipeline change. `helix-crm/` deploys to its own App Hosting backend (`firebase deploy --only apphosting:helix-crm`), and the marketing site's static export does not include it.

1. Tasks 1 to 3 change the doc, add the tokens and run the sweep with dark values. They render as today and can deploy one by one.
2. Task 4 flips the default to light and adds the switch and the STAGE lock. From that deploy on, every CRM user sees light until they switch.
3. Rollback is to redeploy the previous revision. Theme cookies already set are ignored by the old code.
