'use client';

import { useState } from 'react';
import ConstellationCanvas from './ConstellationCanvas';

const tools = [
  { name: 'LinkedIn', sub: 'Sales Navigator', icon: '💼', x: 35, y: 8 },
  { name: 'Apollo', sub: 'Data Enrichment', icon: '🔍', x: 65, y: 10 },
  { name: 'Lemlist', sub: 'Cold Email', icon: '📧', x: 15, y: 15 },
  { name: 'HubSpot', sub: 'CRM', icon: '🧡', x: 85, y: 18 },
  { name: 'Pipedrive', sub: 'Pipeline', icon: '🔄', x: 10, y: 30 },
  { name: 'Instantly', sub: 'Email Outreach', icon: '⚡', x: 45, y: 25 },
  { name: 'Hunter.io', sub: 'Email Finder', icon: '🎯', x: 75, y: 28 },
  { name: 'PhantomBuster', sub: 'LinkedIn Automation', icon: '👻', x: 25, y: 40 },
  { name: 'Clearbit', sub: 'Data Enrichment', icon: '📊', x: 55, y: 38 },
  { name: 'Calendly', sub: 'תיאום פגישות', icon: '📅', x: 80, y: 42 },
  { name: 'Zapier', sub: 'אינטגרציות', icon: '⚡', x: 8, y: 50 },
  { name: 'Make', sub: 'Workflows', icon: '🔧', x: 40, y: 52 },
  { name: 'ChatGPT', sub: 'AI מסרים', icon: '✦', x: 68, y: 55 },
  { name: 'Woodpecker', sub: 'Follow-ups', icon: '🪶', x: 20, y: 62 },
  { name: 'Google Sheets', sub: 'מאגרי נתונים', icon: '📋', x: 50, y: 65 },
  { name: 'Slack', sub: 'התראות', icon: '💜', x: 82, y: 65 },
  { name: 'WhatsApp', sub: 'הודעות', icon: '💬', x: 12, y: 75 },
  { name: 'Notion', sub: 'דוקומנטציה', icon: '📓', x: 35, y: 78 },
  { name: 'Airtable', sub: 'בסיס נתונים', icon: '🗃', x: 60, y: 78 },
  { name: 'n8n', sub: 'אוטומציות', icon: '🌐', x: 85, y: 78 },
];

export default function SalesConstellation() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="constellation-section">
      <div className="container">
        <h2 className="constellation-title">הכלים שאנחנו משתמשים בהם</h2>
        <p className="constellation-subtitle">מערך SDR מורכב מעשרות כלים שעובדים יחד. הנה חלק מהם.</p>
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
