import type { Metadata } from 'next';
import SoftwarePageClient from '../software/SoftwarePageClient';

export const metadata: Metadata = {
  title: 'התוכנות של HELIX, מחירים וחבילות | HELIX',
  description:
    'משפחת מוצרי ה-SaaS של HELIX במקום אחד: אוטומציית שיווק, דשבורדים, SDR, GEO, מוניטין, עוזר AI, Growth Doctor וטפסים. מחיר אחיד ושקוף, 3 מסלולים, חבילות, ומודל עלויות וואטסאפ מלא.',
};

export default function ProductsHubPage() {
  return <SoftwarePageClient />;
}
