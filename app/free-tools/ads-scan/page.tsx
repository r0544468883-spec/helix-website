import type { Metadata } from 'next';
import AdsScanClient from './AdsScanClient';

export const metadata: Metadata = {
  title: 'בדיקת בזבוז בפרסום בחינם — כמה כסף אתה מבזבז ב-Google/Meta',
  description:
    'שתי בדיקות חינם: מוכנות-פרסום של האתר (פיקסל, מעקב-המרות, רימרקטינג) ובזבוז בחשבון Google Ads מדוח מונחי-חיפוש. בלי חיבור חשבון, בלי הרשמה.',
  alternates: { canonical: '/free-tools/ads-scan' },
  robots: { index: true, follow: true },
};

export default function AdsScanPage() {
  return <AdsScanClient />;
}
