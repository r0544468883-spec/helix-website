## Why

HELIX CHIEF CRM is meant to be a simple, free CRM, but the app it lives in is still the STAGE product-launch directory it was forked from. The CRM is 812 of roughly 7,000 lines of app code — about 12 percent — wrapped in 26 unrelated pages (launches, categories, alternatives, compare, community, testers, submit, newsletter, board, signals, profiles). A salesperson who opens the board to work their pipeline gets a cursor-trail particle canvas, 26 floating animated logos, a scroll hijacker, a "compare products" tray and a floating refer-and-earn pill on top of their data, because all five mount in the shared layout. They cannot search for a person anywhere in the app: the contact list is a flat `limit(200)` render sorted by score with no filter and no paging, and the Cmd+K palette that is already built and mounted indexes 24 routes and zero contacts. Moving one deal from `lead` to `won` costs five clicks on 14-pixel chevrons, each one a server action plus a full `force-dynamic` requery of three Supabase tables, with no optimistic update — so the card sits at 40 percent opacity and waits. The footer link out of the board says "back to command center" and lands on `/dashboard`, which queries `products`, `launches` and `waitlist_signups` and offers to make you a "maker": the user's own pipeline exits into a different product.

**Affected surface: `helix-crm/` only.** No file outside `helix-crm/` changes. The public marketing site, the `/app/api/*` routes, Supabase schema, and Resend are all untouched.

## What Changes

**The shell — give the CRM its own.**
- Split `app/[locale]/` into two route groups: `(crm)` for `dashboard/` and `chief/`, `(stage)` for the 26 directory pages. URLs do not change. The STAGE page code stays on disk, untouched, and keeps its current chrome under `(stage)/layout.tsx`.
- `app/[locale]/layout.tsx` keeps only `<html>`, `<body>`, fonts and `globals.css`. The CRM group layout mounts Nav and Footer and nothing else — no `CursorTrail`, no `FloatingBackground`, no `SmoothScroll` (lenis), no `CompareTray`, no `ReferFloatingBadge`.
- Retarget the board's footer link away from `/dashboard` so the CRM no longer exits into the launch dashboard.
- Collapse the board header from five same-weight controls into one primary action plus an overflow drawer for team, API keys, autonomy and automations. `autonomy` becomes reachable outside Cmd+K for the first time.

**Search — make finding a person the fastest thing in the app.**
- The Cmd+K palette indexes the workspace's contacts and open deals alongside routes, and jumps straight to a record.
- A filter field above the contact list narrows the already-loaded rows client-side, with no extra query.

**The pipeline — one gesture instead of five round-trips.**
- Drag a deal card between stage columns with pointer events (mouse, trackpad, touch, pen). The chevron buttons stay as the keyboard and assistive path, not as the only path.
- `useOptimistic` moves the card on release; the server action reconciles. A failed move returns the card to its column and says so.
- `lost` asks for confirmation before it fires.

**Two bugs found while reading the code.**
- `lib/motion/tokens.css` defaults `--hm-surface` to cream `rgba(255,253,249,.86)` and only darkens inside `@media (prefers-color-scheme: dark)`. The CRM is unconditionally dark, so every user on a light-mode OS already gets a cream Cmd+K panel floating on a `#121413` app. Fixed by making the CRM's material tokens dark unconditionally.
- `useFlip` captures `getBoundingClientRect().top` and animates `translateY` only. On a six-column horizontal board, a card moving between columns at the same height animates by zero pixels — the reflow spring wired into the board today does nothing for the move it was added for. Either it gains a horizontal axis or the board stops depending on it for cross-column moves.

**Consistency, folded in where the files are already open.**
- `warm` is styled `yellow-500` in three places while `ChiefChat` uses `amber-400`; `DESIGN.md` documents amber. Unify on amber.
- `TIER_STYLE` is copy-pasted in `dashboard/crm/page.tsx` and `dashboard/crm/[id]/page.tsx`. Extract one helper.

## Capabilities

### New Capabilities
- `crm-shell`: the CRM's own application shell — which routes belong to the CRM, what chrome the CRM renders, the header's action hierarchy, and where navigation out of a CRM screen leads.
- `crm-search`: finding a contact or deal — the command palette's record index and the contact-list filter.
- `crm-pipeline`: moving a deal through stages — drag-and-drop, optimistic feedback, failure recovery, keyboard equivalence, and confirming a loss.
- `crm-contact-intake`: creating a contact from the board without the form displacing the page.

### Modified Capabilities

None. `openspec/specs/` is empty, so every capability here is new.

## Impact

**Routing and layout.** `app/[locale]/layout.tsx` is reduced to the document shell; two new group layouts appear at `app/[locale]/(crm)/layout.tsx` and `app/[locale]/(stage)/layout.tsx`. Every page directory under `app/[locale]/` moves into one of the two groups. `app/[locale]/page.tsx` stays put — it only redirects to the board. No URL changes, so no inbound link breaks and no redirect is needed.

**Components.** `CrmDealBoard`, `CrmAddContact`, `HelixCommandBar` and both CRM pages change. `CursorTrail`, `FloatingBackground`, `SmoothScroll`, `CompareTray` and `ReferFloatingBadge` stay on disk and keep rendering on `(stage)` routes; they stop rendering on CRM routes.

**Existing primitives get used.** `lib/motion/` ships `Sheet`, `Drawer`, `Dialog`, `Material`, `Pressable`, `Scrim` and `ResizablePanel`, and only `CommandPalette` and `useFlip` are imported anywhere today. The add-contact sheet and the header overflow drawer use what is already there rather than adding a dependency.

**Dependencies.** None added. `lenis` stops loading on CRM routes but stays for `(stage)`, so it is not removed from `package.json` by this change.

**Data.** No Supabase schema change, no new table, no new column, no RLS change. The palette's record index reads `crm_contacts` and `crm_deals` through the existing workspace-scoped queries. No new API route.

**Deploy.** `helix-crm/` builds and deploys independently to its own App Hosting backend (`crm.helix.co.il`). This change does not touch the website's static Hosting export, the website's `apphosting.yaml`, or the root `firebase.json` ignore list.

**Docs.** `helix-crm/DESIGN.md` governs this UI and must be updated in the same commit per the standing design-doc rule: new sections for the CRM shell and the board's drag interaction, the dark material tokens, and deletion of the drift rows this change fixes (the `yellow-500`/`amber-400` split and the duplicated `TIER_STYLE`).

## Non-goals

- **Deleting the 26 STAGE pages.** They are quarantined into `(stage)` and left working. Deletion, and dropping the Supabase tables behind them, is a separate decision on separate evidence about what still links in.
- **Redesigning the CRM's visual language.** Tokens, type scale, radii and spacing stay exactly as `DESIGN.md` documents them. This change moves things and removes noise; it does not restyle.
- **The white-label accent bug** (`Nav.tsx` writes `--brand`, Tailwind v4 reads `--color-brand`, so the workspace accent override is inert). It is already `DESIGN.md` drift #10 and is not in scope here.
- **Fixing CHIEF, automations, email campaigns or the API-keys screen.** `/chief` moves into the `(crm)` group and therefore loses the marketing ambience; nothing else about it changes.
- **Paging or server-side search over more than 200 contacts.** The filter narrows what is already loaded. The `limit(200)` ceiling stays, and what to do above it is a later change.
- **Touching the website, the shared `/app/api/*` routes, Supabase schema, or Resend.**
