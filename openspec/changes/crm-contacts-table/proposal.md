## Why

On 2026-09-28 Eran looked at the CRM home the way his end client will: an Israeli business owner in their own workspace, who never learned the CRM's vocabulary. His verdict on the contacts list: "number, name, status. It needs to be more understandable." Nothing in a row says what its parts are:
- **The biggest thing in the row is the lead score**, a bare "65" in the leading column. Nothing says it is a score, what counts as good, or why it is 65.
- **Last touch shows as a lone word, "היום".** Its label, "מגע אחרון", lives only in a tooltip and in text for screen readers.
- **The row hides what is empty.** The role · company · email line and the task line render only when there is data, so a contact with neither reads as a number, a name, a chip and a word.
- **There are no column headers**, so position is the only clue to meaning.

Eran decided on 2026-09-28 to take the number out of the list. The score and the signals behind it move to the lead's drawer, which `crm-lead-details-and-reminders` builds. This is the table part of stage 3 of the CRM redesign ("people as a table, board and saved views"), pulled forward because of this. The board and saved views stay in stage 3.

**Surface: `helix-crm/` only.** One screen, the CRM home's contact list. No database, API or data change.

## What Changes

- **From a 768px viewport, the list is a table with column headers**, in reading order:
  - **איש קשר:** the name, with role · company · email under it when there are any.
  - **סטטוס:** the status chip, still the row's only colour.
  - **תזכורת:** the earliest open reminder with its due date or overdue mark, or "אין" when there is none.
  - **מגע אחרון:** the relative time, or "טרם", with the "צריך מגע" mark under it when it applies.
- **Below 768px, each contact is a card** with the same four fields. The reminder and the last touch each carry their label ("מגע אחרון: היום"), so no value appears without saying what it is.
- **The score number leaves the list,** in the table and on the card alike.
- **The order stays the same:** most promising first, by score. One muted line above the list now says so: "מסודרים לפי עדיפות: הכי מבטיחים למעלה".
- **A contact still opens from anywhere on its row or card.** Each contact is one keyboard stop, its name, and closing the drawer returns focus there.
- **Unchanged:** the search field, the needs-a-touch filter, the count line and the 200-contact cap.

## Capabilities

### New Capabilities

None.

### Modified Capabilities
- `crm-home`: the row requirement becomes a table with headers from 768px and labelled cards below it. It shows no score, says "אין" when there is no reminder, and states the order in words.
- `crm-contact-status`:
  - the list shows no score at all, instead of a neutral number. Status stays the only colour, and no hot/warm/cold word;
  - the mixed-direction scenario uses the last-touch number instead of the score.

## Impact

- **`helix-crm/components/CrmContactList.tsx`:** the table from `md`, the cards below it, the order line and the "אין" reminder. The score chip goes. The row keeps `data-contact-row`, which the drawer returns focus to.
- **`app/[locale]/(crm)/dashboard/crm/page.tsx`:** stops passing `score` to the list. The query still orders by it.
- **`lib/i18n/he.ts` and `en.ts`:** the column headers not already in the dictionary ("איש קשר", "אין") and the order line. "סטטוס", "תזכורת" and "מגע אחרון" exist.
- **`helix-crm/DESIGN.md`:** §8's "Record row" becomes the contacts table and its phone card, with class strings. §3's line on the neutral score badge in a row is updated. Bump `Last updated`.
- **Order of work:** apply after `crm-lead-details-and-reminders`, whose reminder wording ("תזכורת", the `Bell` mark) is what the reminder column shows.

## Non-goals

- **Sorting by clicking a column, per-column filters, saved views, the board view.** These are the rest of stage 3.
- **The "Today" to-do list and the home's deals section.** They are the "Today" change.
- **Changing the score or the order.** The weights and the tiers stay, and the list stays most promising first. Only where the number is shown changes.
- **Phone, WhatsApp or other actions in the row.** They are one click away in the drawer.
- **Paging past the 200 contacts the page loads.**
