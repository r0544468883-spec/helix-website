'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '../SectionHeader';

const reviews = [
  {
    name: 'ירדן כהן',
    role: 'פרילנסר — מיתוג ועיצוב',
    headline: 'שילמתי 15,000 ש"ח למפתח שנעלם',
    text: 'חיכיתי ארבעה חודשים, קיבלתי חצי אתר ושום דבר לא עבד. HELIX נכנסו, הבינו מה צריך, ותוך שבועיים היה לי אתר שאני גאה להציג ללקוחות.',
  },
  {
    name: 'מיכל לוי',
    role: 'מדריכת יוגה',
    headline: 'אף אחד לא מצא אותי בגוגל',
    text: 'היה לי אתר יפה שאיש לא ראה. HELIX עשו SEO מלא, שינו את המבנה, ותוך שלושה חודשים קיבלתי לקוחות חדשים שמגיעים ישירות מחיפוש.',
  },
  {
    name: 'אבי שמש',
    role: 'סוכן ביטוח',
    headline: 'סוכנות שרפה לי תקציב בלי תוצאות',
    text: 'שנה שלמה עם סוכנות פרסום — אפס לידים, אפס תשובות. עברתי ל-HELIX, בנינו מערך LeadGen מחדש, וכבר בחודש הראשון קיבלתי פניות אמיתיות.',
  },
  {
    name: 'נועה גרינברג',
    role: 'מותג אופנה — Noa.G',
    headline: 'פייסבוק שרפה לי תקציב בלי מכירות',
    text: 'הרצתי קמפיינים בפייסבוק ובאינסטגרם וראיתי נתונים מרשימים אבל אפס מכירות. HELIX שינו את הקריאייטיב, את הקהלים ואת הדף נחיתה — והמרות הגיעו.',
  },
  {
    name: 'רועי בן-דוד',
    role: 'בעלים — חברת הובלה',
    headline: 'עסק עונתי שלא יודע מאיפה יבוא הלקוח הבא',
    text: 'בקיץ עמוסים, בחורף שקט. HELIX בנו לי אוטומציה שמחזיקה לידים גם מחוץ לעונה, והיום יש לי יומן מלא שלא תלוי בגחמות השוק.',
  },
  {
    name: 'שירה מנחם',
    role: 'צלמת — Studio Shira',
    headline: 'האתר שלי נראה מ-2010',
    text: 'הלקוחות הגיעו מפה לאוזן, אבל כשנכנסו לאתר — ברחו. HELIX עיצבו מחדש, הוסיפו מערכת הזמנות ועדכנו את הגלריה. עכשיו האתר מוכר בשבילי.',
  },
  {
    name: 'דניאל אביב',
    role: 'שותף — משרד עורכי דין',
    headline: 'רצינו להיכנס לדיגיטל ולא ידענו איך',
    text: 'כמשרד עורכי דין לא הרגשנו נוח עם שיווק. HELIX בנו לנו אסטרטגיה מכובדת ומקצועית, טיפלו בכל הביצוע, ואנחנו ממוקדים רק בלקוחות.',
  },
  {
    name: 'תמר יצחק',
    role: 'בעלת חנות אינטרנטית',
    headline: 'Shopify מת מבחינת המרות',
    text: 'חנות פעילה עם תנועה, אבל אחוז ההמרה היה 0.4%. HELIX עשו CRO, שינו את העמודים, הוסיפו מערך אימיילים — ובחודשיים ההמרות הכפילו את עצמן.',
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
          description="לפני שפגשו אותנו. בדיוק כמו שזה היה."
        />

        <div className="reviews-outer">
          {/* Right arrow — RTL: goes to previous */}
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

          {/* Left arrow — RTL: goes to next */}
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
