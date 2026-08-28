---
name: accessibility-a11y
description: Accessibility review to WCAG 2.2 AA and the Israeli standard Tekan 5568, covering keyboard operability, semantics and labels, perceivable contrast and alt text, motion, and Hebrew RTL correctness. Use when auditing a page, component, or PR for accessibility, verifying keyboard navigation and focus order, checking color contrast, labeling forms, adding aria-live for dynamic updates, or building and reviewing a Hebrew right-to-left UI (logical CSS properties, bidi text, icon mirroring, Hebrew typography). Runs automated axe or pa11y first for the roughly one third that automates, then manual checks for focus, order, and screen-reader meaning, reporting each issue with its WCAG criterion and the fix. Israeli accessibility regulations reference Tekan 5568 which adopts WCAG AA.
---

# Accessibility (a11y) and Hebrew RTL

## When to use
- Auditing a page, component, or PR for accessibility before a release.
- Verifying keyboard reachability, focus visibility, and tab order on a new feature.
- Checking color contrast, form labels, headings, or alt text.
- Announcing dynamic updates to assistive tech (aria-live).
- Building or reviewing a Hebrew RTL interface: layout mirroring, bidi text, icon direction, Hebrew fonts.

## Operative rules (always-on; mirrors the registry entry)
- KEYBOARD: every interactive element reachable and operable via Tab/Enter/Space; visible focus indicator; logical focus order; no keyboard traps; a skip-to-content link.
- SEMANTICS: one descriptive H1; logical heading order (no skipped levels); a programmatic label for every input; links/buttons with clear accessible names (not "click here"); landmarks (header/nav/main/footer); correct roles.
- PERCEIVABLE: meaningful alt text on informative images (empty alt for decorative); text contrast >= 4.5:1 (>= 3:1 large text); do not rely on color alone; captions for media; respect prefers-reduced-motion.
- RTL/Hebrew: correct dir, mirrored layout, lang attribute.
- METHOD: run axe-core / pa11y first for the automatable ~30%, then MANUALLY check what automation misses (focus, order, screen-reader meaning). Report issue + WCAG criterion + the fix.

## Deep reference (the on-demand layer)

