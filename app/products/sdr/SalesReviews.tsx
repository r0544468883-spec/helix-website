'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader';

const reviews = [
  { name: 'עמית ש.', role: 'CEO — חברת SaaS', headline: 'SDR ב-15,000 ₪ עזב אחרי 4 חודשים', text: 'גייסנו SDR, הוא למד את המוצר, התחיל להניב — ואז עזב. עם HELIX יש לנו מערך אוטומטי שלא עוזב ועובד 24/7.' },
  { name: 'רונן כ.', role: 'יועץ עסקי', headline: 'שלחתי 20 הודעות ביום, ידנית', text: 'לינקדין, מייל, לינקדין, מייל. שעתיים ביום. עם HELIX המערכת שולחת 200+ הודעות ביום ואני סוגר עסקאות.' },
  { name: 'נטע מ.', role: 'מנהלת פיתוח עסקי — סטארטאפ', headline: 'לא היה לנו pipeline אמיתי', text: 'ידענו שיש לידים אבל לא ידענו איפה כל אחד עומד. HELIX בנו CRM מסודר עם דשבורד שנותן תמונת מצב מיידית.' },
  { name: 'אלעד ר.', role: 'שותף — משרד ייעוץ', headline: 'הלקוחות לא הגיעו מפרסום', text: 'קהל B2B לא מגיב לקמפיינים. HELIX בנו לנו outreach ממוקד — 40 פגישות בחודשיים הראשונים.' },
];

export default function SalesReviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = 4;
  const maxIndex = Math.max(0, reviews.length - visibleCount);
  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(maxIndex, i + 1));

  return (
    <section className="reviews-section">
      <div className="container">
        <SectionHeader eyebrow="לקוחות SDR" titleHtml="מה קרה אחרי שהפסיקו<br>לשלוח הודעות ידנית." description="עסקים שמצאו דרך אחרת להגיע ללקוחות B2B." />
        <div className="reviews-outer">
          <button className="reviews-arrow" onClick={prev} disabled={currentIndex === 0} aria-label="הקודם"><ChevronRight size={22} /></button>
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
          <button className="reviews-arrow" onClick={next} disabled={currentIndex === maxIndex} aria-label="הבא"><ChevronLeft size={22} /></button>
        </div>
        <div className="reviews-dots">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button key={i} className={`reviews-dot${i === currentIndex ? ' reviews-dot--active' : ''}`} onClick={() => setCurrentIndex(i)} aria-label={`עמוד ${i + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
