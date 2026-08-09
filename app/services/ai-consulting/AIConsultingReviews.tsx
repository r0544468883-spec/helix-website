'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader';

const reviews = [
  {
    name: 'מיכל א.',
    role: 'מנכ"לית — משרד רו"ח',
    headline: 'הצוות פחד מ-AI. עכשיו לא מוותרים עליו',
    text: 'ניסינו לבד וזה נפל. HELIX עשו מיפוי, בחרו 3 כלים, והעבירו סדנה לכל המשרד. תוך חודש כל אחד עובד עם AI ביום-יום — בלי לחץ, בלי סיסמאות משותפות מסוכנות.',
  },
  {
    name: 'עומר ד.',
    role: 'סמנכ"ל תפעול — חברת שירותים',
    headline: 'חסכנו 20 שעות בשבוע על סיכומים ומיילים',
    text: 'הם לא מכרו לנו חלום. ישבו, מצאו איפה שורפים הכי הרבה זמן, והטמיעו כלי אחד שפתר את זה. אחר כך הרחבנו. תוצאה מדידה, לא מצגת.',
  },
  {
    name: 'רננה ב.',
    role: 'מנהלת HR — ארגון עם 120 עובדים',
    headline: 'בנו לנו מדיניות AI ברורה לכל הארגון',
    text: 'הדאגה הכי גדולה שלי הייתה דליפת מידע. HELIX בנו מדיניות שימוש, הגדירו מה מותר ומה אסור, והכשירו את המנהלים. עכשיו אנחנו עובדים עם AI בביטחון.',
  },
  {
    name: 'יואב ק.',
    role: 'בעלים — סטודיו דיגיטל',
    headline: 'עברנו מ"מנסים כלים" ל"תהליך שעובד"',
    text: 'לכל אחד היה ChatGPT פרטי ואף אחד לא ידע מה השני עושה. הם סידרו לנו GPTs ייעודיים, ספריית פרומפטים, ושיטת עבודה. פתאום כל הצוות מדבר אותה שפה.',
  },
];

export default function AIConsultingReviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = 4;
  const maxIndex = Math.max(0, reviews.length - visibleCount);

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(maxIndex, i + 1));

  return (
    <section className="reviews-section">
      <div className="container">
        <SectionHeader
          eyebrow="לקוחות הטמעת AI"
          titleHtml="מה קרה אחרי שהפסיקו<br>לפחד מ-AI."
          description="עסקים וארגונים שעברו מ״ניסיונות מקריים״ לתהליך מסודר עם תוצאות."
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