### Standards: WCAG 2.2 AA and Tekan 5568
Target WCAG 2.2 AA by default. Israeli accessibility regulations (under the Equal Rights for Persons with Disabilities framework and its service-accessibility regulations) reference the Israeli standard Tekan 5568 (ת"י 5568), which adopts WCAG at level AA. Practically: meeting WCAG 2.2 AA meets the technical core of Tekan 5568. Note that Israeli law also expects an accessibility statement (הצהרת נגישות) page and a named accessibility coordinator for many organizations; those are process/legal items beyond the page markup, flag them when reviewing a whole site rather than a single component. If a stricter level (AAA) or an older WCAG version is required, state it explicitly.

### Method: automate ~30%, then manual
Automated tools (axe-core, pa11y, Lighthouse) catch only about a third of issues. Run one first for the cheap coverage:
- `npx @axe-core/cli <url>`
- `npx pa11y <url> --standard WCAG2AA`
- Lighthouse Accessibility (Chrome DevTools).
Then do the manual work automation cannot: real Tab-through, focus-order sanity, and screen-reader meaning. Report every finding as: issue, the WCAG success criterion it violates, location, and the fix.

### Keyboard checklist
| Check | Expected |
|-------|----------|
| Every interactive element reachable via Tab | Yes |
| Focus indicator always visible | Yes (do not remove outlines without a replacement) |
| No keyboard traps | Yes (focus can always move out) |
| Logical tab order | Matches visual/reading order |
| Skip-to-content link on long pages | Yes |
| Custom widgets (modal, menu, tabs, accordion) operable by keyboard | Yes, with correct roles and arrow-key patterns |
Operate via Tab/Enter/Space; a control that only responds to mouse is a defect.

### Semantics and labels
- Exactly one descriptive H1; headings descend without skipping levels (no h2 -> h4).
- Every input has a programmatic label (a real label element, or aria-label / aria-labelledby). Placeholder text is not a label.
- Links and buttons have clear accessible names. "Click here"/"read more" out of context fails; name the destination or action.
- Landmarks present: header, nav, main, footer. Correct ARIA roles only where native elements do not suffice (prefer a real button over role=button).
- Dynamic updates (toasts, live validation, results counts) announced via aria-live (polite for status, assertive for errors).

### Perceivable: contrast, color, media, motion
| Element | Minimum contrast |
|---------|------------------|
| Normal text | 4.5:1 |
| Large text (>= 18pt, or >= 14pt bold) | 3:1 |
| UI components and focus rings, meaningful graphics | 3:1 |
- Informative images have meaningful alt; decorative images have empty alt (alt="") so screen readers skip them.
- Never convey meaning by color alone (add text/icon/pattern). Error states need more than red.
- Media has captions; provide transcripts where relevant.
- Respect prefers-reduced-motion: gate non-essential animation behind the media query.

### Hebrew RTL correctness
Direction and language first: set the attribute, not just CSS.
```html
<html lang="he" dir="rtl">
```
Use CSS logical properties so layout mirrors automatically. Never use physical directional properties for layout:
| Physical (avoid) | Logical (use) |
|------------------|---------------|
| margin-left / margin-right | margin-inline-start / margin-inline-end |
| padding-left / padding-right | padding-inline-start / padding-inline-end |
| border-left | border-inline-start |
| text-align: left / right | text-align: start / end |
| left: 10px | inset-inline-start: 10px |
In Tailwind, prefer logical utilities (ms-4, me-4, ps-4, pe-4, start-0, end-0, rounded-s/e) over ltr:/rtl: variants; reserve rtl: only for transforms and icon flips.

Bidi text: isolate LTR runs inside Hebrew so they do not visually flip. Phone numbers, credit-card numbers, SKUs, URLs, emails, and code must stay LTR: wrap in `<span dir="ltr">`/`<bdo dir="ltr">`, or use unicode-bidi: isolate. For user-generated or unknown-direction content, use `<bdi>` or dir="auto" so direction is auto-detected and cannot leak. A number immediately followed by a sign or currency can flip; isolate it.

Icon mirroring: mirror icons whose meaning is tied to reading direction (nav arrows, back/forward, breadcrumb chevrons, send/submit arrows, carousel/pagination arrows, reply/indent, forward-progress indicators). Do NOT mirror logos, checkmarks, X/close, media play buttons, clocks, or real-world-object icons (phone handset, magnifying glass). Flip with a transform gated on direction:
```css
.icon-directional:dir(rtl) { transform: scaleX(-1); }
```
Prefer an icon set's RTL-aware variant over flipping when available. Keep a `[dir="rtl"]` fallback for browsers older than :dir() support.

Shadows and gradients do not auto-flip: box-shadow, text-shadow, and linear-gradient offsets/angles are physical. Flip them explicitly with a :dir(rtl) override when their direction is meaningful.

Hebrew typography: use a Hebrew-first stack (Heebo, Assistant, Rubik, Noto Sans Hebrew, sans-serif). Slightly larger base size and line-height (around 1.7). Never add letter-spacing to Hebrew (it breaks letterforms). Right-align form labels.

RTL pitfalls to check: directional icons, progress bars filling right-to-left, slider/carousel swipe direction reversed, breadcrumb separators reversed, table header/cell alignment, chart x-axis, and the flexbox row-reverse double-flip (row auto-reverses in RTL; adding row-reverse flips it back to LTR).

### Escalate to a full audit when
New or changed navigation, complex forms or auth flows, custom widgets (modals, accordions, tabs), public releases or compliance requirements, major structural changes, or automated scans returning multiple criticals. A component smoke check is not a compliance audit.

### Reporting format
Result: Pass / Needs Fixes / Escalate to Full Audit. Then a table: Severity (Critical/Major/Minor), Issue, Location (selector/line), WCAG criterion, Fix guidance. For real screen-reader coverage, test with VoiceOver or NVDA; automation and code review do not substitute for it.

## Anti-patterns / common mistakes
- Removing focus outlines with no visible replacement.
- Placeholder used as the only label.
- "Click here" / "read more" links with no accessible context.
- Skipped heading levels or multiple H1s.
- Meaning carried by color alone (red-only errors).
- Decorative images with descriptive alt (noise) or informative images with empty alt (loss).
- Physical CSS (margin-left, text-align: left) in an RTL layout instead of logical properties.
- Letting phone numbers / codes inherit RTL and flip.
- Mirroring a logo, checkmark, or play button; or failing to mirror a nav arrow.
- Adding letter-spacing to Hebrew text.
- row-reverse used to "make RTL", causing a double-flip back to LTR.
- Treating an automated scan as full compliance.

## Checklist before returning
- Automated scan (axe/pa11y) run first; manual keyboard + screen-reader checks done after.
- Keyboard: all interactive elements reachable/operable, visible focus, logical order, no traps, skip link.
- Semantics: one H1, ordered headings, labeled inputs, named links/buttons, landmarks, aria-live for dynamic updates.
- Contrast >= 4.5:1 (3:1 large/UI); no color-only meaning; alt text correct; reduced-motion respected.
- RTL: dir + lang set, logical CSS properties, LTR runs isolated, correct icon mirroring, Hebrew font stack, no letter-spacing, shadows/gradients flipped where meaningful.
- Each finding cites its WCAG criterion and a fix; standard stated (WCAG 2.2 AA / Tekan 5568).
- Escalation to a full audit recommended when the triggers apply.

## Sources
- accessibility-audit (installed at ~/.claude/skills/): WCAG 2.2 AA triage, automate-first (~30%) then manual, keyboard/semantics/contrast/motion checklists, escalation triggers, report format.
- hebrew-rtl-best-practices (installed at ~/.claude/skills/): dir+lang setup, CSS logical properties, bidi isolation (bdi/bdo/dir=auto), icon mirroring rules, shadow/gradient non-flip, Hebrew typography, Tailwind logical utilities, RTL pitfalls.
- Registry operative entry "accessibility-a11y" (ai-kit/skills/registry.ts): keyboard, semantics, perceivable, RTL/Hebrew, automate-then-manual method, report with WCAG criterion.
- Israeli standard Tekan 5568 (ת"י 5568) adopting WCAG AA under Israel's service-accessibility regulations: domain knowledge (statement page and coordinator noted as process items).
