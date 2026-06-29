'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader';

const reviews = [
  {
    name: 'דניאל כ.',
    role: 'בעל חנות eCommerce',
    headline: 'הפסדתי 30% מהלידים כי לא הגבתי בזמן',
    text: 'לידים נכנסו בלילה ואני ראיתי אותם רק בבוקר — כשהם כבר סגרו עם מתחרה. HELIX בנו לי מענה אוטומטי תוך דקה. היום כל ליד מקבל תשובה מיידית.',
  },
  {
    name: 'שירה מ.',
    role: 'יועצת עסקית',
    headline: 'ה-CRM שלי היה ריק חצי שנה',
    text: 'קניתי HubSpot, אף אחד לא מילא. חזרתי לאקסל. HELIX ישבו איתי, הגדירו תהליכים פשוטים, ותוך שבוע ה-CRM עבד. בפועל.',
  },
  {
    name: 'אלון ר.',
    role: 'סטארטאפ B2B',
    headline: 'בנו לי Funnel שלם בשבועיים',
    text: 'מהרגע שליד ממלא טופס ועד שהוא מקבל הצעת מחיר — הכל אוטומטי. אימיילים, WhatsApp, תזכורות. חסכתי 15 שעות בשבוע.',
  },
  {
    name: 'רונית ב.',
    role: 'מנהלת שיווק — חברת שירותים',
    headline: 'עייפתי מלעקוב אחרי לידים באקסל',
    text: 'כל יום הייתי מעדכנת טבלה עם 200 שורות. HELIX חיברו את הטפסים ל-CRM, בנו סדרת אימיילים אוטומטית, ושחררו לי את הידיים.',
  },
];

export default function AutomationReviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = 4;
  const maxIndex = Math.max(0, reviews.length - visibleCount);

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(maxIndex, i + 1));

  return (
    <section className="reviews-section">
      <div className="container">
        <SectionHeader
          eyebrow="לקוחות אוטומציה"
          titleHtml="מה קרה אחרי שהפסיקו<br>לעשות הכל ביד."
          description="עסקים שהפסידו לידים, שרפו זמן, ומצאו דרך אחרת."
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
