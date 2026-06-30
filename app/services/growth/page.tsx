import type { Metadata } from 'next';
import GrowthPageClient from './GrowthPageClient';

export const metadata: Metadata = {
  title: 'Growth Hacking — HELIX',
  description: 'צמיחה מהירה עם ניסויים, A/B testing, viral loops, AI chatbot ומחקר מתחרים. החל מ-1,250 ₪ לחודש. בלי חוזה.',
};

export default function GrowthPage() {
  return <GrowthPageClient />;
}
