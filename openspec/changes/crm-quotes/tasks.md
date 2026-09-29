Nothing here is deployed until task 2.2, Eran applying v20 and v21, is done: the new screens need the new tables.

## 1. DESIGN.md first

- [x] 1.1 Update `helix-crm/DESIGN.md` before any code, as additions to the system:
  - **§8, new blocks:**
    - "Business details": the form, the logo uploader, and the read-only view for non-admins.
    - "Quote editor": the lines table, live totals, the deal select, preview beside the form from `lg` and one tap away below it, and the send bar with its "הסטטוס יעבור ל״הצעה נשלחה״" line and the 8-second undo line.
    - "Quote document": the logo or name, the two parties, the lines, totals, validity, notes, and the A4 print rules.
    - "Drawer quotes": the list, the states and the actions.
  - **§9, new patterns:**
    - A public page outside the route groups, with no CRM chrome and `noindex`.
    - The send pattern: a window opened on the click, then pointed at WhatsApp, with a fallback link.
    - A view counted by the page's script, never by the request.
  - **§8 CRM side menu:** gains "פרטי העסק".
  - **§17:** the file map gains the new files.
  - Bump `Last updated`.

  Verify: every new block names its file and carries class strings, and the §9 patterns match design.md decisions 4, 5 and 6.
  - Done 2026-09-28:
    - §8 gains "Drawer quotes" (after Drawer deals), and "Business details", "Quote editor" (with its Send bar) and "Quote document" (before Header: one primary action). Each names its file and carries class strings.
    - The side menu lists פרטי העסק between צוות and API.
    - §9 gains "A public document page", "Sending that opens another app" and "Counting a view", matching decisions 4, 6 and 5. The route-group tree shows `q/[token]` beside the groups.
    - §10's effects table gains `.doc-paper`, which pins the light tokens so the document is paper in a dark CRM. That is a new class, added in 5.1.
    - §17 lists the new components and libraries. `Last updated` already reads 2026-09-28.
    - `git diff` of DESIGN.md shows only these additions.

## 2. Database

- [x] 2.1 Write `helix-crm/supabase/migration-v21-quotes.sql` per design.md decision 8:
  - the v20 guard;
  - `crm_quotes`, `crm_quote_counters`, and `crm_workspaces.business`;
  - the four `crm_role()` policies on `crm_quotes`, and RLS with no policies on the counters;
  - the public `crm-business` bucket;
  - the indexes, including a unique index on `public_token`.

  Verify by reading:
  - every statement reruns safely (`if not exists` / `on conflict do nothing` / `drop policy if exists`);
  - the guard's message names v20;
  - no policy allows `anon`.
  - Done 2026-09-28. Every statement reruns safely: `if not exists`, `or replace`, `drop policy if exists` before each policy, and `on conflict do nothing` for the bucket.
    - The guard raises "Run supabase/migration-v20-role-enforcement.sql first".
    - Nothing is granted to `anon`.
    - The numbering is `crm_next_quote_number(ws, year)`, one `insert … on conflict do update … returning` that only `service_role` may execute. It is not security definer.
    - A unique index on `(workspace_id, number)` backs "never the same number twice".
    - The migration ends with a self-check: exactly four policies on `crm_quotes`, and the bucket public.
- [x] 2.2 (yours: Supabase SQL editor) Apply v20 if it isn't applied, then v21, then v21 a second time.

  Verify:
  - `select count(*) from pg_policies where tablename = 'crm_quotes'` returns 4;
  - `select public from storage.buckets where id = 'crm-business'` returns `true`;
  - the second run completes with no error.
  - Done 2026-09-29: Eran ran the SQL in the Supabase SQL editor. v21 refuses to run without v20 and ends with its own self-check (four policies, the bucket public), so a clean run means both are in. The three checks above were not run from here: production reads are blocked for Claude.

## 3. Business details

