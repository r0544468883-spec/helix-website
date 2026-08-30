# HELIX CHIEF — Real Scheduling via Cal.com (built 2026-08-18)

The CHIEF `scheduling` agent shipped as a stub: `propose_slots` returned hardcoded fake
times and `book_meeting` only logged a CRM activity. Reuse-first fix: wire **Cal.com**
(open-source, MIT, self-hostable Calendly) as the real backend — live availability + real bookings.

## What was built
- **`lib/chief/scheduling/calcom.ts`** — Cal.com v2 client (verified vs cal.com docs): `getSlots`
  (GET /v2/slots, `cal-api-version: 2024-09-04`) + `createBooking` (POST /v2/bookings,
  `2024-08-13`, attendee nested), `calcomConfigured()`. Bearer auth. Degrades cleanly (null) when
  no key — callers fall back to the old stub, so nothing breaks.
- **`lib/chief/agents.ts`** — `schedulingAgent`:
  - `propose_slots` → live Cal.com availability (next 7 days, filtered by morning/afternoon) when
    configured; hardcoded suggestion otherwise.
  - `book_meeting` → real Cal.com booking when configured + `start_iso` + `attendee_email` are given
    (new optional inputs), then logs the CRM activity with the booking id. Still logs-only otherwise.

## Config
`.env`: `CALCOM_API_KEY`, `CALCOM_EVENT_TYPE_ID`. Default timezone `Asia/Jerusalem`.

## Verify
`tsc --noEmit` → 0 errors repo-wide. Live: set the two env vars, ask CHIEF to propose slots →
real availability; confirm a booking appears in Cal.com + a `meeting` activity on the contact.

## Why not build our own scheduler
Cal.com is the mature open-source Calendly (self-hostable → fits the HELIX privacy moat), and the
ecosystem spec already lists Calendly/Cal.com as the scheduling core. Reuse over reinventing a booking
engine. Reuse index: `Desktop/HELIX - מאגר מקורות סקילים MCP ואייגנטים.docx`.
