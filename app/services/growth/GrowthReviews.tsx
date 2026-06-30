'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader';

const reviews = [
  { name: 'יונתן ק.', role: 'CEO — SaaS Startup', headline: 'הוצאנו 50K על קמפיינים ולמדנו אפס', text: 'HELIX בנו לנו מנגנון ניסויים — 12 ניסויים ברבעון, כל אחד לימד משהו. אחרי 90 יום ההמרות עלו פי 3.' },
  { name: 'ליאת מ.', role: 'מנהלת שיווק — חנות אונליין', headline: 'לא ידענו למה אנשים עוזבים את העגלה', text: 'HELIX מיפו את המשפך. גילו ש-67% נופלים בעמוד התשלום. שינוי אחד קטן — 40% יותר סגירות.' },
  { name: 'אורן ד.', role: 'Founder — אפליקציה', headline: 'רצינו צמיחה בלי לשרוף עוד כסף', text: 'בנו לנו referral program. לקוחות מביאים לקוחות. 30% מהגדילה החודשית מגיעה מהפניות.' },
  { name: 'נועם ש.', role: 'COO — חברת שירותים', headline: 'אף אחד לא הסתכל על המספרים', text: 'HELIX בנו דשבורד growth שאנחנו בודקים כל יום. סוף סוף מבינים מה עובד ומה לא.' },
];

export default function GrowthReviews() {
  const [ci, setCi] = useState(0);
  const max = Math.max(0, reviews.length - 4);
  return (
    <section className="reviews-section">
      <div className="container">
        <SectionHeader eyebrow="לקוחות Growth" titleHtml="מה קרה אחרי שהתחילו<br>לגדול בשיטה." description="עסקים שעברו מ'להוציא כסף' ל'לצמוח בשיטה'." />
        <div className="reviews-outer">
          <button className="reviews-arrow" onClick={() => setCi(i => Math.max(0, i-1))} disabled={ci === 0}><ChevronRight size={22} /></button>
          <div className="reviews-viewport">
            <div className="reviews-track" style={{ transform: `translateX(calc(-${ci} * 25%))` }}>
              {reviews.map((r, i) => (
                <div key={i} className="review-card"><div className="review-card-inner">
                  <div className="review-quote">&ldquo;</div>
                  <p className="review-headline">{r.headline}</p>
                  <p className="review-text">{r.text}</p>
                  <div className="review-divider" />
                  <div className="review-author"><span className="review-name">{r.name}</span><span className="review-role">{r.role}</span></div>
                </div></div>
              ))}
            </div>
          </div>
          <button className="reviews-arrow" onClick={() => setCi(i => Math.min(max, i+1))} disabled={ci === max}><ChevronLeft size={22} /></button>
        </div>
        <div className="reviews-dots">{Array.from({ length: max + 1 }).map((_, i) => (
          <button key={i} className={`reviews-dot${i === ci ? ' reviews-dot--active' : ''}`} onClick={() => setCi(i)} />
        ))}</div>
      </div>
    </section>
  );
}
