import { SITE } from '@/lib/site';

const whatsappHref = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(SITE.whatsappMessage)}`;

export default function FinalCTA() {
  return (
    <section className="final-cta" id="cta">
      <div className="container">
        <p className="final-cta-eyebrow">בואו נדבר</p>

        <h2 className="final-cta-title">
          אם זה מרגיש מתאים,<br />נשמח לשיחה.
        </h2>

        <p className="final-cta-text">
          <strong>30 דקות. חינם. בלי פיץ׳ מכירות.</strong>
          {' '}אני מקשיב, שואל שאלות לא תמיד נוחות, ויוצא עם הבנה אם Helix מתאים לך — או עם המלצה למישהו אחר אם לא.
        </p>

        <div className="final-cta-buttons">
          <a
            href={SITE.calendlyUrl}
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            קבע שיחת היכרות
          </a>
        </div>

        <p className="final-cta-email">
          או ב-WhatsApp:{' '}
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
            הודעה ישירה
          </a>
        </p>
      </div>
    </section>
  );
}
