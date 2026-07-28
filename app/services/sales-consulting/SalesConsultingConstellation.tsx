'use client';

import { useState } from 'react';
import ConstellationCanvas from '../../components/ConstellationCanvas';

const tools = [
  { name: 'HubSpot', sub: 'CRM', icon: '🟠', x: 35, y: 8 },
  { name: 'Salesforce', sub: 'CRM ארגוני', icon: '☁', x: 70, y: 10 },
  { name: 'Pipedrive', sub: 'ניהול פייפליין', icon: '📊', x: 12, y: 15 },
  { name: 'monday', sub: 'CRM ישראלי', icon: '🟣', x: 50, y: 18 },
  { name: 'Powerlink', sub: 'CRM ישראלי', icon: '⚡', x: 85, y: 20 },
  { name: 'Apollo', sub: 'לידים ודאטה', icon: '🚀', x: 8, y: 32 },
  { name: 'LinkedIn Sales', sub: 'Sales Navigator', icon: '💼', x: 42, y: 30 },
  { name: 'Lemlist', sub: 'רצפי מכירה', icon: '✉', x: 72, y: 32 },
  { name: 'Calendly', sub: 'תיאום פגישות', icon: '📅', x: 25, y: 42 },
  { name: 'Gong', sub: 'ניתוח שיחות', icon: '🎙', x: 60, y: 40 },
  { name: 'DocuSign', sub: 'חתימת חוזים', icon: '✍', x: 88, y: 42 },
  { name: 'WhatsApp', sub: 'מכירה בצ׳אט', icon: '💬', x: 10, y: 52 },
  { name: 'Zoom', sub: 'פגישות מכירה', icon: '📹', x: 38, y: 55 },
  { name: 'Slack', sub: 'תיאום צוות', icon: '💠', x: 68, y: 55 },
  { name: 'Dashboard', sub: 'דוחות ויעדים', icon: '📈', x: 20, y: 65 },
  { name: 'Zapier', sub: 'אוטומציות', icon: '⚙', x: 50, y: 68 },
  { name: 'Stripe', sub: 'גבייה', icon: '💳', x: 82, y: 65 },
  { name: 'Otter', sub: 'תמלול שיחות', icon: '🦦', x: 12, y: 78 },
  { name: 'Google Sheets', sub: 'מעקב', icon: '📗', x: 40, y: 78 },
  { name: 'ChatGPT', sub: 'תסריטים ומסרים', icon: '🤖', x: 65, y: 78 },
  { name: 'Mailchimp', sub: 'דיוור', icon: '🐵', x: 88, y: 78 },
];

export default function SalesConsultingConstellation() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="constellation-section">
      <div className="container">
        <h2 className="constellation-title">הכלים שמניעים את המכירות</h2>
        <p className="constellation-subtitle">אנחנו מקימים ומחברים את מערך הכלים הנכון לעסק שלכם — CRM, אוטומציה ומדידה. הנה חלק מהם.</p>
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
