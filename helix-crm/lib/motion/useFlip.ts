'use client';
import { useLayoutEffect, useRef } from 'react';
import { createSpring, SPRINGS } from './spring';
import { useReducedMotion } from './useMotionPreference';

/**
 * FLIP reflow with springs — the desktop win (skill §4, §7 spatial consistency).
 * When a list/table/board reorders, items FLOW to their new positions instead of
 * jumping. Pure state change, no gesture. Works with mouse, keyboard, anything.
 *
 * Usage:
 *   const listRef = useFlip<HTMLTableSectionElement>([sortKey, sortDir, rows]);
 *   return <tbody ref={listRef}>{rows.map(r => <tr key={r.id} data-flip-id={r.id}>…</tr>)}</tbody>;
 *
 * Each animated child MUST carry a stable `data-flip-id`. Animates transform only.
 *
 * Both axes are tracked. This used to capture `top` alone and animate translateY,
 * which meant a six-column kanban board — the one consumer that reorders
 * horizontally — animated by zero pixels for a cross-column move.
 *
 * Each axis gets its own spring, animating pixels. A single normalized 0→1 spring
 * would be wrong here: createSpring's rest test is absolute (|x − target| < 0.1),
 * so on a unit scale it would settle while the item was still 10% of the distance
 * from home. Both springs share SPRINGS.reflow and start at rest, and the equation
 * is linear, so they stay visually in step.
 */
type Pos = { top: number; left: number };

export function useFlip<T extends HTMLElement>(deps: unknown[]) {
  const ref = useRef<T>(null);
  const reduce = useReducedMotion();
  const prev = useRef<Map<string, Pos>>(new Map());

  // capture positions BEFORE the DOM paints the new order
  const container = ref.current;
  if (container) {
    const map = new Map<string, Pos>();
    container.querySelectorAll<HTMLElement>('[data-flip-id]').forEach((el) => {
      const r = el.getBoundingClientRect();
      map.set(el.dataset.flipId!, { top: r.top, left: r.left });
    });
    prev.current = map;
  }

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    el.querySelectorAll<HTMLElement>('[data-flip-id]').forEach((child) => {
      const id = child.dataset.flipId!;
      const old = prev.current.get(id);
      if (old == null) return; // newly added — skip the FLIP (could fade instead)
      const now = child.getBoundingClientRect();
      const dx = old.left - now.left;
      const dy = old.top - now.top;
      if (!dx && !dy) return;

      // One transform, written from whichever axis ticked last.
      const cur = { x: dx, y: dy };
      const write = () => {
        child.style.transform = `translate(${cur.x}px, ${cur.y}px)`;
      };
      write();
      child.style.willChange = 'transform';

      let pending = (dx ? 1 : 0) + (dy ? 1 : 0);
      const settle = () => {
        if (--pending > 0) return;
        child.style.transform = '';
        child.style.willChange = '';
      };

      if (dx) {
        createSpring({
          from: dx, to: 0, ...SPRINGS.reflow, reduce,
          onUpdate: (v) => { cur.x = v; write(); },
          onRest: settle,
        });
      }
      if (dy) {
        createSpring({
          from: dy, to: 0, ...SPRINGS.reflow, reduce,
          onUpdate: (v) => { cur.y = v; write(); },
          onRest: settle,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
