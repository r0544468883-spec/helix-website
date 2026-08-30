---
name: ecommerce-sell
description: Ecommerce selling and support that answers only from catalog, inventory, and policy facts, recommends the best-fit item with a reason, handles the top objection, and closes on one clear next step. Also covers building high-converting storefront surfaces: product detail pages (galleries, variant selectors, social proof, sticky add-to-cart, structured data) and low-friction checkout (express wallets, address autocomplete, field reduction, one-page flow, early shipping costs). Use when writing a sales or support reply, recommending or upselling a product, or designing or optimizing a PDP or checkout to lift add-to-cart and reduce abandonment. Hebrew native and RTL. Not for paid ad management (use paid-ads) or funnel CRO diagnosis (use cro-conversion).
---

# Ecommerce Sell and Support

## When to use
- Writing a customer-facing sales or support reply grounded in real catalog/inventory/policy data.
- Recommending the best-fit product, handling an objection, or suggesting one complementary add-on.
- Designing or optimizing a product detail page (PDP): gallery, variants, social proof, add-to-cart.
- Designing or optimizing checkout to reduce abandonment.

Not for: managing paid ad spend (use paid-ads), or diagnosing where a funnel leaks with significance testing (use cro-conversion).

## Operative rules (always-on; mirrors the registry entry)
- GROUNDING (hard): prices, stock, specs, shipping, and return terms come ONLY from tool/catalog data. Never invent a product, price, variant, or stock level. If a fact is missing, say you will check or hand off, do not guess.
- SELL: understand the need in one question if unclear, recommend the best-fit item with the reason, handle the top objection (price -> value/ROI or alternative; fit -> specs; risk -> returns/guarantee). Warm and helpful, never pushy.
- AOV: suggest at most ONE genuinely complementary item that already exists in the retrieved facts. Never a repeat, never a bare upsell. Frame as usefulness, not "buy more".
- CLOSE: one clear CTA (add to cart / checkout / the specific next step). Match the customer's language; Hebrew native and RTL.

## Deep reference (the on-demand layer)

### Grounding discipline
Every factual assertion about a product (price, stock level, spec, shipping time, return window) must trace to tool or catalog data present in context. If the data is not there: say you will check or hand off. Never fill a gap with a plausible-sounding number. A confident wrong price or a promised stock level that is not real is a defect, not a helpful guess. This mirrors the qa-verification evidence standard applied to commerce.

### Sell flow
1. Diagnose the need. If the request is ambiguous, ask exactly one clarifying question, not a survey.
2. Recommend the single best-fit item and say why it fits their stated need. One recommendation reads as advice; three read as a catalog dump.
3. Handle the top objection at its type:
   - Price: reframe to value/ROI, or offer a cheaper alternative that still fits.
   - Fit/suitability: answer with the specific spec that resolves it.
   - Risk: point to the return policy or guarantee.
4. One complementary add-on, only if a genuinely useful match exists in the retrieved facts. Frame it as making the first item work better, never "customers also buy".
5. Close on one concrete next step.

### Product detail page (PDP)
Above the fold on desktop, without scrolling: title, price, main image, add-to-cart. Below that, the depth.

Gallery: zoomable main image with thumbnails and swipe on mobile. Hero image loads eager; thumbnails and secondary images lazy. Serve responsive srcset in a modern format (WebP/AVIF). Set explicit width/height or aspect-ratio on the container to prevent layout shift (CLS).

Variant selector: use semantic radio inputs inside fieldset/legend, not clickable divs, so screen readers and keyboard work. Track availability per combination; disable (do not hide) out-of-stock variants so shoppers see what exists, with an sr-only "(out of stock)". Update the URL with the selected variant (replaceState) so the page is shareable. When a color has its own image, switch the gallery on selection.

Sticky add-to-cart bar: on long pages (especially mobile), show a sticky buy bar when the main add-to-cart button scrolls out of view. Use an IntersectionObserver on the main button; the bar carries the name, current price, and the button (disabled/"Sold Out" when the variant is unavailable).

Social proof and trust: star rating + count immediately below the title, above the price. Real low-stock only ("Only 3 left" solely when inventory is genuinely under threshold; never fake urgency). Trust badges (secure checkout, free returns, warranty) near the add-to-cart. Recent-purchase notifications only with real data.

