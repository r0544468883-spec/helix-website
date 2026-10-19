# GEO Product — Technical Review Guide

מדריך לסקירה טכנית מלאה של כלי ה-GEO (מדידת נראות מותג במנועי AI). קרא מלמעלה למטה: קודם הרצה מקומית, אחר כך מפת הארכיטקטורה, ואז נקודות שחשוב לבחון לעומק.

Everything below is code in this repo (helix website, Next.js 15 App Router, Firebase App Hosting). The GEO product has two faces: a full outbound report (`/r/<token>`) and a self-serve lead tool. Engine = "Share of Model" (per-engine, multi-run, Hebrew-first).

---

## 1. Run it locally

```bash
git clone <this repo>            # r0544468883-spec/helix-website, branch master
cd helix-website
npm install
cp .env.example .env.local       # if no example exists, create .env.local with the vars below
npm run dev                      # http://localhost:3000
npm run build                    # production build (what App Hosting runs)
npx tsc --noEmit                 # type check
```

### Environment variables the GEO features read

| Var | Needed for | Notes |
|---|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` | report + event + api-key storage | Storage REST only, no SQL. Buckets: `geo-reports`, `geo-events`, `geo-api-keys`. |
| `ANTHROPIC_API_KEY` | Claude engine | |
| `OPENAI_API_KEY` | ChatGPT engine (`gpt-6-sol`) | |
| `GEMINI_API_KEY` | Gemini engine | |
| `PERPLEXITY_API_KEY` | Perplexity engine (optional) | absent today; engine auto-skips |
| `PORTAL_SESSION_SECRET` | admin token derivation | `adminToken()` = sha256("geo-som:"+secret).slice(0,24) |
| `GEO_ADMIN_PASSWORD` | admin login (optional) | login ALSO accepts a hard-coded sha256 fallback, see §6 |
| `FIRECRAWL_API_KEY`, `PAGESPEED_API_KEY` | Layer-B scan enrichment | degrade gracefully if unset |

Every engine is optional: with no key, `isConfigured()` is false and it is skipped. With zero engines, `computeShareOfModel` returns `available:false` (still returns the question set).

---

## 2. Architecture / data flow

```
POST /api/geo-generate (admin)  ─┐
POST /api/v1/audit     (api key) ─┤
                                 ▼
                          buildGeoReport(url, opts)          lib/geo-report-build.ts
                                 │
          ┌──────────────────────┼─────────────────────────┐
          ▼                      ▼                           ▼
   scanSite(url)         computeShareOfModel()         buildGeoPlan(report)
   lib/geo-scan.ts       lib/share-of-model.ts         lib/geo-plan.ts
   (Layer B, HTTP only,  (Layer A, fans out to          (pure, $0, derives the
    deterministic, $0)    claude/openai/gemini,          90-day plan from the
          │               3 runs x 8 questions)          report's own fields)
          │                      │                           │
          └──────────────────────┴───────────┬───────────────┘
                                              ▼
                       GeoReport object  { scan, shareOfModel, iab4p,
                         addressableSources, ownedProperties, israeli, plan }
                                              │
                               saveReport() → Supabase Storage (geo-reports/<token>.json)
                                              │
                              GET /r/<token>  → app/r/[token]/page.tsx  (SSR, noindex)
                              Track beacon → /api/r-track → geo-events/<token>/*.json
                              GET /api/geo-reports/<token>/stats (admin) ← aggregates events
```

The flywheel the plan is ordered by: `INGEST -> STRUCTURE -> ANSWER -> CITE -> MEASURE`.

---

## 3. File map (what to read, in order)

**Core engine**
- `lib/share-of-model.ts` — the measurement. Question generation, per-(question,engine,run) fan-out, brand/competitor parsing, share-of-model math, sentiment, accuracy check, **presence Wilson confidence band**. Start here.
- `lib/geo-scan.ts` — deterministic Layer-B scan: fetch, robots.txt + AI-crawler check, GPTBot live-fetch probe, schema/JSON-LD, `extractExternalPresence` (owned links). `scanSite()` + `normalizeUrl()`.
- `lib/ai-visibility.ts` — shared primitives reused by the engine (`brandAliases`, `mentionsBrand`, `extractCompetitors`, `REFUSAL_RE`).
- `lib/providers/{claude,openai,gemini,perplexity}.ts` + `types.ts` — each wraps one engine's web-search call; parses citations. `isConfigured()` / `ask()`.

**Report assembly**
- `lib/geo-report-build.ts` — `buildGeoReport`, the `GeoReport` contract, IAB 4Ps roll-up, addressable sources, owned-properties cross-ref.
- `lib/israeli-geo.ts` — the Israeli citation-graph layer (curated source graph, footprint, prioritized gaps). The moat.
- `lib/geo-plan.ts` — `buildGeoPlan` (v1, pure) + `draftAnswerPassages` (v2, paid).
- `lib/geo-cost.ts` — pre-flight cost estimate + the per-call price bands.
- `lib/geo-report-store.ts` — Supabase Storage read/write/list for reports.
- `lib/report-events.ts` + `lib/report-sections.ts` — analytics events + section order.

**Routes** (`app/api/...`)
- `geo-generate` (admin), `v1/audit` (api-key), `geo-access-check` (PUBLIC FREE), `geo-reports/keys` (admin mint), `geo-reports/[token]/stats` (admin), `r-track` (public beacon), `geo-admin-login`.

**UI**
- `app/r/[token]/page.tsx` — the report (render contract mirrored locally). `track.tsx` — the beacon.
- `app/geo-admin/*` — dashboard (login, generate card, reports table, api-keys card).

**Auth / keys**
- `lib/geo-admin-auth.ts` — `adminToken()`, `isAdmin()`.
- `lib/geo-api-keys.ts` — api-key create/validate/list (sha256-hashed, Storage-backed).

**Distributables**
- `packages/helix-geo-cli/` — `npx helix-geo check|audit`.
- `.github/actions/geo-access-check/` — composite GitHub Action (free access check).

---

## 4. Endpoints + how to exercise them

```bash
# PUBLIC, FREE, no auth, no LLM, $0 — the engine behind the GitHub Action
curl "https://helix.co.il/api/geo-access-check?url=example.com"

# Admin: dry-run returns the cost estimate and spends nothing
curl -X POST https://helix.co.il/api/geo-generate \
  -H "content-type: application/json" -H "x-som-key: <adminToken>" \
  -d '{"url":"example.com","dryRun":true}'

# API-key gated full audit (spends real credits; capped per key)
curl -X POST https://helix.co.il/api/v1/audit \
  -H "authorization: Bearer <hgk_...>" -H "content-type: application/json" \
  -d '{"url":"example.com"}'
```

Admin dashboard: `/geo-admin`. Access tokens: header `x-som-key` = `adminToken()`, or the cookie set by `/api/geo-admin-login`.

---

## 5. Cost model

One full run ≈ `1 (question gen) + N_engines (brand desc) + questions*engines*runs` calls (today: 8*3*3 + 3 + 1 = 76 calls, ~$1.8-3.7 across claude/openai/gemini). `estimateShareOfModelCost()` computes a low/high band from per-call price bands in `geo-cost.ts`. Guards: `dryRun` (preview, $0), `maxUsd` (refuse over cap, 402), and per-api-key `maxUsdPerRun`. v2 passage drafting adds up to 5 cheapest-engine calls, reflected in the estimate.

---

## 6. Areas that most need a second pair of eyes (honest hotspots)

**Security**
- `/api/geo-access-check` and `scanSite` fetch an **arbitrary user-supplied URL server-side** (SSRF surface): no allowlist, no block on private/loopback ranges, public + unauthenticated. Review whether it can be pointed at internal hosts or abused as a request amplifier/DoS. This is the biggest one.
- Admin auth: `/api/geo-admin-login` matches `GEO_ADMIN_PASSWORD` **or a hard-coded sha256 of the password committed to this (public) repo** (see `app/api/geo-admin-login/route.ts`). The password is a guessable brand string. Acceptable for a low-value internal dashboard, but a reviewer should weigh it. Admin endpoints return 404 (not 401) to probes by design.
- `/api/v1/audit` spends real money per call. Gated only by per-key `maxUsdPerRun`. There is **no global rate limit and no per-key daily cap / kill-switch yet** — a leaked key with a high cap could burn credits until noticed. Worth adding before publishing the CLI widely.
- API keys stored as sha256 in a Supabase Storage bucket created `public:false` — confirm the bucket is actually private in the project and that the service key is server-only.

**Correctness (the measurement is heuristic by nature)**
- Competitor extraction + brand position are parsed from LLM **prose/numbered lists via regex** (`parseRankedNames`, `extractCompetitors`) — brittle to formatting; worth spot-checking against raw answers.
- Sentiment is a **lexical word-list heuristic**, not a model call — cheap but coarse.
- Accuracy/hallucination check compares engine text to thin site "facts" — review the thresholds.
- Wilson interval treats runs as independent trials; runs against the same engine are not fully independent, so the band is indicative, not rigorous.
- Per-call USD price bands in `geo-cost.ts` are **estimates**, not metered actuals.

**Scale / ops**
- Each report = ~76 live calls, run sequentially per question (engines*runs in parallel). No scan caching.
- Analytics writes **one Storage object per event**; a popular report accumulates many objects, and `reportStats` lists+loads them (paginates to 10k). Fine for outbound volumes, watch at scale.
- Deploy trap: `firebase deploy --only apphosting` returns **exit 0 even when Cloud Build fails**. Only "Rollout for backend ... complete!" in the log means it shipped. Confirm every deploy by the log line, not the exit code.

**Honesty / product**
- Results are non-deterministic by design; the product frames everything as a trend/band, never a promise. Confirm no copy accidentally implies a guarantee.
- v2 drafted Hebrew passages are marked "draft, proofread recommended" and are NOT yet routed through the brand-voice/baldiga proofing pass. Confirm before any auto-publish.

---

## 7. Known non-goals (so review scope is clear)
- Not a developer self-serve SaaS yet (CLI/Action/API exist but are unpublished).
- No cited-page verification ("fetch the cited page, confirm the brand is actually on it") yet — a known candidate upgrade.
- Perplexity engine is wired but keyless today.
