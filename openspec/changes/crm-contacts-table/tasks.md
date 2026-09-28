Apply after `crm-lead-details-and-reminders`: the reminder column shows its wording ("תזכורת") and its `Bell` mark.

## 1. DESIGN.md first

- [x] 1.1 Update `helix-crm/DESIGN.md` before any code:
  - **§8 "Record row (the CRM workhorse)" becomes "Contacts table (`components/CrmContactList.tsx`)".** One DOM serves both widths:
    - `role="table"` on a CSS grid, with the header row `hidden md:grid` and each contact a `role="row"` card.
    - From `md`: four aligned columns, from fixed column widths for status and last touch plus `minmax(0,1fr)` for contact and reminder.
    - Below `md`: the name and chip on the first line, then "תזכורת: …" and "מגע אחרון: …" with their labels shown.
    - The whole card is clickable through a stretched name link (`after:absolute after:inset-0` in a `relative` row). The link keeps `data-contact-row`, so there is one keyboard stop per contact and the drawer's focus return is unchanged. The focus ring goes around the whole card.
    - The order line above the list, "אין" for no reminder, and the needs-touch mark under the last touch.
    - No score column, and why (Eran, 2026-09-28: an owner can't read a bare number, and the drawer's details explain it).
  - **§3 Contact status:** after "only element of a contact-list row allowed to use colour", add that the list shows no score at all since 2026-09-28.
  - **§18:** add a checklist line: a value in a list carries its label, a column header on a wide screen and a label on a phone.
  - Bump `Last updated`.

  Verify:
  - §8 carries the class strings for the header row, the row card, each cell and the phone labels.
  - The block no longer mentions a score chip.
  - `Last updated` reads the day of the change.
  - Done 2026-09-28:
    - §8 "Record row" is now "Contacts table", with class strings for the order line, the head row, the row, each cell and the phone labels.
    - One change from the plan, recorded in the doc. The link is an empty `absolute inset-0` layer over the card, named by the person (`aria-label`), not the stretched name link. The global `a:focus-visible` ring is unlayered CSS, which no utility can switch off, so a stretched name link would outline only the name. The empty layer takes the same ring around the whole card, and it is still one link per contact carrying `data-contact-row`.
    - §3 says the list shows no score since 2026-09-28, and §18 gains the "every value says what it is" line.
    - The remaining "score chip" mentions are the full record page's, which keeps its chip. `Last updated` reads 2026-09-28.

## 2. The table

- [x] 2.1 In `helix-crm/lib/i18n/he.ts` and `en.ts`, add:
  - `colContact`: "איש קשר" / "Contact"
  - `reminderNone`: "אין" / "none"
  - `listOrder`: "מסודרים לפי עדיפות: הכי מבטיחים למעלה" / "Sorted by priority: most promising first"

  The other headers reuse `statusLabel`, `nextStep` and `lastTouchLabel`.

  Verify: `cd helix-crm && npx tsc --noEmit` exits 0.
  - Done 2026-09-28: the three keys are in both dictionaries next to `contactsHeading`. The reused headers exist: `statusLabel` סטטוס / Status, `nextStep` תזכורת / Reminder, `lastTouchLabel` מגע אחרון / Last touch. tsc exits 0.
- [x] 2.2 Rebuild the list in `helix-crm/components/CrmContactList.tsx` to the §8 spec:
  - the header row from `md`;
  - rows that become labelled cards below `md`;
  - the order line;
  - "אין" when there is no task;
  - the needs-touch mark in the last-touch cell;
  - the stretched name link;
  - the score chip removed.

  The search, the needs-touch filter, the count line and the capped notice stay as they are.

  Verify:
  - tsc passes.
  - `grep -n "c.score" helix-crm/components/CrmContactList.tsx` returns nothing.
  - Done 2026-09-28: the list is one DOM for both widths.
    - The order line and a `role="table"`, whose head row is `hidden md:grid` with four `role="columnheader"`.
    - Each contact is a `role="row"` grid: `[1fr auto]` on a phone (name and chip, then the labelled reminder and last touch across both columns), and `MD_COLS` from `md`, matching the head.
    - The link is the empty `absolute inset-0` layer named by the person, carrying `data-contact-row`. The visible name is `aria-hidden`, so a screen reader doesn't read it twice.
    - "אין" shows when there is no task, and the needs-touch mark sits under the last touch.
    - The empty and no-match lines render without a head.
    - The search, the needs-touch filter, the count line and the capped notice are untouched.
    - tsc exits 0, and the grep returns nothing. The rendered scenarios move to 3.2.
- [x] 2.3 In `app/[locale]/(crm)/dashboard/crm/page.tsx`, stop passing `score` to the list and drop it from `ListContact`. The query keeps ordering by score.

  Verify:
  - tsc passes.
  - `npm run build` exits 0.
  - The CRM home's first-load size is within 2 kB of the last build.
  - Done 2026-09-28:
    - `ListContact` has no `score`, and the page's list mapping no longer passes it. The query still orders by score, and the figures line's hot count still reads it from the loaded contacts.
    - tsc exits 0. `npm run build` exits 0 with no warnings: `/[locale]/dashboard/crm` is 16.6 kB (150 kB first load), up from 16.4 / 149.
    - The compiled CSS has `md:grid-cols-[minmax(0,1fr)_132px_minmax(0,1fr)_120px]` and `grid-cols-[minmax(0,1fr)_auto]`, so both layouts made it into the build.

## 3. Verification

- [x] 3.1 Run the gates:
  - `cd helix-crm && npx tsc --noEmit && npm run build` (both exit 0);
  - `openspec validate crm-contacts-table --strict`.
  - Done 2026-09-28: tsc exits 0, and `npm run build` exits 0 (see 2.3). `openspec validate crm-contacts-table --strict` reports the change valid.
- [ ] 3.2 In a visible window, walk every scenario in both delta specs under `openspec/changes/crm-contacts-table/specs/`:
  - on `http://localhost:3100/he/dashboard/crm` and `/en/dashboard/crm`;
  - at 1440×900, 768×1024, 767×1024 (either side of the breakpoint) and 390×844;
  - with the keyboard: Tab, Enter, and Escape back to the row;
  - with a text search for the score ("65") that finds nothing in the list.

  List any scenario that could not be verified, with the reason.
- [ ] 3.3 When Eran asks for the deploy, run `firebase deploy --only apphosting:helix-crm` from the repo root. Then on https://crm.helix.co.il/he/dashboard/crm:
  - the header row reads איש קשר · סטטוס · תזכורת · מגע אחרון;
  - no number shows beside a name;
  - the order line is above the list;
  - clicking a row's last-touch cell opens the drawer.
