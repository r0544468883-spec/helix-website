import type { Metadata } from 'next';
import SalesPageClient from './SalesPageClient';

export const metadata: Metadata = {
  title: 'HELIX SDR — נציג מכירות אוטומטי 24/7 | HELIX',
  description:
    'HELIX SDR — מערך BDR אוטומטי שמזהה איתות, חוקר ליד, כותב פנייה מותאמת ושולח בלינקדאין ובאימייל עם AI. לידים B2B חמים, בעברית, עם אישור אנושי. החל מ-1,250 ₪ לחודש.',
};

export default function SdrProductPage() {
  return <SalesPageClient />;
}
