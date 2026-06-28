'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader';

const reviews = [
  {
    name: 'ירדן כהן',
    role: 'פרילנסר — מיתוג ועיצוב',
    headline: 'שילמתי 15,000 למפתח שנעלם',
    text: 'חיכיתי 4 חודשים, קיבלתי חצי אתר ושום דבר לא עבד. HELIX נכנסו, הבינו מה צריך, ותוך שבועיים היה לי אתר מקצועי שאני גאה להציג ללקוחות.',
  },
  {
    name: 'שירה מנחם',
    role: 'צלמת — Studio Shira',
    headline: 'האתר שלי נראה מ-2010',
    text: 'הלקוחות הגיעו מפה לאוזן, אבל כשנכנסו לאתר — ברחו. HELIX עיצבו מחדש, הוסיפו מערכת הזמנות ועדכנו את הגלריה. עכשיו האתר מוכר בשבילי.',
  },
  {
    name: 'יוסי מזרחי',
    role: 'בעלים — חברת שיפוצים',
    headline: 'האתר עלה, ואז — שקט מוחלט',
    text: 'שילמתי 12,000 על אתר. יפה, מרשים. אבל אף אחד לא נכנס. HELIX בנו מחדש עם SEO מהיום הראשון — תוך חודשיים התחלתי לקבל פניות מגוגל.',
  },
  {
    name: 'עדי רוזנפלד',
    role: 'יועצת תזונה',
    headline: 'הספק נעלם באמצע הפרויקט',
    text: 'הפרילנסר שבנה לי את האתר פשוט הפסיק לענות. HELIX לקחו את מה שהיה, סיימו תוך 10 ימים, והוסיפו מערכת הזמנות אוטומטית שחוסכת לי שעות.',
  },
  {
    name: 'תמר יצחק',
    role: 'בעלת חנות אינטרנטית',
    headline: 'החנות הייתה איטית ולא ממירה',
    text: 'חנות Shopify עם תנועה אבל 0.4% המרה. HELIX שיפרו את המהירות, שינו את עמודי המוצרים ואת תהליך הצ׳קאאוט. ההמרות הכפילו את עצמן תוך חודשיים.',
  },
  {
    name: 'אורן דהן',
    role: 'מאמן כושר — FitZone',
    headline: 'רציתי אתר פשוט, קיבלתי סיוט',
    text: 'שלושה חודשים של התכתבויות על דף נחיתה פשוט. HELIX בנו לי את כל האתר תוך שבוע — כולל טפסים, WhatsApp ו-SEO. סוף סוף יש לי נוכחות אונליין.',
  },
];

export default function WebsitesReviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = 4;
  const maxIndex = Math.max(0, reviews.length - visibleCount);

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(maxIndex, i + 1));

  return (
    <section className="reviews-section">
      <div className="container">
        <SectionHeader
          eyebrow="לקוחות אתרים"
          titleHtml="מה קרה אחרי שבנינו<br>להם את האתר."
          description="סיפורים אמיתיים מבעלי עסקים שנתקעו עם ספק, אתר ישן, או אתר יפה שלא מביא תנועה."
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
