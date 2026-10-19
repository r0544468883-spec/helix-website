'use client';

import { usePathname } from 'next/navigation';

// Hides the full-site chrome (nav, footer, marketing floaters) on the hosted
// report routes (/r/<token>), so a prospect who opens a report link sees a clean
// standalone report, not the HELIX homepage menu. Everywhere else it is a plain
// passthrough, so the rest of the site is unaffected.
export default function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname && pathname.startsWith('/r/')) return null;
  return <>{children}</>;
}
