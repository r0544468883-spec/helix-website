# HELIX Systems — Mockup Design Language

Design language for the 8 HELIX product UI mockups (`public/_mock/`). One shared
foundation keeps them consistent with each other **and** with the marketing site
(`EFFECTS.md`); a single per-product accent gives each system its own identity.

Grounded in `EFFECTS.md` + three screen-design skills (saas-ui-master,
dashboard-designer, Dammyjay interface-design).

## Files
- `public/_mock/mock.css` — shared tokens (dark **and** light) + components. Class names are stable; only values change per theme.
- `public/_mock/theme.js` — injects the sun/moon toggle into `.top-right`, persists choice (`localStorage`), respects `prefers-color-scheme`, supports `?theme=light|dark` override (used for screenshots).
- `public/_mock/icons.svg` — Lucide SVG sprite. **No emoji as icons** — use `<svg class="i"><use href="/_mock/icons.svg#ic-NAME"/></svg>`.
- `public/_mock/_system.html` — the living palette/spec board.
- `public/_mock/index.html` — gallery of all 8.
- `public/_mock/<slug>.html` + `<slug>-2..5.html` — **5 screens per product (40 total)**. View list per product is in the gallery's `PRODUCTS` array.

## The 40 screens (5 per product)
- **marketing-ops**: לוח בקשות · עורך תוכן AI · ערכת מותג · 9 ערוצים · אנליטיקס
- **sdr**: לוח בקרה · Unibox · כרטיס ליד · Playbook · אישורים
- **geo**: GEO Monitor · GSC Intelligence · עורך מאמרים · ציטוטי AI · אתרים
- **dashboards**: שיווק · מכירות · פיננסים · בונה Widgets · דיג׳סט
- **forms**: תור מסמכים · תבניות · בונה טפסים · חתימה מהנייד · מעקב
- **reputation**: ביקורות · תגובות AI · מקורות · וידג׳ט · טרנדים
- **assistant**: שיחות · ידע · אוטומציות · לידים · הטמעה
- **growth-doctor**: אבחון · מפת חום · ניסויים · קוהורטות · שאל את ה-Doctor

## Foundation (shared, both themes)
Surfaces step ~5% in lightness (Linear/Vercel-style elevation).

| Token | Dark | Light |
|-------|------|-------|
| `--bg` canvas | `#101312` | `#EDF1EF` |
| `--s1` card | `#181B1A` | `#FFFFFF` |
| `--s2` raised | `#1E2220` | `#F6FAF8` |
| `--s3` popover | `#242926` | `#FFFFFF` |
| `--input` (inset, darker) | `#0C0F0E` | `#EDF1EF` |
| `--ink` / `--ink-2` / `--ink-3` | `#E6E7E5` / `#B4C0B7` / `#7E8C82` | `#0E1A14` / `#3B4A42` / `#657468` |
| `--line` | `rgba(255,255,255,.07)` | `rgba(6,35,26,.09)` |

Brand (HELIX signature, ~10% accent role): `--brand #10B981`, `--neon #16FFAB`, text-on-dark `--brand-text #34D399` (light: `#059669`).
Semantic (shared): success/warn/danger/info, auto-remapped per theme for contrast.

## Per-product accent (`--ac` on `<html>`) — 60% neutral / 30% emerald / 10% accent
| Product | slug | `--ac` | world |
|---------|------|--------|-------|
| Marketing OPS | `marketing-ops` | `#A78BFA` violet | creativity/content |
| SDR | `sdr` | `#38BDF8` sky | outbound signal |
| RANK (GEO/SEO) | `geo` | `#FBBF24` gold | ranking/search |
| DASHBOARDS | `dashboards` | `#60A5FA` blue | BI/data |
| SIGN (Forms) | `forms` | `#2DD4BF` teal | trust/documents |
| REPUTATION | `reputation` | `#FB7185` rose (+gold stars) | sentiment |
| ASSISTANT | `assistant` | `#10B981` emerald-core | conversation |
| GROWTH DOCTOR | `growth-doctor` | `#34D399` green (+`--danger` red for leaks) | health/diagnosis |

## Craft rules applied (from the skills)
- **Insight headlines**, not labels: "הכנסה ₪284K — עלייה של 12%", not "דשבורד".
- **Hierarchy via weight+color**, not size alone. KPI value = Rubik 900 + tabular-nums; label = muted/tracked/uppercase; delta = semantic color.
- One focal point per view; F-pattern (hero KPI top-start).
- Dark-mode accents shifted lighter (300/400); light-mode accent text darkened via `color-mix`.
- SVG icons only; ellipsis menus for row actions; `--input` inset darker.

## Light/Dark
Default dark. Every mockup carries the toggle (auto-injected). Same layout, two palettes.

## Regenerating screenshots
Serve locally (`npm run dev`, port 3000). Batch-capture all 40 via a Node script using
the npx-cached `playwright-core` (`import(pathToFileURL('…/playwright-core/index.js'))`,
then `(pw.default ?? pw).chromium`), viewport 1440×900 `deviceScaleFactor:2`, `?theme=dark`.
Output: `product-demos/<slug>-<n>.jpg` (n=1 is the main screen). This avoids the Playwright-MCP
screenshot-surface freeze (identical md5 after many captures) — the MCP needs `browser_close`+re-navigate to reset.
Use `?theme=light` for light-mode captures.
