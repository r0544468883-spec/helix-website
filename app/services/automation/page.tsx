import type { Metadata } from 'next';
import AutomationPageClient from './AutomationPageClient';

export const metadata: Metadata = {
  title: 'אוטומציות וסוכני AI — HELIX',
  description: 'אוטומציית תהליכים וסוכני AI — CRM, Email, WhatsApp, צ׳אטבוטים חכמים. החל מ-300 ₪. בלי חוזה.',
};

export default function AutomationPage() {
  return <AutomationPageClient />;
}
