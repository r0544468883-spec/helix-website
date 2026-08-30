import type { Metadata } from 'next';
import ReferralWidget from '@/app/components/ReferralWidget';

// Track A hub — where HELIX visitors get their share link and track the reward loop.

export const metadata: Metadata = {
  title: 'שתפו את HELIX, קבלו הנחה',
  description: 'הזמינו חברים ל-HELIX ותקבלו קוד הנחה אוטומטי על מוצר בתשלום.',
};

export default function ReferPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '72px 20px', direction: 'rtl' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>
          ממליצים על HELIX? קבלו על זה הנחה
        </h1>
        <p style={{ fontSize: 16, color: '#9ca3af', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
          כל חבר שמצטרף דרך הלינק האישי שלכם מקרב אתכם לקוד הנחה אוטומטי על כל מוצר בתשלום.
          שתפו בלינק, בוואטסאפ, או עם קוד QR מודפס.
        </p>
      </div>
      <ReferralWidget />
    </main>
  );
}
