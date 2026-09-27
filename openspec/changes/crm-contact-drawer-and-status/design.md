## Context

See proposal.md — Why. The constraints that shape this design, all verified in the code:

- **`lifecycle_stage` and `lead_status` have readers outside this change.** `app/api/v1/crm/contacts/route.ts` accepts them on POST and returns them on GET to API-key integrations; `lib/chief/crm-client.ts` selects them into CHIEF's context; `lib/automations/types.ts` offers them as condition fields, and those conditions are stored inside user-created graphs in the database. Dropping or renaming either column breaks contracts this change cannot see or update.
- **`lib/crm-score.ts` scores from both columns.** The contact list is ordered `score desc`, so any change to the formula reorders every list.
- **`lib/motion/Drawer.tsx` already exists** with spring in/out, an Escape handler, a scrim, and a logical `side` prop that resolves against `document.documentElement.dir`.
- **The CRM home page is `force-dynamic`** and already awaits `params`. It does not currently receive `searchParams`.
- **Resend is wired for campaigns, not for 1:1.** `lib/email-deliver.ts` is segment-shaped: it resolves recipients, personalises, and enforces campaign segment authorisation. It is not a "send this one message" function.
- **`helix-crm/` has no rate limiter.** The `lib/rate-limit.ts` in the repo root belongs to the marketing site and is across the import boundary, which must not be crossed.
- **This change stacks on the uncommitted `simplify-crm-shell-and-board` branch**, which owns `CrmContactList`, `lib/crm-tier.ts` and the `(crm)` route group.

## Goals / Non-Goals

**Goals:**
- One writable status column, with the legacy columns kept truthful by derivation so that nothing outside this change has to be edited.
- A status→points table chosen so the migration does not reshuffle the contact list.
- Drawer state in the URL, rendered by the server, so back/forward and sharing work without client-side fetching code.
- WhatsApp with no external account, no approval and no per-message cost.

**Non-Goals (design level):**
- No generic "workflow engine" for statuses. Any status can be set from any other; no transition validation, no required order. Eran corrects mistakes by picking the right value.
- No optimistic-concurrency scheme on the status. Last write wins; a solo operator with a handful of teammates does not need version vectors.
- No abstraction over messaging channels. WhatsApp is a URL and email is a function call; a `Channel` interface with two implementations would be indirection for its own sake.

## Decisions

### 1. Add `status`; keep `lifecycle_stage` and `lead_status` as derived mirrors

`status text not null default 'new'` on `crm_contacts`, with a check constraint listing the nine values. Every write path that sets `status` also writes the mapped legacy pair, in the same statement, from one shared mapping table in `lib/crm-status.ts`.

```
status        ->  lifecycle_stage   lead_status
new               lead              new
contacted         lead              contacted
talking           sql               qualified
proposal          opportunity       qualified
signed            opportunity       qualified
paid              customer          qualified
client            customer          qualified
declined          lead              unqualified
frozen            lead              contacted
```

*Rejected — drop the two columns.* Cleanest schema, and it breaks the public v1 API response shape, every stored automation condition referencing those fields, and CHIEF's contact context. The blast radius is outside this change's control.

*Rejected — leave the old columns frozen at their current values.* Cheapest to write and the worst outcome: the API and automations would quietly report a state the CRM no longer believes, and nobody would notice until an automation misfired.

*Rejected — a database trigger to maintain the mirror.* Keeps the invariant even for writes that bypass the app, which is genuinely better. Rejected because the app owns the mapping for scoring anyway, so a trigger would put the same table in two languages and two places. Revisit if a second writer ever appears.

### 2. The status→points table is chosen to preserve existing scores

`scoreContact` takes `status` and adds a single lookup where it previously added two. The values are the sums of the pair each status maps back from, so a contact whose two legacy fields agreed keeps its exact score:

```
new 0 · contacted 5 · talking 40 · proposal 50 · signed 50 · paid 55 · client 55 · declined -20 · frozen 5
```

`talking` is 40 because `sql`(25) + `qualified`(15) = 40; `paid` and `client` are 55 because `customer`(40) + `qualified`(15) = 55. All other signals — business email 25, company 10, phone 5, LinkedIn 5, open deal 20, recent activity 20, clamp 0..100 — are untouched.

The migration recomputes `score` in SQL using the same table. Scores move only where the old pair was self-contradictory, for example `opportunity` + `unqualified`, which scored 15 and becomes `declined` at -20. That is a correction, not a regression, and it is the only class of row whose list position changes.

