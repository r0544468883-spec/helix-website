'use client';

import { useState } from 'react';
import ConstellationCanvas from './ConstellationCanvas';

const tools = [
  { name: 'React', sub: 'Frontend', icon: '⚛', x: 30, y: 8 },
  { name: 'Next.js', sub: 'Full-stack', icon: '▲', x: 65, y: 10 },
  { name: 'Node.js', sub: 'Backend', icon: '🟢', x: 12, y: 18 },
  { name: 'Python', sub: 'AI / Scripts', icon: '🐍', x: 48, y: 20 },
  { name: 'TypeScript', sub: 'Type Safety', icon: '🔷', x: 85, y: 15 },
  { name: '.NET', sub: 'Enterprise', icon: '🟣', x: 8, y: 35 },
  { name: 'PostgreSQL', sub: 'Database', icon: '🗄', x: 38, y: 32 },
  { name: 'Supabase', sub: 'BaaS', icon: '⚡', x: 70, y: 30 },
  { name: 'Redis', sub: 'Cache', icon: '🔴', x: 25, y: 45 },
  { name: 'Docker', sub: 'Containers', icon: '🐳', x: 55, y: 42 },
  { name: 'AWS', sub: 'Cloud', icon: '☁', x: 88, y: 40 },
  { name: 'GCP', sub: 'Cloud', icon: '🌐', x: 10, y: 55 },
  { name: 'Vercel', sub: 'Hosting', icon: '🚀', x: 42, y: 55 },
  { name: 'OpenAI', sub: 'LLM API', icon: '🤖', x: 72, y: 55 },
  { name: 'Claude', sub: 'AI Agent', icon: '🧠', x: 20, y: 68 },
  { name: 'n8n', sub: 'Automations', icon: '⚙', x: 50, y: 65 },
  { name: 'Stripe', sub: 'Payments', icon: '💳', x: 82, y: 65 },
  { name: 'GitHub', sub: 'Version Control', icon: '🐙', x: 12, y: 80 },
  { name: 'Figma', sub: 'Design', icon: '🖌', x: 38, y: 78 },
  { name: 'Tailwind', sub: 'CSS', icon: '💨', x: 65, y: 78 },
  { name: 'GraphQL', sub: 'API', icon: '◈', x: 88, y: 78 },
];

export default function DevelopmentConstellation() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="constellation-section">
      <div className="container">
        <h2 className="constellation-title">הטכנולוגיות שאנחנו עובדים איתן</h2>
        <p className="constellation-subtitle">Stack מודרני ומוכח. בוחרים את הכלי הנכון לפרויקט, לא את הכלי שנוח לנו.</p>
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
            <div className="constellation-icon">{tool.icon}</div>
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
