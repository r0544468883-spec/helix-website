'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader';

const reviews = [
  {
    name: 'אבי שמש',
    role: 'סוכן ביטוח',
    headline: 'סוכנות שרפה לי תקציב בלי תוצאות',
    text: 'שנה שלמה עם סוכנות פרסום — 7,000 ₪ בחודש, אפס לידים, אפס תשובות. עברתי ל-HELIX, בנינו מערך LeadGen מחדש, וכבר בחודש הראשון קיבלתי 23 פניות אמיתיות.',
  },
  {
    name: 'נועה גרינברג',
    role: 'מותג אופנה — Noa.G',
    headline: 'קמפיינים יפים, אפס מכירות',
    text: 'הרצתי קמפיינים בפייסבוק ובאינסטגרם — נתונים מרשימים בדוח אבל אפס מכירות. HELIX שינו את הקריאייטיב, את הקהלים ואת דף הנחיתה. תוך חודש — המרות אמיתיות.',
  },
  {
    name: 'דניאל אביב',
    role: 'שותף — משרד עורכי דין',
    headline: 'רצינו להיכנס לדיגיטל ולא ידענו איך',
    text: 'כמשרד עורכי דין לא הרגשנו נוח עם שיווק אגרסיבי. HELIX בנו לנו אסטרטגיה מכובדת — SEO, תוכן מקצועי וקמפיינים ממוקדים. היום 40% מהלקוחות מגיעים מגוגל.',
  },
  {
    name: 'מיכל לוי',
    role: 'מדריכת יוגה',
    headline: 'אף אחד לא מצא אותי בגוגל',
    text: 'שילמתי לפרילנסר על SEO. חודשים עברו, כלום לא זז. HELIX עשו מחקר מילים, שינו את המבנה, כתבו תוכן. תוך 3 חודשים — עמוד ראשון בגוגל.',
  },
  {
    name: 'רועי בן-דוד',
    role: 'בעלים — חברת הובלה',
    headline: 'בחורף אין לקוחות',
    text: 'עסק עונתי — בקיץ עמוסים, בחורף מת. HELIX בנו קמפיין שמחזיק לידים כל השנה. היום היומן מלא 11 חודשים בשנה במקום 6.',
  },
  {
    name: 'ליאת כהן',
    role: 'בעלת קליניקה לאסתטיקה',
    headline: 'הסוכנות לקחה 8,000 והביאה לידים זבל',
    text: 'קיבלתי לידים שלא ענו לטלפון או שרצו הכל בחינם. HELIX שינו את הקהלים ואת המסרים — עכשיו 70% מהלידים קובעים תור.',
  },
];

export default function MarketingReviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = 4;
  const maxIndex = Math.max(0, reviews.length - visibleCount);

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(maxIndex, i + 1));

  return (
    <section className="reviews-section">
      <div className="container">
        <SectionHeader
          eyebrow="לקוחות שיווק"
          titleHtml="מה קרה אחרי שעברו<br>לשיווק עם HELIX."
          description="סיפורים אמיתיים מבעלי עסקים שנשרפו מסוכנויות יקרות ומצאו דרך אחרת."
        />

        <div className="reviews-outer">
          <button className="reviews-arrow" onClick={prev} disabled={currentIndex === 0} aria-label="הקודם">
            <ChevronRight size={22} />
          </button>

          <div className="reviews-viewport">
            <div className="reviews-track" style={{ transform: `translateX(calc(-${currentIndex} * 25%))` }}>
              {reviews.map((r, i) => (
                <div key={i} className="review-card">
                  <div className="review-card-inner">
                    <div className="review-quote">&ldquo;</div>
                    <p className="review-headline">{r.headline}</p>
                    <p className="review-text">{r.text}</p>
                    <div className="review-divider" />
                    <div className="review-author">
                      <span className="review-name">{r.name}</span>
                      <span className="review-role">{r.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="reviews-arrow" onClick={next} disabled={currentIndex === maxIndex} aria-label="הבא">
            <ChevronLeft size={22} />
          </button>
        </div>

        <div className="reviews-dots">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              className={`reviews-dot${i === currentIndex ? ' reviews-dot--active' : ''}`}
              onClick={() => setCurrentIndex(i)}
              aria-label={`עמוד ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
