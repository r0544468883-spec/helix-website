# HELIX × GTM Skills — Clusters → Products Map

Source: **swan-gtm/gtm-skills** (358 GTM SKILL.md playbooks, MIT). Installed globally in `~/.claude/skills/` and theme-distributed into each product's `.claude/skills/` on 2026-09-02. Each product's `.claude/agents/TEAM.md` now wires the relevant clusters to the owning specialist agent, per the standing rule **Agent = archetype × domain(skill)**.

Key point: the pool is not a bag of loose skills. It contains **6-8 product-grade capability clusters**. Every one of them slots into an EXISTING HELIX product as a module. No new product is required (though several clusters are strong enough to spin out later).

## Clusters → owning product (module, not new product)

| Cluster (skills) | Lands in | As |
|---|---|---|
| **Prospecting + list/ICP/TAM + enrichment** (~40) | SDR-BDR-BOT | list/ICP/TAM engine |
| **Signal-based selling** (signals, triggers, bridgebound) (~25) | SDR-BDR-BOT | signal→campaign chain |
| **Cold outreach copy + sequences + deliverability** (~30) | SDR-BDR-BOT | outbound copy + inbox health |
| **RevOps** (revops-*, routing, data governance) (~30) | CRM | RevOps operating system |
| **Pipeline + deal management** (meddpicc, deal-desk, multi-thread) (~15) | CRM + Meeting | deal engine + deal coach |
| **Customer success + expansion + retention** (~15) | Growth Doctor + CRM | retention/expansion motions |
| **Paid media / Ads** (google-ads-*, meta-*, linkedin-ads-*) (~40) | OPS | paid-media module |
| **ABM** (linkedin-abm-*, abm-*, 1-to-1-abm-ads) (~15) | OPS (+ CRM account tiering) | ABM engine |
| **Creator / Influencer marketing** (creator-*, influencer-*) (~13) | OPS | creator-marketing module |
| **Newsletter + email marketing** (newsletter-*, beehiiv, 52-ideas) (~15) | OPS | email-marketing module |
| **Reddit / Community authority** (reddit-*, quora-*, subreddit-*) (~12) | OPS | 3rd engagement lane |
| **LinkedIn organic** (ghostwriting, engagement, DM classifier) (~6) | OPS | organic social |
| **SEO** (seo-*) (~10) | Rank | keyword/technical SEO |
| **AEO / AI-visibility** (aeo-*, ai-visibility-*, citation-gap) (~8) | Rank | AEO module (brand presence in AI answers) |
| **Positioning / messaging** (positioning-*, category-of-one, battlecard) (~8) | OPS + Shop + Stage | positioning |
| **Pricing / monetization** (pricing-*, ai-pricing, credit-packaging, comp) (~6) | Account Portal (+ CRM deal-desk) | pricing engine |
| **Founder / startup GTM** (founder-*, gtm-planning, vc-portfolio-research) (~8) | Stage | GTM-in-a-box for founders |
| **Metrics / measurement** (revops-metrics, benchmarks, ROI-proof) (~10) | Dashboards | GTM performance cockpit |
| **Conversational outreach** (outreach-messaging, sequence-writer) (~8) | WhatsApp | WA outreach |

## Free tools (HELIX site lead-magnets) — CONSOLIDATED

Design decision (2026-09-03): do NOT ship one tool per skill. Consolidate into a few tools; each is a UI wrapper over several pool skills, gated + funneling to the matching paid product.

| Free tool | Merges | Skills | Status | Funnels to |
|---|---|---|---|---|
| **AI-visibility check** (do you show up in ChatGPT/Perplexity) | — | ai-visibility-prompt-research, ai-visibility-sampling, aeo-visibility-tracking | **EXISTS** | Rank |
| **GTM Intelligence** — 2 tabs: (a) "who to sell to" = ICP+TAM; (b) "research a target" = account brief + battlecard if competitor | 1 + 4 + 5 | icp-builder, tam-builder, build-and-fill-a-tam, account-research-brief, company-deep-dive, battlecard, competitor-positioning | new | SDR / CRM |
| **Cold Email Optimizer** — paste email → score + fixes + better subject lines | 2 + 7 | cold-email-preflight, email-metrics-benchmarks, email-writing-frameworks, email-subject-lines, email-copy-optimizer | new | SDR / OPS |
| **ICP List Filter** — upload CSV → who matches, with a reason per row | 3 (standalone) | audience-icp-filter, icp-score-and-route | new | SDR / CRM |
| **Business Differentiation** (existing) + category-of-one upgrade | 6 folds in | positioning-and-story, category-of-one-positioning | enhance existing | OPS |

Net: 3 new free tools + 1 enhancement to the existing differentiation tool. All run the Maker->Critic pattern + baldiga proofread + clean-text, and end on a CTA to the matching paid product.

## Standing rule
Before any new build: check installed skills for a fit AND pull swan-gtm/gtm-skills for new skills. See memory `feedback-check-skills-on-every-build`.
