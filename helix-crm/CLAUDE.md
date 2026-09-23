# HELIX CHIEF CRM — Claude Code Context

> Scoped context for everything under `helix-crm/`. The parent repo's `../CLAUDE.md` still applies for brand, voice, and standing rules.

---

## 🎨 RULE #1 — `DESIGN.md` is read first and updated last

**Before you edit any `.tsx`, `.css`, or UI-shaped file in this app: open `helix-crm/DESIGN.md`.**
**Before you finish: update it.** The change is not done until the doc matches the code.

This is not a suggestion and not a review-time nicety. It's the first step and the last step.

**Read first — what you're looking for:**
- Colors, status hues, white-label accent → §2, §3, §4
- Type sizes and which font → §5
- Container width, padding, section rhythm → §6
- Radius for a control vs a card vs a row → §7
- **A component you're about to build probably already has a class string → §8. Copy it verbatim.**
- Screen layout (workspace / record / chat / inline form) → §9
- Animation → §10 (springs from `lib/motion`, never durations)
- RTL and i18n → §11 · a11y → §12 · icons → §13
- **What NOT to do → §14. Read it every time.**
- Known bugs and deviations → §15 · unresolved calls → §16
- Shipping a new screen → §18 checklist

**Update last — any of these means you touch `DESIGN.md` in the same commit:**
- a new token, or a changed one
- a button/input/card/row/chip variant that isn't in §8 yet
- a new spacing, radius, container width, or grid
- a new status color or its meaning
- a new screen pattern
- new motion
- you found a deviation in existing code → add a row to **§15 Known Drift**
- you fixed one → delete that row
- always: bump `Last updated:` in the header

**Doc vs code conflict:** the doc wins — fix the code. Changing the system instead needs Eran's sign-off, the doc updated first with the reason, then the code.

**Never copy design from the website.** `../DESIGN.md` and `../EFFECTS.md` describe a light, editorial marketing site. This is a dark, dense app with different token names. Cross-copying classes is a bug, not a shortcut.

---

## What this app is

HELIX CHIEF CRM — Next.js 15 (App Router) + React 19 + Supabase + Tailwind v4, Hebrew-first (`he` default, `en` secondary), deployed to its own Firebase App Hosting backend (`helix-crm`, project `helix-fc9de`, europe-west4) at **crm.helix.co.il**.

Signed-in surfaces: `/[locale]/dashboard/**` (command center, CRM, email, automations), `/[locale]/chief` (CHIEF conversational agent), `/[locale]/login`, `/[locale]/onboarding`. Public STAGE-era routes (`/board`, `/launches`, `/products`, `/community`) are legacy and allowed marketing warmth.

## Hard boundaries

- **Builds and deploys independently.** Own `npm install`, own `package-lock.json`, own `apphosting.yaml`. It needs a server runtime, so it can never ship inside the parent site's static export.
- **Never import across the `helix-crm/` boundary** in either direction. The `@/*` alias would drag excluded files into the build.
- The parent repo excludes this directory from its App Hosting build (`firebase.json`) and from root type-check (`tsconfig.json`).
- `vercel.json` crons don't run here. Scheduling is Cloud Scheduler hitting `/api/digest` and `/api/email/run-scheduled` with `Authorization: Bearer $DIGEST_SECRET`.
- `README.md` in this directory is **stale** (it describes the old HELIX STAGE platform). Trust `DESIGN.md`, the code, and this file over it.

## Conventions

- **No Tailwind config file.** The palette lives in `app/globals.css` under Tailwind v4 `@theme`. Utilities resolve `--color-*`.
- **No user-visible string in a component.** Everything goes through `lib/i18n/{he,en}.ts`, typed by `Dict`.
- **Logical CSS properties only** (`ms-` `me-` `ps-` `pe-` `start-` `end-` `border-s` `text-start`). RTL is the default, not an afterthought.
- **Motion comes from `lib/motion/`** — a zero-dependency spring system. Read its `README.md` before animating.
- **Multi-tenant by `workspace_id`.** Every Supabase query in a CRM path filters on the active workspace (`lib/crm-workspace.ts`). RLS is the backstop, not the filter.
- **Invite-only auth.** Magic link with `shouldCreateUser: false`; signup is blocked in the DB trigger too.

> This directory is a git subtree of `r0544468883-spec/helix-crm`. Files added here (this one, `DESIGN.md`) travel upstream on the next subtree push.
