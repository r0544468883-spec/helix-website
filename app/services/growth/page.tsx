import type { Metadata } from 'next';
import GrowthPageClient from './GrowthPageClient';
import JsonLd from '@/app/components/JsonLd';
import { SITE } from '@/lib/site';
import { serviceSchema, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Growth Hacking — HELIX',
  description: 'צמיחה מהירה עם ניסויים, A/B testing, viral loops, AI chatbot ומחקר מתחרים. החל מ-1,250 ₪ לחודש. בלי חוזה.',
};

export default function GrowthPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: 'Growth Hacking',
            description: 'צמיחה מהירה מבוססת ניסויים — A/B testing, viral loops, אוטומציות ומחקר מתחרים.',
            path: '/services/growth',
            serviceType: 'Growth Marketing',
          }),
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'Growth Hacking', url: `${SITE.url}/services/growth` },
          ]),
        ]}
      />
      <GrowthPageClient />
    </>
  );
}