Structured data: emit Product JSON-LD server-side (name, images, description, sku, brand, offers with price/availability, and aggregateRating when reviews exist). This is a SEO/GEO win; see seo-geo-pack for schema-page-match rules.

Platform note: on Shopify/WooCommerce/BigCommerce most of this is theme + app configuration (variant pills, review apps like Judge.me/Loox, swatch plugins, sticky-cart theme options) rather than custom code. On custom/headless, build the two-column grid with a sticky gallery and the components above.

### Checkout optimization
Abandonment averages around 70%. The high-impact, mostly-configuration fixes:
- One-page checkout (contact + shipping + payment on one page) over a multi-step flow.
- Express wallets above the form: Apple Pay, Google Pay, Shop Pay, PayPal Express. Two-tap completion; never bury them below a long form.
- Address autocomplete (Google Places) cuts address entry time markedly and reduces errors; restrict to the countries you ship to.
- Reduce fields: single full-name field, hide company (unless B2B), make address line 2 optional/hidden, drop order notes unless actually used.
- Guest checkout available; capture email first (single field at top) so abandonment recovery works even if they drop.
- Show shipping cost early (cart or first step). Revealing shipping at the last step is the top abandonment cause.
- Keep the order summary visible throughout; shoppers need to see what they are buying.
- Validate on blur, not only on submit, so errors get fixed progressively.
- Trust signals (SSL badge, card logos, short return-policy link) near the payment fields, the highest-anxiety step.
- Mobile: single column, native autocomplete, minimal typing.

Measure after changes (GA4 funnel): checkout initiation > 30% of cart sessions, completion > 50% of initiated, express usage > 20% of completions, mobile completion > 45%.

### Motion (use sparingly, never slow the path to purchase)
Add-to-cart around 200ms ease-out; quick-view around 250ms; checkout step around 350ms ease-in-out; cart update around 150ms. Skeleton screens for perceived speed. Every motion should build buying confidence, never delay the click. Respect prefers-reduced-motion.

### Hebrew and RTL
Customer copy reads as native Israeli Hebrew, RTL, with ₪ before the number (₪149). Isolate LTR runs (SKUs, phone numbers, model codes) so they do not flip inside Hebrew text. Right-align labels; mirror directional icons; keep prices/codes LTR. See accessibility-a11y and the RTL reference for bidi details.

## Anti-patterns / common mistakes
- Inventing a price, stock number, spec, or product not in the retrieved facts.
- Recommending three items instead of one best-fit with a reason.
- A bare upsell ("want to add more?") or repeating an item already in cart.
- Fake urgency ("only 3 left") not backed by real inventory.
- Clickable divs for variants instead of radio/fieldset (breaks keyboard and screen reader).
- Hiding out-of-stock variants instead of disabling them.
- Images without width/height (CLS jumps); hero image lazy-loaded.
- Express wallets buried below the form; shipping cost revealed only at the last step.
- Too many checkout fields; forced account creation blocking guest checkout.
- Animations long enough to delay add-to-cart or checkout.
- Pushy tone; more than one CTA.

## Checklist before returning
- Every product fact traces to catalog/inventory/policy data; no invented numbers.
- One best-fit recommendation with a reason; top objection handled at its type.
- At most one genuinely complementary add-on from real facts, framed as usefulness.
- PDP: above-the-fold essentials, semantic variant selector, disabled (not hidden) out-of-stock, real social proof, sticky cart, server-side Product JSON-LD, CLS-safe images.
- Checkout: one-page, express wallets on top, autocomplete, minimal fields, guest checkout, early shipping cost, visible order summary, trust signals at payment.
- One clear CTA. Hebrew native + RTL, ₪ before the number, LTR runs isolated.
- Motion never slows the path to purchase; reduced-motion respected.

## Sources
- product-page-design (installed at ~/.claude/skills/): PDP layout, gallery, semantic variant selector with availability, sticky add-to-cart, social proof/trust, Product JSON-LD, platform vs custom guidance, CLS pitfalls.
- checkout-flow-optimization (installed at ~/.claude/skills/): one-page checkout, express wallets, address autocomplete, field reduction, early shipping cost, validate-on-blur, funnel metrics.
- e-commerce-retail (installed at ~/.claude/skills/): Disney-principle motion timings for commerce, "never let animation slow the path to purchase".
- Registry operative entry "ecommerce-sell" (ai-kit/skills/registry.ts): grounding, sell flow, single complementary add-on, one CTA, Hebrew/RTL.
