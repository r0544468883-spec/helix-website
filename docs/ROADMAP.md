# Helix Site — Development Roadmap

Phased build plan. Phase 1 is the launch target; everything else is post-launch.

---

## Phase 1: Launch MVP (target: 1-2 weeks of work)

The goal: a homepage that converts. Everything else can wait.

### 1.1 Project setup
- [ ] Initialize Astro project with TypeScript
- [ ] Add Tailwind CSS + configure with Helix design tokens (from `docs/BRAND.md`)
- [ ] Install and configure Heebo font (Google Fonts)
- [ ] Configure `<html dir="rtl" lang="he">` defaults
- [ ] Set up Vercel or Netlify deployment with preview URLs
- [ ] Set up Git repo with sensible `.gitignore`

### 1.2 Shared components
- [ ] `Layout.astro` — base layout with metadata, font loading, html lang/dir
- [ ] `Nav.astro` — sticky nav with scroll-aware backdrop blur
- [ ] `Footer.astro` — minimal footer
- [ ] `Button.astro` — three variants: primary, secondary, text
- [ ] `SectionHeader.astro` — eyebrow + title + description pattern

### 1.3 Homepage
Port `reference/homepage-mockup.html` to Astro. Build section by section:
- [ ] Hero
- [ ] Pain (Promise vs Reality)
- [ ] Capabilities (with monospace tech stack lines)
- [ ] Method (4 behaviors)
- [ ] Journey (4-step stepper)
- [ ] Services (Audit / Launch / Grow — no prices!)
- [ ] Cases (4 placeholder cases — Eran will fill content)
- [ ] About / מי אני
- [ ] FAQ (native `<details>` / `<summary>`, no JS)
- [ ] Resources (4 channel cards as prose list)
- [ ] Final CTA (light section, NOT dark)

### 1.4 Polish
- [ ] Responsive on mobile (test at 375px width)
- [ ] All section anchors work (smooth scroll)
- [ ] Lighthouse audit 90+ on Performance, Accessibility, Best Practices, SEO
- [ ] Open Graph + Twitter card meta tags
- [ ] Favicon (simple, brand emerald dot)
- [ ] 404 page (on-brand)

### 1.5 Deploy
- [ ] Domain `helix.co.il` connected
- [ ] SSL working
- [ ] Test on real devices (iPhone + Android)
- [ ] Send to Eran for final review

---

## Phase 2: Content channels (target: 1 week after Phase 1)

Bring articles and podcast online so Eran can start publishing.

### 2.1 Articles
- [ ] Port `reference/articles-mockup.html` to `/articles` page
- [ ] Set up Content Collections in Astro for articles (Markdown / MDX)
- [ ] Build article page template (`/articles/[slug]`)
- [ ] Article page features:
  - [ ] Hero with title, category, date, read time
  - [ ] Body with Tailwind typography (`prose` plugin)
  - [ ] "Related articles" at bottom
  - [ ] Newsletter signup
- [ ] Tag/category support (simple, just visual filtering for now)
- [ ] RSS feed at `/articles/rss.xml`

### 2.2 Podcast
- [ ] Port `reference/podcast-mockup.html` to `/podcast` page
- [ ] Set up Content Collections for episodes
- [ ] Build episode page template (`/podcast/[slug]`)
- [ ] Episode page features:
  - [ ] Featured episode card (dark variant from mockup)
  - [ ] Audio player embed (Spotify or Substack player)
  - [ ] Show notes (Markdown body)
  - [ ] Subscribe links (Spotify, Apple, YouTube, RSS)
  - [ ] Transcript section (collapsible)
- [ ] Podcast RSS feed at `/podcast/rss.xml` (for podcast platforms)

### 2.3 Newsletter integration
- [ ] Pick a provider: ConvertKit (recommended) or Mailchimp
- [ ] Add signup form to: articles page, podcast page, footer
- [ ] Custom confirmation email
- [ ] Welcome email sequence (3 emails)

---

## Phase 3: Conversion optimization (target: 2 weeks after Phase 2)

### 3.1 Calendly integration
- [ ] Embed Calendly on Final CTA section
- [ ] Discovery call link with intake questions
- [ ] Calendar slot only on Tue/Thu (Eran's preference)

### 3.2 Analytics
- [ ] Install Plausible Analytics (privacy-friendly, on-brand)
- [ ] Track key events: discovery-call clicks, FAQ opens, article reads
- [ ] Set up monthly report for Eran

### 3.3 SEO
- [ ] Sitemap.xml
- [ ] robots.txt
- [ ] Schema.org markup for Organization
- [ ] Schema.org for individual articles
- [ ] Audit and fix any SEO issues

### 3.4 Performance
- [ ] Image optimization (Astro's built-in)
- [ ] Font preloading
- [ ] Critical CSS inlining
- [ ] Target 95+ Lighthouse all categories

---

## Phase 4: Internationalization (target: when first international lead arrives)

For Toptal/Arc.dev clients.

- [ ] English homepage at `/en`
- [ ] Language switcher in nav
- [ ] English copy translated (NOT just machine-translated — voice-aligned)
- [ ] English versions of Cases and About
- [ ] hreflang tags for SEO
- [ ] `<html dir="ltr" lang="en">` for English pages

---

## Phase 5: Future enhancements (when there's demand)

Ideas to revisit after launch + 90 days:

- [ ] **Case study deep-dives** — individual `/cases/[slug]` pages
- [ ] **Search** — for articles, when 10+ articles exist
- [ ] **Article tags page** — `/articles/tags/[tag]`
- [ ] **Resource downloads** — gated PDFs (e.g., "Audit Checklist", "Status Meeting Template")
- [ ] **Client portal** — secure login for active clients (Phase X, only if needed)
- [ ] **Comment / discussion** — on articles (consider Disqus or self-hosted)
- [ ] **Tip jar / Buy me a coffee** — for newsletter readers
- [ ] **Audio versions of articles** — for accessibility / commute reading

---

## Non-goals (for now)

Things we explicitly will NOT build:

- ❌ Pricing page (prices stay off the site)
- ❌ Live chat widget
- ❌ Chatbot for sales
- ❌ Push notifications
- ❌ "Pop-up to subscribe before you leave"
- ❌ Sticky footer CTA bars
- ❌ Exit-intent popups
- ❌ Affiliate / referral program tracking
- ❌ Multi-author setup (Eran is the only author for now)
- ❌ Forum / community section

If a future "yes, we should add this" feeling comes up — re-read the BRAND.md and ask whether the addition feels Helix-calm or vendor-flashy.

---

## Decision Log

When making architecture or design decisions during build, log them here:

```
[Date] — Decision: ...
        Reasoning: ...
        Alternatives considered: ...
```

Example to start:
```
2026 launch — Decision: Astro + Tailwind + TypeScript
              Reasoning: Best fit for content-heavy marketing site,
                         Eran's React knowledge transfers, ships zero JS.
              Alternatives: Next.js (overkill), 11ty (less flexibility),
                            plain HTML (not enough scaffolding for content growth)
```

---

## How to Use This Roadmap

1. **Don't skip phases.** Phase 1 is the entire MVP. Resist the urge to build Phase 2 features while Phase 1 isn't deployed.
2. **Check items off as you complete them.** Visible progress matters.
3. **Add items as you discover them.** This is a living doc.
4. **Re-prioritize when reality demands it.** If a client asks for a feature and pays for it, that beats roadmap order.

---

*Roadmap as of project initialization. Adjust as the business and feedback evolve.*
