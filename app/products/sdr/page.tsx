import type { Metadata } from 'next';
import SalesPageClient from './SalesPageClient';
import JsonLd from '@/app/components/JsonLd';
import { SITE } from '@/lib/site';
import { getProduct } from '../products-data';
import { softwareApplicationSchema, faqSchema, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'HELIX SDR — נציג מכירות אוטומטי 24/7 | HELIX',
  description:
    'HELIX SDR — מערך BDR אוטומטי שמזהה איתות, חוקר ליד, כותב פנייה מותאמת ושולח בלינקדאין ובאימייל עם AI. לידים B2B חמים, בעברית, עם אישור אנושי. החל מ-1,250 ₪ לחודש.',
};

export default function SdrProductPage() {
  const product = getProduct('sdr');
  const path = '/products/sdr';
  const schemas: object[] = [
    softwareApplicationSchema({
      name: product?.name || 'HELIX SDR',
      description: product?.subtitle || 'מערך BDR אוטומטי לזיהוי, מחקר ופנייה ללידים B2B בעברית עם AI ואישור אנושי.',
      path,
      price: product?.price,
    }),
    breadcrumbSchema([
      { name: 'בית', url: SITE.url },
      { name: 'התוכנות של HELIX', url: `${SITE.url}/products` },
      { name: 'HELIX SDR', url: `${SITE.url}${path}` },
    ]),
  ];
  if (product?.faq?.length) schemas.push(faqSchema(product.faq));

  return (
    <>
      <JsonLd data={schemas} />
      <SalesPageClient />
    </>
  );
}
