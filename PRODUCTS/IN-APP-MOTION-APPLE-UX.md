# HELIX Products — In-App Motion (Apple-UX)

**The motion layer for every HELIX product's UI.** Companion to the products effects/flow theme doc (`HELIX PRODUCTS EFFECTS AND FLOW THEME FOR ALL SOFTWARES.docx`) — this markdown is the code-facing source of truth; fold its summary into the docx.

Shipped as **`@helix/motion`** (`helix/packages/helix-motion/`). Grounded in the `apple-design` skill (Apple *Designing Fluid Interfaces*, WWDC 2018, 17 principles).

---

## 1. Why this exists

Most product UIs (dashboards, CRMs, tools) are **desktop-first** and feel like "a website with data." Apple's fluid-interface model is what separates that from software that feels alive:

> An interface feels alive when motion **starts from the current on-screen value, inherits the user's velocity, projects momentum forward, and can be grabbed and reversed at any instant.** Springs make all of this natural because they are inherently interruptible and velocity-aware.

This is **not** about touch gestures. The biggest wins — spring transitions on every state change, interruptible animations, FLIP table reflow, ⌘K — are pure mouse+keyboard. Gestures (drag-to-dismiss) are one secondary layer on top.

## 2. The model: springs, not durations

Parameters are **`damping`** (overshoot: `1.0` = no bounce, `<1` bounces) and **`response`** (seconds to reach target — *not* a fixed duration). Apple's concrete ship values, encoded in `SPRINGS`:

| Interaction | damping | response |
|---|---|---|
| Move / reposition | 1.0 | 0.4 |
| Rotation | 0.8 | 0.4 |
| Drawer / sheet | 0.8 | 0.3 |
| Modal (scale-in) | 0.85 | 0.35 |
| Momentum landing | 0.8 | 0.35 |
| List reflow (FLIP) | 0.85 | 0.42 |

Rule: **damping `1.0` by default**; add bounce (`~0.8`) **only when the gesture carried momentum** (a flick/throw/drag-release). Overshoot on a menu that just faded in feels wrong; overshoot on a card you flicked feels right.

## 3. The 17 principles → what we actually do

1. **Response** — feedback on pointer-**down**, not release (`Pressable`, `:active` scale). Kill latency.
2. **Direct manipulation** — 1:1 tracking glued to the finger, respect the grab offset (`Sheet`, `ResizablePanel`).
3. **Interruptibility** — grab a moving element mid-flight and reverse it; always animate from the live presentation value (all overlays).
4. **Behavior over animation** — springs everywhere a user can touch; new input just retargets.
5. **Velocity handoff** — release velocity seeds the spring (`VelocityTracker` → `createSpring({velocity})`).
6. **Momentum projection** — a flick throws to the projected snap point (`project()`).
7. **Spatial consistency** — enter/exit the same path; `Dialog` scales **from its trigger origin**.
8. **Hint toward the gesture** — intermediate frames point at the outcome.
9. **Rubber-banding** — progressive resistance at bounds, never a hard stop (`rubberband()`).
10. **Gesture details** — 10px hysteresis, cancel-by-dragging-away, parallel recognition.
11. **Frame smoothness** — `transform`/`opacity` only, `requestAnimationFrame`, `will-change`.
12. **Materials & depth** — translucent chrome with content scrolling under (`Material`); dim-to-focus scrim (`Scrim`).
13. **Multimodal feedback** — motion + optional sound/haptic on the *same frame* (opt-in).
14. **Reduced motion** — cross-fade instead of slide/spring; frostier surfaces; more contrast (`useMotionPreference`).
15. **Typography** — size-specific tracking (tighten large text), leading inverse to size.
16. **Foundations** — purpose, agency (easy undo), responsibility, familiarity, flexibility, simplicity, craft, delight.
17. **Process** — prototype interactively; design motion and visuals together.

## 4. Primitives

See `helix/packages/helix-motion/README.md` and `EFFECTS.md §26` for the export table. Components: `Pressable`, `Material`, `Scrim`, `Sheet`, `Drawer`, `Dialog`, `CommandPalette`, `useFlip`, `ResizablePanel`. Engine: `createSpring`, `SPRINGS`, `project`, `rubberband`, `VelocityTracker`, `useMotionPreference`.

Zero runtime deps beyond React (self-contained spring engine) so it drops into any HELIX repo — Next.js or Vite — without installing framer-motion (10 of 13 repos don't have it).

## 5. Per-product adoption map

| Product | Highest-value primitives first |
|---|---|
| **PLUG** | `useFlip` (candidate lists), `Drawer` (candidate details), `Dialog` (delete w/ undo), `CommandPalette` |
| **Dashboards** | `useFlip` (data tables), `ResizablePanel` (widget/inspector split), `Material` chrome |
| **CRM** | `Drawer` (record), `useFlip` (pipeline/table), `CommandPalette` (jump-to) |
| **Rank** | `useFlip` (keyword/citation tables), `Drawer` (entity detail) |
| **OPS** | `Drawer` (lead/ad detail), `Dialog` (confirm actions), `Sheet` (mobile) |
| **SDR** | `useFlip` (enrichment rows), `Drawer` (contact), `CommandPalette` |
| **Growth-Doctor** | `ResizablePanel` (heatmap/detail), `useFlip` (cohort table) |
| **Meeting** | `ResizablePanel` (transcript/notes), `Drawer` (action items) |
| **Shop** | `Sheet` (cart/product, mobile-leaning), `Dialog`, `Pressable` |
| **Guard / Sign / Stage / Account / Maintenance** | `Drawer` + `Dialog` + `Material` + `Pressable` baseline |

Accent per product via `--hm-accent` (Rank amber, OPS orange, PLUG/site green…). Global nav/CTA identity color is unchanged.

## 6. Definition of Done (every in-app-motion PR)

1. `prefers-reduced-motion` collapses springs to instant/cross-fade — built into every primitive.
2. Animate **only** `transform`/`opacity` (+ `backdrop-filter` sparingly). No layout thrash.
3. **RTL**: drawers/resizers resolve physical edge from `document.dir`; verify in Hebrew.
4. **Data-dense views**: motion on state transitions (open/sort/expand), not per row/cell.
5. Keep per-product accent; no site-green in product chrome.
6. touch targets ≥44px, `:focus-visible` rings, `aria-*` preserved.

## 7. Rollout order

1. **Reference**: PLUG `/motion-lab` (built) — the living prototype/bar.
2. **Wave 1**: CRM + Dashboards (most tables/panels → immediate win).
3. **Wave 2**: Rank / OPS / SDR / Growth-Doctor (mind data-density).
4. **Wave 3**: Meeting / Shop / Guard / Sign / Stage / Account / Maintenance.

Each wave = drop `lib/motion/`, `import '@helix/motion/tokens.css'`, set `--hm-accent`, then replace ad-hoc modals/drawers/table-sorts with the primitives.
