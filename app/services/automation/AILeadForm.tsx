'use client';

import { useState, useEffect, useRef } from 'react';
import { SITE } from '@/lib/site';

const chatMessages = [
  { from: 'user', text: 'היי, ראיתי את הדירה ברחוב הירקון. אפשר לתאם סיור למחר?', time: '09:41' },
  { from: 'ai', text: 'בשמחה! 🙌 כדי לתאם, רק כמה פרטים: לאיזה שעות נוח לכם מחר?', time: '09:41' },
  { from: 'user', text: 'אחרי 17:00 הכי טוב.', time: '09:42' },
  { from: 'ai', text: 'מעולה — שריינתי 17:30. שלחתי אישור ותזכורת, והעברתי את הפרטים לאיתי מצוות המכירות.', time: '09:42' },
];

// Delays: typing indicator shown for this long before each message appears
const delays = [2000, 2500, 1800, 3000];
const LOOP_PAUSE = 4000;

export default function AILeadForm() {
  const [messages, setMessages] = useState<typeof chatMessages>([]);
  const [typing, setTyping] = useState(false);
  const [typingFrom, setTypingFrom] = useState<'user' | 'ai'>('user');
  const [showHandoff, setShowHandoff] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', interest: '' });
  const bodyRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    function nextStep() {
      const i = stepRef.current;

      if (i >= chatMessages.length) {
        // Show handoff, then pause and restart
        setShowHandoff(true);
        setTyping(false);
        timeout = setTimeout(() => {
          setMessages([]);
          setShowHandoff(false);
          stepRef.current = 0;
          nextStep();
        }, LOOP_PAUSE);
        return;
      }

      // Show typing indicator
      setTypingFrom(chatMessages[i].from as 'user' | 'ai');
      setTyping(true);

      timeout = setTimeout(() => {
        // Add message and hide typing
        setTyping(false);
        setMessages(prev => [...prev, chatMessages[i]]);
        stepRef.current = i + 1;

        // Schedule next step
        timeout = setTimeout(nextStep, 600);
      }, delays[i]);
    }

    // Start after a short delay
    timeout = setTimeout(nextStep, 1000);

    return () => clearTimeout(timeout);
  }, []);

  // Auto-scroll chat body
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, typing]);

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
                  {typing ? (typingFrom === 'ai' ? 'מקליד…' : 'הלקוח מקליד…') : 'מחובר'}
                </div>
              </div>
              <div className="ai-chat-online" />
            </div>
            <div className="ai-chat-body" ref={bodyRef}>
              {messages.map((msg, i) => (
                <div key={i} className={`ai-chat-bubble ai-chat-${msg.from}`}>
                  <p>{msg.text}</p>
                  <span className="ai-chat-time">{msg.time}</span>
                </div>
              ))}
              {typing && (
                <div className={`ai-chat-bubble ai-chat-${typingFrom}`}>
                  <div className="ai-typing-dots">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              {showHandoff && (
                <div className="ai-chat-handoff">✓ הועבר לנציג אנושי · עם כל ההקשר</div>
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
