import type { Metadata } from 'next';
import WebsitesPageClient from './WebsitesPageClient';

export const metadata: Metadata = {
  title: 'בניית אתרים · דפי נחיתה · מיניסייטים | HELIX',
  description: 'אתרים עסקיים, דפי נחיתה ומיניסייטים. עיצוב בהתאמה אישית, SEO, תחזוקה כלולה. החל מ-1,250 ₪ לחודש. בלי דמי הקמה, בלי חוזה.',
};

export default function WebsitesPage() {
  return <WebsitesPageClient />;
}