- [x] 3.1 Add the rules and the server side:
  - `lib/crm-business.ts` holds the limits and `validateBusiness()`: name 120, company number 20, address 200, phone 30, email 254, website 300, notes 1,000, and validity 1 to 365 days (default 14).
  - `app/crm-actions.ts` gains `crmSaveBusiness`, `crmUploadBusinessLogo` and `crmRemoveBusinessLogo`. They are admin and agency_admin only, and the logo is checked by MIME type and magic bytes, at most 1 MB, uploaded with the service role.
  - `accessRole` is exported from `lib/crm-workspace.ts`.

  Verify:
  - A scratch `npx tsx` check: each limit, the refused email and `javascript:` website, and validity 0 and 400 refused, 14 accepted.
  - A PNG, a JPEG and a WebP header are accepted, and SVG and a renamed `.png` text file are refused.
  - tsc exits 0.
  - Done 2026-09-28: the scratch check passes 19 of 19.
    - Every limit refuses one character over.
    - `office@`, `javascript:` and validity 0, 400 and 7.5 are refused. 14 passes, and the email is lowercased.
    - An empty column reads as the defaults.
    - The PNG, JPEG and WebP headers are accepted, and SVG and a text file named `.png` are refused.
    - The logo action also removes the previous file, but only one inside the workspace's own folder, and only after the new one is stored.
    - `next.config.mjs` raises the server-action body limit to 2 MB (1 MB of file plus the multipart envelope) and sends `X-Robots-Tag: noindex, nofollow` on `/:locale/q/:token`.
    - tsc exits 0.
- [x] 3.2 Build the screen:
  - `app/[locale]/(crm)/dashboard/crm/business/page.tsx` and `components/CrmBusinessForm.tsx`: the form, the logo uploader with preview, replace and remove, and a read-only view for other roles;
  - "פרטי העסק" in `components/CrmNavMenu.tsx`, between צוות and API;
  - the route in `HelixCommandBar` `ROUTES`;
  - the strings in `lib/i18n/he.ts` and `en.ts`.

  Verify: tsc and `npm run build` exit 0. The screen's scenarios go to 7.2.
  - Done 2026-09-28:
    - `dashboard/crm/business` reads the business with the service role once the workspace is known.
    - `CrmBusinessForm` shows:
      - the logo box with upload, replace and remove (a button that opens a hidden file input, so the keyboard reaches it);
      - the six text fields, the VAT select, validity and notes;
      - errors under their fields with `aria-describedby`, and the saved and failed lines.
    - A non-admin gets the same values as a read-only `<dl>` and the "רק מנהל…" line.
    - Building2 "פרטי העסק" sits between צוות and API in the side menu, and the route is in `ROUTES`.
    - tsc exits 0, and the build exits 0: `/[locale]/dashboard/crm/business` is 5.31 kB (108 kB first load).
    - The rendered scenarios go to 6.2, after the migration.

## 4. Quotes: rules and server

- [x] 4.1 Add `lib/crm-quote.ts`: the line limits, `validateQuote()`, `quoteTotals(items, vatRate)`, `formatQuoteNumber(year, n)`, and the set of statuses a send moves forward.

  Verify with a scratch `npx tsx` check:
  - 2 × 1,500 + 1 × 3,000 gives 6,000.00 / 1,080.00 / 7,080.00;
  - 3 × 33.33 gives 99.99 / 18.00 / 117.99;
  - an עוסק פטור (rate 0) gives no VAT;
  - quantity 0 and a 51st line are refused;
  - `formatQuoteNumber(2026, 1)` is `2026-001`, and 1000 gives `2026-1000`;
  - `talking` moves and `client` doesn't.
  - Done 2026-09-28: the scratch check passes 17 of 17.
    - The spec's figures come out exact: 6,000 / 1,080 / 7,080, 99.99 / 18.00 / 117.99, and the עוסק פטור 2,000 with no VAT. `₪7,080.00` is in Hebrew grouping.
    - Refused: quantity 0 on its line, 51 lines, three decimals, and a send with no subject or with only a blank line. A draft may have neither.
    - "18,000" and "₪1,500.50" read as numbers, and a mixed Hebrew/Latin line keeps its text.
    - The number format and the forward-only set check out (declined and frozen move; proposal, signed, paid and client stay).
    - The module also holds the shared `QuoteView` and snapshot types.
    - One key was renamed: the quote's "subject required" is `errQuoteSubjectRequired`, because `errSubjectRequired` already belongs to the email box.
    - tsc exits 0.
