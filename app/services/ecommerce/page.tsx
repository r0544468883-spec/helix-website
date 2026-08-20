import type { Metadata } from 'next';
import EcommercePageClient from './EcommercePageClient';
import JsonLd from '@/app/components/JsonLd';
import { SITE } from '@/lib/site';
import { serviceSchema, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'בניית חנות איקומרס · Shopify · WooCommerce | HELIX',
  description:
    'חנויות אונליין שמוכרות, Shopify, WooCommerce או חנות מותאמת. תשלומים, משלוחים, אוטומציות ואופטימיזציית מכירות. החל מ-500 ₪ לחודש. בלי דמי הקמה, בלי חוזה.',
};

export default function EcommercePage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: 'בניית חנות איקומרס',
            description: 'חנויות אונליין ב-Shopify, WooCommerce או פתרון מותאם, תשלומים, משלוחים, אוטומציות ואופטימיזציית מכירות.',
            path: '/services/ecommerce',
            serviceType: 'eCommerce Development',
          }),
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'איקומרס', url: `${SITE.url}/services/ecommerce` },
          ]),
        ]}
      />
      <EcommercePageClient />
    </>
  );
}
