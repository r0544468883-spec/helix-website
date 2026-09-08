import type { Metadata } from 'next';
import GtmSalesPageClient from './GtmSalesPageClient';
import JsonLd from '@/app/components/JsonLd';
import { SITE } from '@/lib/site';
import { serviceSchema, breadcrumbSchema, faqSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'GTM Engineering למכירות · הנדסת משפך המכירה | HELIX',
  description:
    'הצד ההנדסי של המכירות על HubSpot, Salesforce ו-Zoho. ארכיטקטורת pipeline, ניתוב לידים ו-speed-to-lead, אוטומציות מכירה, outbound מבוסס סיגנלים עם Clay, forecasting ו-CPQ. שכל ליד יטופל וכל דיל יהיה נראה.',
};

const FAQ = [
  {
    q: 'על אילו פלטפורמות אתם עובדים?',
    a: 'HubSpot, Salesforce, Zoho ו-Pipedrive. בונים את ה-pipeline, האוטומציות והדשבורדים בתוך המערכת שכבר יש לכם, ומחברים אליה כלי outbound והעשרה כמו Clay ו-Apollo.',
  },
  {
    q: 'מה ההבדל בין זה לבין HELIX SDR האוטומטי?',
    a: 'ה-SDR האוטומטי מבצע outbound בשבילכם. GTM Engineering למכירות בונה את התשתית: ה-pipeline, ניתוב הלידים, האוטומציות וה-forecasting שבתוך ה-CRM. הרבה חברות לוקחות את שניהם יחד.',
  },
  {
    q: 'יש לנו כבר Salesforce מסובך. אתם נכנסים לזה?',
    a: 'כן. אנחנו עושים אבחון, מסדרים את שלבי הדיל, בונים את האוטומציות והניתוב שחסרים, ומנקים את ה-pipeline כך שה-forecast יהיה אמין. בלי לשבור את מה שעובד.',
  },
  {
    q: 'כמה זמן עד שרואים תוצאות?',
    a: 'משלוחים ראשונים תוך ימים ספורים. ניתוב וקיצור speed-to-lead נכנסים לפעולה מהר, ותהליך pipeline מסודר עומד תוך שבועות. משם מכווננים בליווי שוטף.',
  },
  {
    q: 'כמה זה עולה?',
    a: 'לפי היקף. פרויקט חד-פעמי או ריטיינר חודשי. השיחה הראשונה ואבחון הארכיטקטורה הם ללא עלות, ואז חוזרים עם תמחור ברור.',
  },
];

export default function GtmSalesPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: 'GTM Engineering למכירות',
            description:
              'הנדסת משפך המכירה על HubSpot, Salesforce ו-Zoho. ארכיטקטורת pipeline, ניתוב לידים, speed-to-lead, אוטומציות מכירה, outbound עם Clay, forecasting ו-CPQ.',
            path: '/services/gtm-engineering/sales',
            serviceType: 'Sales Operations Engineering',
          }),
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'GTM Engineering', url: `${SITE.url}/services/gtm-engineering` },
            { name: 'למכירות', url: `${SITE.url}/services/gtm-engineering/sales` },
          ]),
          faqSchema(FAQ),
        ]}
      />
      <GtmSalesPageClient />
    </>
  );
}
