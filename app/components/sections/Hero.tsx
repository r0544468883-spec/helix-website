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
          העולם הדיגיטלי מתנהל לפי מוסכמה אחת לא כתובה, לגבות הרבה, לספר מעט. אנחנו באים לשבור את המוסכמה הזו. הבינה מלאכותית חוסכת לנו בשעות העבודה בצורה דרמטית, ובמקום שנחגוג על ההפרש החלטנו להשאיר אותו אצל הלקוחות שלנו. שירותים דיגיטליים מלאים ב-500 שקל לחודש. כי אם בינה מלאכותית חוסכת לנו זמן, לא הגיוני שאתם תמשיכו לשלם כאילו היא לא קיימת.
        </p>

        <div className="hero-ctas">
          <Button href={whatsappHref} variant="primary">דברו איתנו בוואטסאפ</Button>
          <Button href="#paths" variant="text" arrow="down">לחבילות</Button>
        </div>
      </div>
    </section>
  );
}
