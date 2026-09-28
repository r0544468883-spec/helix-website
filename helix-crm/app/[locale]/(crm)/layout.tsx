import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import HelixCommandBar from '@/components/HelixCommandBar';
import { CrmSideNav } from '@/components/CrmNavMenu';

// The CRM shell: nav, side menu + screen, footer. No cursor trail, no floating logos, no scroll
// hijacking, no compare tray, no refer badge — those belong to the directory product
// and render only under (stage). The command bar renders nothing until it is opened
// and is the CRM's search surface, so it lives here and not on the public pages.
// See DESIGN.md — CRM Shell.
export default async function CrmLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <Nav locale={locale} crmMenu />
      {/* The side menu is the first flex child, so it sits on the start edge:
          the right in Hebrew, the left in English. No z-index here: the STAGE layout
          lifts its page above floating logos, the CRM has nothing beneath its page,
          and a stacking context here once held the contact drawer under the nav.
          Overlays portal themselves into <body> (DESIGN.md §9 — Overlay stacking). */}
      <div className="flex-1 flex w-full max-w-[1280px] mx-auto">
        <CrmSideNav locale={locale} />
        <main id="main-content" className="flex-1 min-w-0">
          {children}
        </main>
      </div>
      <Footer locale={locale} />
      <HelixCommandBar />
    </>
  );
}
