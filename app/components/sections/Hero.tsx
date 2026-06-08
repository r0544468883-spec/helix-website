import Button from '../Button';
import FoundersCoin from '../FoundersCoin';
import { SITE } from '@/lib/site';

const whatsappHref = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(SITE.whatsappMessage)}`;

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-layout">
          <div className="hero-text">
            <h1 className="hero-headline">
              <span>מבטיחים פחות.</span>
              <span>מספקים יותר.</span>
            </h1>

            <h2 className="hero-subtitle">הילדים הטובים של עולם הדיגיטל.</h2>

            <div className="hero-coin-mobile">
              <FoundersCoin />
            </div>

            <p className="hero-subline">
              כשהבינה המלאכותית חוסכת לנו זמן יקר, לא הגיוני שתמשיכו לשלם כאילו היא לא קיימת. אנחנו מציעים חבילות דיגיטל מלאות ומתקדמות, בלי סיפורים, בלי דמי הקמה, בלי אותיות קטנות ובעיקר בלי מחירים מנופחים.
            </p>

            <div className="hero-ctas">
              <Button href={whatsappHref} variant="primary">דברו איתנו בוואטסאפ</Button>
              <Button href="#packages" variant="text" arrow="down">לחבילות</Button>
            </div>
          </div>
          <div className="hero-coin">
            <FoundersCoin />
          </div>
        </div>
      </div>
    </section>
  );
}