- [x] 4.2 In `app/crm-actions.ts`, add:
  - `crmCreateQuote`: from a contact, choosing the deal as the spec says, defaulting the validity and notes, and minting a 32-byte base64url token;
  - `crmSaveQuote`: drafts only, with totals recomputed on the server;
  - `crmDuplicateQuote`: a new draft with the same subject, lines and notes, and a fresh validity;
  - `crmCancelQuote`: sent quotes only;
  - the timeline label `at_quote`.

  Verify: tsc passes. Reading the code: every query filters `workspace_id`, a save or cancel checks `status` in the `WHERE`, and a viewer is refused before any write.
  - Done 2026-09-28: `crmCreateQuote`, `crmSaveQuote`, `crmDuplicateQuote` and `crmCancelQuote` are in `app/crm-actions.ts`.
    - Each checks `ctx()` and `canWrite` before anything else. Every read and write carries `.eq('workspace_id', …)`.
    - Save updates `.eq('status', 'draft')` and cancel `.eq('status', 'sent')`, each with `.select('id')`, so a quote in the wrong state updates nothing and says so.
    - The deal must be one of the lead's open deals in the workspace.
    - The VAT rate follows the business setting while a draft, and is frozen at send.
    - The token is `randomBytes(32)` in base64url. `at_quote` is in both dictionaries.
    - tsc exits 0.
- [x] 4.3 Add `crmSendQuote` per design.md decision 6.
  - The order is: checks, totals, the number from the counter upsert, one update of the quote (number, snapshots, `status = sent`, `sent_at`), then the deal, the status move with its row, the touch and rescore, and the quote's timeline row.
  - A failure before the quote update changes nothing visible. A later failure still returns the sent quote, with a Hebrew line saying what didn't update.
  - It returns `{ link, waUrl, number, previous, activityId }`.

  Verify:
  - tsc passes.
  - A scratch check drives the forward-only rule and the deal-stage rule through every status and stage.
  - Reading the code: the counter statement is a single `insert … on conflict do update … returning`.
  - Done 2026-09-28: `crmSendQuote` takes what the editor holds, so pressing send saves and sends in one step. The order is:
    1. validation (the send mode);
    2. the quote in the workspace and still a draft;
    3. the lead;
    4. a business name, or `business`;
    5. for WhatsApp, a usable number, or `nophone`;
    6. the deal among the lead's open deals;
    7. totals at the business's current VAT rate;
    8. the number through `rpc('crm_next_quote_number')`, the migration's single `insert … on conflict do update … returning`, executable by the service role only;
    9. one update of the quote to sent with the number and both snapshots, guarded `.eq('status', 'draft')`.
  - After that, the deal is updated or created, and the lead moves forward through the same `STATUS_LEGACY` update and `logStatusChange` row as the status path. The touch (`last_activity_at`) and the rescore run after the deal, so a new deal's 20 points count. Then the `quote` timeline row is written.
  - Anything failing after step 9 sets `partial` instead of undoing the send.
  - It returns `{ number, link, waUrl, contactId, moved, previous, activityId, partial }`. The link uses the origin the user is on, falling back to `NEXT_PUBLIC_SITE_URL`.
  - The scratch check passes 14 of 14: new, contacted, talking, declined and frozen move to proposal; proposal, signed, paid and client stay. Deal stages lead, qualified and meeting move to proposal; proposal and negotiation stay.
  - tsc exits 0.

## 5. Screens

- [x] 5.1 Build the document and the public page:
  - `components/QuoteDocument.tsx`: the document, in he or en, with print CSS for A4.
  - `app/[locale]/q/[token]/page.tsx`:
    - `notFound()` for an unknown token or a draft;
    - the cancelled view;
    - the expired note;
    - `robots: { index: false }`;
    - Open Graph with the business name and "הצעת מחיר" only.
  - `components/QuotePrintButton.tsx`.
  - An `X-Robots-Tag: noindex` header for `/:locale/q/:token` in `next.config`.

  Verify:
  - tsc and build pass.
  - `curl -sI` against the local page shows `x-robots-tag: noindex`.
  - Done 2026-09-28:
    - `QuoteDocument` renders a `QuoteView`, with no hooks, so the page and the editor share it. It shows:
      - the logo or the business name, and the details;
      - the client, and the subject;
      - the lines, as a table from `sm` and blocks on a phone;
      - the totals, with the VAT line or "עוסק פטור";
      - the validity and the notes.
    - Amounts are `₪` with two decimals, and dates and numbers are isolated left to right.
    - `.doc-paper` in `globals.css` pins the light tokens. The print rules set A4 with 16 mm margins, the page's button is `print:hidden`, and the document drops its border and padding.
    - The page reads by token with the service role, through a per-request `cache()` shared with `generateMetadata`. A token must match `^[A-Za-z0-9_-]{40,64}$` before any query.
    - A draft or unknown token goes to a bilingual `not-found.tsx`, and a locale mismatch redirects to the quote's own locale.
    - A cancelled quote shows only `ההצעה בוטלה` and the business name. An expired one shows `פג תוקף ב-…` above it.
    - The metadata sets `robots: noindex`, and the Open Graph title and description are the business name and "הצעת מחיר", with no amount.
    - tsc and build exit 0: `/[locale]/q/[token]` is 488 B (103 kB first load).
    - On `next start -p 3100`, a made-up 43-character code returns `404` with `X-Robots-Tag: noindex, nofollow`, a robots `noindex` meta, no ₪ and "ההצעה לא נמצאה". A malformed code returns 404.
    - A real sent quote can only render after v21 (task 2.2), so its scenarios go to 6.2.
