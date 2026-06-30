'use client';
import { useState } from 'react';
import ConstellationCanvas from './ConstellationCanvas';

const tools = [
  { name: 'Hotjar', sub: 'Heatmaps', icon: '🔥', x: 35, y: 8 },
  { name: 'Mixpanel', sub: 'Product Analytics', icon: '📊', x: 65, y: 10 },
  { name: 'GA4', sub: 'Analytics', icon: '📈', x: 15, y: 15 },
  { name: 'Optimizely', sub: 'A/B Testing', icon: '🧪', x: 85, y: 18 },
  { name: 'Amplitude', sub: 'User Behavior', icon: '🔍', x: 10, y: 30 },
  { name: 'ChatGPT', sub: 'AI Analysis', icon: '✦', x: 45, y: 25 },
  { name: 'Claude', sub: 'AI Strategy', icon: '◈', x: 75, y: 28 },
  { name: 'VWO', sub: 'CRO', icon: '🎯', x: 25, y: 40 },
  { name: 'Semrush', sub: 'מתחרים', icon: '🕵️', x: 55, y: 38 },
  { name: 'Ahrefs', sub: 'SEO + Content', icon: '🔗', x: 80, y: 42 },
  { name: 'Intercom', sub: 'Chatbot', icon: '💬', x: 8, y: 50 },
  { name: 'Drift', sub: 'Conversational', icon: '🤖', x: 40, y: 52 },
  { name: 'Zapier', sub: 'Automations', icon: '⚡', x: 68, y: 55 },
  { name: 'Typeform', sub: 'Surveys', icon: '📝', x: 20, y: 62 },
  { name: 'Unbounce', sub: 'Landing Pages', icon: '📄', x: 50, y: 65 },
  { name: 'Mailchimp', sub: 'Email', icon: '📧', x: 82, y: 65 },
  { name: 'ReferralCandy', sub: 'Referrals', icon: '🍬', x: 12, y: 75 },
  { name: 'Viral Loops', sub: 'Growth Loops', icon: '🔄', x: 35, y: 78 },
  { name: 'Looker', sub: 'Dashboards', icon: '📉', x: 60, y: 78 },
  { name: 'n8n', sub: 'Workflows', icon: '🌐', x: 85, y: 78 },
];

export default function GrowthConstellation() {
  const [active, setActive] = useState<string | null>(null);
  return (
    <section className="constellation-section">
      <div className="container">
        <h2 className="constellation-title">הכלים שאנחנו משתמשים בהם</h2>
        <p className="constellation-subtitle">Growth Hacking מורכב מעשרות כלים שעובדים יחד. הנה חלק מהם.</p>
      </div>
      <div className="constellation-map">
        <ConstellationCanvas particleCount={50} connectionDistance={100} />
        {tools.map((tool) => (
          <div key={tool.name} className={`constellation-node ${active === tool.name ? 'constellation-active' : ''}`} style={{ left: `${tool.x}%`, top: `${tool.y}%` }} onMouseEnter={() => setActive(tool.name)} onMouseLeave={() => setActive(null)}>
            <div className="constellation-sparkle" />
            <div className="constellation-icon">{tool.icon}</div>
            <div className="constellation-label"><span className="constellation-name">{tool.name}</span><span className="constellation-sub">{tool.sub}</span></div>
          </div>
        ))}
      </div>
    </section>
  );
}
