'use client';

import { useState } from 'react';
import ConstellationCanvas from './ConstellationCanvas';

const tools = [
  { name: 'ChatGPT', sub: 'GPT · צוותים', icon: '✦', x: 35, y: 8 },
  { name: 'Claude', sub: 'Anthropic', icon: '◈', x: 65, y: 10 },
  { name: 'Gemini', sub: 'Google', icon: '✧', x: 15, y: 15 },
  { name: 'Microsoft Copilot', sub: 'M365', icon: '🟦', x: 85, y: 18 },
  { name: 'Perplexity', sub: 'מחקר', icon: '🔎', x: 10, y: 30 },
  { name: 'Midjourney', sub: 'תמונות', icon: '🎨', x: 45, y: 25 },
  { name: 'ElevenLabs', sub: 'קול', icon: '🎙', x: 75, y: 28 },
  { name: 'NotebookLM', sub: 'ידע ארגוני', icon: '📓', x: 25, y: 40 },
  { name: 'Zapier', sub: 'אינטגרציות', icon: '⚡', x: 55, y: 38 },
  { name: 'Make', sub: 'אוטומציות', icon: '🔧', x: 80, y: 42 },
  { name: 'n8n', sub: 'Workflows', icon: '🌐', x: 8, y: 50 },
  { name: 'HubSpot', sub: 'CRM + AI', icon: '🧡', x: 40, y: 52 },
  { name: 'Gamma', sub: 'מצגות', icon: '📊', x: 68, y: 55 },
  { name: 'Fireflies', sub: 'סיכום פגישות', icon: '📝', x: 20, y: 62 },
  { name: 'Cursor', sub: 'פיתוח AI', icon: '⌨', x: 50, y: 60 },
  { name: 'Runway', sub: 'וידאו', icon: '🎬', x: 82, y: 62 },
  { name: 'Custom GPTs', sub: 'סוכנים ייעודיים', icon: '🤖', x: 50, y: 72 },
  { name: 'Vector DB', sub: 'RAG · ידע פנימי', icon: '🗃', x: 82, y: 72 },
  { name: 'Azure OpenAI', sub: 'ארגוני · פרטי', icon: '☁', x: 12, y: 75 },
  { name: 'Whisper', sub: 'תמלול', icon: '🎧', x: 35, y: 78 },
  { name: 'Zoom AI', sub: 'פגישות', icon: '💬', x: 60, y: 80 },
  { name: 'API מותאם', sub: 'חיבור למערכות', icon: '🔗', x: 85, y: 80 },
];

export default function AIConsultingConstellation() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="constellation-section">
      <div className="container">
        <h2 className="constellation-title">הכלים שאנחנו מטמיעים ומחברים</h2>
        <p className="constellation-subtitle">הטמעת AI בארגון היא לא כלי אחד — זה אקוסיסטם שלם של כלים שעובדים יחד. הנה חלק מהם.</p>
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