- [x] 5.2 Record views:
  - `app/api/q/[token]/view/route.ts` and `components/QuoteViewBeacon.tsx`, per design.md decision 5: one POST after mount, 204 for drafts and for signed-in members, and a timeline row on the first view only.

  Verify:
  - tsc passes.
  - Locally, `curl -s` of the page HTML records nothing, because no script runs, and a POST for a draft's token returns 204 and writes nothing.
  - Done 2026-09-28:
    - `QuoteViewBeacon` posts once after mount with `keepalive`, and ignores failures.
    - `app/api/q/[token]/view/route.ts` checks the token's shape, reads the quote with the service role, and returns 204 for anything but `sent`.
    - It returns 204 without recording for a signed-in member (via the now-exported `accessRole`).
    - It sets `first_viewed_at` with `.is('first_viewed_at', null)`, and only the request that set it writes the timeline row ("{name} פתח/ה את הצעת המחיר {number}", with no owner, which v15 allows).
    - Later opens only move `last_viewed_at`.
    - The page component writes nothing. A POST for a made-up code returned 204 locally.
    - Recording a real first view needs v21, so it goes to 6.2.
- [x] 5.3 Build the editor:
  - `app/[locale]/(crm)/dashboard/crm/quotes/[id]/page.tsx` and `components/CrmQuoteEditor.tsx`;
  - subject, lines (add and remove, up to 50), live totals, the deal select, valid-until and notes;
  - the preview: `QuoteDocument` with the draft, beside the form from `lg` and on a tab below it;
  - save with a 15s timeout, an in-flight guard, and typed values kept on failure;
  - a quote from another workspace shows as not found.

  Verify: tsc and build pass. The editor scenarios go to 7.2.
  - Done 2026-09-28:
    - The page checks the id's shape and reads the quote within the workspace. Another workspace's quote, or a malformed id, gets the "not found" notice. A sent quote redirects to its page.
    - It loads the lead, their open deals, and the business through the service role.
    - `CrmQuoteEditor` has the subject, the deal select (open deals plus "עסקה חדשה"), and lines with add and remove. At 50 lines, the add button gives way to the limit line.
    - Each line's total shows live, and the totals (VAT or עוסק פטור) follow from `parseLinesLoose`, so an unfinished line doesn't break them.
    - It also has valid-until and notes.
    - The preview is `QuoteDocument` with the draft: beside the form from `lg`, behind an עריכה / תצוגה מקדימה switch below it.
    - Errors show under their field or line. Save validates as a draft, with the 15s timeout and an in-flight guard.
    - A viewer gets the notice and the preview only.
    - tsc exits 0. The build runs with 5.5.
