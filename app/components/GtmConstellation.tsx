'use client';

import { useState } from 'react';
import ConstellationCanvas from './ConstellationCanvas';
import { EmojiIcon } from '@/lib/emoji-icon';

export type GtmTool = { name: string; sub: string; icon: string; x: number; y: number };

export default function GtmConstellation({
  tools,
  title = 'הסטאק שאנחנו מהנדסים',
  subtitle = 'מנוע ההכנסות מורכב מעשרות כלים שצריכים לדבר אחד עם השני. אנחנו מחברים אותם.',
}: {
  tools: GtmTool[];
  title?: string;
  subtitle?: string;
}) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="constellation-section">
      <div className="container">
        <h2 className="constellation-title">{title}</h2>
        <p className="constellation-subtitle">{subtitle}</p>
      </div>
      <div className="constellation-map">
        <ConstellationCanvas particleCount={50} connectionDistance={100} />
        {tools.map((tool) => (
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
