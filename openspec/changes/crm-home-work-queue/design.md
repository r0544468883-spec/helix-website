## Context

See proposal.md for the motivation and specs/ for the required behaviour. What the code does today, verified on 2026-09-27:

- **`lib/motion/Drawer.tsx` gets its direction from the DOM during render.** It uses `typeof document !== 'undefined' && document.documentElement.dir === 'rtl'`. On the server that is `false`, so the server HTML anchors a `side="start"` panel with `left:0`. In the browser it is `true`, so `hiddenSign` is `+1` and the panel is hidden with `translateX(+100%)`. React does not patch `style` on a hydration mismatch, which leaves a left-anchored panel pushed 100% to the right, into the middle of the page. The "עוד" menu (`side="end"`) has the mirror problem. Both panels are `hm-material` at `rgba(26,28,27,.86)` with `pointer-events:auto`. Confirmed with `elementFromPoint` on production: clicks at x=600 and x=1300 hit the closed panels.
- **`Sheet.tsx` parks the add-contact sheet at `top:100%`.** It is off screen, but it is not hidden from the tab order, and its contents (the nine status options, the form fields) stay focusable. `Dialog.tsx` uses `display:none` when closed and is already correct.
- **Consumers work around the primitives.** `CrmContactDrawer` sets `inert={!open}` on its own content, and `CrmHeaderMenu` wraps its content in `{open && …}`. This is DESIGN.md §15 row 9.
- **The CRM home page** fetches contacts `id, full_name, email, role_title, status, score, company`. It does not fetch `last_activity_at`, and nothing reads `crm_tasks` except the automation engine, which writes rows no screen shows.

## Goals / Non-Goals

**Goals:**
- The server and the browser agree on an overlay's position from the first byte, so there is no hydration mismatch to paper over.
- A closed overlay is inert because of the primitive, not because each consumer remembers to make it so.
- The home page gets its new data from the queries it already runs, with no new route, table or client fetch.

**Non-Goals:**
- No change to the spring engine, to `SPRINGS` values, or to the drag code in `CrmDealBoard`.
- No new motion. The collapsed board and the figures line appear without animation.

## Decisions

### 1. Direction comes from a prop the server knows, not from `document`

`Drawer` takes a `dir: 'rtl' | 'ltr'` prop. Every CRM page already has `locale`, so a caller passes `dir={locale === 'he' ? 'rtl' : 'ltr'}`. A small `dirOf(locale)` helper in `lib/i18n` keeps that expression in one place. The anchoring edge and the hide sign are both computed from this prop, identically on the server and in the browser.

*Rejected: read `document.dir` in a `useLayoutEffect` and re-render.* The server HTML would still be wrong, so the panel flashes on screen on every load until the effect runs. That fails the first-paint scenario.

*Rejected: logical CSS alone (`inset-inline-start`).* Anchoring would become correct, but `transform: translateX` has no logical form, so the hide direction still needs to know the direction. Solving half of it in CSS and half in JS leaves two places to get wrong.

*Rejected: `suppressHydrationWarning`.* It silences the symptom and leaves the panel mid-screen.

### 2. A closed overlay is `visibility:hidden` + `inert` inside the primitive

When the spring rests at closed, the primitive sets `visibility:hidden` and the `inert` attribute on the panel wrapper. It clears both before the opening spring starts. The server renders the closed state with both already set, so a closed panel is invisible and unfocusable from the first byte, even if JavaScript never runs.

`visibility:hidden` is chosen over `display:none` because it keeps layout, so the width measurement the spring relies on stays stable. `Dialog` keeps its existing `display:none`, which already works. The two consumer workarounds (`inert={!open}` in `CrmContactDrawer`, `{open && …}` in `CrmHeaderMenu`) are removed, and §15 row 9 is deleted.

*Rejected: `pointer-events:none` only.* The panel would stop eating clicks, but it would stay visible and focusable when mis-positioned, and every future positioning bug would come back as a dim band.

