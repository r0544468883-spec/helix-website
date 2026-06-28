'use client';

import { useState } from 'react';

const tools = [
  { name: 'Google Ads', sub: 'PPC', icon: '📢', x: 35, y: 8 },
  { name: 'Meta Ads', sub: 'פייסבוק + אינסטגרם', icon: '📱', x: 65, y: 10 },
  { name: 'TikTok', sub: 'שיווק בוידאו', icon: '🎵', x: 15, y: 15 },
  { name: 'GA4', sub: 'Analytics', icon: '📊', x: 85, y: 18 },
  { name: 'SEO', sub: 'קידום אורגני', icon: '🔍', x: 10, y: 30 },
  { name: 'GEO', sub: 'מנועי AI', icon: '🤖', x: 45, y: 25 },
  { name: 'Ahrefs', sub: 'מחקר מילים', icon: '🔗', x: 75, y: 28 },
  { name: 'ChatGPT', sub: 'תוכן AI', icon: '✦', x: 25, y: 40 },
  { name: 'Gemini', sub: 'ניתוח נתונים', icon: '◈', x: 55, y: 38 },
  { name: 'Canva', sub: 'קריאייטיב', icon: '🎨', x: 80, y: 42 },
  { name: 'HubSpot', sub: 'CRM', icon: '🧡', x: 8, y: 50 },
  { name: 'Taboola', sub: 'Brand Awareness', icon: '📰', x: 40, y: 52 },
  { name: 'Outbrain', sub: 'Native Ads', icon: '🌐', x: 68, y: 55 },
  { name: 'Hotjar', sub: 'Heatmaps', icon: '🔥', x: 20, y: 62 },
  { name: 'Mailchimp', sub: 'אימייל מרקטינג', icon: '📧', x: 50, y: 65 },
  { name: 'Semrush', sub: 'מתחרים', icon: '📈', x: 82, y: 65 },
  { name: 'Looker', sub: 'דשבורדים', icon: '📉', x: 12, y: 75 },
  { name: 'n8n', sub: 'אוטומציות', icon: '⚡', x: 35, y: 78 },
  { name: 'Perplexity', sub: 'AI Search', icon: '🔮', x: 60, y: 78 },
  { name: 'GTM', sub: 'Tag Manager', icon: '🏷', x: 85, y: 78 },
];

export default function MarketingConstellation() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="constellation-section">
      <div className="container">
        <h2 className="constellation-title">הכלים שאנחנו משתמשים בהם</h2>
        <p className="constellation-subtitle">כל קמפיין מורכב מעשרות כלים שעובדים יחד. הנה חלק מהם.</p>
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
        <svg className="constellation-lines" viewBox="0 0 100 85" preserveAspectRatio="none">
          <line x1="35" y1="10" x2="65" y2="12" /><line x1="15" y1="17" x2="35" y2="10" />
          <line x1="65" y1="12" x2="85" y2="20" /><line x1="10" y1="32" x2="25" y2="42" />
          <line x1="45" y1="27" x2="75" y2="30" /><line x1="55" y1="40" x2="80" y2="44" />
          <line x1="8" y1="52" x2="20" y2="64" /><line x1="40" y1="54" x2="68" y2="57" />
          <line x1="50" y1="67" x2="82" y2="67" /><line x1="12" y1="77" x2="35" y2="80" />
          <line x1="60" y1="80" x2="85" y2="80" /><line x1="25" y1="42" x2="45" y2="27" />
        </svg>
      </div>
    </section>
  );
}