*Rejected — recompute nothing and let scores drift until the next write.* The list is ordered by score, so a stale score is a visibly wrong order until someone happens to touch the row.

### 3. Backfill with an explicit ordered CASE, terminal states first

```
lead_status = 'unqualified'                      -> declined
lifecycle_stage = 'customer'                     -> client
lifecycle_stage = 'opportunity'                  -> proposal
lifecycle_stage = 'sql'                          -> talking
lifecycle_stage = 'mql'                          -> contacted
lifecycle_stage = 'lead' and lead_status='qualified'  -> talking
lifecycle_stage = 'lead' and lead_status='contacted'  -> contacted
otherwise                                        -> new
```

`unqualified` is tested first so a contradictory row resolves to the terminal state rather than to a progress state — an unqualified opportunity is a person who said no, not a live proposal. `signed`, `paid` and `frozen` are never produced by the backfill: the old schema could not express them, and inventing them would be fabricating history. Eran sets them going forward.

The migration is written idempotently — `add column if not exists`, and the backfill guarded so a second run is a no-op — matching the convention every migration from v14 onward already follows.

### 4. Nine chips distinguished by treatment, not hue alone

Colour follows the CRM's existing badge pattern from `lib/crm-tier.ts`: a 15–20% alpha fill with full-strength text, which scales to nine values without the carnival effect a solid fill would produce. Two of the nine differ by *treatment* rather than hue, because nine distinguishable hues in a dark dense UI is not achievable: `new` is the only chip with no fill (outline only — the absence of colour reads as untouched), and `frozen` is the only chip with a dashed border.

```
new        border only, ink-muted text     talking    indigo
contacted  sky                             proposal   amber
signed     violet                          paid       emerald (brand)
client     teal                            declined   red
frozen     slate + dashed border
```

Every chip always carries its Hebrew label, so hue is redundant reinforcement and never the only carrier of meaning — which is also what ת"י 5568 requires. Emerald is reserved for action elsewhere in the CRM; `paid` is the one status allowed to use it, because money arriving is the one status that means the same thing the brand colour means. The chips have no hover state, which keeps them visually distinct from buttons.

Exact class strings go into `helix-crm/DESIGN.md` in the same commit, and the map lives in `lib/crm-status.ts` beside `lib/crm-tier.ts`.

*Rejected — reuse the tier colours.* Only three values, and it would re-create the contradiction this change removes.

### 5. Drawer state as `?c=<id>`, rendered on the server

The CRM home page starts accepting `searchParams`. When `c` names a contact in the active workspace, the page fetches that contact's details, deals and activities server-side and renders them inside the drawer. Rows in `CrmContactList` become links to `?c=<id>`, so middle-click and copy-link work as they do for any link.

This gives back/forward, a shareable address and workspace scoping for free, with no client fetch layer, no loading skeleton and no second copy of the authorisation check. The cost is a server round-trip per open on an already `force-dynamic` page.

*Rejected — client-side fetch into the drawer.* Needs a new data-fetching path, its own loading and error states, and a second place where workspace scoping must be enforced correctly.

*Rejected — intercepting routes (`(.)` convention) so `/dashboard/crm/[id]` renders as a drawer over the list.* The idiomatic App Router answer and the best long-term shape. Rejected for this change because it adds a parallel-route slot to a layout that was just restructured in `simplify-crm-shell-and-board`, and two structural changes to the same layout in consecutive changes is how a route tree becomes unexplainable. Worth revisiting once this settles.

### 6. WhatsApp is a link; the number resolver is pure and tested

`toWhatsAppNumber(raw): string | null` in `lib/phone-il.ts`: strip everything that is not a digit, drop a leading `+`, replace a single leading `0` with `972`, return `null` unless the result is 11–15 digits. Pure function, no I/O, so it is the one piece of this change with straightforward unit tests.

The action is an `<a href="https://wa.me/<digits>?text=<encoded>">` with `target="_blank"` and `rel="noopener noreferrer"`, which works identically on desktop WhatsApp Web and on a phone's installed app.

The activity is logged by a server action fired on click, and its Hebrew wording says WhatsApp was *opened* — the CRM genuinely cannot know whether Eran pressed send, and a timeline that claims delivery it cannot observe is worse than one that admits the limit.

