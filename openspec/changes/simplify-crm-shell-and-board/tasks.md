All paths are relative to `helix-crm/`. This change touches no file outside it.
Build verification throughout is `cd helix-crm && npm run build`; the dev server is not proof.

## 1. Split the shell into route groups

- [x] 1.1 Check `git log helix-crm/` against the subtree remote for upstream commits touching `app/[locale]/`, and report before moving anything — verify by naming the upstream HEAD compared against, or stating that the subtree is level
- [x] 1.2 Create `app/[locale]/(crm)/` and `app/[locale]/(stage)/`, and `git mv` `dashboard/` and `chief/` into `(crm)`, and the other 24 page directories into `(stage)`, leaving `layout.tsx` and `page.tsx` at `app/[locale]/` — verify with `git status` showing renames, not delete-plus-add
- [x] 1.3 Reduce `app/[locale]/layout.tsx` to `<html>`, `<body>`, the three fonts, `globals.css` and the skip-nav link, moving `Nav`, `Footer` and the five chrome components out of it — verify `npm run build` succeeds
- [x] 1.4 Create `app/[locale]/(stage)/layout.tsx` rendering exactly what the old layout rendered below `<body>`: `SmoothScroll`, `CursorTrail`, `FloatingBackground`, `Nav`, `main`, `Footer`, `CompareTray`, `ReferFloatingBadge` — verify `/he/launches` renders with the cursor trail and floating logos present
- [x] 1.5 Create `app/[locale]/(crm)/layout.tsx` rendering `Nav`, `main`, `Footer` and nothing else — verify `/he/dashboard/crm` renders with no cursor-trail canvas, no floating logo layer, no compare tray and no refer pill in the DOM
- [ ] 1.6 (routing verified unauthenticated: protected routes 307 to /he/login, public 200, no group in any URL; the 200 half needs a signed-in session) Load each of `/he/dashboard/crm`, `/he/dashboard/crm/team`, `/he/dashboard/crm/api`, `/he/dashboard/crm/autonomy`, `/he/dashboard/crm/<a real id>`, `/he/chief`, `/he/launches`, `/he/categories`, `/he/compare` and confirm each returns 200 with no new redirect — this is the gate the design names before any behavioural work starts

## 2. Fix the motion tokens so overlays are dark

- [x] 2.1 Import `lib/motion/tokens.css` once from `app/globals.css` and override `--hm-surface`, `--hm-surface-solid`, `--hm-border`, `--hm-shadow`, `--hm-scrim` and `--hm-accent` at `:root` unconditionally with the CRM dark values — verify by opening the command palette with the OS set to light mode and seeing a dark panel
- [x] 2.2 Remove the per-component `import '@/lib/motion/tokens.css'` and the local `ACCENT` constant from `components/HelixCommandBar.tsx` — verify the palette still renders with the brand accent on its highlighted row
- [ ] 2.3 Confirm the palette renders a solid dark panel with no blur under `prefers-reduced-transparency: reduce` — verify by toggling the emulation in devtools

## 3. Navigation hierarchy and the CRM's own header

- [x] 3.1 Replace the three outline links in the board header with one overflow control backed by `lib/motion/Drawer`, listing team, API keys, autonomy and automations — verify all four destinations load from the drawer, autonomy included
- [ ] 3.2 Confirm the drawer closes on Escape and returns focus to the control that opened it, and that it enters from the inline-start edge under `rtl` — verify by keyboard on `/he/dashboard/crm`
- [x] 3.3 Remove the footer back-link to `/[locale]/dashboard` from `app/[locale]/(crm)/dashboard/crm/page.tsx` — verify no CRM screen reaches the launch dashboard by following links only
- [ ] 3.4 Check the header at a 390px viewport: title, workspace switcher, overflow control and primary action all visible, touch targets at least 44 by 44 pixels, nothing clipped

## 4. Contact intake in a sheet

- [x] 4.1 Move the `CrmAddContact` form body into `lib/motion/Sheet`, leaving only the trigger button in the header flex row — verify the board header, metrics and stage columns keep their position and width when the form opens
- [x] 4.2 Add required-name and email-format validation with visible Hebrew messages and focus moved to the offending field, replacing the current silent `return` on an empty name — verify saving with an empty name, with whitespace only, and with an email lacking `@` each keeps the sheet open and states the reason
- [x] 4.3 Surface the failure path: keep the sheet open with every typed value intact when the save fails, with a Hebrew message — verify by blocking the request in devtools and confirming the fields still hold their values
- [x] 4.4 Guard against a double submit so two rapid activations create exactly one contact — verify by double-clicking save and counting rows in `crm_contacts`
- [x] 4.5 Confirm before discarding a non-empty form on Escape or scrim dismissal — verify Escape with a typed name prompts, declining keeps the values, confirming closes without creating a contact
- [ ] 4.6 Check the sheet at a 390px viewport in Hebrew: single-column fields, both actions reachable, name and role right-to-left, email and phone left-to-right

