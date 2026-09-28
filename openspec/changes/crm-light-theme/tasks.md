## 1. The system change, written down first

- [x] 1.1 Rewrite `helix-crm/DESIGN.md` before any code, recording Eran's sign-off (2026-09-28, light by default, dark by choice):
  - **§1:** the founding line becomes "light by default, dark by choice; dense and quiet".
  - **§2:** the token table for both themes, including the five new tokens (design decision 2).
  - **§3:** the light and dark chip pairs for the nine statuses, the tiers and the semantic chips (decision 3).
  - **§8:** buttons use `text-on-brand`, and the destructive fill uses `danger` / `on-danger`.
  - **§12:** 4.5:1 for text and 3:1 for focus, per theme.
  - **§14:** new anti-patterns: `text-bg` on green, `white/` and `black/` overlays, and a raw hue without a `dark:` pair.
  - **§15:** add the white-logo risk, and keep row 2.
  - Bump `Last updated`.

  Verify that each section says so and the doc still reads top to bottom.
  - Done 2026-09-28. The header, §1, §2, §3, §8, §12, §13, §14 and §15 now describe two themes.
    - The contrast script (the one 4.1 will run) was written first, so the doc carries measured values only: every pair passes, and the tightest are light muted on soft (4.56) and the `proposal` chip (4.87).
    - The class strings across the doc were renamed ahead of the code: `text-on-brand`, `text-brand-ink`, `text-danger`, `bg-ink/N`.
    - The logo's period keeps `text-brand` as the mark, which the doc says.
    - §15 row 12 records the white-logo risk.

## 2. Tokens and the sweep (the CRM still renders dark, exactly as today)

- [x] 2.1 In `helix-crm/app/globals.css`, make the tokens theme-aware, with nothing visible changing yet:
  - `@theme` holds the light values plus `on-brand`, `brand-ink`, `danger`, `on-danger` and `focus`.
  - A `[data-theme="dark"]` block holds today's values and the new tokens' dark values.
  - The `--hm-*` material tokens get a light `:root` block and a dark `[data-theme="dark"]` block, both after the `tokens.css` import.
  - Add `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));`.
  - The focus ring, text selection and skip link move to tokens.
  - `app/[locale]/layout.tsx` renders `data-theme="dark"` for now.

  Verify:
  - `cd helix-crm && npx tsc --noEmit && npm run build` exits 0.
  - The built CSS under `.next/static/css` contains `[data-theme=dark]` and `--color-on-brand`.
  - Done 2026-09-28: tsc and build exit 0. The built CSS contains `[data-theme=dark]`, `--color-on-brand`, `--color-brand-ink`, `--color-danger`, `data-theme-lock` and `--hm-scrim`. Nothing in the code used `dark:` before; the compiled `dark:` rules come from DESIGN.md's tables, which Tailwind v4 scans. The page is pinned to `data-theme="dark"`, so nothing looks different yet.
- [x] 2.2 Sweep A, labels and errors (decision 4):
  - Every `text-bg` on a green fill becomes `text-on-brand`, STAGE components included (the value is the same `#121413` there).
  - The two lost-deal confirm buttons become `bg-danger hover:bg-danger/90 text-on-danger`.
  - Every `text-red-400` becomes `text-danger`.
  - Every `text-brand` (green used as text or a link, `hover:` included) becomes `text-brand-ink`: 145 places, a third of them in STAGE pages, where the value stays `#10B981`. Added 2026-09-28: the bright green as text measures 2.5:1 on light.

  Verify:
  - No `text-bg` remains on a green or red fill. Corrected 2026-09-28: four `bg-ink text-bg` inverted chips (PostForm and three STAGE pages) keep `text-bg` on purpose, because an inverted pair reads correctly in both themes.
  - `grep -rn "text-red-400" helix-crm/components helix-crm/app` returns nothing.
  - `grep -rnE "text-brand([^-]|$)"` finds only the three logo periods (Nav, Footer, a STAGE one-pager), which keep bright green as the mark.
  - Done 2026-09-28: 80 files swept. That covered 59 labels on green → `text-on-brand`, 2 lost-deal confirms → danger tokens, 26 `text-red-400` → `text-danger` and 122 `text-brand` → `text-brand-ink`. The gate script finds nothing left, and tsc and build exit 0. In dark every new token equals today's value, so nothing looks different.
  - tsc and build pass.
