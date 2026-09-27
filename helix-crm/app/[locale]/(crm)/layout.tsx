import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import HelixCommandBar from '@/components/HelixCommandBar';

// The CRM shell: nav, screen, footer. No cursor trail, no floating logos, no scroll
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
      <Nav locale={locale} />
      <main id="main-content" className="relative z-10 flex-1">
        {children}
      </main>
      <div className="relative z-10">
        <Footer locale={locale} />
      </div>
      <HelixCommandBar />
    </>
  );
}
