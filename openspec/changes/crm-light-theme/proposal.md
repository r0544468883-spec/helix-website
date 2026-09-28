## Why

Eran works in the CRM for hours a day, and it has only one look: dark (`#121413`). The CRMs he measures it against open light and offer dark as a choice: Attio, Folk, Pipedrive, HubSpot. HELIX's own palette, on the website, is light and calm, so the CRM does not read as the same company. On 2026-09-28 Eran decided: **light by default, with dark kept as an option.** This is the first of seven redesign changes (then sidebar, Today, people views, companies, the HubSpot-style person page, deals and tasks). It goes first because it touches every screen once, so every later change is built in its final colours.

Two facts make this more than swapping a palette:
- **The code assumes a dark background in 60 or so places.** Green buttons use `text-bg` for their text, which would turn light-on-green, and some hover and chip backgrounds are white overlays. Status chips use hues tuned for dark (`text-sky-400` and the like), and error text uses `text-red-400`.
- **The website's light palette fails contrast in two places.** Its grey `#A8A8A8` and its green text `#10B981` measure 2.4:1 and 2.5:1 on white, below the 4.5:1 that ת"י 5568 requires. The green focus ring would measure 2.4:1 on a light background, below the 3:1 a focus indicator needs.

**Surface: `helix-crm/` only.** No database migration, no API change, nothing on the marketing site.

## What Changes

- **Light is the default.** Every CRM screen opens light the first time, whatever the operating system's setting. That covers home, drawer, full contact page, automations, team, API, email and ⌘K.
- **Dark is one switch away.** A sun/moon switch in the nav, beside the language switch, turns the whole CRM dark at once without a reload. The choice is kept in a cookie, so the next page loads in the chosen theme from its first paint, with no flash of the other one. When the sidebar lands (next change), the switch moves into its footer.
- **Colours become theme tokens.** Background, surface, ink, borders and the brand keep their names and get a value per theme. Four tokens are added where the code borrowed one:
  - `on-brand`: the text on green buttons. It is dark in both themes, 7.3:1.
  - `brand-ink`: green used as text or a link. `#047857` in light (5.3:1), unchanged in dark.
  - `danger` and `on-danger`: error text and the destructive button.
  - `focus`: the focus ring, which is `brand-ink` in light.
- **Light contrast is fixed at the source.** Muted text is `#6E6E6E` (4.6:1 or better on every light surface) instead of the site's `#A8A8A8`.
- **Status chips get a light version with the same meaning.** Each is a pale fill with dark text (for example `bg-sky-50 text-sky-700`), and each keeps its dark version. `paid` stays the one green status, `new` stays the only chip with no fill, and `frozen` stays the only dashed one.
- **Overlays follow the theme.** The drawer, sheet, dialog and ⌘K switch to a light frosted surface in light.
- **The automation canvas** follows the theme instead of always showing React Flow's light default.
- **The STAGE directory stays dark.** Those legacy pages were built for dark, and this change does not redesign them. Their layout locks them to dark. That includes the sign-in page, which still lives in that group.

## Capabilities

### New Capabilities
- `crm-theme`:
  - light by default, dark by choice
  - how the choice is remembered, with no flash of the other theme
  - legibility (contrast) in both themes
  - overlays and the automation canvas following the theme
  - the STAGE pages staying dark

### Modified Capabilities
- `crm-shell`: the signed-in nav adds the theme switch to its controls.
- `crm-contact-status`: the nine status chips stay distinct and legible in both themes, not only in dark.

## Impact

**Styles:**
- `helix-crm/app/globals.css`: the token set per theme (`:root` light, `[data-theme="dark"]` dark), the new tokens, a Tailwind `dark:` variant bound to the theme attribute, the motion material tokens (`--hm-*`) per theme, the focus ring, the text selection colour and the skip link.
- `lib/motion/tokens.css`: unchanged. `globals.css` keeps overriding it, now per theme.

**Theme plumbing:**
- `app/[locale]/layout.tsx` reads the theme cookie and renders `<html data-theme>`. Every locale route already renders dynamically, so nothing becomes dynamic that was not.
- A new theme switch component goes in `components/Nav.tsx`, shown only in the CRM shell.
- `app/[locale]/(stage)/layout.tsx` locks its pages to dark.

**Components:**
- The sweep swaps `text-bg` on green for `text-on-brand` (65 places), white overlays for ink-based ones (about 16), and `text-red-400` / `bg-red-500` for the danger tokens.
- The chip maps in `lib/crm-status.ts` and `lib/crm-tier.ts` get their light/dark pairs.
- `components/AutomationBuilder.tsx` passes the theme to React Flow.

**i18n:** the switch's label in `lib/i18n/he.ts` and `en.ts`.

**Docs:**
- `helix-crm/DESIGN.md`: §1's founding line ("dark, dense, and quiet") becomes "light by default, dark by choice; dense and quiet". §2, §3, §8, §12 and §14 change with it, and §15 gets updates.
- Per the doc's own rule, the doc changes first, with Eran's sign-off recorded.

## Non-goals

- **No layout change.** The sidebar, Today, people views, companies, person page, deals and tasks are the six changes that follow. This one changes colour only.
- **No automatic theme from the operating system.** Eran chose light by default. Following the OS can be added later as a third option.
- **No theme saved to the account.** The choice lives in this browser. A second device starts light.
- **No redesign of the STAGE pages,** and no moving sign-in and onboarding into the CRM (DESIGN.md §16 keeps that open).
- **No new brand colour.** Emerald `#10B981` stays the action colour; only its role as text gets a darker partner for contrast.
- **The autonomy screen's own inline colour system (DESIGN.md §15 row 2) is left as it is.** The screen is hidden from navigation, and porting it is its own cleanup.