- [x] 2.3 Sweep B, overlays and hues:
  - `bg-white/N`, `hover:bg-white/N` and any `black/` overlay in CRM code become `bg-ink/N`.
  - `STATUS_BADGE`, `STATUS_TEXT` and `STATUS_BAR` in `lib/crm-status.ts`, and `TIER_BADGE` / `TIER_TEXT` in `lib/crm-tier.ts`, get their light values with `dark:` pairs (decision 3; light path bars at `-600`).
  - So do the remaining raw hues in `ChiefChat.tsx`, `CrmTeamManager.tsx`, `CrmApiKeys.tsx`, `AutomationBuilder.tsx` and `CampaignComposer.tsx`.

  Verify:
  - `grep -rnE "(bg|text|border)-(white|black)(/|\b)" helix-crm/components helix-crm/lib helix-crm/app/[locale]/(crm)` returns nothing.
  - A scratch `npx tsx` check over those files finds no palette-hue class without a `dark:` twin in the same class string.
  - tsc and build pass.
  - Done 2026-09-28: tsc and build exit 0.
    - Overlays: 11 `bg-white/N` became `bg-ink/N`, in the menu, the path, the list's and drawer's score chips, the workspace switcher, the automation picker, the ChiefChat bubble and the cold tier. Two stay by design: a video letterbox (`bg-black`) and a STAGE modal backdrop (`bg-black/70`), both of which darken in both themes.
    - The overlay grep finds nothing else.
    - The pair-check script finds 2 unpaired hues in the whole app, both in the `(stage)` route group, which is locked dark.
    - Also fixed: the API screen's two buttons had white text on green (2.5:1 in either theme), now `text-on-brand`. The automation builder's `text-yellow-500` became amber (§3 already called yellow drift).
    - `bg-brand/15 text-brand-ink` chips stay as they are: 4.76:1 on light, which 4.1 re-measures.

## 3. The switch (the visible change: light becomes the default)

- [x] 3.1 Turn the theme on:
  - `app/[locale]/layout.tsx` reads the `crm-theme` cookie with `cookies()`: `dark` when the value is `dark`, `light` otherwise.
  - Add `components/ThemeToggle.tsx` and `lib/use-theme.ts` (decision 7). The toggle writes the cookie, flips the attribute and dispatches the `crm-theme` event. Its name is "מצב כהה" / "מצב בהיר" (keys `themeDark` / `themeLight` in `lib/i18n/he.ts` and `en.ts`), and it is `min-h-[44px] min-w-[44px]` with lucide `Moon` / `Sun`.
  - `components/Nav.tsx` renders the toggle beside the language switch only when `crmMenu` is set.
  - `app/[locale]/(stage)/layout.tsx` renders the `data-theme-lock="dark"` marker. `globals.css` matches `:root:has([data-theme-lock="dark"])` in the dark block and in the `dark:` variant (decision 6).

  Verify:
  - tsc and build pass.
  - After deploy, `curl -s https://crm.helix.co.il/he/login` shows `data-theme="light"` and `data-theme-lock="dark"`, and the sign-in page still renders dark.
  - Done 2026-09-28: tsc and build exit 0. Verified before deploy, on a local production server (`next start`):
    - `/he/login` sends `data-theme="light"` with the lock marker. With `crm-theme=dark` it sends `data-theme="dark"`, and a nonsense value gives light.
    - In Chrome, the locked sign-in page paints dark: body `rgb(18,20,19)`, text `rgb(226,227,225)`, dark material. The STAGE nav shows no switch.
    - With the marker removed, the light tokens render: body `rgb(250,250,248)`, text `rgb(26,26,26)`, white material.
    - Setting `data-theme="dark"` turns it dark again.
    - Also added: `lib/theme.ts` holds the cookie name, the event name and `themeFrom()`, shared by the layout, the nav and the hooks. The nav reads the cookie too, so the switch's first render already shows the right icon.
