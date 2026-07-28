import type { Metadata } from 'next';
import SalesConsultingPageClient from './SalesConsultingPageClient';

export const metadata: Metadata = {
  title: 'ייעוץ מכירות ופיתוח עסקי · בניית תהליך מכירה | HELIX',
  description:
    'ייעוץ מכירות ופיתוח עסקי — אבחון, אסטרטגיה, תסריטים, הקמת CRM, הדרכת צוות וליווי שוטף. הופכים מכירות מ״תלוי במזל״ למערכת שעובדת. החל מ-1,250 ₪ לחודש, בלי חוזה.',
};

export default function SalesConsultingPage() {
  return <SalesConsultingPageClient />;
}
