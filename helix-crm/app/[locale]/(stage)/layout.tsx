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
      {/* The STAGE directory was drawn for dark and is not part of the CRM's light
          theme: this marker locks the whole document dark while a STAGE page is
          shown (app/globals.css, :root:has([data-theme-lock="dark"])). */}
      <span data-theme-lock="dark" hidden />
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
