import type { Metadata } from 'next';
import WebsitesPageClient from './WebsitesPageClient';
import JsonLd from '@/app/components/JsonLd';
import { SITE } from '@/lib/site';
import { serviceSchema, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'בניית אתרים · דפי נחיתה · מיניסייטים | HELIX',
  description: 'אתרים עסקיים, דפי נחיתה ומיניסייטים. עיצוב בהתאמה אישית, SEO, תחזוקה כלולה. החל מ-1,250 ₪ לחודש. בלי דמי הקמה, בלי חוזה.',
};

export default function WebsitesPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: 'בניית אתרים ודפי נחיתה',
            description: 'אתרים עסקיים, דפי נחיתה ומיניסייטים בעיצוב אישי, עם SEO ותחזוקה כלולה.',
            path: '/services/websites',
            serviceType: 'Web Design & Development',
          }),
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'בניית אתרים', url: `${SITE.url}/services/websites` },
          ]),
        ]}
      />
      <WebsitesPageClient />
    </>
  );
}
