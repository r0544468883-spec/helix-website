'use client';

/**
 * Decorative green orbs scattered across the page background.
 * Inspired by sefibogin.co.il — large semi-transparent circles
 * that add depth and brand color to the layout.
 * Uses emerald (#10B981) only for Helix brand consistency.
 */
export default function GreenOrbs() {
  return (
    <div className="green-orbs" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
      <div className="orb orb-5" />
      <div className="orb orb-6" />
      <div className="orb orb-7" />
      <div className="orb orb-8" />
      <div className="orb orb-9" />
      <div className="orb orb-10" />
    </div>
  );
}
