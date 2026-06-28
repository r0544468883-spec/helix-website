'use client';

import { useState } from 'react';
import ConstellationCanvas from './ConstellationCanvas';

const tools = [
  { name: 'WordPress', sub: 'CMS', icon: '📝', x: 35, y: 8 },
  { name: 'Shopify', sub: 'eCommerce', icon: '🛒', x: 70, y: 10 },
  { name: 'WooCommerce', sub: 'חנות WP', icon: '🛍', x: 12, y: 15 },
  { name: 'Elementor', sub: 'Page Builder', icon: '🎨', x: 50, y: 18 },
  { name: 'Next.js', sub: 'React Framework', icon: '▲', x: 85, y: 20 },
  { name: 'Figma', sub: 'עיצוב UI/UX', icon: '🖌', x: 8, y: 32 },
  { name: 'Webflow', sub: 'No-Code', icon: '🌊', x: 42, y: 30 },
  { name: 'React', sub: 'Frontend', icon: '⚛', x: 72, y: 32 },
  { name: 'Tailwind', sub: 'CSS Framework', icon: '💨', x: 25, y: 42 },
  { name: 'Vercel', sub: 'Hosting', icon: '🚀', x: 60, y: 40 },
  { name: 'Cloudflare', sub: 'CDN + SSL', icon: '☁', x: 88, y: 42 },
  { name: 'GA4', sub: 'Analytics', icon: '📊', x: 10, y: 52 },
  { name: 'Hotjar', sub: 'Heatmaps', icon: '🔥', x: 38, y: 55 },
  { name: 'SEO', sub: 'קידום אורגני', icon: '🔍', x: 68, y: 55 },
  { name: 'Stripe', sub: 'תשלומים', icon: '💳', x: 20, y: 65 },
  { name: 'WhatsApp', sub: 'צ׳אט באתר', icon: '💬', x: 50, y: 68 },
  { name: 'Supabase', sub: 'Database', icon: '🗄', x: 82, y: 65 },
  { name: 'n8n', sub: 'אוטומציות', icon: '⚡', x: 12, y: 78 },
  { name: 'GTM', sub: 'Tag Manager', icon: '🏷', x: 40, y: 78 },
  { name: 'Lottie', sub: 'אנימציות', icon: '✨', x: 65, y: 78 },
  { name: 'GitHub', sub: 'Version Control', icon: '🐙', x: 88, y: 78 },
];

export default function WebsitesConstellation() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="constellation-section">
      <div className="container">
        <h2 className="constellation-title">הכלים שאנחנו בונים איתם</h2>
        <p className="constellation-subtitle">כל אתר נבנה עם הטכנולוגיות המתקדמות ביותר. הנה חלק מהן.</p>
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
