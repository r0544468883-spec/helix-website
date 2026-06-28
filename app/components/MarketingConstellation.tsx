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
          <path d="M35,10 Q50,5 65,12" />
          <path d="M15,17 Q25,8 35,10" />
          <path d="M65,12 Q78,10 85,20" />
          <path d="M10,32 Q5,38 25,42" />
          <path d="M45,27 Q60,22 75,30" />
          <path d="M55,40 Q70,35 80,44" />
          <path d="M8,52 Q10,60 20,64" />
          <path d="M40,54 Q55,50 68,57" />
          <path d="M50,67 Q66,62 82,67" />
          <path d="M12,77 Q24,72 35,80" />
          <path d="M60,80 Q72,74 85,78" />
          <path d="M25,42 Q30,32 45,27" />
          <path d="M35,10 Q42,20 45,27" />
          <path d="M75,30 Q82,35 80,44" />
          <path d="M20,64 Q35,68 50,67" />
          <path d="M68,57 Q78,60 82,67" />
        </svg>
      </div>
    </section>
  );
}
