'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createSpring, SPRINGS, SpringController } from './spring';
import { useReducedMotion } from './useMotionPreference';
import { LAYERS, Portal } from './Portal';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Which edge it slides from. In RTL, 'start' = right, 'end' = left. */
  side?: 'start' | 'end';
  /**
   * Text direction, from the locale (`dirOf(locale)`). Required on purpose: reading
   * `document.dir` during render gave the server one answer and the browser another,
   * and React keeps the server's style on a mismatch, so closed panels were parked
   * mid-screen. The server knows the locale, so both renders agree.
   */
  dir: 'rtl' | 'ltr';
  width?: number;
  className?: string;
  /** Opened from inside another overlay: one layer above it (see LAYERS). */
  nested?: boolean;
}

/**
 * Side drawer for detail panels (CRM record, candidate details, settings).
 * Spring in/out, fully interruptible: toggle rapidly and it follows the target
 * from its live on-screen position instead of finishing the old animation (§3).
 * Enter and exit share the same path (§7 spatial consistency). Closes on scrim
 * click and Escape. Pure state-change motion — no gesture required (desktop-first).
 * Renders into <body> through Portal, so wherever it is mounted it sits above the
 * app's nav.
 */
export function Drawer(props: DrawerProps) {
  return <Portal><DrawerPanel {...props} /></Portal>;
}

function DrawerPanel({ open, onClose, children, side = 'start', dir, width = 400, className, nested = false }: DrawerProps) {
  const layer = nested ? LAYERS.nested : LAYERS.base;
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const anim = useRef<SpringController | null>(null);
  const p = useRef(100); // percent off-screen; 100 hidden, 0 open
  // A closed drawer is invisible and inert from the first byte, so that even a
  // positioning bug can never again leave a panel covering the page or taking
  // clicks and focus. Cleared before the open spring, set when the close one rests.
  const [parked, setParked] = useState(!open);

  // resolve physical edge from logical side + direction (server-safe, see `dir`)
  const physicalRight = side === 'start' ? dir === 'rtl' : dir === 'ltr';
  const hiddenSign = physicalRight ? 1 : -1; // translateX% direction to hide

  const apply = useCallback((pct: number) => {
    p.current = pct;
    if (panelRef.current) panelRef.current.style.transform = `translateX(${pct * hiddenSign}%)`;
    const t = 1 - Math.abs(pct) / 100;
    const scrim = scrimRef.current;
    if (scrim) {
      scrim.style.background = `rgba(var(--hm-scrim), ${(0.4 * t).toFixed(3)})`;
      const b = `blur(${(t * 5).toFixed(1)}px)`;
      scrim.style.setProperty('backdrop-filter', b);
      scrim.style.setProperty('-webkit-backdrop-filter', b);
      scrim.style.pointerEvents = t > 0.03 ? 'auto' : 'none';
    }
  }, [hiddenSign]);

  useEffect(() => {
    anim.current?.cancel();
    if (open) setParked(false);
    anim.current = createSpring({
      from: p.current, to: open ? 0 : 100, ...(open ? SPRINGS.drawer : SPRINGS.default),
      reduce, onUpdate: apply,
      onRest: () => {
        if (open) return;
        if (scrimRef.current) scrimRef.current.style.pointerEvents = 'none';
        setParked(true);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div ref={scrimRef} className="hm-scrim" style={{ zIndex: layer.scrim }} onClick={onClose} />
      <div
        ref={panelRef}
        className={className}
        inert={parked}
        aria-hidden={parked || undefined}
        style={{
          position: 'fixed', top: 0, [physicalRight ? 'right' : 'left']: 0, height: '100%',
          width: `min(${width}px, 86vw)`, zIndex: layer.panel, transform: `translateX(${100 * hiddenSign}%)`, willChange: 'transform',
          visibility: parked ? 'hidden' : 'visible',
        }}
      >
        <div
          className="hm-material"
          style={{ height: '100%', padding: 22, boxShadow: physicalRight ? '-20px 0 60px rgba(0,0,0,.2)' : '20px 0 60px rgba(0,0,0,.2)' }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
