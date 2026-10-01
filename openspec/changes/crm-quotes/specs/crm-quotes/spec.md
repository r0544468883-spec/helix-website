## Purpose

A price quote made in the CRM from a lead. It is sent over WhatsApp as a link to a page the client opens without logging in, and sending it moves the lead's status and deal, so the CRM always knows which quote went out, for how much, and whether it was opened.

## ADDED Requirements

### Requirement: A quote is drafted from the lead

A user who can write SHALL be able to start a quote from a lead's drawer with one `+ הצעת מחיר` control, which creates a draft for that lead and opens the quote editor. The editor SHALL hold:
- a subject, required, up to 120 characters;
- 1 to 50 line items, each with a description (required, up to 200 characters), a quantity (above 0, at most 99,999) and a unit price in ₪ (0 to 10,000,000, at most 2 decimals);
- a valid-until date, defaulting to today in Israel plus the business's default validity;
- notes, defaulting to the business's default notes, up to 1,000 characters;
- the deal it belongs to. The lead's open deal is chosen when there is exactly one, the lead's open deals are offered when there are several, and "עסקה חדשה" is used when there are none.

The editor SHALL show, as the items change, the total before VAT, VAT at 18% and the total. A workspace marked עוסק פטור SHALL get no VAT line and the words "עוסק פטור" instead. Each line is quantity × unit price rounded to the agora. VAT is rounded to the agora, and the total is their sum. The server SHALL compute the same totals and SHALL store only its own.

A draft SHALL have no number and SHALL NOT be reachable from its public link. Saving a draft SHALL be stored within 2 seconds. A save with no response within 15 seconds SHALL be treated as failed, and a failed save SHALL keep what was typed. A draft SHALL only ever belong to the user's active workspace.

#### Scenario: Starting a quote from the drawer

- **WHEN** Eran presses `+ הצעת מחיר` in the drawer of `דנה כהן`, who has one open deal
- **THEN** the quote editor opens for `דנה כהן` with that deal chosen, one empty line, the default validity date and the default notes

#### Scenario: Totals with VAT

- **WHEN** the lines are 2 × ₪1,500 and 1 × ₪3,000
- **THEN** the editor shows ₪6,000.00 before VAT, ₪1,080.00 VAT and ₪7,080.00 in total

#### Scenario: Rounding to the agora

- **WHEN** the only line is 3 × ₪33.33
- **THEN** the editor shows ₪99.99 before VAT, ₪18.00 VAT and ₪117.99 in total

#### Scenario: An עוסק פטור

- **WHEN** a workspace marked עוסק פטור drafts 1 × ₪2,000
- **THEN** the editor shows no VAT line, the words "עוסק פטור", and ₪2,000.00 in total

#### Scenario: A quantity of zero

- **WHEN** Eran saves a line with quantity 0
- **THEN** a Hebrew message under that line says the quantity must be above 0, and nothing is stored

#### Scenario: A 51st line

- **WHEN** Eran tries to add a line to a quote that has 50
- **THEN** no line is added and a Hebrew line states the 50-line limit

#### Scenario: An empty subject

- **WHEN** the subject field is empty
- **THEN** the send controls are disabled, and saving the draft is still allowed

#### Scenario: The save fails

- **WHEN** Eran saves a draft and the write fails because Supabase is unreachable
- **THEN** the typed subject and lines stay in the editor and a Hebrew message says the quote was not saved

#### Scenario: The network drops mid-save

- **WHEN** Eran saves a draft and no response arrives
- **THEN** within 15 seconds what he typed is still in the editor and a Hebrew message says the save did not complete

#### Scenario: A viewer can't start a quote

- **WHEN** a user with the viewer role opens a lead's drawer
- **THEN** no `+ הצעת מחיר` control is shown, and a draft save sent from a viewer's session is refused with a Hebrew message and nothing stored

#### Scenario: A quote from another workspace

- **WHEN** a signed-in user loads the editor URL of a quote that belongs to a workspace they are not in
- **THEN** the page says the quote was not found and shows none of its content

#### Scenario: A line mixing Hebrew, Latin and numerals

- **WHEN** a line reads `עיצוב דף נחיתה Landing v2`
- **THEN** the editor, the preview and the page show the Hebrew right to left, and `Landing v2` in its own order

