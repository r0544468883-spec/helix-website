## Why

Eran sends price quotes to leads over WhatsApp, and every one is made outside the CRM. The CRM can't produce a quote, has no place for his logo or business details, and never learns that a quote went out. He moves the lead to "הצעה נשלחה" by hand, and the deal's value is whatever he remembers to type.

On 2026-09-28 he asked for a quote made from the lead, with his company logo and the quote's details, that moves the status to "הצעה נשלחה" by itself when it is sent. Agreed the same day:
- **Built in, not through SUMIT:** SUMIT is a separate, bigger change.
- **Sent over WhatsApp:** as a link to a quote page the client opens on their phone and can save as PDF.
- **No approving on the page yet:** that is the next version.

**Surface: `helix-crm/` only.** It adds a database migration (v21) that Eran applies in the Supabase SQL editor, after v20. Nothing on the marketing site changes.

## What Changes

- **A "פרטי העסק" screen** in the CRM side menu. It holds a logo for documents (PNG, JPEG or WebP, up to 1 MB), the business name, company number, address, phone, email, website, whether the business is an עוסק פטור, the default validity in days, and default notes. An admin edits it and everyone else sees it read-only. The document logo is its own field, so setting it doesn't change the CRM's top bar.
- **"+ הצעת מחיר" in the lead's drawer** opens a quote editor. It has:
  - a subject;
  - line items (description, quantity, unit price);
  - the total before VAT, 18% VAT (none for an עוסק פטור) and the total;
  - a valid-until date and notes;
  - the deal it belongs to;
  - a live preview that is exactly the page the client will see.
- **Sending: "שליחה בווטסאפ" or "העתקת קישור".** Either one:
  - gives the quote its number (`2026-001`, per workspace per year) and freezes what was sent;
  - opens WhatsApp with a short message and the link, or copies the link;
  - moves the lead to "הצעה נשלחה" if they are before it, with an 8-second undo, and leaves a lead already at a later status where they are;
  - sets the deal's stage to proposal and its value to the total before VAT, or creates the deal when there is none;
  - writes the timeline, and counts as a touch.
- **The quote page** at `crm.helix.co.il/he/q/<code>` needs no login. It shows the logo, the business, the client, the items, the totals, the validity and the notes, with "שמירה כ-PDF" (A4). Search engines don't index it. A draft isn't public, and a cancelled quote says so and hides the prices.
- **Knowing it was opened:** the client's first visit writes "{name} פתח/ה את הצעת המחיר" to the timeline, and the drawer shows when it was opened. WhatsApp's link-preview robot and signed-in team members don't count.
- **A "הצעות מחיר" region in the drawer:** each quote with its number, subject, total and state, and actions to copy the link, duplicate it into a new draft, or cancel it.

## Capabilities

### New Capabilities
- `crm-business-profile`: the business details and the document logo, who edits them, and their limits.
- `crm-quotes`:
  - drafting a quote from a lead, its totals and VAT, and the preview;
  - sending it and what sending moves;
  - the public quote page;
  - knowing when it was opened;
  - the drawer's quotes region.

### Modified Capabilities
- `crm-shell`: the side menu lists "פרטי העסק".

## Impact

**Database (`helix-crm/supabase/migration-v21-quotes.sql`, applied by Eran after v20):**
- `crm_quotes`: items as JSON, frozen snapshots of the business and the client, the public code, and sent / opened times.
- `crm_quote_counters` for the numbering.
- `crm_workspaces.business` (JSON) for the business details.
- A public `crm-business` storage bucket for document logos.
- Row access follows v20's roles through `crm_role()`, which is why v20 must run first.

**Server:**
- `app/crm-actions.ts` gains the business details save, the logo upload, and quote create, save, duplicate, cancel and send. Totals, numbering, snapshots, the deal and the status are all decided on the server.
- A new `app/api/q/[token]/view/route.ts` records the client's visit.

**Screens:**
- `dashboard/crm/business` (new).
- `dashboard/crm/quotes/[id]`: the editor (new).
- `app/[locale]/q/[token]`: the public page (new, outside the CRM chrome).
- A quotes region in `CrmContactDrawer`, the side-menu item, and a ⌘K route.

**Shared code:** `lib/crm-quote.ts` holds the item rules, totals and VAT, used by the editor and the server. A single `QuoteDocument` component is both the preview and the public page.

**i18n and docs:** `lib/i18n/he.ts` and `en.ts`. `helix-crm/DESIGN.md` gains the business screen, the editor, the quote document and the drawer region, and bumps `Last updated`.

## Non-goals

- **The client approving the quote on the page.** That is the next version.
- **Email, and PDF files made on a server.** The PDF is the browser's "save as PDF" from the quote page.
- **SUMIT or any invoicing system,** and invoices, receipts or payments.
- **Per-line discounts, a product catalogue, quote templates, currencies other than ₪.**
- **Editing a sent quote.** Duplicate it into a new draft instead.
