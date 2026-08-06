import type { Metadata } from 'next';
import AutomationPageClient from './AutomationPageClient';
import JsonLd from '@/app/components/JsonLd';
import { SITE } from '@/lib/site';
import { serviceSchema, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'אוטומציות וסוכני AI — HELIX',
  description: 'אוטומציית תהליכים וסוכני AI — CRM, Email, WhatsApp, צ׳אטבוטים חכמים. החל מ-300 ₪. בלי חוזה.',
};

export default function AutomationPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: 'אוטומציות וסוכני AI',
            description: 'אוטומציית תהליכים וסוכני AI — CRM, אימייל, WhatsApp וצ׳אטבוטים חכמים לעסקים.',
            path: '/services/automation',
            serviceType: 'Business Process Automation',
          }),
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'אוטומציות ובוטים', url: `${SITE.url}/services/automation` },
          ]),
        ]}
      />
      <AutomationPageClient />
    </>
  );
}
