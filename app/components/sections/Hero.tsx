import Button from '../Button';
import { SITE } from '@/lib/site';

const whatsappHref = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(SITE.whatsappMessage)}`;

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <h1 className="hero-headline">
          <span>מבטיחים פחות.</span>
          <span>מספקים יותר.</span>
        </h1>

        <h2 className="hero-subtitle">הילדים הטובים של עולם הדיגיטל.</h2>

        <p className="hero-subline">
          כשהבינה המלאכותית חוסכת לנו זמן יקר, לא הגיוני שתמשיכו לשלם כאילו היא לא קיימת. אנחנו מציעים חבילות דיגיטל מלאות ומתקדמות, בלי סיפורים, בלי דמי הקמה, בלי אותיות קטנות ובעיקר בלי מחירים מנופחים.
        </p>

        <div className="hero-ctas">
          <Button href={whatsappHref} variant="primary">דברו איתנו בוואטסאפ</Button>
          <Button href="#paths" variant="text" arrow="down">לחבילות</Button>
        </div>
      </div>
    </section>
  );
}
