import type { Metadata } from 'next';
import PortalClient from './PortalClient';
import './portal.css';

// איזור אישי ללקוחות. לא לאינדוקס (עמוד גישה בקוד).
export const metadata: Metadata = {
  title: 'איזור אישי | HELIX',
  description: 'הקבצים האישיים שלך מ-HELIX.',
  robots: { index: false, follow: false },
};

export default function PortalPage() {
  return (
    <main className="portal" dir="rtl">
      <PortalClient />
    </main>
  );
}