#### Scenario: The editor at 390px

- **WHEN** Eran edits a quote on a 390px-wide viewport
- **THEN** every field and control is at least 44px on its smaller side, the preview is one tap away, and nothing scrolls horizontally

### Requirement: The editor shows the quote as the client will see it

The editor SHALL show a preview that is the same document the client's page shows:
- the logo, or the business name when there is no logo;
- the business details;
- the client's name and company;
- `טיוטה` where the number will be, and the date;
- the lines, the totals, the valid-until date and the notes.

A change in the editor SHALL show in the preview within 1 second.

#### Scenario: The preview follows the lines

- **WHEN** Eran changes a line's unit price from ₪1,500 to ₪1,800
- **THEN** within 1 second the preview shows the new line total and totals

#### Scenario: Preview and page match

- **WHEN** Eran sends a quote and opens its public page
- **THEN** the page shows the same logo, details, lines, totals, date and notes as the preview did, with the number in place of `טיוטה`

### Requirement: Sending a quote numbers it, freezes it and moves the lead

A user who can write SHALL be able to send a draft with `שליחה בווטסאפ` or `העתקת קישור`. A draft SHALL be sendable only with a subject, at least one line, and a business name set in "פרטי העסק". Without the business name, the editor SHALL say so and link to "פרטי העסק". When the lead has no phone number usable for WhatsApp, only `העתקת קישור` SHALL be offered, with a Hebrew line saying why.

A send SHALL, within 2 seconds:
- **Number the quote** `{year}-{NNN}`: the year in Israel, and the next number in that workspace and year, at least three digits. Numbers are never reused, and never repeat even when two quotes are sent at the same moment.
- **Freeze the quote:** the business details, the client's details, the lines and the totals as they were at sending. Later edits to "פרטי העסק" or to the lead SHALL NOT change a sent quote.
- **Deliver it.** `שליחה בווטסאפ` SHALL open WhatsApp to the lead's number with the message `היי {first name}, הנה הצעת המחיר מ{business name}: {link}`. `העתקת קישור` SHALL copy the link.
- **Move the lead to `הצעה נשלחה`** when their status is `ליד חדש`, `יצרנו קשר`, `בשיחה`, `נדחה` or `בהקפאה`. It SHALL leave `הצעה נשלחה`, `חתם`, `שולם` and `לקוח פעיל` unchanged. The move SHALL be recorded as a status change, and SHALL be undoable for 8 seconds without un-sending the quote.
- **Update the deal.** A chosen open deal SHALL move to the proposal stage when it is before it, and SHALL take the quote's total before VAT as its value. With `עסקה חדשה`, an open deal SHALL be created with the subject as its title, the total before VAT as its value and the proposal stage, and the lead SHALL be rescored.
- **Write the timeline:** one entry, `הצעת מחיר {number} נשלחה · ₪{total}`, and the send SHALL count as a touch.

The send buttons SHALL say, under them, that the status will move to `הצעה נשלחה`. A send that fails SHALL change nothing: the quote stays a draft with no number, WhatsApp does not open, nothing is copied, and a Hebrew message says so. A send with no response within 15 seconds SHALL be treated as failed. A sent quote SHALL NOT be editable. It can be duplicated into a new draft.

#### Scenario: The first quote of the year

- **WHEN** Eran sends the first quote his workspace sends in 2026
- **THEN** the quote's number is `2026-001`, and the next one sent is `2026-002`

#### Scenario: Two sends at the same moment

- **WHEN** two quotes in one workspace are sent within the same 100ms
- **THEN** they get two different consecutive numbers, and no number is skipped or repeated

#### Scenario: Sending on WhatsApp

- **WHEN** Eran presses `שליחה בווטסאפ` on a quote for `דנה כהן` in `בשיחה`
- **THEN** WhatsApp opens to Dana's number with the message and the link, and within 2 seconds her status is `הצעה נשלחה`, the timeline shows the quote's number and total, and her home row shows last touch `היום`

#### Scenario: A client asked for more is not moved back

- **WHEN** Eran sends a quote to a lead whose status is `לקוח פעיל`
- **THEN** the quote is sent and numbered, and the lead's status stays `לקוח פעיל`

