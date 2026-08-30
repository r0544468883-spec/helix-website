import type { Metadata } from 'next';
import DevelopmentPageClient from './DevelopmentPageClient';
import JsonLd from '@/app/components/JsonLd';
import { SITE } from '@/lib/site';
import { serviceSchema, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'פיתוח תוכנה · אפיון · ייעוץ AI | HELIX',
  description: 'פיתוח תוכנה בהתאמה אישית, אפיון מוצר, ייעוץ טרנספורמציה ל-AI. בנק שעות גמיש החל מ-300 ₪ לשעה. שיחת אפיון ראשונה חינם.',
};

export default function DevelopmentPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: 'פיתוח תוכנה וייעוץ AI',
            description: 'פיתוח תוכנה בהתאמה אישית, אפיון מוצר וייעוץ טרנספורמציה ל-AI. בנק שעות גמיש.',
            path: '/services/development',
            serviceType: 'Software Development',
          }),
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'פיתוח', url: `${SITE.url}/services/development` },
          ]),
        ]}
      />
      <DevelopmentPageClient />
    </>
  );
}
