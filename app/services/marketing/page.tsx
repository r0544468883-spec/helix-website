import type { Metadata } from 'next';
import MarketingPageClient from './MarketingPageClient';

export const metadata: Metadata = {
  title: 'שיווק דיגיטלי · Hands-on | HELIX',
  description: 'שיווק דיגיטלי שעובד. קמפיינים, SEO, סושיאל, תוכן. החל מ-1,250 ₪ לחודש. בלי חוזה.',
};

export default function MarketingPage() {
  return <MarketingPageClient />;
}