#### Scenario: A new deal is created

- **WHEN** Eran sends a quote chosen with `עסקה חדשה`, subject `בניית אתר` and ₪6,000.00 before VAT
- **THEN** the lead has a new open deal titled `בניית אתר`, worth ₪6,000, in the proposal stage, and the lead's score includes the 20 points for an open deal

#### Scenario: An existing deal is updated

- **WHEN** Eran sends a ₪9,000.00-before-VAT quote chosen with the lead's deal that is at the meeting stage
- **THEN** that deal moves to the proposal stage and its value becomes ₪9,000

#### Scenario: Undo within 8 seconds

- **WHEN** Eran presses undo 3 seconds after sending a quote that moved a lead from `בשיחה`
- **THEN** the lead's status returns to `בשיחה`, and the quote stays sent with its number

#### Scenario: No business name

- **WHEN** Eran tries to send a quote while "פרטי העסק" has no business name
- **THEN** the send controls are disabled, and a Hebrew line says a business name is needed, with a link to "פרטי העסק"

#### Scenario: No usable phone

- **WHEN** the lead has no phone number
- **THEN** only `העתקת קישור` is offered, with a Hebrew line saying the lead has no number for WhatsApp

#### Scenario: Copying the link sends the quote

- **WHEN** Eran presses `העתקת קישור` on a draft
- **THEN** the link is on the clipboard, the quote is numbered and sent, and the lead and the deal move as a WhatsApp send would move them

#### Scenario: The send fails

- **WHEN** Eran presses `שליחה בווטסאפ` and the write fails because Supabase is unreachable
- **THEN** WhatsApp does not open, the quote stays a draft with no number, the lead's status is unchanged, and a Hebrew message says the quote was not sent

#### Scenario: Double-pressing send

- **WHEN** Eran presses `שליחה בווטסאפ` twice within 300ms
- **THEN** one number is used, one WhatsApp window opens, and one timeline entry is written

#### Scenario: A sent quote is locked

- **WHEN** Eran opens a sent quote from the drawer
- **THEN** its page opens, and no editor for it is offered

#### Scenario: The WhatsApp message in Hebrew

- **WHEN** WhatsApp opens for `דנה כהן` from `HELIX`
- **THEN** the message reads `היי דנה, הנה הצעת המחיר מHELIX:` followed by the link, and the link is intact and tappable

### Requirement: The client opens the quote without logging in

A sent quote SHALL be shown at `/{locale}/q/{code}` to anyone with the link, with no login, in the language it was drafted in. `{code}` SHALL carry at least 128 bits of randomness. The page SHALL show the frozen quote:
- the logo or business name, and the business details;
- the client;
- the number and the date;
- the lines and the totals;
- the valid-until date and the notes.

It SHALL carry a `שמירה כ-PDF` control that prints an A4 document holding only the quote, with no controls. For each state:
- **An unknown code or a draft** SHALL get a not-found page showing no business or amount.
- **A cancelled quote** SHALL say `ההצעה בוטלה` with the business name and no lines or amounts.
- **A quote past its valid-until date** SHALL still show, with `פג תוקף ב-{date}` above it.

Every response SHALL tell search engines not to index it. The link preview SHALL show the business name and the words "הצעת מחיר", and no amount.

#### Scenario: A client opens the link on a phone

- **WHEN** Dana opens the quote's link at 390×844, not signed in
- **THEN** she sees the logo, the business, her name, the number, the lines and the totals in Hebrew, right to left, with no horizontal scroll and no CRM menu or top bar

#### Scenario: An unknown code

- **WHEN** someone loads `/he/q/` followed by a code that no quote has
- **THEN** a not-found page shows, with no business name and no amount

#### Scenario: A draft's code

- **WHEN** someone loads the link of a quote that is still a draft
- **THEN** a not-found page shows, with no business name and no amount

#### Scenario: A cancelled quote

- **WHEN** Dana opens the link of a quote Eran cancelled
- **THEN** the page says `ההצעה בוטלה` with the business name, and no line or amount is shown

#### Scenario: An expired quote

- **WHEN** Dana opens a quote whose valid-until date was yesterday
- **THEN** the quote shows in full, with `פג תוקף ב-{date}` above it

#### Scenario: Saving as PDF

