'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * The overlay stacking order. The app's sticky nav sits at 50, so every overlay's
 * scrim covers it. `nested` is for an overlay opened from inside another one; the
 * order never depends on which of the two mounted first.
 */
export const LAYERS = {
  /** Drawer, Sheet */
  base: { scrim: 60, panel: 61 },
  /** Dialog, and a Drawer or Sheet opened from inside another overlay */
  nested: { scrim: 70, panel: 71 },
  /** CommandPalette, which can open over anything */
  palette: { scrim: 80, panel: 81 },
} as const;

/**
 * Renders its children into <body>, and nothing on the server or before mount.
 * Every overlay primitive goes through it, so no ancestor's stacking context
 * (a `relative z-10` wrapper) or `backdrop-filter` (which makes an element the
 * containing block of its fixed children) can trap a panel. The children mount
 * only once <body> is there, so their effects always find their elements.
 */
export function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}
