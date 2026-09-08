import type { Metadata } from 'next';
import GtmMarketingPageClient from './GtmMarketingPageClient';
import JsonLd from '@/app/components/JsonLd';
import { SITE } from '@/lib/site';
import { serviceSchema, breadcrumbSchema, faqSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'GTM Engineering לשיווק · הנדסת משפך השיווק | HELIX',
  description:
    'הצד ההנדסי של השיווק על HubSpot, Salesforce ו-Zoho. לכידת לידים והעשרת דאטה, ניקוד לידים, אוטומציות nurture, שלבי מחזור-חיים, attribution ודשבורדים. משפך שיווק שמראה מאיפה באמת מגיעה ההכנסה.',
};

const FAQ = [
  {
    q: 'על אילו פלטפורמות אתם עובדים?',
    a: 'HubSpot, Salesforce, Zoho ו-Pipedrive, וגם מערכות marketing automation כמו Marketo ו-Pardot. אנחנו מהנדסים חוצה-פלטפורמות ומחברים ביניהן, לא נעולים על כלי אחד.',
  },
  {
    q: 'מה זה בעצם GTM Engineering לשיווק?',
    a: 'הצד הטכני של השיווק. במקום עוד קמפיינים, אנחנו בונים את התשתית שמאחוריהם: לכידת לידים, העשרת דאטה, ניקוד, אוטומציות nurture, שלבי מחזור-חיים ומדידת attribution. כך שכל ליד נקלט נכון, מסווג, ומטופל אוטומטית.',
  },
  {
    q: 'יש לנו כבר HubSpot. אתם עדיין רלוונטיים?',
    a: 'בדיוק אז אנחנו רלוונטיים. רוב החברות משתמשות בחלק קטן מהיכולת. אנחנו עושים אבחון, מסדרים את מודל הדאטה, בונים את האוטומציות שחסרות ומחברים את הכלים שכבר יש לכם.',
  },
  {
    q: 'כמה זמן עד שרואים תוצאות?',
    a: 'משלוחים ראשונים תוך ימים ספורים, בלי פאזת discovery אינסופית. משפך העשרה וניקוד עומד תוך שבועות, ומשם ממשיכים לכוונן ולהרחיב בליווי שוטף.',
  },
  {
    q: 'כמה זה עולה?',
    a: 'לפי היקף. פרויקט חד-פעמי או ריטיינר חודשי. השיחה הראשונה ואבחון הארכיטקטורה הם ללא עלות, ואז חוזרים עם תמחור ברור.',
  },
];

export default function GtmMarketingPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: 'GTM Engineering לשיווק',
            description:
              'הנדסת משפך השיווק על HubSpot, Salesforce ו-Zoho. לכידת לידים, העשרת דאטה, ניקוד לידים, אוטומציות nurture, מחזור-חיים ו-attribution.',
            path: '/services/gtm-engineering/marketing',
            serviceType: 'Marketing Operations Engineering',
          }),
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'GTM Engineering', url: `${SITE.url}/services/gtm-engineering` },
            { name: 'לשיווק', url: `${SITE.url}/services/gtm-engineering/marketing` },
          ]),
          faqSchema(FAQ),
        ]}
      />
      <GtmMarketingPageClient />
    </>
  );
}
