import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import SmoothScroll from '@/components/SmoothScroll';
import CursorTrail from '@/components/CursorTrail';
import FloatingBackground from '@/components/FloatingBackground';
import CompareTray from '@/components/CompareTray';
import ReferFloatingBadge from '@/components/ReferFloatingBadge';
import { getDict } from '@/lib/i18n';

// The STAGE directory pages, with the chrome they have always had: smooth scroll,
// cursor trail, floating logos, the compare tray and the refer badge. Nothing here
// changed in the shell split — these surfaces were simply lifted out of the shared
// layout so they stop rendering over the CRM. See DESIGN.md — CRM Shell.
export default async function StageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getDict(locale);

  return (
    <>
      <SmoothScroll />
      <CursorTrail />
      <FloatingBackground />
      <Nav locale={locale} />
      <main id="main-content" className="relative z-10 flex-1">
        {children}
      </main>
      <div className="relative z-10">
        <Footer locale={locale} />
      </div>
      <CompareTray
        locale={locale}
        compareLabel={t.compare.compareNow}
        clearLabel={t.compare.clear}
      />
      <ReferFloatingBadge />
    </>
  );
}