- [x] 5.4 Build the send bar in the editor:
  - "שליחה בווטסאפ" opens a window on the click, then points it at `waUrl` after `crmSendQuote`, and closes it on failure. A fallback "פתיחת ווטסאפ" link shows after a send.
  - "העתקת קישור" uses the clipboard, with the link shown to copy by hand if the clipboard is refused.
  - The line under the buttons says the status will move.
  - An 8-second undo line calls `crmUndoStatus`.
  - Notices: no business name (with a link to פרטי העסק), and no phone (copy link only).
  - After a send, the editor gives way to the sent quote's page and the drawer.

  Verify: tsc passes. Reading the code: `window.open` runs before the first `await`.
  - Done 2026-09-28:
    - The bar shows:
      - "שליחה בווטסאפ", only with a usable number;
      - "העתקת קישור";
      - "שמירת טיוטה";
      - under them, "בשליחה הסטטוס של {name} יעבור ל״הצעה נשלחה״", only when the status will move;
      - the business-name notice with its link, or the no-phone line.
    - Both sends are disabled until there is a business name, a subject and a line that parses.
    - `send()` validates in send mode, then calls `window.open('', '_blank')` synchronously in the click handler, before `startTransition` and its first `await`. It points that window at `waUrl` on success, and closes it on failure.
    - Copying the link tries the clipboard after the send. If the browser refuses (Safari after an await), the link shows in a read-only field that selects itself on focus.
    - After a send, the form gives way to a status card with:
      - the number;
      - "הסטטוס עבר ל״הצעה נשלחה״", with an 8-second "ביטול" that calls `crmUndoStatus`;
      - the `partial` warning when needed;
      - "פתיחת ווטסאפ" as a fallback;
      - "לצפייה בהצעה";
      - the back link to the lead.
    - tsc exits 0.
- [x] 5.5 Build the drawer region:
  - `components/CrmDrawerQuotes.tsx`, after the deals: the list with its states, open, copy link, duplicate (into the editor), cancel (asking in a `Dialog`), and `+ הצעת מחיר` (create, then go to the editor);
  - the drawer's page query gains the contact's quotes;
  - a viewer gets the list and page links only.

  Verify: tsc and `npm run build` exit 0.
  - Done 2026-09-28:
    - The page reads up to 20 of the lead's quotes, newest first, in the same `Promise.all` as the deals. Before v21 the query errors and the region reads as empty.
    - Sent and opened dates are the Israeli day, formatted on the server. "נפתחה" uses `last_viewed_at`, so the spec's second-open scenario shows the new day.
    - Each row shows the number (or `טיוטה`), subject, total and state, and opens a panel:
      - "פתיחה": the editor for a draft, the page in a new tab otherwise;
      - "העתקת קישור" (sent), with the editor's copy-by-hand field when the clipboard is refused;
      - "שכפול", which opens the new draft in the editor;
      - "ביטול הצעה" (sent), asking by number in a `Dialog`.
    - While the cancel question is open, the drawer ignores Escape (a third `overlays` flag).
    - A viewer gets "פתיחה" only, and no region with no quotes. A draft opens as the editor's read-only preview.
    - tsc and `npm run build` exit 0.

## 6. Verification

- [x] 6.1 Run the gates:
  - `cd helix-crm && npx tsc --noEmit && npm run build` (both exit 0);
  - `openspec validate crm-quotes --strict`.
  - Done 2026-09-28: tsc and the build exit 0, and `openspec validate crm-quotes --strict` says the change is valid.
- [ ] 6.2 Walk every scenario in the three delta specs under `openspec/changes/crm-quotes/specs/`, after 2.2, in a visible window:
  - on `http://localhost:3100/he/dashboard/crm`, `/he/dashboard/crm/business` and `/en/dashboard/crm`;
  - on the public page at `/he/q/{code}` in a private window, at 1440×900 and 390×844;
  - the print preview;
  - pasting the link into WhatsApp and checking that no open is recorded.

  Use a lead Eran approves for test quotes. List every scenario that could not be verified, with the reason, and "Supabase unreachable" is among them.
- [ ] 6.3 When Eran asks for the deploy, run `firebase deploy --only apphosting:helix-crm` from the repo root, after 2.2. Then on https://crm.helix.co.il:
  - fill "פרטי העסק";
  - send a quote to an approved lead with "העתקת קישור";
  - open the link in a private window, and check the timeline shows it opened;
  - cancel it, and check the page says `ההצעה בוטלה`.
  - Deployed 2026-09-29 from the working tree (uncommitted); the rollout completed. Live checks without a sign-in pass:
    - a made-up 43-character code gives 404, `X-Robots-Tag: noindex, nofollow`, a robots meta with `noindex`, "ההצעה לא נמצאה", and no ₪;
    - a malformed code gives 404;
    - the view POST gives 204;
    - `/he/dashboard/crm/business`, the editor and the CRM home send a signed-out visitor to `/he/login`.
  - Still open: the four steps above. They write real data, so they wait for Eran and a lead he approves.
