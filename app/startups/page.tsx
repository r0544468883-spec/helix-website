import type { Metadata } from 'next';
import Link from 'next/link';
import { STARTUPS_DATA } from './startups-data';
import ScrollReveal from '../components/ScrollReveal';
import StartupDiscountBanner from './StartupDiscountBanner';

export const metadata: Metadata = {
  title: 'סטארטאפים ויזמים — שירותים, תוכנות ו-HELIX STAGE | HELIX',
  description:
    'כל מה שסטארטאפ צריך כדי לצמוח: Growth Hacking, פיתוח עסקי, שיווק דיגיטלי, חדירה לשווקים חדשים, והבמה הקהילתית HELIX STAGE. 20% הנחה אוטומטית לסטארטאפים ויזמים, ו-STAGE חינם.',
};

export default function StartupsHubPage() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <span className="eyebrow">סטארטאפים ויזמים</span>
          <h1>
            כל מה שסטארטאפ
            <br />
            צריך כדי לצמוח.
          </h1>
          <p className="intro">
            שירותים ותוכנות של HELIX, מותאמים לסטארטאפים ויזמים — צמיחה, מכירות, שיווק, חדירה לשווקים חדשים,
            והבמה הקהילתית HELIX STAGE. <strong>20% הנחה אוטומטית על הכל</strong>, ו-<strong>STAGE חינם</strong>.
          </p>
        </div>
      </section>

      <StartupDiscountBanner />

      <section className="products-hub">
        <div className="container">
          <ScrollReveal direction="up" stagger staggerDelay={0.06}>
            <div className="products-hub-grid">
              {STARTUPS_DATA.filter((s) => !s.unlisted).map((s) => (
                <Link key={s.slug} href={`/startups/${s.slug}`} className="product-hub-card">
                  <span className="product-hub-eyebrow">{s.eyebrow}</span>
                  <h2 className="product-hub-name">{s.name}</h2>
                  <p className="product-hub-desc">{s.subtitle}</p>
                  <span className="product-hub-link">{s.isStage ? 'כניסה למערכת ←' : 'לפרטים ←'}</span>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
