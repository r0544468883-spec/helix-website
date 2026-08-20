'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '../SectionHeader';

const reviews = [
  {
    name: 'ירדן כהן',
    role: 'בעלים, סוכנות תיירות',
    headline: 'שילמתי 15,000 ש"ח למפתח שנעלם',
    text: 'חיכיתי ארבעה חודשים למערכת הזמנות וקיבלתי חצי מסך שלא עבד. HELIX נכנסו, הבינו מה צריך, ותוך שבועיים היה לי מערכת שמנהלת את כל ההזמנות לבד.',
  },
  {
    name: 'מיכל לוי',
    role: 'מנהלת קליניקה',
    headline: 'שלוש שעות ביום על תיאום תורים',
    text: 'כל תור נקבע בוואטסאפ ידנית, וחצי מהמטופלים שכחו להגיע. HELIX בנו בוט שמתאם, מזכיר ומעדכן ביומן. הביטולים ברגע האחרון ירדו בחצי.',
  },
  {
    name: 'אבי שמש',
    role: 'מנכ"ל, חברת שילוח',
    headline: 'הלידים נפלו בין הכיסאות',
    text: 'פניות הגיעו למייל, לוואטסאפ ולטופס, ואף אחד לא ידע מי מטפל במה. HELIX חיברו הכול ל-CRM אחד עם התראות אוטומטיות. אפס פניות אבודות מאז.',
  },
  {
    name: 'נועה גרינברג',
    role: 'מייסדת, פלטפורמת B2B',
    headline: 'הצוות טבע בעבודה ידנית',
    text: 'שלושה אנשים העתיקו נתונים בין מערכות כל בוקר. HELIX בנו סוכן AI שעושה את זה לבד ומסמן רק את החריגים. שחררנו שתי משרות לעבודה אמיתית.',
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
    headline: 'ניהלתי הזמנות ביומן נייר',
    text: 'כל תיאום צילום היה שרשור וואטסאפ, ופעמיים כמעט קבעתי שני אירועים באותו יום. HELIX בנו מערכת הזמנות עם אישור אוטומטי ומקדמה. היומן מנהל את עצמו.',
  },
  {
    name: 'דניאל אביב',
    role: 'מנהל תפעול, רשת מסעדות',
    headline: 'כל סניף עבד עם אקסל אחר',
    text: 'לא הייתה לי תמונה אחת של המלאי והמשמרות. HELIX בנו דשבורד שמושך מכל הסניפים אוטומטית. אני רואה הכול במסך אחד בבוקר במקום לרדוף אחרי מנהלים.',
  },
  {
    name: 'תמר יצחק',
    role: 'מייסדת, SaaS לעסקים קטנים',
    headline: 'תנועה יפה, אפס הרשמות',
    text: 'אחוז ההמרה בהרשמה היה 0.4% ולא הבנתי למה. HELIX הריצו ניסויים על המסלול, שינו את שלב ההרשמה והוסיפו אונבורדינג אוטומטי. ההמרות הוכפלו בחודשיים.',
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
