'use client';

import { useState } from 'react';

const tools = [
  { name: 'Claude', sub: 'Agentic AI', icon: '🤖', x: 38, y: 8 },
  { name: 'OpenAI', sub: 'GPT-4', icon: '✦', x: 18, y: 14 },
  { name: 'Gemini', sub: 'Multi-modal', icon: '◈', x: 52, y: 5 },
  { name: 'n8n', sub: 'Automation', icon: '⚡', x: 72, y: 7 },
  { name: 'Prompts', sub: 'Engineering', icon: '💬', x: 8, y: 10 },
  { name: 'APIs & MCPs', sub: 'REST · GraphQL', icon: '🔗', x: 82, y: 12 },
  { name: 'Terminal', sub: 'CLI & Scripts', icon: '⌨', x: 58, y: 18 },
  { name: 'CRO', sub: 'Optimization', icon: '📊', x: 5, y: 22 },
  { name: 'Strategy', sub: 'Team Lead', icon: '🎯', x: 45, y: 22 },
  { name: 'SMB Tools', sub: 'Custom', icon: '🛠', x: 65, y: 24 },
  { name: 'Make', sub: 'Workflows', icon: '🔄', x: 85, y: 22 },
  { name: 'Growth & GTM', sub: 'Full Funnel', icon: '📈', x: 12, y: 32 },
  { name: 'Apollo', sub: 'Lead Gen', icon: '🚀', x: 72, y: 32 },
  { name: 'Content', sub: 'Build Logs', icon: '✏', x: 48, y: 35 },
  { name: 'HubSpot', sub: 'CRM', icon: '🧡', x: 88, y: 36 },
  { name: 'Paid & ABM', sub: 'Campaigns', icon: '💰', x: 28, y: 40 },
  { name: 'Video & UGC', sub: 'Production', icon: '🎬', x: 62, y: 42 },
  { name: 'Events', sub: 'Live + Digital', icon: '🎪', x: 18, y: 50 },
  { name: 'LinkedIn', sub: 'B2B Network', icon: '💼', x: 42, y: 48 },
  { name: 'Google Ads', sub: 'PPC', icon: '📢', x: 75, y: 48 },
  { name: 'Meta Ads', sub: 'Social', icon: '📱', x: 55, y: 55 },
  { name: 'Shopify', sub: 'eCommerce', icon: '🛒', x: 8, y: 58 },
  { name: 'React', sub: 'Frontend', icon: '⚛', x: 32, y: 58 },
  { name: 'Node.js', sub: 'Backend', icon: '🟢', x: 85, y: 55 },
  { name: 'Figma', sub: 'Design', icon: '🎨', x: 68, y: 62 },
  { name: 'Zapier', sub: 'Integrations', icon: '⚙', x: 22, y: 68 },
  { name: 'Cursor', sub: 'AI IDE', icon: '▶', x: 48, y: 66 },
  { name: 'Ahrefs', sub: 'SEO Research', icon: '🔍', x: 78, y: 70 },
  { name: 'AWS', sub: 'Cloud', icon: '☁', x: 10, y: 75 },
  { name: 'Docker', sub: 'DevOps', icon: '🐳', x: 60, y: 76 },
  { name: 'GA4', sub: 'Analytics', icon: '📉', x: 38, y: 78 },
  { name: 'Python', sub: 'AI/ML', icon: '🐍', x: 85, y: 78 },
];

export default function ToolsConstellation() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="constellation-section">
      <div className="container">
        <h2 className="constellation-title">הכלים שמאחורי הקלעים</h2>
        <p className="constellation-subtitle">כל פרויקט מורכב מעשרות כלים שעובדים יחד. הנה חלק מהם.</p>
      </div>
      <div className="constellation-map">
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
        {/* Connection lines */}
        <svg className="constellation-lines" viewBox="0 0 100 85" preserveAspectRatio="none">
          <line x1="38" y1="10" x2="18" y2="16" /><line x1="38" y1="10" x2="52" y2="7" />
          <line x1="52" y1="7" x2="72" y2="9" /><line x1="18" y1="16" x2="5" y2="24" />
          <line x1="45" y1="24" x2="58" y2="20" /><line x1="65" y1="26" x2="85" y2="24" />
          <line x1="12" y1="34" x2="28" y2="42" /><line x1="48" y1="37" x2="62" y2="44" />
          <line x1="72" y1="34" x2="88" y2="38" /><line x1="42" y1="50" x2="55" y2="57" />
          <line x1="18" y1="52" x2="32" y2="60" /><line x1="75" y1="50" x2="85" y2="57" />
          <line x1="48" y1="68" x2="60" y2="78" /><line x1="22" y1="70" x2="38" y2="80" />
        </svg>
      </div>
    </section>
  );
}
