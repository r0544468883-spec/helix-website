'use client';

import { useState } from 'react';
import ConstellationCanvas from '../../components/ConstellationCanvas';
import { EmojiIcon } from '@/lib/emoji-icon';

const tools = [
  { name: 'ChatGPT', sub: 'מנוע תשובות', icon: '🤖', x: 35, y: 8 },
  { name: 'Gemini', sub: 'AI של גוגל', icon: '✨', x: 70, y: 10 },
  { name: 'Perplexity', sub: 'חיפוש AI', icon: '🔮', x: 12, y: 15 },
  { name: 'AI Overviews', sub: 'תשובות גוגל', icon: '🟦', x: 50, y: 18 },
  { name: 'Claude', sub: 'מנוע תשובות', icon: '🟤', x: 85, y: 20 },
  { name: 'Copilot', sub: 'AI של Bing', icon: '🧭', x: 8, y: 32 },
  { name: 'Schema.org', sub: 'JSON-LD', icon: '🏷', x: 42, y: 30 },
  { name: 'FAQ Schema', sub: 'שאלות ותשובות', icon: '❓', x: 72, y: 32 },
  { name: 'Wikidata', sub: 'ישויות', icon: '🗂', x: 25, y: 42 },
  { name: 'Knowledge Graph', sub: 'גרף ידע', icon: '🕸', x: 60, y: 40 },
  { name: 'llms.txt', sub: 'קובץ ל-AI', icon: '📄', x: 88, y: 42 },
  { name: 'Search Console', sub: 'מדידת גוגל', icon: '📊', x: 10, y: 52 },
  { name: 'Hub & Spoke', sub: 'מבנה תוכן', icon: '🎯', x: 38, y: 55 },
  { name: 'Answer-first', sub: 'פסקת תשובה', icon: '💡', x: 68, y: 55 },
  { name: 'Citation Share', sub: 'דוח ציטוטים', icon: '📈', x: 20, y: 65 },
  { name: 'עמוד-סטטיסטיקות', sub: 'מגנט ציטוטים', icon: '📌', x: 50, y: 68 },
  { name: 'Compare', sub: 'עמודי השוואה', icon: '⚖', x: 82, y: 65 },
  { name: 'Entities', sub: 'ישויות עסק', icon: '🧩', x: 12, y: 78 },
  { name: 'Reddit / Quora', sub: 'מקורות ציטוט', icon: '💬', x: 40, y: 78 },
  { name: 'Sitemap', sub: 'מפת אתר', icon: '🗺', x: 65, y: 78 },
  { name: 'ChatGPT Search', sub: 'חיפוש בצ׳אט', icon: '🔎', x: 88, y: 78 },
];

export default function GeoConstellation() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="constellation-section">
      <div className="container">
        <h2 className="constellation-title">איפה הלקוחות שלכם שואלים</h2>
        <p className="constellation-subtitle">אנחנו דואגים שתופיעו במקומות שבהם מקבלים היום החלטות קנייה, מנועי ה-AI והתשתיות שמזינות אותם. הנה חלק מהם.</p>
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
