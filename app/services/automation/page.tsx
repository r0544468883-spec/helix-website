import type { Metadata } from 'next';
import AutomationPageClient from './AutomationPageClient';

export const metadata: Metadata = {
  title: 'אוטומציות — HELIX',
  description: 'אוטומציית תהליכים, CRM, Email, WhatsApp, Funnels. החל מ-1,250 ₪ לחודש. בלי חוזה.',
};

export default function AutomationPage() {
  return <AutomationPageClient />;
}
