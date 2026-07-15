'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader';

const reviews = [
  {
    name: 'שלומי דהן',
    role: 'מנכ"ל — חנות Shopify',
    headline: 'ניהלתי מלאי באקסל עד שנשברתי',
    text: 'עם Datashop קיבלתי מערכת שמזהה תעודות משלוח אוטומטית, מסנכרנת מלאי עם Shopify, ומראה לי בדיוק מה חסר. חסכתי 10 שעות שבועיות של עבודה ידנית.',
  },
  {
    name: 'מיכל לוי',
    role: 'מנהלת שיווק — סטארטאפ B2B',
    headline: 'ContentBot חסך לי כותב תוכן',
    text: 'הייתי צריכה 8 פוסטים לסושיאל בשבוע. ContentBot מייצר תוכן בעברית שנשמע כמו הטון שלנו. אני עורכת 10 דקות במקום לכתוב שעתיים.',
  },
  {
    name: 'אורי קפלן',
    role: 'מייסד — חברת שירותים',
    headline: 'הרואה חשבון שלי התרגש',
    text: 'BookKeep סורק חשבוניות, מסווג הוצאות, ומכין דוח חודשי מוכן. הרו"ח שלי קיבל דוח מסודר בפעם הראשונה בחיים. חוסך לי שעתיים כל חודש.',
  },
  {
    name: 'רוני אביטל',
    role: 'סמנכ"ל מכירות — סוכנות ביטוח',
    headline: 'הפסקתי לאבד לידים',
    text: 'LeadFlow מעשיר נתונים, מנקד לידים, ומפזר אותם לאנשי המכירות שלי בזמן אמת. קיבלנו 30% יותר פגישות בחודש הראשון.',
  },
  {
    name: 'תמר שושני',
    role: 'בעלת אתר eCommerce',
    headline: 'האתר נפל ולא ידעתי',
    text: 'SiteGuard שלח לי התראה אחרי 2 דקות של downtime. לפני זה, לקוחות היו מתקשרים להגיד שהאתר לא עובד. עכשיו אני שקטה.',
  },
  {
    name: 'יואב מזרחי',
    role: 'מנהל תפעול — רשת חנויות',
    headline: 'שלוש תוכנות במחיר אחד',
    text: 'לקחנו חבילת 3 תוכנות — Datashop, LeadFlow ו-BookKeep. ב-1,000 ₪ לחודש קיבלנו מה שהיה עולה 15,000 ₪ לפתח מאפס.',
  },
];

export default function ToolsReviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = 4;
  const maxIndex = Math.max(0, reviews.length - visibleCount);

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(maxIndex, i + 1));

  return (
    <section className="reviews-section">
      <div className="container">
        <SectionHeader
          eyebrow="לקוחות תוכנות"
          titleHtml="מה קרה אחרי שהתחלנו<br>להשתמש בכלים."
          description="סיפורים אמיתיים מעסקים שהפסיקו לפתח מאפס והתחילו להשתמש בתוכנות מוכנות."
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
