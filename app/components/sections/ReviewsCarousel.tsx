'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '../SectionHeader';

const reviews = [
  {
    name: 'ירדן כהן',
    role: 'פרילנסר, מיתוג ועיצוב',
    headline: 'לידים היו מתפזרים ואיבדתי לקוחות',
    text: 'כל פנייה נחתה במקום אחר, בוואטסאפ, במייל ובפתקים, ועד שחזרתי חלק כבר ברחו. HELIX הקימו לי אוטומציה שאוספת כל פנייה, שולחת הצעת מחיר ומזכירה מעקב. הפסקתי לרדוף אחרי לקוחות.',
  },
  {
    name: 'מיכל לוי',
    role: 'מדריכת יוגה',
    headline: 'כל פנייה הייתה נעלמת בוואטסאפ',
    text: 'קיבלתי הרבה הודעות אבל לא הספקתי לענות לכולן, וחצי מהן התאדו. HELIX בנו לי בוט שמגיב מיד וקובע שיעורים ישירות ליומן. עכשיו השיעורים מתמלאים לבד.',
  },
  {
    name: 'אבי שמש',
    role: 'סוכן ביטוח',
    headline: 'סוכנות שרפה לי תקציב בלי תוצאות',
    text: 'שנה שלמה עם סוכנות פרסום, אפס לידים, אפס תשובות. עברתי ל-HELIX, בנינו מערך LeadGen מחדש, וכבר בחודש הראשון קיבלתי פניות אמיתיות.',
  },
  {
    name: 'נועה גרינברג',
    role: 'מותג אופנה, Noa.G',
    headline: 'הזמנות התפספסו כי לא הספקתי לענות',
    text: 'לקוחות שאלו על מידות, זמינות ומשלוח, ועד שחזרתי אליהם הם כבר קנו במקום אחר. HELIX הקימו סוכן AI שמגיב מיד, מאשר הזמנות ושולח מעקב. המכירות עלו בלי שהוספתי שעות עבודה.',
  },
  {
    name: 'רועי בן-דוד',
    role: 'בעלים, חברת הובלה',
    headline: 'עסק עונתי שלא יודע מאיפה יבוא הלקוח הבא',
    text: 'בקיץ עמוסים, בחורף שקט. HELIX בנו לי אוטומציה שמחזיקה לידים גם מחוץ לעונה, והיום יש לי יומן מלא שלא תלוי בגחמות השוק.',
  },
  {
    name: 'שירה מנחם',
    role: 'צלמת, Studio Shira',
    headline: 'לקוחות פנו, ונעלמו עד שחזרתי',
    text: 'הפניות הגיעו מפה לאוזן, אבל בזמן שצילמתי הן חיכו יומיים לתשובה וברחו. HELIX הקימו מערכת שמאשרת פניות, מתאמת מועד צילום ושולחת תזכורות אוטומטית. היומן מתמלא בלי שאני נוגעת.',
  },
  {
    name: 'דניאל אביב',
    role: 'שותף, משרד עורכי דין',
    headline: 'פניות נפלו בין הכיסאות',
    text: 'פנייה שהגיעה בערב או באמצע דיון פשוט הלכה לאיבוד. HELIX הקימו אוטומציה שקולטת כל פנייה, מתאמת פגישת ייעוץ ושומרת הכל ב-CRM. כבר לא מפספסים לקוח.',
  },
  {
    name: 'תמר יצחק',
    role: 'בעלת חנות אינטרנטית',
    headline: 'לקוחות נטשו עגלות ואף אחד לא חזר אליהם',
    text: 'הייתה תנועה בחנות אבל המון עגלות ננטשו בלי מעקב. HELIX הקימו אוטומציית שחזור עגלות ב-WhatsApp ובמייל, ותשובות אוטומטיות לשאלות נפוצות. ההכנסות עלו והפסקתי לרדוף אחרי כל הזמנה.',
  },
];

export default function ReviewsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = 4;
  const maxIndex = reviews.length - visibleCount; // 4

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(maxIndex, i + 1));

  return (
    <section className="reviews-section" id="reviews">
      <div className="container">
        <SectionHeader
          eyebrow="לקוחות"
          titleHtml="מה שמענו מהשטח."
          description="מה קרה אחרי שהתקשרו אלינו."
        />

        <div className="reviews-outer">
          {/* Right arrow, RTL: goes to previous */}
          <button
            className="reviews-arrow"
            onClick={prev}
            disabled={currentIndex === 0}
            aria-label="הקודם"
          >
            <ChevronRight size={22} />
          </button>

          <div className="reviews-viewport">
            <div
              className="reviews-track"
              style={{ transform: `translateX(calc(-${currentIndex} * 25%))` }}
            >
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

          {/* Left arrow, RTL: goes to next */}
          <button
            className="reviews-arrow"
            onClick={next}
            disabled={currentIndex === maxIndex}
            aria-label="הבא"
          >
            <ChevronLeft size={22} />
          </button>
        </div>

        {/* Dot indicators */}
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
