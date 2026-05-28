import Button from '../Button';
import { SITE } from '@/lib/site';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <h1 className="hero-headline">
          <span>מבטיחים פחות.</span>
          <span>מספקים יותר.</span>
          <span className="accent">עושים תיאום ציפיות.</span>
        </h1>

        <p className="hero-subline">
          חברת פיתוח-וצמיחה לעסקים ישראלים שעייפו מספקים שלא מדברים אחד עם השני, מהבטחות שלא מתממשות, ומסטטוסים שלא קורים.
        </p>

        <div className="hero-ctas">
          <Button href={SITE.calendlyUrl} variant="primary">קבע שיחת היכרות</Button>
          <Button href="#method" variant="text" arrow="down">איך זה עובד</Button>
        </div>
      </div>
    </section>
  );
}
