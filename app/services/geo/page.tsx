import type { Metadata } from 'next';
import GeoPageClient from './GeoPageClient';
import JsonLd from '@/app/components/JsonLd';
import { SITE } from '@/lib/site';
import { serviceSchema, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'פיילוט קידום ב-AI (GEO) · שהעסק יצוץ ב-ChatGPT | HELIX',
  description:
    'פיילוט GEO של 3 חודשים: שהעסק שלך יצוץ כשלקוח שואל את ChatGPT, Gemini או Claude, לא רק בגוגל. כתבות מותאמות-AI, שיפוץ התוכן הקיים ודוח חודשי כמה הוזכרת מול המתחרים. החל מ-1,250 ₪ לחודש, בלי חוזה.',
};

export default function GeoPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: 'פיילוט קידום ב-AI (GEO)',
            description:
              'פיילוט GEO של 3 חודשים: כתבות מותאמות-AI, שיפוץ התוכן הקיים ומדידה חודשית כמה פעמים העסק מוזכר מול המתחרים ב-ChatGPT, Gemini ו-Claude.',
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
