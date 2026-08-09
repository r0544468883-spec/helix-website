import type { Metadata } from 'next';
import AIConsultingPageClient from './AIConsultingPageClient';
import JsonLd from '@/app/components/JsonLd';
import { SITE } from '@/lib/site';
import { serviceSchema, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'ליווי והטמעת בינה מלאכותית בעסקים וארגונים — HELIX',
  description: 'ליווי, אסטרטגיה והטמעה של כלי AI בעסקים ובארגונים — מיפוי, Quick Wins, סדנאות, ופיקוח על תוצאות מדידות. בלי חוזה. הילדים הטובים של עולם הדיגיטל.',
};

export default function AIConsultingPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: 'ליווי והטמעת בינה מלאכותית בעסקים וארגונים',
            description: 'ליווי אסטרטגי והטמעה מעשית של כלי AI בעסקים ובארגונים — מיפוי הזדמנויות, Quick Wins, סדנאות צוות, ותפעול שוטף עם תוצאות מדידות.',
            path: '/services/ai-consulting',
            serviceType: 'AI Adoption & Implementation Consulting',
          }),
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'ליווי והטמעת AI', url: `${SITE.url}/services/ai-consulting` },
          ]),
        ]}
      />
      <AIConsultingPageClient />
    </>
  );
}
