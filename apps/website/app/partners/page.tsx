import type { Metadata } from 'next';
import PartnersPageClient from './PartnersPageClient';
import JsonLd from '@/app/components/JsonLd';
import { SITE } from '@/lib/site';
import { serviceSchema, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'תכנית השותפים של HELIX, הרוויחו על כל לקוח שתביאו',
  description:
    'הצטרפו לתכנית השותפים של HELIX: תמלוג חודשי חוזר על כל לקוח שתביאו לתוכנות ולליווי, מדרגות שעולות עם הכמות, ומסלול White-Label לסוכנויות. בלי עלות הצטרפות, בלי חוזה.',
};

export default function PartnersPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: 'תכנית השותפים של HELIX',
            description:
              'תכנית שותפים ותמלוגים ותכנית White-Label לתוכנות ולשירותים של HELIX. יועצים, סוכנויות ואנשי מכירות מרוויחים אחוז חודשי חוזר על כל לקוח, עם מדרגות שעולות עם הנפח.',
            path: '/partners',
            serviceType: 'Partner & Affiliate Program',
          }),
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'תכנית שותפים', url: `${SITE.url}/partners` },
          ]),
        ]}
      />
      <PartnersPageClient />
    </>
  );
}
