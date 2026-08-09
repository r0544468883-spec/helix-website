import type { Metadata } from 'next';
import ToolsPageClient from './ToolsPageClient';
import JsonLd from '@/app/components/JsonLd';
import { SITE } from '@/lib/site';
import { serviceSchema, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'תוכנות מוכנות · SaaS לעסקים | HELIX',
  description:
    'גישה לתוכנות שכבר בנינו — ניהול מלאי, לידים, תוכן, הנהלת חשבונות וניטור אתרים. תוכנה בודדת 500 ₪/חודש, חבילת 3 תוכנות 1,000 ₪/חודש.',
};

export default function ToolsPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: 'תוכנות SaaS מוכנות לעסקים',
            description: 'גישה לתוכנות מוכנות של HELIX — ניהול מלאי, לידים, תוכן, הנהלת חשבונות וניטור אתרים.',
            path: '/services/tools',
            serviceType: 'SaaS',
          }),
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'תוכנות מוכנות', url: `${SITE.url}/services/tools` },
          ]),
        ]}
      />
      <ToolsPageClient />
    </>
  );
}
