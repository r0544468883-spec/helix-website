import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '../components/JsonLd';

export const metadata: Metadata = {
  title: 'פרטיות',
  description: `מדיניות הפרטיות של ${SITE.name}: מה אנחנו אוספים, איך אנחנו משתמשים בזה, ואיך לפנות אלינו.`,
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'בית', url: SITE.url },
          { name: 'פרטיות', url: `${SITE.url}/privacy` },
        ])}
      />
      <section className="page-header">
        <div className="container">
          <div className="eyebrow">משפטי</div>
          <h1>פרטיות.</h1>
          <p className="intro">
            מה אנחנו אוספים, איך אנחנו משתמשים בזה, ואיך לפנות אלינו.
          </p>
        </div>
      </section>

      <section className="legal">
        <div className="container">
          <div className="about-text legal-body">
            <p>
              <strong>מה אנחנו אוספים.</strong> אתר Helix משתמש ב-Google Analytics
              וב-Meta Pixel למדידת תנועה. שניהם אוספים נתונים אנונימיים על הדפים
              שצפיתם בהם, מקור ההגעה, ומידע טכני על הדפדפן. אין באתר טפסי קשר,
              אז אנחנו לא שומרים שם או אימייל אלא אם פנית אלינו ישירות באימייל.
            </p>
            <p>
              <strong>איך אנחנו משתמשים בזה.</strong> כדי להבין מה עובד באתר ומה לא.
              זהו. לא מוכרים נתונים, לא משתפים עם שותפים, לא מצטרפים ל-data brokers.
            </p>
            <p>
              <strong>שליטה ב-cookies.</strong> אפשר לחסום cookies בדפדפן או להשתמש
              ב-ad-blocker. זה לא ישבור שום דבר באתר.
            </p>
            <p>
              <strong>יצירת קשר.</strong> אם יש שאלה, או שברצונכם לבקש למחוק נתון
              מסוים — <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
            </p>
            <p className="muted-block">עודכן: 24.05.2026</p>
          </div>
        </div>
      </section>
    </>
  );
}
