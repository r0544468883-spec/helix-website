'use client';

import { useState } from 'react';
import ConstellationCanvas from './ConstellationCanvas';

const tools = [
  { name: 'HubSpot', sub: 'CRM', icon: '🧡', x: 35, y: 8 },
  { name: 'Monday', sub: 'ניהול פרויקטים', icon: '📋', x: 65, y: 10 },
  { name: 'Pipedrive', sub: 'Pipeline', icon: '🔄', x: 15, y: 15 },
  { name: 'Zapier', sub: 'אינטגרציות', icon: '⚡', x: 85, y: 18 },
  { name: 'Make', sub: 'אוטומציות', icon: '🔧', x: 10, y: 30 },
  { name: 'n8n', sub: 'Workflows', icon: '🌐', x: 45, y: 25 },
  { name: 'SendPulse', sub: 'Email + SMS', icon: '📧', x: 75, y: 28 },
  { name: 'WhatsApp API', sub: 'הודעות אוטומטיות', icon: '💬', x: 25, y: 40 },
  { name: 'Google Sheets', sub: 'מאגרי נתונים', icon: '📊', x: 55, y: 38 },
  { name: 'Calendly', sub: 'תיאום פגישות', icon: '📅', x: 80, y: 42 },
  { name: 'Twilio', sub: 'SMS + Voice', icon: '📞', x: 8, y: 50 },
  { name: 'Airtable', sub: 'בסיס נתונים', icon: '🗃', x: 40, y: 52 },
  { name: 'Slack', sub: 'התראות צוות', icon: '💜', x: 68, y: 55 },
  { name: 'ChatGPT', sub: 'AI Agent', icon: '✦', x: 20, y: 62 },
  { name: 'Typeform', sub: 'טפסים חכמים', icon: '📝', x: 50, y: 65 },
  { name: 'Stripe', sub: 'תשלומים', icon: '💳', x: 82, y: 65 },
  { name: 'Notion', sub: 'דוקומנטציה', icon: '📓', x: 12, y: 75 },
  { name: 'ActiveCampaign', sub: 'Marketing Automation', icon: '🎯', x: 35, y: 78 },
  { name: 'Intercom', sub: 'Live Chat', icon: '💬', x: 60, y: 78 },
  { name: 'Webhook', sub: 'חיבורים מותאמים', icon: '🔗', x: 85, y: 78 },
];

export default function AutomationConstellation() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="constellation-section">
      <div className="container">
        <h2 className="constellation-title">הכלים שאנחנו מחברים</h2>
        <p className="constellation-subtitle">כל אוטומציה מורכבת מעשרות כלים שעובדים יחד. הנה חלק מהם.</p>
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
