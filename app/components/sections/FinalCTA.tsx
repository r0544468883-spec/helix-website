import { SITE } from '@/lib/site';
import Button from '../Button';

const whatsappHref = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(SITE.whatsappMessage)}`;

export default function FinalCTA() {
  return (
    <section className="final-cta" id="cta">
      <div className="container">
        <p className="final-cta-eyebrow">צעד אחד</p>

        <h2 className="final-cta-title">
          שלחו הודעה.<br />תקבלו תשובה תוך שעות.
        </h2>

        <p className="final-cta-text">
          בלי טפסים, בלי שיחות מכירה. ערן או רון יקראו, יבינו מה אתם צריכים, ויחזרו אליכם עם תשובה ישירה.
        </p>

        <div className="final-cta-buttons">
          <Button href={whatsappHref} variant="primary">דברו איתנו בוואטסאפ</Button>
          <Button href={`mailto:${SITE.email}`} variant="minimal" arrow="left">
            או שלחו מייל
          </Button>
        </div>
      </div>
    </section>
  );
}
