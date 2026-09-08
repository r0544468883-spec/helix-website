'use client';

import dynamic from 'next/dynamic';

// עטיפת לקוח כדי שנוכל לטעון לוטי (ssr:false) בתוך דף האב שהוא Server Component.
const AutomationHeroLottie = dynamic(() => import('./AutomationHeroLottie'), { ssr: false });

export default function GtmHubHeroLottie() {
  return <AutomationHeroLottie />;
}
