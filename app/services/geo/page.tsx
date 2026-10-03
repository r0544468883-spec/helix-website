import type { Metadata } from 'next';
import GeoPageClient from './GeoPageClient';
import JsonLd from '@/app/components/JsonLd';
import { SITE } from '@/lib/site';
import { serviceSchema, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'קידום ב-AI · GEO ו-AEO · שהעסק יצוץ ב-ChatGPT | HELIX',
  description:
    'שירות GEO ו-AEO: שהעסק שלכם יצוץ כשלקוח שואל את ChatGPT, Gemini או Perplexity, לא רק בגוגל. ארכיטקטורת תוכן, Schema, עמוד-ישויות ומדידת Citation Share. החל מ-1,250 ₪ לחודש, בלי חוזה.',
};

export default function GeoPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: 'קידום ב-AI, GEO ו-AEO',
            description:
              'הפיכת העסק לתשובה שמנועי ה-AI מצטטים: ארכיטקטורת תוכן Hub-and-Spoke, Schema ו-FAQ, עמוד-ישויות ומדידת Citation Share על פני ChatGPT, Gemini ו-Perplexity.',
            path: '/services/geo',
            serviceType: 'Generative Engine Optimization',
          }),
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'קידום ב-AI, GEO ו-AEO', url: `${SITE.url}/services/geo` },
          ]),
        ]}
      />
      <GeoPageClient />
    </>
  );
}
