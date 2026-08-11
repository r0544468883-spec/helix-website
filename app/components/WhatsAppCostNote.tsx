'use client';

// מקור אמת אחד לסקשן "עלויות וואטסאפ", משותף לדף הראשי ולכל דף מוצר שמשתמש בוואטסאפ.
export default function WhatsAppCostNote() {
  return (
    <section className="wcn-section">
      <style>{`
        .wcn-section { padding: clamp(48px, 7vw, 80px) 0; }
        .wcn-section .container { max-width: 1120px; margin: 0 auto; padding: 0 clamp(16px, 4vw, 32px); }
        .wcn { border: 1px solid rgba(37,211,102,0.25); border-radius: 20px; padding: clamp(28px, 5vw, 44px); background: linear-gradient(160deg, rgba(37,211,102,0.06), rgba(0,0,0,0.2)); }
        .wcn-head { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
        .wcn-badge { font-size: 0.72rem; font-weight: 700; color: #25D366; border: 1px solid rgba(37,211,102,0.4); border-radius: 999px; padding: 4px 12px; }
        .wcn-title { font-size: clamp(1.4rem, 3.5vw, 2rem); font-weight: 800; color: #fff; }
        .wcn-body { color: #b9c2bd; line-height: 1.8; font-size: 0.95rem; }
        .wcn-body strong { color: #fff; }
        .wcn-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 26px; }
        @media (max-width: 720px) { .wcn-cols { grid-template-columns: 1fr; } }
        .wcn-opt { border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 22px; background: rgba(0,0,0,0.2); }
        .wcn-opt h4 { font-size: 1.02rem; color: #fff; margin-bottom: 6px; font-weight: 700; }
        .wcn-opt p { font-size: 0.84rem; color: #9ca3af; line-height: 1.6; margin-bottom: 12px; }
        .wcn-opt table { width: 100%; border-collapse: collapse; }
        .wcn-opt td { font-size: 0.84rem; color: #d1d5db; padding: 6px 0; border-top: 1px solid rgba(255,255,255,0.05); }
        .wcn-opt td:last-child { text-align: left; color: #34d399; font-weight: 700; }
        .wcn-opt tr:first-child td { border-top: none; }
        .wcn-note { font-size: 0.78rem; color: #6b7280; margin-top: 18px; line-height: 1.6; }
      `}</style>
      <div className="container">
        <div className="wcn">
          <div className="wcn-head">
            <span className="wcn-badge">💬 WhatsApp Business API הרשמי</span>
          </div>
          <h3 className="wcn-title">עלויות וואטסאפ, שקוף לחלוטין</h3>
          <p className="wcn-body">
            המערכת שולחת הודעות דרך <strong>ה-API הרשמי והמקורי של וואטסאפ (Meta Cloud API)</strong>, ולא דרך
            כלים אפורים. זו החלטה מודעת: שליחה בשיטות לא-רשמיות מובילה ל<strong>חסימת מספרי הטלפון של הלקוחות שלכם</strong>,
            ואנחנו לא מוכנים לסכן את העסק שלכם. הדרך הרשמית שומרת על המספרים בטוחים ומאושרים.
          </p>
          <p className="wcn-body" style={{ marginTop: '12px' }}>
            בתמורה, <strong>מטא מחייבת על כל הודעה שהבוט שולח</strong>, התעריפים נקבעים על ידי מטא, משתנים לפי מדינה
            וסוג הודעה, <strong>ואינם בשליטתנו</strong>. לכן עלות ההודעות נפרדת מהמנוי, ואתם בוחרים איך לשלם:
          </p>

          <div className="wcn-cols">
            <div className="wcn-opt">
              <h4>לפי שימוש (Pay-as-you-go)</h4>
              <p>טוענים קרדיט מראש ומשלמים רק על מה ששלחתם. מתאים לנפח נמוך או משתנה.</p>
              <table>
                <tbody>
                  <tr><td>מחיר להודעה</td><td>₪0.20</td></tr>
                  <tr><td>טעינה מינימלית</td><td>₪50</td></tr>
                  <tr><td>הבוט מושהה כשנגמר</td><td>✓</td></tr>
                </tbody>
              </table>
            </div>
            <div className="wcn-opt">
              <h4>חבילה חודשית</h4>
              <p>מכסת הודעות קבועה במחיר נמוך יותר להודעה. מתאים לנפח גבוה וקבוע.</p>
              <table>
                <tbody>
                  <tr><td>1,000 הודעות</td><td>₪149</td></tr>
                  <tr><td>5,000 הודעות</td><td>₪590</td></tr>
                  <tr><td>25,000 הודעות</td><td>₪2,400</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <p className="wcn-note">
            ✓ כל מסלול כולל מכסת הודעות חינם (100 / 500 / 2,000). התשלום מתחיל רק מעליה.<br />
            ℹ️ עדכון מטא: החל מ-1 באוקטובר 2026 גם תגובות הבוט בחלון 24 השעות יחויבו על ידי מטא (היום הן חינם), נעדכן את המכסות בהתאם.
          </p>
        </div>
      </div>
    </section>
  );
}
