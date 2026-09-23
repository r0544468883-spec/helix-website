'use client';

import { useState, useEffect, useRef, useId } from 'react';
import { SITE } from '@/lib/site';
import Lottie from 'lottie-react';
import { EmojiIcon } from '@/lib/emoji-icon';

const chatMessages = [
  { from: 'user', text: 'היי, ראיתי את הדירה ברחוב הירקון. אפשר לתאם סיור למחר?', time: '09:41' },
  { from: 'ai', text: 'בשמחה! כדי לתאם, רק כמה פרטים: לאיזה שעות נוח לכם מחר?', time: '09:41' },
  { from: 'user', text: 'אחרי 17:00 הכי טוב.', time: '09:42' },
  { from: 'ai', text: 'מעולה, שריינתי 17:30. שלחתי אישור ותזכורת, והעברתי את הפרטים לאיתי מצוות המכירות.', time: '09:42' },
];

const delays = [2000, 2500, 1800, 3000];
const LOOP_PAUSE = 4000;

// What we tell the visitor after a press. We never claim the details reached us
// before the response says so, the same rule the exit popup follows.
const NOTE = {
  sending: 'וואטסאפ נפתח עם ההודעה. עוד רגע נאשר שהפרטים נקלטו גם אצלנו.',
  sent: 'קיבלנו את הפרטים ונחזור אליכם.',
  failed: 'וואטסאפ נפתח, שלחו את ההודעה. הפרטים לא נשמרו אצלנו בגלל תקלה.',
  // Without consent we store nothing, so there is nothing to confirm.
  whatsapp: 'וואטסאפ נפתח עם ההודעה, שלחו אותה ונחזור אליכם.',
} as const;

type Status = 'idle' | keyof typeof NOTE;

// /api/lead only strips separators, then demands 0XXXXXXXX or 972XXXXXXXX. A
// visitor who typed 00972... or +972... was 400'd before anything was stored,
// so the lead vanished while the WhatsApp draft still opened. Normalize to
// the local 0 form here, where we still have the raw input.

// An Israeli number with the trunk 0 stripped: mobile and the 07X range are 9
// digits, geographic landlines (02/03/04/08/09) are 8.
const IL_SUBSCRIBER = /^(?:[57]\d{8}|[23489]\d{7})$/;

function normalizePhone(raw: string): string {
  const local = raw.replace(/\D/g, '').replace(/^(?:00972|972)/, '');
  if (!local) return '';
  // Some people keep the trunk 0 after +972, so do not hand back a 00 number.
  if (local.startsWith('0')) return local;
  // Only a real subscriber number gets the trunk 0 back. Adding it to anything
  // else turned 1-800-123-456 into 01800123456, which passes PHONE_RE and puts
  // a number nobody can dial in Eran's inbox. A shape we don't recognise goes
  // over as typed, so the route judges the number the visitor actually gave.
  return IL_SUBSCRIBER.test(local) ? `0${local}` : raw;
}

export default function AILeadForm() {
  const [messages, setMessages] = useState<typeof chatMessages>([]);
  const [typing, setTyping] = useState(false);
  const [typingFrom, setTypingFrom] = useState<'user' | 'ai'>('user');
  const [showHandoff, setShowHandoff] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', interest: '' });
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [lottieData, setLottieData] = useState(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef(0);
  const uid = useId();

  // A press while the POST is open, or after it landed, would only add a row
  // and a mail: nothing downstream dedupes a lead.
  const busy = status === 'sending' || status === 'sent';

  // Load lottie
  useEffect(() => {
    fetch('/ai-service.json?' + Date.now())
      .then(r => r.json())
      .then(setLottieData)
      .catch(() => {});
  }, []);

  // Chat animation loop
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    function nextStep() {
      const i = stepRef.current;
      if (i >= chatMessages.length) {
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
      setTypingFrom(chatMessages[i].from as 'user' | 'ai');
      setTyping(true);
      timeout = setTimeout(() => {
        setTyping(false);
        setMessages(prev => [...prev, chatMessages[i]]);
        stepRef.current = i + 1;
        timeout = setTimeout(nextStep, 600);
      }, delays[i]);
    }

    timeout = setTimeout(nextStep, 1000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, typing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    const msg = `שלום, אני מעוניין בסוכן AI לעסק שלי\nשם: ${form.name}\nטלפון: ${form.phone}\nמעניין אותי: ${form.interest || 'לא צוין'}`;

    // Same reason as the exit popup: the details used to exist only inside the
    // WhatsApp draft, so a visitor who never pressed send was lost. No await,
    // because window.open after one is blocked as a non-gesture popup; keepalive
    // keeps the request alive once the tab hands off to WhatsApp. The response
    // only picks the line we show, the handoff never waits for it.
    if (agreed) {
      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: normalizePhone(form.phone),
          interest: form.interest,
          source: 'ai-agent-form',
        }),
        keepalive: true,
      })
        .then(res => setStatus(res.ok ? 'sent' : 'failed'))
        .catch(() => setStatus('failed')); /* the WhatsApp handoff doesn't depend on our backend */
    }

    window.open(`https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
    setStatus(agreed ? 'sending' : 'whatsapp');
  };

  return (
    <section className="ai-lead-section">
      <div className="container">
        <div className="ai-lead-grid">
          {/* Left: Lottie + form */}
          <div className="ai-lead-form-wrap">
            {lottieData && (
              <div className="ai-lead-lottie" style={{ filter: 'hue-rotate(var(--lottie-hue, 0deg))' }}>
                <Lottie animationData={lottieData} loop autoplay style={{ width: 120, height: 120, margin: '0 auto 16px' }} aria-hidden="true" />
              </div>
            )}
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
              {/* The exit popup's consent block, so the two forms read as one
                  system. Deliberately not an HTML-required box: a visitor who
                  declines still gets the WhatsApp draft, which is their own
                  message to send. The checkbox gates only what we keep. */}
              <div className="exit-popup-consent">
                <input
                  type="checkbox"
                  id={`${uid}-consent`}
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                />
                <label htmlFor={`${uid}-consent`}>
                  אני מסכים ל<a href="/privacy" target="_blank">מדיניות הפרטיות</a> ול<a href="/privacy" target="_blank">תנאי השימוש</a>
                </label>
              </div>
              <button type="submit" className="ai-lead-cta" disabled={busy} style={busy ? { opacity: 0.65, cursor: 'default' } : undefined}>
                {status === 'sending' ? 'שולח…' : 'בדקו התאמה לסוכן AI'}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              {status !== 'idle' && (
                <p style={{ marginTop: 10, fontSize: '0.78rem', lineHeight: 1.5, textAlign: 'right', color: status === 'sent' ? '#10B981' : '#9ca3af' }}>
                  {NOTE[status]}
                </p>
              )}
            </form>
          </div>

          {/* Right: WhatsApp chat simulation */}
          <div className="ai-chat-column">
            <div className="ai-chat-sim">
              <div className="ai-chat-header">
                <div className="ai-chat-avatar"><EmojiIcon e="🤖" /></div>
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
                    <div className="ai-typing-dots"><span /><span /><span /></div>
                  </div>
                )}
                {showHandoff && (
                  <div className="ai-chat-handoff">✓ הועבר לנציג אנושי · עם כל ההקשר</div>
                )}
              </div>
            </div>
            <div className="ai-chat-badges">
              <span>סוכן אוטונומי, מבין, מחליט ומבצע</span>
              <span>מענה 24/7, וואטסאפ, טלפון, CRM</span>
              <span>אדם כשצריך, הסוכן יודע לעצור ולהעביר</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