*Rejected — the WhatsApp Cloud API.* Requires a Meta Business account, business verification, approved templates for business-initiated messages outside a 24-hour window, and per-message fees. For a free CRM this is the wrong trade at this stage. Noted as a later option, not a gap.

### 7. A 1:1 email path separate from the campaign path

A new `sendContactEmail` server action calls the Resend SDK directly with the existing `RESEND_FROM` sender, rather than routing through `deliverCampaign`. `deliverCampaign` exists to resolve segments and enforce segment authorisation; a single known recipient has neither. It stays untouched so the campaign product is not put at risk by CRM work.

The activity row is written only after the provider returns success, so the timeline means "accepted for delivery". A 15-second timeout races the send, matching the pattern already used in `CrmAddContact`.

### 8. Rate limiting in Postgres, not in memory

The 20-sends-per-hour cap counts `crm_activities` rows of type `email` for the workspace in the last hour, before sending. There is no new table and no new dependency, the count is correct across the multiple instances App Hosting may run, and the data it reads is data this change already writes.

*Rejected — an in-memory counter.* Wrong on more than one instance, and reset by every deploy.

*Rejected — reusing the marketing site's `lib/rate-limit.ts`.* It is on the other side of the import boundary, which must not be crossed in either direction.

### 9. `crmUpdateContact` takes `status` and stops taking the legacy fields

Both callers are in this repo (`CrmContactPanel`, and the new drawer). Keeping the old parameters accepted "just in case" would leave two ways to set the same state, and the mirror invariant would then depend on every caller remembering which one to use.

## Risks / Trade-offs

- **The backfill is a one-way door on a live table.** → The migration only adds a column and recomputes a derived number; `lifecycle_stage` and `lead_status` are never modified by it, so rollback is `alter table crm_contacts drop column status` plus reverting the app. The original data survives the round trip.
- **Scores shift for self-contradictory rows, reordering part of the list.** → Bounded to rows where `lead_status = 'unqualified'` and `lifecycle_stage` was past `lead`. Task 1 includes counting those rows before the migration so the size of the change is known rather than discovered.
- **Nine statuses is more than the six Eran asked for; the extra three may go unused.** → `talking`, `proposal` and `frozen` were argued for in exploration and accepted. If two of them sit empty after a month, removing a value is a check-constraint edit and a backfill of the affected rows, not a redesign.
- **`paid` and `client` are adjacent in both meaning and hue (emerald, teal).** → They are the two most easily confused chips. The Hebrew labels differ plainly (`שולם` / `לקוח פעיל`), and if it proves confusing in use the fix is one hue, not a structural change.
- **The email path can still annoy recipients, just 20 at a time.** → The cap protects the sending domain, not the recipient's patience. Accepted: this is a CRM for a practice with tens of contacts, not hundreds.
- **`wa.me` depends on WhatsApp keeping that URL shape.** → It is WhatsApp's documented public link format and has been stable for years. If it changed, the fix is one string in one function.
- **A stale `?c=` link after a contact is deleted.** → Specified to render the list with a Hebrew not-found notice and HTTP 200, the same path as a contact in another workspace.
- **Two structural changes land on the CRM in quick succession.** → This change does not restructure routes or layouts; it adds a query parameter and components. The route tree that `simplify-crm-shell-and-board` established is not touched.

## Migration Plan

1. Count the rows whose legacy pair is self-contradictory, so the score movement is known in advance.
2. Apply `migration-v19-contact-status.sql` in the Supabase SQL editor: add the column with its constraint and default, backfill via the ordered CASE, recompute `score`, add the ordering index. Idempotent and re-runnable.
3. Deploy the app. The mirror is written by the app from this point on; rows written between the migration and the deploy keep their default `new` and a correct mirror, because `new` maps to the `(lead, new)` pair that is already the column default.
4. Verify against the specs on a signed-in session.

**Rollback:** revert the app deploy, then `alter table public.crm_contacts drop column if exists status`. `lifecycle_stage` and `lead_status` were never written by the migration, so the pre-change app resumes on untouched data. Scores recomputed by step 2 stay recomputed; they self-correct on the next write of each row.

## Open Questions

- Should using the WhatsApp action also advance a `new` contact to `contacted` automatically? It is defensible — opening WhatsApp is contact — but it makes the status move by itself, which decision 1 of this change deliberately avoids. Deferred: it changes no spec here, and it is one line in the click handler if wanted later.
