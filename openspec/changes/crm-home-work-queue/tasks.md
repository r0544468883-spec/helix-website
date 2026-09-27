## 1. Overlays stop covering the page (ships first, on its own if needed)

- [x] 1.1 Add `dirOf(locale)` to `helix-crm/lib/i18n` and make `dir` a required prop on `lib/motion/Drawer.tsx`. Compute the anchoring edge and the hide sign from it instead of `document`. Verify `cd helix-crm && npx tsc --noEmit` flags exactly the two callers, then passes once they pass `dir`.
- [ ] 1.2 Make Drawer and Sheet render closed with `visibility:hidden` and `inert`, set on spring rest and cleared before opening (design decision 2). Verify with `npm run dev` on port 3100: at 1900px on `/he/dashboard/crm`, `document.elementFromPoint` at x=600 and x=1300 returns page content, not an `.hm-material` panel.
- [x] 1.3 Remove the consumer workarounds: `inert={!open}` in `CrmContactDrawer.tsx` and `{open && …}` in `CrmHeaderMenu.tsx`. Verify by keyboard on the home page that Tab never focuses a control inside the closed drawer, menu or add-contact sheet.
- [ ] 1.4 Check both directions and reduced motion. On `/he` the contact drawer enters from the right; on `/en` from the left. With `prefers-reduced-motion: reduce` emulated, it appears and disappears without sliding. Verify by opening and closing a contact in each case, and toggling the "עוד" menu 5 times in 2 seconds, ending closed with the page clickable.
- [x] 1.5 Update `helix-crm/DESIGN.md`: in §8 Contact drawer, drop the "load-bearing `inert`" note, document the `dir` prop, and delete §15 row 9. Verify `npm run build` passes and the doc's `Last updated` is bumped.

## 2. Shell sheds STAGE

- [x] 2.1 Rewrite `helix-crm/components/Footer.tsx` to name HELIX CHIEF CRM and link to https://helix.co.il, with labels from `lib/i18n/he.ts` / `en.ts`. Remove the STAGE tagline key if nothing else reads it (grep first). Verify on `/he/dashboard/crm` and `/en/dashboard/crm` that "HELIX STAGE" does not appear in the page text.
- [x] 2.2 In `helix-crm/components/Nav.tsx`: remove the signed-in "הכניסה שלי" button, move "האיזור האישי" into i18n, and give the portal link an accessible name that says it opens a new tab. Verify on `/en/dashboard/crm` that every nav label is English, and at 390px that the nav is one row with 44px controls.
- [x] 2.3 Update DESIGN.md: §9 App shell gets the footer and nav contents, and the Nav part of §15 row 5 is removed (the `CrmWorkspaceSwitcher` part stays). Verify `npm run build` passes.
- [x] 2.4 Hide CHIEF: remove the CHIEF link from `components/Nav.tsx` and the `/chief` entry from `components/HelixCommandBar.tsx` ROUTES, keeping the route itself. Verify the nav has no CHIEF link, ⌘K "CHIEF" returns nothing, and `/he/chief` still renders.

## 3. Data for the queue

- [x] 3.1 Move `STALL_DAYS` from `app/crm-actions.ts` into `lib/crm-status.ts` beside a new `ACTIVE_STATUSES` set and a pure `needsTouch(status, lastActivityAt, createdAt, now)` helper. Import it back into `crm-actions.ts`. Verify with a scratch `npx tsx` script: `talking` at 15 days → true, `client` at 60 → false, `new` at exactly 14 → true, `new` at 13 → false.
- [x] 3.2 In `app/[locale]/(crm)/dashboard/crm/page.tsx`, add `last_activity_at, created_at` to the contacts select and the open-tasks query to the existing `Promise.all` (design decision 3). Build a first-task-per-contact map, and on task-query error log it and use an empty map. Verify by temporarily pointing the task query at a nonexistent column: the page still renders every contact with no task line.
- [x] 3.3 Compute each row's relative last-touch string with `Intl.RelativeTimeFormat` on the server, "טרם" / "never" when null, plus its needs-touch flag and next task (title, due date, overdue). Extend `ListContact` with those fields. Verify `npx tsc --noEmit` passes.

## 4. The home becomes a work queue

- [x] 4.1 Write the new class strings into DESIGN.md §8 *before* the code: the compact header, the figures line, the queue row (score · name + chip · last touch · task line · needs-touch text marker), the needs-touch chip and the collapsed board line. Verify the section exists and the date is bumped.
- [x] 4.2 Replace the H1, subtitle and five tiles in `page.tsx` with the compact header and one figures line. With 0 deals, show only the contact count. Verify at 1440×900 with 1 contact and 0 deals: no "₪0", no "0%", no product headline, and the first contact row is visible without scrolling.
- [x] 4.3 Rework the row in `components/CrmContactList.tsx`: chip beside the name, last touch at the end, task line under the meta line with an overdue text mark, and truncation for long Hebrew. Verify at 390px with a 40-character Hebrew name and a 60-character task: both truncate, the chip stays whole, and the row is ≥44px.
- [x] 4.4 Add the "צריך מגע (N)" chip to `CrmContactList`. Hide it when N is 0, and combine it with the text filter so the count line reflects both. Verify with 3 stale contacts out of 20: the chip narrows to 3, pressing again restores 20, and typing a matching name narrows to 1.
- [x] 4.5 Move the contact list above the pipeline section. In `components/CrmDealBoard.tsx`, render only the title line and add-deal action when `deals.length === 0` (title only for a viewer). Verify adding a first deal shows the full board without a reload, and a viewer with 0 deals sees just the title.
- [x] 4.6 Add the new i18n keys (figures line labels, "טרם", needs-touch chip and marker, overdue, task due) to both `lib/i18n/he.ts` and `en.ts`. Verify `npx tsc --noEmit` passes, which proves the dictionaries match.

## 5. Verification

- [x] 5.1 Run the gates `cd helix-crm && npx tsc --noEmit && npm run build`. Both must exit 0.
- [ ] 5.2 On a signed-in session at `http://localhost:3100/he/dashboard/crm`, then `/en/dashboard/crm`, walk every scenario in `specs/crm-overlays/spec.md`, `specs/crm-home/spec.md` and `specs/crm-shell/spec.md` at 1900px, 1440×900 and 390×844, including reduced motion and a viewer session. Report any scenario that could not be verified rather than skipping it.
- [ ] 5.3 After `firebase deploy --only apphosting:helix-crm`, load https://crm.helix.co.il/he/dashboard/crm at 1900px and confirm the ghost panels are gone. Check by clicking a contact row at the page's left third and right third: the drawer opens on the first click both times.
