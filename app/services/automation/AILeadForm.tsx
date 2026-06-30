'use client';

import { useState, useEffect } from 'react';
import { SITE } from '@/lib/site';

const chatMessages = [
  { from: 'user', text: 'היי, ראיתי את הדירה ברחוב הירקון. אפשר לתאם סיור למחר?', time: '09:41' },
  { from: 'ai', text: 'בשמחה! 🙌 כדי לתאם, רק כמה פרטים: לאיזה שעות נוח לכם מחר?', time: '09:41' },
  { from: 'user', text: 'אחרי 17:00 הכי טוב.', time: '09:42' },
  { from: 'ai', text: 'מעולה — שריינתי 17:30. שלחתי אישור ותזכורת, והעברתי את הפרטים לאיתי מצוות המכירות.', time: '09:42' },
];

export default function AILeadForm() {
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [form, setForm] = useState({ name: '', phone: '', interest: '' });

  useEffect(() => {
    if (visibleMessages >= chatMessages.length) return;
    const timer = setTimeout(() => setVisibleMessages(v => v + 1), 1200);
    return () => clearTimeout(timer);
  }, [visibleMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `שלום, אני מעוניין בסוכן AI לעסק שלי\nשם: ${form.name}\nטלפון: ${form.phone}\nמעניין אותי: ${form.interest || 'לא צוין'}`;
    window.open(`https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <section className="ai-lead-section">
      <div className="container">
        <div className="ai-lead-grid">
          {/* Left: WhatsApp simulation */}
          <div className="ai-chat-sim">
            <div className="ai-chat-header">
              <div className="ai-chat-avatar">🤖</div>
              <div>
                <div className="ai-chat-name">העסק שלכם · סוכן AI</div>
                <div className="ai-chat-status">
                  {visibleMessages < chatMessages.length ? 'מקליד…' : 'מחובר'}
                </div>
              </div>
            </div>
            <div className="ai-chat-body">
              {chatMessages.slice(0, visibleMessages).map((msg, i) => (
                <div key={i} className={`ai-chat-bubble ai-chat-${msg.from}`} style={{ animationDelay: `${i * 0.15}s` }}>
                  <p>{msg.text}</p>
                  <span className="ai-chat-time">{msg.time}</span>
                </div>
              ))}
              {visibleMessages >= chatMessages.length && (
                <div className="ai-chat-handoff">הועבר לנציג אנושי · עם כל ההקשר</div>
              )}
            </div>
            <div className="ai-chat-badges">
              <span>🤖 סוכן אוטונומי — מבין, מחליט ומבצע</span>
              <span>📞 מענה 24/7 — וואטסאפ, טלפון, CRM</span>
              <span>👤 אדם כשצריך — הסוכן יודע לעצור ולהעביר</span>
            </div>
          </div>

          {/* Right: Lead form */}
          <div className="ai-lead-form-wrap">
            <h2 className="ai-lead-title">איזו עבודה הייתם נותנים לסוכן AI?</h2>
            <p className="ai-lead-sub">כתבו לנו מה חוזר אצלכם ידנית ונחזיר כיוון מעשי, לא מצגת.</p>

            <form onSubmit={handleSubmit} className="ai-lead-form">
              <div className="ai-field">
                <label>שם מלא *</label>
                <input type="text" placeholder="שם מלא" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="ai-field">
                <label>טלפון *</label>
                <input type="tel" placeholder="050-123-4567" required dir="ltr" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="ai-field">
                <label>מה מעניין אתכם? (אופציונלי)</label>
                <select value={form.interest} onChange={e => setForm({...form, interest: e.target.value})}>
                  <option value="">בחרו תחום</option>
                  <option value="סוכן AI לוואטסאפ">סוכן AI לוואטסאפ</option>
                  <option value="סוכן AI קולי">סוכן AI קולי</option>
                  <option value="ניהול לידים אוטומטי">ניהול לידים אוטומטי</option>
                  <option value="CRM חכם">CRM חכם</option>
                  <option value="קביעת תורים">קביעת תורים אוטומטית</option>
                  <option value="אוטומציה בהתאמה">אוטומציה בהתאמה אישית</option>
                </select>
              </div>
              <button type="submit" className="ai-lead-cta">
                בדקו התאמה לסוכן AI
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
