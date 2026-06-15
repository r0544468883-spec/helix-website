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
      {/* Top right — large, faint */}
      <div className="orb orb-1" />
      {/* Left middle — medium */}
      <div className="orb orb-2" />
      {/* Right below fold */}
      <div className="orb orb-3" />
      {/* Bottom left — small */}
      <div className="orb orb-4" />
      {/* Far bottom right */}
      <div className="orb orb-5" />
      {/* Mid page left */}
      <div className="orb orb-6" />
    </div>
  );
}