- [x] 3.2 `components/AutomationBuilder.tsx` passes `useTheme()` to React Flow's `colorMode`, and its minimap and background use the tokens. Verify tsc and build pass. The canvas check in both themes happens in 4.3.
  - Done 2026-09-28: tsc and build exit 0. The automation page reads the theme cookie and passes it as `initialTheme`, so the canvas's first render matches the page. `useTheme()` then follows the switch. The minimap already used `!bg-surface`, which follows the theme. The on-screen check in both themes moves to 4.3.
- [x] 3.3 Finish `helix-crm/DESIGN.md`:
  - **§9:** the nav lists the theme switch, and it moves to the sidebar footer in the next change.
  - **§10:** the material tokens per theme.
  - **§11:** direction and alignment are the same in both themes.
  - **§17:** `ThemeToggle.tsx` and `lib/use-theme.ts`.
  - Bump `Last updated`.

  Verify the sections match the code.
  - Done 2026-09-28. §9's nav lists the theme switch (CRM shell only, with its name and size, and a note that it moves to the sidebar). §10 says overlays follow the theme through `--hm-*` and names React Flow's `colorMode` as the one surface that styles itself. §11 says direction does not change with the theme. §17 lists `ThemeToggle.tsx`, `lib/theme.ts` and `lib/use-theme.ts`. `Last updated` is 2026-09-28. Checked against the code: the nav renders the switch only with `crmMenu`, and the builder passes `colorMode={theme}`.

## 4. Verification

- [x] 4.1 Contrast (decision 8). A scratch `npx tsx` script reads the OKLCH palette from `helix-crm/node_modules/tailwindcss/theme.css` and the hex tokens from `globals.css`, then prints each spec pair with its ratio, in both themes:
  - text tokens on `bg`, `surface` and `soft`
  - labels on `brand`, `brand-hover` and `danger`
  - `brand-ink` and `danger` text on `bg`
  - each of the nine status labels on its own fill
  - the focus ring on `bg`

  Every text pair must be ≥ 4.5 and the focus ring ≥ 3.0. Verify the script prints no FAIL.
  - Done 2026-09-28: 87 pairs across both themes, ALL PASS, exit 0.
    - The script measures the classes the code actually uses: `paid` and `declined` on the `brand-ink` / `danger` tokens, the `bg-brand/15` and `bg-brand/10` green chips, and the status text on the drawer surface.
    - Tightest in light: green chip 4.76, muted on soft 4.56, `proposal` chip 4.87, amber path bar 3.19 (graphics floor 3).
    - The script lives in the session scratchpad. Committing it (for example as `helix-crm/scripts/check-contrast.ts`) would let later changes run it too.
- [x] 4.2 Gates: `cd helix-crm && npx tsc --noEmit && npm run build`. Both must exit 0.
  - Done 2026-09-28: tsc exit 0, build exit 0, and no errors or warnings in the build log. `/[locale]/dashboard/crm` is unchanged at 13.8 kB (first load 145 kB).
- [ ] 4.3 After `firebase deploy --only apphosting:helix-crm`, on https://crm.helix.co.il (signed in):
  - Walk every scenario in the three delta specs under `openspec/changes/crm-light-theme/specs/`, in Hebrew and English, at 1440×900 and 390×844, first light and then dark.
  - Cover every CRM screen: home, drawer, full contact page, automations with the canvas, team, API, email and ⌘K.
  - Check that the choice survives a reload, which the server HTML's `data-theme` shows.
  - Check that a browser refusing cookies falls back to light on the next load.
  - Check that `/he/login` stays dark.

  Report any scenario that could not be verified instead of skipping it.
