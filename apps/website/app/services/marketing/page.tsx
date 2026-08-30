import type { Metadata } from 'next';
import MarketingPageClient from './MarketingPageClient';
import JsonLd from '@/app/components/JsonLd';
import { SITE } from '@/lib/site';
import { serviceSchema, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'שיווק דיגיטלי · Hands-on | HELIX',
  description: 'שיווק דיגיטלי שעובד. קמפיינים, SEO, סושיאל, תוכן. החל מ-1,250 ₪ לחודש. בלי חוזה.',
};

export default function MarketingPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: 'שיווק דיגיטלי',
            description: 'שיווק דיגיטלי hands-on, קמפיינים ממומנים, SEO, סושיאל ותוכן, תחת אחריות אחת.',
            path: '/services/marketing',
            serviceType: 'Digital Marketing',
          }),
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'שיווק דיגיטלי', url: `${SITE.url}/services/marketing` },
          ]),
        ]}
      />
      <MarketingPageClient />
    </>
  );
}
