'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader';

const reviews = [
  {
    name: 'אבי נחמיאס',
    role: 'מנכ״ל, חברת שירותי IT',
    headline: 'צוות מכירות בלי שום שיטה',
    text: 'היו לי שלושה אנשי מכירות שכל אחד עבד אחרת. HELIX בנו תהליך אחיד, תסריטי שיחה ודשבורד, תוך חודשיים אחוז הסגירה עלה ב-40%.',
  },
  {
    name: 'רונית לוי',
    role: 'בעלים, סטודיו לעיצוב',
    headline: 'לידים נכנסו ופשוט נעלמו',
    text: 'קיבלתי המון פניות ולא ידעתי לאן הן הולכות. הקימו לי CRM, תהליך פולואפ אוטומטי ותסריט, הפסקתי לאבד לקוחות בדרך.',
  },
  {
    name: 'משה ברוך',
    role: 'סמנכ״ל מכירות, יבואן',
    headline: 'לא ידעתי מה באמת עובד',
    text: 'עבדנו הרבה אבל בלי מספרים. HELIX הקימו דשבורד מכירות ויעדים ברורים לכל נציג, לראשונה ראיתי איפה נתקעים ותיקננו.',
  },
  {
    name: 'דנה אשכנזי',
    role: 'מייסדת, סטארטאפ B2B',
    headline: 'לא ידעתי לתמחר ולסגור',
    text: 'מוצר טוב, אבל כל שיחת מכירה נגמרה ב״נחשוב על זה״. בנו לי אסטרטגיית תמחור, טיפול בהתנגדויות וסקריפט סגירה. עכשיו אני סוגרת.',
  },
  {
    name: 'יניב סבן',
    role: 'מנהל, חברת שיפוצים',
    headline: 'גייסתי אנשי מכירות שלא הצליחו',
    text: 'גייסתי וכולם עזבו תוך חודש. HELIX ליוו את הגיוס, בנו תוכנית הכשרה ותסריט, הנציגים החדשים התחילו לסגור כבר בשבוע השני.',
  },
  {
    name: 'גלית פרץ',
    role: 'מנכ״לית, חברת הדרכות',
    headline: 'רציתי להיכנס לשוק חדש',
    text: 'ידעתי שיש הזדמנות בשוק העסקי אבל לא ידעתי איך. פיתוח עסקי מסודר, מיפוי, שותפויות ותהליך, פתח לי ערוץ הכנסה שלם.',
  },
];

export default function SalesConsultingReviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = 4;
  const maxIndex = Math.max(0, reviews.length - visibleCount);

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(maxIndex, i + 1));

  return (
    <section className="reviews-section">
      <div className="container">
        <SectionHeader
          eyebrow="לקוחות ייעוץ מכירות"
          titleHtml="מה קרה אחרי שבנינו<br>להם מכונת מכירות."
          description="סיפורים אמיתיים מבעלי עסקים שהיו להם אנשי מכירות, אבל לא הייתה להם שיטה."
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
