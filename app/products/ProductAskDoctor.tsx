'use client';

import { useEffect, useState } from 'react';

type QA = { q: string; diagnosis: string; fix: string; metric: string };

const CASES: QA[] = [
  {
    q: 'למה 68% נוטשים בעמוד התשלום?',
    diagnosis: 'שדה "מספר כרטיס" נטען לאט במובייל, והמשתמשים מוותרים אחרי 4 שניות.',
    fix: 'טעינה עצלה + אוטופיל + מחוון התקדמות',
    metric: '+31% השלמת רכישה',
  },
  {
    q: 'למה משתמשים חוזרים אבל לא קונים?',
    diagnosis: 'קוהורט המבקרים החוזרים לא רואה הצעת ערך ברורה, הם מגיעים ל-Blog ולא ל-Pricing.',
    fix: 'באנר החזרה מותאם + CTA ל-Pricing',
    metric: '+22% Return-to-Paid',
  },
  {
    q: 'איפה המשפך דולף הכי הרבה?',
    diagnosis: 'המעבר Signup→Activation מאבד 54%, האונבורדינג ארוך מדי (7 שלבים).',
    fix: 'קיצור ל-3 שלבים + Aha-moment מוקדם',
    metric: '+18% Activation',
  },
];

/** "Ask the Doctor" panel, Attio-style AI-answer card that auto-rotates through diagnoses. */
export default function ProductAskDoctor({ accent }: { accent: string }) {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'thinking' | 'answer'>('thinking');

  useEffect(() => {
    setPhase('thinking');
    const t1 = setTimeout(() => setPhase('answer'), 1100);
    const t2 = setTimeout(() => setIdx((i) => (i + 1) % CASES.length), 5200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [idx]);

  const c = CASES[idx];

  return (
    <section className="pad" style={{ ['--pac' as string]: accent }}>
      <div className="container">
        <h2 className="pad-title">
          שאלו את ה-<em>Doctor</em>, ותקבלו אבחון, לא עוד גרף
        </h2>
        <div className="pad-panel">
          <div className="pad-q">
            <span className="pad-q-avatar" aria-hidden="true">🧑‍💼</span>
            <span className="pad-q-text">{c.q}</span>
          </div>

          <div className={`pad-a${phase === 'answer' ? ' is-answer' : ''}`}>
            <span className="pad-a-avatar" aria-hidden="true">🩺</span>
            {phase === 'thinking' ? (
              <span className="pad-thinking" aria-label="חושב">
                <span className="pad-dot" />
                <span className="pad-dot" />
                <span className="pad-dot" />
              </span>
            ) : (
              <div className="pad-a-body">
                <p className="pad-diag">{c.diagnosis}</p>
                <div className="pad-fix">
                  <span className="pad-fix-label">מרשם</span>
                  <span className="pad-fix-text">{c.fix}</span>
                </div>
                <span className="pad-metric">{c.metric}</span>
              </div>
            )}
          </div>
        </div>
        <div className="pad-dots" role="tablist" aria-hidden="true">
          {CASES.map((_, i) => (
            <span key={i} className={`pad-nav${i === idx ? ' is-on' : ''}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
