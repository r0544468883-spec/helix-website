import type { Metadata } from 'next';
import EcommercePageClient from './EcommercePageClient';

export const metadata: Metadata = {
  title: 'בניית חנות איקומרס · Shopify · WooCommerce | HELIX',
  description:
    'חנויות אונליין שמוכרות — Shopify, WooCommerce או חנות מותאמת. תשלומים, משלוחים, אוטומציות ואופטימיזציית מכירות. החל מ-500 ₪ לחודש. בלי דמי הקמה, בלי חוזה.',
};

export default function EcommercePage() {
  return <EcommercePageClient />;
}
