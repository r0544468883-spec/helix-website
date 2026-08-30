import type { Metadata } from 'next';
import SalesConsultingPageClient from './SalesConsultingPageClient';
import JsonLd from '@/app/components/JsonLd';
import { SITE } from '@/lib/site';
import { serviceSchema, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'ייעוץ מכירות ופיתוח עסקי · בניית תהליך מכירה | HELIX',
  description:
    'ייעוץ מכירות ופיתוח עסקי, אבחון, אסטרטגיה, תסריטים, הקמת CRM, הדרכת צוות וליווי שוטף. הופכים מכירות מ״תלוי במזל״ למערכת שעובדת. החל מ-1,250 ₪ לחודש, בלי חוזה.',
};

export default function SalesConsultingPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: 'ייעוץ מכירות ופיתוח עסקי',
            description: 'אבחון, אסטרטגיה, תסריטים, הקמת CRM, הדרכת צוות וליווי, הפיכת מכירות למערכת שעובדת.',
            path: '/services/sales-consulting',
            serviceType: 'Sales Consulting',
          }),
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'מכירות ופיתוח עסקי', url: `${SITE.url}/services/sales-consulting` },
          ]),
        ]}
      />
      <SalesConsultingPageClient />
    </>
  );
}
