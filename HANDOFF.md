# HANDOFF — pending manual steps (for Eran)

Date: 2026-08-25. Context: a clean-room email-suppression layer + agent teams
were shipped across the HELIX products. Three steps remain that need dashboard /
DB / per-machine access and could not be done from the coding session. None are
code changes — the code is already committed and pushed.

---

## 1. Run the `email_suppression` migration (OPS + SDR) — ~2 min

Both products now filter every send through an `email_suppression` table, but the
table does not exist yet in the databases. Run this SQL **once in each project's
Supabase → SQL Editor** (HELIX OPS project AND HELIX SDR project):

```sql
create table if not exists email_suppression (
  email      text primary key,
  reason     text not null default 'manual',   -- bounce | complaint | manual
  source     text not null default 'system',
  created_at timestamptz not null default now()
);
alter table email_suppression enable row level security;
-- no anon/authenticated policies => client access denied; service role writes.
```

Source of truth in-repo:
- OPS: `helix-ops/supabase/migration-v22-email-suppression.sql`
- SDR: `helix-sdr-bdr-bot/supabase/email-suppression.sql`

Until this runs: OPS `deliverCampaign` sends normally but does not suppress; SDR
`resendSend` fails open (no suppression, sending not blocked).

## 2. Configure the Resend bounce webhook (OPS + SDR) — ~5 min

So hard bounces / spam complaints auto-populate the suppression list:

1. Resend dashboard → **Webhooks** → add endpoint:
   - OPS: `https://<ops-domain>/api/webhooks/resend`
   - SDR: `https://<sdr-domain>/api/webhooks/resend`
   - Events: `email.bounced`, `email.complained`
2. Add env var **`RESEND_WEBHOOK_SECRET`** (any strong random string) in the
   Vercel project settings for BOTH OPS and SDR, and set the same value as the
   webhook's secret header (`x-webhook-secret`).

Route handlers already exist:
- `helix-ops/app/api/webhooks/resend/route.ts`
- `helix-sdr-bdr-bot/app/api/webhooks/resend/route.ts`

## 3. Enable the codebase-memory MCP (per developer machine) — ~1 min

Each repo has a `.mcp.json` adding the `codebase-memory` server (cuts agent token
use ~99%). On your machine:

```bash
npm install -g codebase-memory-mcp
```

Then open any HELIX repo in Claude Code and **approve** the project MCP server
when prompted. (Already installed + approved on Ron's machine.)

---

## What was already shipped (no action needed)
- **Suppression core**: `lib/email-suppression.ts` in OPS + SDR, wired into the
  send paths, with a Resend bounce webhook. Committed + pushed.
- **Clean-room skills** (`.claude/skills/`): `helix-email-campaigns`,
  `helix-screen-recording`, `helix-project-management`, `helix-video-production`
  — OSS-safe replacements for AGPL tools (listmonk / Cap / plane / OpenMontage).
- **Agent teams**: per-product rosters in each product's `.claude/agents/` +
  `TEAM.md`, from VoltAgent subagents (MIT), under `multi-agent-coordinator`.
- **Invisible-char cleaner**: `lib/clean-text.ts` wired into every product's LLM
  output path (RTL-safe).