### 3. Next task and last touch come from the existing page query

The contacts select adds `last_activity_at, created_at`. A second query in the same `Promise.all` reads the workspace's open tasks for the loaded contact ids:

```
crm_tasks  select contact_id, title, due_date
           where workspace_id = ws and status = 'open' and contact_id in (<up to 200 ids>)
           order by due_date asc nulls last
```

The page keeps the first task per contact in a map. The query runs through the user's own client, so RLS (v20) applies. A viewer reads tasks like any other data.

If the task query errors, the map is empty and rows render without a task line, as required by the degrade scenario. The error is logged server-side, not shown.

*Rejected: a Postgres view or RPC joining contacts to their next task.* That is a migration for something one extra query already answers at 200 rows.

### 4. "Needs a touch" is computed on the server, once

The page computes the flag per contact using the active-status set and a 14-day threshold. The threshold reuses `STALL_DAYS` from `crm-actions.ts`, moved to `lib/crm-status.ts` so the stalled-deal sweep and the home page agree. The list receives a boolean. The chip filter is client-side over rows already in memory, and combines with the existing text filter.

Relative times ("לפני 3 ימים") use `Intl.RelativeTimeFormat` with the locale, computed on the server. They are stale by at most one page load, which is acceptable for a day-granularity signal and avoids a hydration mismatch from two clocks.

### 5. Layout order

```
+--------------------------------------------------+
| [workspace v]  [... עוד]            [+ ליד חדש]  |  header, one row at >=768px
| 30 אנשי קשר · 4 חמים · ₪48,000 פתוח · ...        |  figures line (text-[13px] ink-secondary)
+--------------------------------------------------+
| [search.................]  [צריך מגע (3)]        |
| 82  רונית בן-דוד [בשיחה]   לפני 15 ימים  !       |
|     Nurit Ltd. · מנכ"לית                          |
|     > לשלוח הצעת מחיר · עד 30/9                   |
| ...                                              |
+--------------------------------------------------+
| צינור עסקאות                      [+ עסקה חדשה]  |  collapsed when 0 deals
+--------------------------------------------------+
```

The row keeps its score at the start and moves the status chip next to the name. The last-touch text sits at the end of the row. A needs-a-touch row carries a text marker ("צריך מגע"), not just a colour. All new class strings are written into DESIGN.md §8 before the code, under the Design-Doc Rule.

## Risks / Trade-offs

- **[Risk] Other callers of `Drawer` break when `dir` becomes required.** → Only two callers exist (`CrmContactDrawer`, `CrmHeaderMenu`), and `tsc` finds both. Making the prop required on purpose means a missing direction is a type error, not a silent default.
- **[Risk] `inert` on the closed panel also blocks the exit animation's focus return.** → Focus is returned to the opening row before the closing spring starts, as `CrmContactDrawer` already does. `inert` is applied on rest, after the panel has left.
- **[Risk] The task query adds latency to the home page.** → One indexed query bounded by 200 ids, run in parallel with the existing three. `crm_tasks` has an index on `(owner_id, status, due_date)` but not on `workspace_id`. If the page's server time grows by more than 100ms at the current data size, add `crm_tasks (workspace_id, status, due_date)` as a follow-up migration. That is not needed at today's volume.
- **[Trade-off] Removing the headline also removes the only place the product name appears on the page.** → The nav logo already names it on every screen.
- **[Trade-off] Hiding "₪0 / 0%" with no deals means the figures line changes shape once the first deal exists.** → A line that grows is better than tiles that report zeros as if they were results.

## Migration Plan

No data migration. Deploy is the usual `firebase deploy --only apphosting:helix-crm`, and it does not touch the website's static Hosting export. The drawer fix is independent of the rest and can ship first if the layout work runs long. Tasks are ordered that way. Rollback is a revert of the app deploy. Nothing persists.
