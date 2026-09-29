## Context

See proposal.md (Why). The current state this builds on:

- **Deals** (`crm_deals`) hold only `title`, `value` (₪), `stage` and `status`. There are no line items or documents.
- **Status.** `lib/crm-status.ts` owns the nine statuses and their score weights. `crmUpdateContact` and `logStatusChange` in `app/crm-actions.ts` change a status and write its timeline row (a status change is not a touch). `crmUndoStatus` undoes one change given its activity id and the previous status. The drawer asks before opening a deal ("לפתוח עסקה?") only when the status path moves to `proposal`; that prompt lives in the drawer's `useStatusChange` handler.
- **WhatsApp.** `whatsAppLink(phone, text)` in `lib/phone-il.ts` builds a `wa.me` link, or returns null when the number can't be used. `crmLogWhatsApp` records the touch.
- **Branding.** `crm_workspaces.branding` holds `logo_url`, and `components/Nav.tsx` shows it in the top bar. Nothing writes it, and there is no field for business details. The existing public storage bucket `product-logos` belongs to STAGE.
- **Access.** Migration v20 adds `crm_role(ws)` and the per-verb policies: every role reads, admin, agency_admin and member write, admin and agency_admin delete. v20 is written but not applied in production (crm-team-roles task 2.6).
- **Routes.** `middleware.ts` protects `/dashboard`, `/chief`, `/onboarding`, `/submit` and `/profile/edit`, and lets `/api` pass. `app/[locale]/layout.tsx` is the document shell only, so a route beside the `(crm)` and `(stage)` groups renders with no CRM chrome.
- **Timeline types.** `crm_activities.type` has no check constraint. `crmLogActivity` allows only the five manual types, so a `quote` row can come only from the quote actions.

## Goals / Non-Goals

**Goals:**
- A sent quote is a frozen record. What the client sees never changes after sending, whatever happens later to "פרטי העסק" or the lead.
- The server is the only author of totals, numbers, snapshots and the status or deal effects. The browser shows previews.
- Hebrew renders right to left with no PDF engine: the page is HTML, and the PDF is the browser's print.

**Non-Goals:**
- No server-side PDF, and no new npm dependency.
- The quote page does not accept any write from the client apart from recording a view.

## Decisions

### 1. One table for quotes, JSON lines, snapshots at send

`crm_quotes`:
- **Identity:** `id`, `workspace_id`, `contact_id` (set null on delete), `deal_id` (set null on delete).
- **State:** `number` (null while a draft), `status` (`draft` / `sent` / `cancelled`), `locale` (`he` / `en`).
- **Content:** `subject`, `items` (JSON array of `{description, quantity, unit_price}`), `valid_until`, `notes`.
- **Money:** `vat_rate` (0.18, or 0 for an עוסק פטור, fixed per quote), `subtotal`, `vat`, `total` (numeric 12,2), `currency` (`ILS`).
- **The link:** `public_token`, unique.
- **Frozen at send:** `business_snapshot` and `client_snapshot` (JSON).
- **Times and authorship:** `sent_at`, `first_viewed_at`, `last_viewed_at`, `created_by`, `created_at`, `updated_at`.

Rejected:
- **A table per line.** Nothing queries lines on their own, and 50 lines of JSON is small.
- **Rendering a sent quote from live data.** A logo change would silently rewrite what the client already received.

### 2. Numbers at send, from a counter row, through the service role

`crm_quote_counters (workspace_id, year, last_number)`. The send action runs one statement on the service-role client, after its own authorisation:

```sql
insert … on conflict (workspace_id, year) do update set last_number = crm_quote_counters.last_number + 1 returning last_number
```

The statement is atomic, so two sends at once get consecutive numbers. The number is formatted `{year}-{NNN}`, zero-padded to 3 digits.

Rejected:
- **A security-definer SQL function.** v18 removed such a function because it had no membership guard. The action is where the membership check already lives.
- **Numbering at draft creation.** Abandoned drafts would leave gaps, and gaps look like missing documents.

### 3. Business details in their own column, logo in its own bucket

`crm_workspaces.business` (JSON) holds the name, company number, address, phone, email, website, `vat_exempt`, `validity_days` and `default_notes`, plus `logo_url`. `branding.logo_url` keeps meaning the top bar, so a document logo never changes how the CRM looks.

The logo goes through a server action:
- It receives `FormData`.
- It checks the type (PNG, JPEG, WebP by MIME and by magic bytes) and the size (1 MB or less).
- It uploads with the service-role client to the public bucket `crm-business` at `{workspace_id}/logo-{timestamp}.{ext}`. There are no storage policies for anon or authenticated users, so only the server writes.

Rejected: SVG, because an SVG opened directly runs script, and a logo doesn't need vectors.

### 4. The public page lives outside the CRM groups

The page is `app/[locale]/q/[token]/page.tsx`, a server component:
- It reads the quote by token with the service-role client. A draft or an unknown token gets `notFound()`.
- It sets `robots: { index: false }` and the `X-Robots-Tag` header, through the route's headers config.
- It sets Open Graph metadata with the business name and "הצעת מחיר" only.

It renders `components/QuoteDocument.tsx` from the snapshots. The editor's preview renders the same component with the live draft, so the two can't drift.

"שמירה כ-PDF" is `window.print()`. Print CSS (`@page { size: A4; margin: 16mm }`) hides everything but the document.

