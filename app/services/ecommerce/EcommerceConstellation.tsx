'use client';

import { useState } from 'react';
import ConstellationCanvas from '../../components/ConstellationCanvas';

const tools = [
  { name: 'Shopify', sub: 'פלטפורמת חנות', icon: '🛒', x: 35, y: 8 },
  { name: 'WooCommerce', sub: 'חנות WordPress', icon: '🛍', x: 70, y: 10 },
  { name: 'Stripe', sub: 'סליקת אשראי', icon: '💳', x: 12, y: 15 },
  { name: 'PayPal', sub: 'תשלומים', icon: '🅿', x: 50, y: 18 },
  { name: 'Bit', sub: 'תשלום ישראלי', icon: '📱', x: 85, y: 20 },
  { name: 'Klaviyo', sub: 'דיוור ואוטומציה', icon: '✉', x: 8, y: 32 },
  { name: 'Mailchimp', sub: 'ניוזלטר', icon: '🐵', x: 42, y: 30 },
  { name: 'ReCharge', sub: 'מנויים', icon: '🔁', x: 72, y: 32 },
  { name: 'Google Shopping', sub: 'פיד מוצרים', icon: '🔍', x: 25, y: 42 },
  { name: 'Meta Shop', sub: 'חנות פייסבוק/אינסטגרם', icon: '📷', x: 60, y: 40 },
  { name: 'TikTok Shop', sub: 'מכירה בטיקטוק', icon: '🎵', x: 88, y: 42 },
  { name: 'GA4', sub: 'Analytics', icon: '📊', x: 10, y: 52 },
  { name: 'Hotjar', sub: 'Heatmaps', icon: '🔥', x: 38, y: 55 },
  { name: 'Judge.me', sub: 'ביקורות מוצר', icon: '⭐', x: 68, y: 55 },
  { name: 'משלוחים', sub: 'חברות שילוח', icon: '📦', x: 20, y: 65 },
  { name: 'WhatsApp', sub: 'שירות לקוחות', icon: '💬', x: 50, y: 68 },
  { name: 'ניהול מלאי', sub: 'Inventory', icon: '🗄', x: 82, y: 65 },
  { name: 'n8n', sub: 'אוטומציות', icon: '⚡', x: 12, y: 78 },
  { name: 'Meta Pixel', sub: 'ריטרגטינג', icon: '🎯', x: 40, y: 78 },
  { name: 'Vercel', sub: 'אחסון מהיר', icon: '🚀', x: 65, y: 78 },
  { name: 'Cloudflare', sub: 'CDN + אבטחה', icon: '☁', x: 88, y: 78 },
];

export default function EcommerceConstellation() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="constellation-section">
      <div className="container">
        <h2 className="constellation-title">הכלים שמניעים את החנות שלכם</h2>
        <p className="constellation-subtitle">כל חנות מחוברת לתשתית מלאה — תשלומים, משלוחים, שיווק ואוטומציה. הנה חלק מהם.</p>
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
