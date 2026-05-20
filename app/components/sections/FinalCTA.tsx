import { SITE } from '@/lib/site';

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
          <a href={`mailto:${SITE.email}`} className="btn btn-primary">
            קבע שיחת היכרות
          </a>
        </div>

        <p className="final-cta-email">
          או באימייל: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </p>
      </div>
    </section>
  );
}