## 5. Search

- [x] 5.1 Add a server action returning a trimmed index of the active workspace's contacts and open deals, resolving the workspace server-side via `getWorkspace()` and never from a client-supplied id — verify a user with two workspaces gets only the active workspace's records
- [x] 5.2 Call it from `HelixCommandBar` on first open, hold the result for the session, and drop it when the workspace cookie changes — verify switching workspace changes which contacts the palette finds
- [x] 5.3 Index contacts by name, email, company and role, and open deals by title and contact name; selecting a contact opens its record, selecting a deal opens its contact's record, and a deal with no contact returns to the board — verify each of the five match paths finds its record
- [x] 5.4 Add the explicit Hebrew empty state for a query matching nothing, and the degraded notice when the record index fails to load while routes still work — verify by querying a nonsense string, then by forcing the action to fail
- [x] 5.5 Add the client-side filter field above the contact list, matching name, company, role and email, with a visible match count and a Hebrew empty state offering to clear — verify typing 8 characters issues zero network requests in the devtools network panel
- [x] 5.6 Disclose the 200-contact ceiling next to the filter when the workspace holds more than 200 contacts — verify against a workspace seeded past the limit
- [ ] 5.7 Check the palette and the filter at a 390px viewport and in Hebrew with a mixed Hebrew, Latin and numeric query — verify no horizontal scrolling and no reordering of the Latin characters or digits

## 6. Pipeline

- [x] 6.1 Extend `lib/motion/useFlip` to capture `left` as well as `top` and animate `translate(x, y)`, leaving behaviour identical when `dx` is zero — verify a cross-column card move animates horizontally and an existing vertical reorder is unchanged
- [x] 6.2 Wrap the board's deals in `useOptimistic` and route the existing `‹` and `›` controls through it, reading `crmMoveDeal`'s `{ error }` instead of discarding it — verify a card moves within 100ms of activation and no control drops to reduced opacity during the move
- [x] 6.3 Show a Hebrew message and let the optimistic state unwind when a move fails, with a distinct message for an expired session — verify by forcing `crmMoveDeal` to return `{ error }`, then by clearing the session cookie mid-move
- [x] 6.4 Implement the pointer-event drag: capture on press, card follows the pointer 1:1, columns hit-tested by `getBoundingClientRect()`, release commits to the column under the pointer or springs home — verify a `lead` to `won` move takes one gesture and a release outside any column sends no request
- [x] 6.5 Arm the drag only after a 200ms press or 8px of movement along the column axis, applying `touch-action` only once armed — verify the board still scrolls vertically by touch drag at 390px
- [x] 6.6 Highlight the pending drop column while the pointer is over it and clear it on leave — verify visually during a drag
- [x] 6.7 Keep the column count and money total correct through an optimistic move, matching after the server reconciles — verify by moving a card worth 5,000 between two columns with known totals
- [x] 6.8 Add a visible focus ring on card controls and an accessible name on each card that includes its deal title and current stage — verify by tabbing the board and by reading a card with VoiceOver
- [x] 6.9 Confirm the loss of a deal before it fires, naming the deal in the prompt — verify cancelling sends no request, confirming removes the card and reduces the column count and total
- [ ] 6.10 Check the board under `prefers-reduced-motion: reduce`: cards appear in their new position with no spring and no reflow animation

## 7. Consistency and the design document

- [x] 7.1 Extract the duplicated `TIER_STYLE` from `app/[locale]/(crm)/dashboard/crm/page.tsx` and `app/[locale]/(crm)/dashboard/crm/[id]/page.tsx` into one helper beside `lib/crm-score.ts` — verify both screens render the same classes for the same tier
- [x] 7.2 Change the warm tier from `yellow-500` to the amber documented in `DESIGN.md` at all three usages — verify no `yellow-500` remains under `app/[locale]/(crm)/` by grep
- [x] 7.3 Update `helix-crm/DESIGN.md` in the same commit as the code it describes: new sections for the CRM shell split, the header primary-plus-overflow pattern, the board drag interaction and the unconditional dark motion tokens; delete the drift rows this change fixes; bump `Last updated:` — verify the doc describes what shipped, per the standing design-doc rule in `CLAUDE.md`

## 8. Verification

- [x] 8.1 Run `cd helix-crm && npm run build` and confirm it exits zero with no new type errors
- [ ] 8.2 Walk every scenario in `specs/crm-shell/spec.md`, `specs/crm-search/spec.md`, `specs/crm-pipeline/spec.md` and `specs/crm-contact-intake/spec.md` against the running app at `/he/dashboard/crm`, and report any scenario that could not be verified rather than skipping it silently
