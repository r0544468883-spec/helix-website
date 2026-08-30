'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader';

const reviews = [
  {
    name: 'רועי אלימלך',
    role: 'מותג ביגוד, DTC',
    headline: 'חנות יפה, אפס מכירות',
    text: 'שילמתי 22,000 על חנות Shopify מהממת. ואז גיליתי שאף אחד לא נכנס אליה. HELIX חיברו שיווק, SEO ואוטומציות, תוך חודשיים החנות התחילה למכור לבד.',
  },
  {
    name: 'ליהי ברקוביץ׳',
    role: 'קוסמטיקה טבעית',
    headline: 'נטישת עגלות של 78%',
    text: 'אנשים הוסיפו מוצרים ונעלמו. לא היה שום תהליך שחזור. HELIX הקימו אימיילים אוטומטיים לעגלה נטושה, החזרנו 30% מהעגלות שברחו.',
  },
  {
    name: 'דניאל עופר',
    role: 'חנות כלי בית',
    headline: 'עלויות התוספים חנקו אותי',
    text: 'כל חודש עוד אפליקציה, עוד 40 דולר. הגעתי ל-600 דולר בחודש רק על תוספים. HELIX בנו מחדש חכם יותר, חצי מהעלות, פי שתיים ביצועים.',
  },
  {
    name: 'מאיה שטרן',
    role: 'תכשיטנית, Studio Maya',
    headline: 'החנות לא עבדה במובייל',
    text: '80% מהתנועה שלי מהמובייל, והצ׳קאאוט פשוט נשבר שם. HELIX תיקנו את כל חוויית המובייל, ההמרות במובייל שולשו.',
  },
  {
    name: 'איתי כהן',
    role: 'מוצרי ספורט',
    headline: 'תקוע ב-WooCommerce איטי',
    text: 'החנות טענה 8 שניות. גוגל העניש אותי והלקוחות ברחו. HELIX העבירו לתשתית מהירה, אופטימיזציית תמונות ו-CDN, טעינה מתחת לשנייה.',
  },
  {
    name: 'נועה פרידמן',
    role: 'מותג תינוקות',
    headline: 'רציתי להשיק מהר, בלי סיפורים',
    text: 'היה לי מוצר מוכן וזמן קצר להשקה. HELIX הקימו חנות מלאה תוך 3 שבועות, תשלומים, משלוחים, מלאי ודיוור. הגעתי לשוק בזמן.',
  },
];

export default function EcommerceReviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = 4;
  const maxIndex = Math.max(0, reviews.length - visibleCount);

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(maxIndex, i + 1));

  return (
    <section className="reviews-section">
      <div className="container">
        <SectionHeader
          eyebrow="לקוחות איקומרס"
          titleHtml="מה קרה אחרי שבנינו<br>להם את החנות."
          description="סיפורים אמיתיים מבעלי חנויות שנתקעו עם חנות יפה שלא מוכרת, נטישת עגלות, או תשתית איטית."
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