Rejected:
- **Chromium or Gotenberg on a server.** Not needed while WhatsApp carries a link, and a separate service to run.
- **react-pdf / pdfkit.** No bidi support, so Hebrew mixed with numbers comes out reordered.

### 5. Views are recorded by the page's script, not by the request

After hydration, a client component on the page sends one `POST /api/q/{token}/view`. The route:
1. Reads the quote with the service-role client.
2. Returns 204 for anything but a sent quote.
3. If the request has a session whose user has a role in the quote's workspace, returns 204 without recording. It uses `accessRole`, exported from `lib/crm-workspace.ts`.
4. Otherwise sets `first_viewed_at` if null, and always sets `last_viewed_at`.
5. On the first view only, writes one `quote` timeline row.

Link-preview robots fetch the HTML and run no script, so they never post.

Rejected:
- **Recording on the page request.** WhatsApp's preview fetch alone would mark every quote as opened.
- **A user-agent block list.** It is always one robot behind.

### 6. Send: one server action, and a window opened before the await

`crmSendQuote({ id, via })`, with `via` being `whatsapp` or `link`:
1. **Checks:** the writer role, the workspace, `status = draft`, a subject, at least one valid line, and a business name. For `whatsapp`, a usable phone.
2. **Totals:** computed again from the lines with `lib/crm-quote.ts`, the same code the editor uses.
3. **Freeze:** takes the number (decision 2) and writes the snapshots, `status = sent` and `sent_at`.
4. **The deal:** the chosen open deal moves to `proposal` if its stage is `lead`, `qualified` or `meeting`, and its value becomes the subtotal. With no deal chosen, one is created with the subject as its title, the subtotal as its value and the `proposal` stage.
5. **The lead:** moves to `proposal` if their status is `new`, `contacted`, `talking`, `declined` or `frozen`, through the same update and `logStatusChange` path as the status path.
6. **The touch and the timeline:** the send sets `last_activity_at` to now as a touch, rescores the lead, and writes one `quote` timeline row.
7. **Returns** `{ link, waUrl, number, previous, activityId }`. The last two let the page offer undo through `crmUndoStatus`.

Browsers block a window opened after an `await`. So the "שליחה בווטסאפ" handler opens `window.open('', '_blank')` synchronously on the click, awaits the action, then sets that window's location to `waUrl`. On failure it closes the window and shows the message. A plain "פתיחת ווטסאפ" link remains as a fallback when the window was blocked anyway.

"העתקת קישור" awaits the action, then writes the link to the clipboard. If the clipboard is refused, the link shows in a field to copy by hand.

The drawer's "לפתוח עסקה?" prompt doesn't fire, because the send moves the status on the server and not through the drawer's path handler.

Rejected:
- **Treating only a confirmed WhatsApp delivery as sent.** The CRM can't see inside WhatsApp. The press is the honest signal, and undo covers a change of mind.
- **Asking "לעדכן סטטוס?" after sending.** Eran asked for it to happen by itself. The button says what will move.

### 7. One shared rules module

`lib/crm-quote.ts` is pure, so client components can use it. It exports:
- the line limits;
- `validateQuote()`;
- `quoteTotals(items, vatRate)`, which rounds each line to the agora, then the VAT, then sums;
- `formatQuoteNumber()`;
- the forward-only status set.

The server reruns everything; the client uses it for instant feedback.

### 8. Migration v21 needs v20

`migration-v21-quotes.sql`:
- **Starts with a guard:** it raises an exception naming v20 if `public.crm_role(uuid)` doesn't exist.
- **Tables:** creates `crm_quotes` and `crm_quote_counters`, and adds `crm_workspaces.business`.
- **Policies:** gives `crm_quotes` v20's four policies, all through `crm_role(workspace_id)`. `crm_quote_counters` gets RLS on and no policies, so only the service role writes it.
- **Storage:** inserts the `crm-business` bucket as public.
- **Indexes:** `crm_quotes (workspace_id, contact_id, created_at desc)`, plus a unique index on `public_token`.
- **Safe to rerun:** every statement uses `if not exists` or `on conflict do nothing`.

## Risks / Trade-offs

- **[The popup blocker wins anyway.]** Some mobile browsers ignore even a synchronous `window.open`. → The fallback link is always shown after a successful send, so one more tap gets there.
- **[Print-to-PDF on a phone is clumsy.]** iOS hides "save as PDF" inside share → print. → The button still works, and the page reads well without printing. A real PDF file is the SUMIT change's job.
- **[A forwarded link shows the quote to anyone.]** That is true of any quote link. → The token is 128 bits or more and unguessable, cancel revokes it, and nothing on the page is writable.
- **[v20 isn't applied.]** v21's guard refuses to run and names v20. The new screens can't work without the new tables, so the tasks put the migrations before the deploy and ask Eran first.
- **[Counters and year boundaries.]** The year is taken from `todayInIsrael()` at send, so 00:30 on 1 January in Israel numbers into the new year.
- **[The deal value is before VAT.]** Pipeline figures are before VAT elsewhere too, while the page shows both. That is stated in DESIGN.md.

## Migration Plan

1. **Eran runs the migrations** in the Supabase SQL editor: v20 (if not yet), then v21, then v21 again to confirm it reruns cleanly.
2. **Deploy** with `firebase deploy --only apphosting:helix-crm`. The marketing site's static Hosting export and its App Hosting backend are untouched.
3. **Rollback:** the previous App Hosting revision. v21 only adds things, so the old code ignores the new tables and column.
