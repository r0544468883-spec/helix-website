import type { Metadata } from 'next';
import ToolsPageClient from './ToolsPageClient';

export const metadata: Metadata = {
  title: 'תוכנות מוכנות · SaaS לעסקים | HELIX',
  description:
    'גישה לתוכנות שכבר בנינו — ניהול מלאי, לידים, תוכן, הנהלת חשבונות וניטור אתרים. תוכנה בודדת 500 ₪/חודש, חבילת 3 תוכנות 1,000 ₪/חודש.',
};

export default function ToolsPage() {
  return <ToolsPageClient />;
}
