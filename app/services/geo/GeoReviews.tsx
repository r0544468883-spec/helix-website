'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader';

const reviews = [
  {
    name: 'עידו פלדמן',
    role: 'מייסד, פלטפורמת SaaS',
    headline: 'לקוחות שאלו צ׳אט לפני שהגיעו אלי',
    text: 'גיליתי שלקוחות שואלים את ChatGPT מה הכלי הכי טוב בתחום שלי, ולא הופעתי. HELIX בנו לי מערך תוכן ו-Schema, היום אני מוזכר בתשובות על שלושה מונחים מרכזיים.',
  },
  {
    name: 'שירה בן דוד',
    role: 'בעלים, קליניקה פרטית',
    headline: 'גוגל כבר לא לבד',
    text: 'חצי מהפונים אמרו ש-Gemini המליץ עליי. לא ידעתי בכלל שאפשר לכוון את זה. עכשיו יש לי עמודים שבנויים בדיוק בשביל שה-AI יצטט אותם.',
  },
  {
    name: 'רן אלוני',
    role: 'מנכ״ל, חברת B2B',
    headline: 'המתחרה הופיע ב-AI, אני לא',
    text: 'ראיתי שכששואלים את Perplexity, מקפיצים את המתחרה שלי. HELIX עשו אבחון, מצאו למה, ובנו תוכן שמחזיר אותי למשחק. תוך חודשיים התמונה התהפכה.',
  },
  {
    name: 'מיכל צדוק',
    role: 'מנהלת שיווק, סטארטאפ',
    headline: 'דוח שסוף סוף הבנתי',
    text: 'במקום impressions, קיבלתי דוח כמה פעמים אנחנו מצוטטים ב-AI מול המתחרים. לראשונה ראיתי מה באמת זז. בלי ז׳רגון, בלי בולשיט.',
  },
  {
    name: 'דני הראל',
    role: 'בעלים, עסק מקומי',
    headline: 'חשבתי שזה רק לחברות גדולות',
    text: 'הייתי בטוח שקידום ב-AI זה משהו של תאגידים עם תקציב ענק. התברר שבמחיר חודשי שפוי ובלי חוזה אפשר להתחיל. הילדים הטובים באמת.',
  },
  {
    name: 'נועה קפלן',
    role: 'מייסדת, חנות איקומרס',
    headline: 'שאלו את הצ׳אט איזה מוצר לקנות',
    text: 'קונים שואלים את ה-AI מה הכי מתאים להם לפני שהם קונים. בנו לי תוכן שעונה בדיוק על השאלות האלה, וה-AI התחיל להפנות אליי. זה הכנסות אמיתיות.',
  },
];

export default function GeoReviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = 4;
  const maxIndex = Math.max(0, reviews.length - visibleCount);

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(maxIndex, i + 1));

  return (
    <section className="reviews-section">
      <div className="container">
        <SectionHeader
          eyebrow="לקוחות קידום ב-AI"
          titleHtml="מה קרה כשהעסק<br>הפך לתשובה של ה-AI."
          description="סיפורים אמיתיים מבעלי עסקים שגילו שהלקוחות שלהם שואלים AI, והיום הם התשובה."
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
