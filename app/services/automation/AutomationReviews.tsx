'use client';

import SectionHeader from '../../components/SectionHeader';
import ScrollReveal from '../../components/ScrollReveal';

const reviews = [
  { name: 'דניאל כ.', role: 'בעל חנות eCommerce', text: 'לפני HELIX הייתי מפסיד 30% מהלידים כי לא הגבתי בזמן. עכשיו כל ליד מקבל תשובה תוך דקה — אוטומטית.' },
  { name: 'שירה מ.', role: 'יועצת עסקית', text: 'סוף סוף ה-CRM שלי עובד. לא האמנתי שאפשר לעבור מאקסל למערכת אמיתית בשבוע.' },
  { name: 'אלון ר.', role: 'סטארטאפ B2B', text: 'בנו לנו Funnel שלם — מהרגע שליד ממלא טופס ועד שהוא מקבל הצעת מחיר. הכל אוטומטי.' },
];

export default function AutomationReviews() {
  return (
    <section className="sp2-section">
      <div className="container">
        <SectionHeader eyebrow="מה לקוחות אומרים" titleHtml="עסקים שהפסיקו<br>לעבוד ביד." />
        <ScrollReveal direction="up" stagger staggerDelay={0.1}>
          <div className="sp-reviews-grid">
            {reviews.map((r) => (
              <blockquote key={r.name} className="sp-review-card">
                <p>{r.text}</p>
                <footer>
                  <strong>{r.name}</strong>
                  <span>{r.role}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