- **WHEN** Dana presses `שמירה כ-PDF` and saves from the print dialog
- **THEN** the file is an A4 document with the logo, the Hebrew right to left, the lines and totals, and no button or link from the page

#### Scenario: Not indexed

- **WHEN** a crawler requests a quote page
- **THEN** the response carries `noindex` in both an `X-Robots-Tag` header and a robots meta tag

#### Scenario: The link preview shows no amount

- **WHEN** the link is pasted into a WhatsApp chat
- **THEN** the preview shows the business name and "הצעת מחיר", and no amount

#### Scenario: A quote drafted in English

- **WHEN** a quote drafted on `/en/dashboard/crm` is opened
- **THEN** its page is in English, left to right, at `/en/q/{code}`

### Requirement: The CRM knows when the client opened the quote

The first time a sent quote's page is opened by someone other than a signed-in member of its workspace, the lead's timeline SHALL gain one entry, `{first name} פתח/ה את הצעת המחיר {number}`. The drawer SHALL then show the quote as opened, with the date. Every later open SHALL update only the last-opened time. A request that runs no script, such as a link-preview robot, SHALL NOT count as an open. An open by a signed-in member of the quote's workspace SHALL NOT count. A failure to record an open SHALL NOT change what the page shows.

#### Scenario: The first open

- **WHEN** Dana opens the quote for the first time
- **THEN** within 5 seconds Eran's drawer shows the quote as opened today, and the timeline shows `דנה פתח/ה את הצעת המחיר 2026-004`

#### Scenario: A second open

- **WHEN** Dana opens the same quote a second time the next day
- **THEN** no new timeline entry is written, and the last-opened date shows the new day

#### Scenario: WhatsApp's link preview

- **WHEN** WhatsApp fetches the page to build the link preview
- **THEN** no open is recorded and the drawer does not show the quote as opened

#### Scenario: Eran checks his own link

- **WHEN** Eran, signed in to the CRM, opens the quote's page
- **THEN** no open is recorded

#### Scenario: Recording fails

- **WHEN** Dana opens the quote while the recording write fails
- **THEN** the page shows the quote in full as usual

### Requirement: The drawer lists the lead's quotes

The lead's drawer SHALL show a `הצעות מחיר` region after the deals, listing the lead's quotes, newest first. Each SHALL show:
- its number, or `טיוטה`;
- the subject;
- the total in ₪;
- its state: `טיוטה`, `נשלחה {date}`, `נפתחה {date}` or `בוטלה`.

A user who can write SHALL be able to:
- open a draft in the editor;
- open a sent quote's page;
- copy a sent quote's link;
- duplicate any quote into a new draft;
- cancel a sent quote after confirming.

A cancellation SHALL show on the page at once. For a user who can write, the region SHALL always show `+ הצעת מחיר`. A user who cannot write SHALL see the list with only the page links, and no region when the lead has no quotes.

#### Scenario: Quotes in the drawer

- **WHEN** Eran opens a lead with a quote sent yesterday and opened today, and a draft started after it
- **THEN** the region lists the draft first as `טיוטה`, then the sent quote as `נפתחה` with today's date

#### Scenario: Duplicating a sent quote

- **WHEN** Eran duplicates quote `2026-004`
- **THEN** a new draft opens in the editor with the same subject, lines and notes, a fresh valid-until date and no number

#### Scenario: Cancelling asks first

- **WHEN** Eran presses cancel on quote `2026-004`
- **THEN** he is asked in Hebrew to confirm by the quote's number, and only after he confirms does the page show `ההצעה בוטלה`

#### Scenario: The cancel fails

- **WHEN** Eran confirms a cancel and the write fails because Supabase is unreachable
- **THEN** the quote stays sent, its page is unchanged, and a Hebrew message says it was not cancelled

#### Scenario: A viewer

- **WHEN** a user with the viewer role opens a lead with two sent quotes
- **THEN** both are listed with a link to their page, and no duplicate, cancel or `+ הצעת מחיר` control is shown

#### Scenario: The region at 390px

- **WHEN** the drawer shows three quotes on a 390px-wide viewport
- **THEN** each quote's number, total and state stay visible, every control is at least 44px on its smaller side, and nothing scrolls horizontally
