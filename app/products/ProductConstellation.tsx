'use client';

import { useState } from 'react';
import ConstellationCanvas from '../components/ConstellationCanvas';
import { EmojiIcon } from '@/lib/emoji-icon';

export type ConstellationTool = { name: string; sub: string; icon: string };

// Fixed galactic layout, tools are placed onto these slots in order.
const POSITIONS = [
  { x: 35, y: 8 }, { x: 70, y: 10 }, { x: 12, y: 15 }, { x: 50, y: 18 }, { x: 85, y: 20 },
  { x: 8, y: 32 }, { x: 42, y: 30 }, { x: 72, y: 32 }, { x: 25, y: 42 }, { x: 60, y: 40 },
  { x: 88, y: 42 }, { x: 10, y: 52 }, { x: 38, y: 55 }, { x: 68, y: 55 }, { x: 20, y: 65 },
  { x: 50, y: 68 }, { x: 82, y: 65 }, { x: 12, y: 78 }, { x: 40, y: 78 }, { x: 65, y: 78 }, { x: 88, y: 78 },
];

export default function ProductConstellation({
  tools,
  title = 'הכלים שהמוצר מתחבר אליהם',
  subtitle = 'מחובר לכל מה שהעסק שלכם כבר עובד איתו. הנה חלק מהם.',
}: {
  tools: ConstellationTool[];
  title?: string;
  subtitle?: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const placed = tools.slice(0, POSITIONS.length).map((t, i) => ({ ...t, ...POSITIONS[i] }));

  return (
    <section className="constellation-section">
      <div className="container">
        <h2 className="constellation-title">{title}</h2>
        <p className="constellation-subtitle">{subtitle}</p>
      </div>
      <div className="constellation-map">
        <ConstellationCanvas particleCount={50} connectionDistance={100} />
        {placed.map((tool) => (
          <div
            key={tool.name}
            className={`constellation-node ${active === tool.name ? 'constellation-active' : ''}`}
            style={{ left: `${tool.x}%`, top: `${tool.y}%` }}
            onMouseEnter={() => setActive(tool.name)}
            onMouseLeave={() => setActive(null)}
          >
            <div className="constellation-sparkle" />
            <div className="constellation-icon"><EmojiIcon e={tool.icon} /></div>
            <div className="constellation-label">
              <span className="constellation-name">{tool.name}</span>
              <span className="constellation-sub">{tool.sub}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
