'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader';

const reviews = [
  {
    name: 'עמית שגב',
    role: 'מייסד — SaaS לניהול מלאי',
    headline: 'ה-MVP שלי היה אמור לקחת 3 חודשים',
    text: 'ספק קודם לקח שנה ונתן חצי מוצר. HELIX אפיינו מחדש, בנו MVP עובד תוך 6 שבועות, והיום יש לי לקוחות משלמים. הפער הוא בגישה — לא בטכנולוגיה.',
  },
  {
    name: 'גיל מרקוביץ׳',
    role: 'CTO — סטארטאפ FinTech',
    headline: 'חיפשנו מפתח שמבין עסק, לא רק קוד',
    text: 'צריך היה לחבר 3 מערכות שונות ולבנות דשבורד מותאם. HELIX עשו אפיון חכם שחסך לנו חודש פיתוח, והאינטגרציה עובדת בלי תקלות מיום ראשון.',
  },
  {
    name: 'ליאור ברנר',
    role: 'מנכ"ל — חברת לוגיסטיקה',
    headline: 'רצינו לאמץ AI ולא ידענו מאיפה להתחיל',
    text: 'HELIX עשו מיפוי תהליכים, זיהו 3 מקומות שבינה מלאכותית חוסכת שעות, ובנו פתרון מותאם. היום החיסכון שלנו הוא 40 שעות עבודה בחודש.',
  },
  {
    name: 'נטלי אדרי',
    role: 'מייסדת — פלטפורמת הזמנות',
    headline: 'הספק הקודם נעלם עם הקוד',
    text: 'שילמתי 60,000 ₪ על מערכת הזמנות. הספק נעלם. HELIX לקחו מה שנשאר, כתבו מחדש את הליבה, והיום המערכת מטפלת ב-500 הזמנות ביום.',
  },
  {
    name: 'רן כספי',
    role: 'סמנכ"ל תפעול — רשת קליניקות',
    headline: 'המערכת הפנימית שלנו הייתה מאקסל',
    text: '15 סניפים ניהלו הכל באקסל משותף. HELIX בנו מערכת ניהול פנימית עם דשבורד, התראות אוטומטיות, ודוחות. ספרינט ראשון היה מוכן תוך שבועיים.',
  },
  {
    name: 'דנה שפירא',
    role: 'יועצת ארגונית',
    headline: 'רציתי כלי AI שיחסוך שעות על דוחות',
    text: 'כל שבוע ישבתי 6 שעות על דוחות. HELIX בנו כלי שמפיק דוח אוטומטי מנתוני CRM. עכשיו זה 20 דקות. שעת הייעוץ הראשונה כבר חסכה לי כסף.',
  },
];

export default function DevelopmentReviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = 4;
  const maxIndex = Math.max(0, reviews.length - visibleCount);

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(maxIndex, i + 1));

  return (
    <section className="reviews-section">
      <div className="container">
        <SectionHeader
          eyebrow="לקוחות פיתוח"
          titleHtml="מה קרה אחרי שהתחלנו<br>לפתח ביחד."
          description="סיפורים אמיתיים מיזמים ובעלי עסקים שהגיעו עם בעיה וקיבלו פתרון שעובד."
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
