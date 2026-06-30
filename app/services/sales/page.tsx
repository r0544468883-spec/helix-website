import type { Metadata } from 'next';
import SalesPageClient from './SalesPageClient';

export const metadata: Metadata = {
  title: 'תהליכי מכירה אוטומטיים (SDR) — HELIX',
  description: 'מערך SDR אוטומטי — LinkedIn Outreach, Cold Email, Data Enrichment, Pipeline. החל מ-1,250 ₪ לחודש. בלי חוזה.',
};

export default function SalesPage() {
  return <SalesPageClient />;
}
