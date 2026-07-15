import type { Metadata } from 'next';
import DevelopmentPageClient from './DevelopmentPageClient';

export const metadata: Metadata = {
  title: 'פיתוח תוכנה · אפיון · ייעוץ AI | HELIX',
  description: 'פיתוח תוכנה בהתאמה אישית, אפיון מוצר, ייעוץ טרנספורמציה ל-AI. בנק שעות גמיש החל מ-300 ₪ לשעה. שיחת אפיון ראשונה חינם.',
};

export default function DevelopmentPage() {
  return <DevelopmentPageClient />;
}
