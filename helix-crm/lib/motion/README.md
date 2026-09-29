# @helix/motion

The **in-app motion system** for every HELIX product (dashboards, CRM, Rank, OPS, SDR, Growth-Doctor, Meeting, Shop, Guard, Sign, Stage, Account, Website-Maintenance) and PLUG.

It ports Apple's *Designing Fluid Interfaces* (WWDC 2018) model to the web: motion is **spring-based** (parameters are `damping` + `response`, never a duration), starts from the current on-screen value, inherits the user's velocity, projects momentum, and is **interruptible at any instant**. This is what makes a UI feel like premium software instead of a website.

> Scope: **inside the software**, not marketing pages. Marketing keeps the 60-effect library in `EFFECTS.md`. This is the layer for tables, drawers, dialogs, panels, and command surfaces.

## Why zero-dependency
10 of 13 HELIX repos don't have framer-motion. So the spring engine is self-contained (~90 lines, `spring.ts`) and every component animates raw `transform`/`opacity` on `requestAnimationFrame`. Drops into **any** HELIX repo — Next.js App Router or Vite — with no new dependency.

## Setup (once per app)
```ts
// app root: globals.css / main.tsx / layout.tsx
import '@helix/motion/tokens.css';
```
```css
/* set the product accent — everything else is accent-agnostic */
:root { --hm-accent: #F97316; } /* e.g. OPS orange; PLUG green; Rank amber */
```
If you don't publish the package, copy this folder to `lib/motion/` (Next) or `src/lib/motion/` (Vite) and import from there.

## Primitives → skill mapping
| Export | What | Apple principles |
|--------|------|------------------|
| `createSpring`, `SPRINGS`, `project`, `rubberband`, `VelocityTracker` | The engine + Apple's concrete ship values | §4 §5 §6 §9 |
| `useReducedMotion` / `useMotionPreference` | reduced-motion / -transparency / -contrast | §14 |
| `Pressable` | instant press feedback on pointer-down | §1 |
| `Material` | frosted translucent surface, weight-aware | §12 |
| `Scrim` | dim-to-focus layer | §12 |
| `Sheet` | bottom sheet: 1:1 drag, velocity handoff, projection, rubber-band, interruptible | §2 §3 §5 §6 §9 §12 |
| `Drawer` | side detail panel, interruptible, symmetric path | §3 §7 |
| `Dialog` | modal scaling from its trigger origin | §7 §12 |
| `CommandPalette` | ⌘K, keyboard nav, spring, scrim blur | §4 §12 |
| `useFlip` | spring FLIP reflow for tables/lists (the desktop win) | §4 §7 |
| `ResizablePanel` | mouse-drag split with rubber-band + momentum | §2 §6 §9 |

## Quick examples
```tsx
'use client';
import { Drawer, CommandPalette, useFlip, Pressable, Material } from '@helix/motion';

// FLIP table — rows FLOW to their sorted position, no gesture needed
const bodyRef = useFlip<HTMLTableSectionElement>([sortKey, sortDir, rows]);
<tbody ref={bodyRef}>{rows.map(r => <tr key={r.id} data-flip-id={r.id}>…</tr>)}</tbody>

// ⌘K palette
<CommandPalette open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)}
  items={[{ id: 'add', title: 'הוסף רשומה', subtitle: 'פעולה', run: addRecord }]} />

// Detail drawer + origin-anchored dialog + instant press
<Drawer open={sel != null} onClose={() => setSel(null)}>…</Drawer>
<Pressable as="button" className="btn" onClick={save}>שמור</Pressable>
```

## Portals and stacking
`Drawer`, `Sheet`, `Dialog` and `CommandPalette` render into `<body>` through `Portal`, and render nothing on the server. Mount them wherever the state lives; never wrap one in your own `createPortal` or a `z-index` wrapper. An ancestor's stacking context (`relative z-10`) or `backdrop-filter` (which makes an element the containing block of its fixed children) can't trap them.

The order comes from `LAYERS` in `Portal.tsx`, above an app nav at 50:

| Layer | Scrim | Panel |
|---|---|---|
| `Drawer`, `Sheet` | 60 | 61 |
| `Dialog`, and a `Drawer` / `Sheet` with `nested` | 70 | 71 |
| `CommandPalette` | 80 | 81 |

Pass `nested` to a `Drawer` or `Sheet` opened from inside another overlay, like a status list over a detail drawer. The order never depends on which overlay mounted first.

## Non-negotiables (Definition of Done)
1. **reduced-motion** collapses springs to instant/cross-fade — built into every component.
2. Animate **only** `transform`/`opacity` (+ `backdrop-filter` sparingly). No layout thrash.
3. **RTL**: a `Drawer` takes `dir` from the locale (`dirOf(locale)`), never from `document.dir`, which the server doesn't have. Verify in Hebrew.
4. **data-dense views**: use motion on state transitions (open/sort/expand), not per-row.
5. touch targets ≥44px, focus-visible rings, `aria-*` preserved on your own markup.

Grounded in the `apple-design` skill (17 principles). See `EFFECTS.md → §25 In-App Motion` for the design-system entry.
