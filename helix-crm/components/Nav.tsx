import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getActiveBranding, type Branding } from '@/lib/crm-workspace';
import LocaleSwitcher from './LocaleSwitcher';

// HELIX CHIEF CRM — lean product nav (de-STAGE'd). Brand + CRM + CHIEF + account.
// When operating inside a branded (agency/client) workspace, the logo + accent
// follow that workspace's white-label branding.
export default async function Nav({ locale }: { locale: string }) {
  let signedIn = false;
  let branding: Branding = {};
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    signedIn = !!user;
    if (user) branding = await getActiveBranding(supabase, { id: user.id, email: user.email });
  } catch {
    // אין עדיין חיבור ל-Supabase — הניווט עובד גם בלי
  }

  const crm = `/${locale}/dashboard/crm`;
  const chief = `/${locale}/chief`;

  const accent = branding.primary_color && /^#[0-9a-fA-F]{3,8}$/.test(branding.primary_color) ? branding.primary_color : null;
  const brandName = branding.brand_name?.trim();
  // inline var override → header CTAs/logo dot follow the workspace accent
  const headerStyle = accent ? ({ ['--brand' as string]: accent, ['--brand-hover' as string]: accent }) : undefined;

  return (
    <header className="sticky top-0 z-50 bg-bg/85 backdrop-blur-md border-b border-border" style={headerStyle}>
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 h-16 flex items-center justify-between gap-4">
        <Link
          href={signedIn ? crm : `/${locale}`}
          className="nav-logo font-display font-black text-lg tracking-tight shrink-0 flex items-center gap-2"
        >
          {branding.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={branding.logo_url} alt={brandName || 'logo'} className="h-7 w-auto object-contain" />
          ) : (
            <>{brandName || 'HELIX CHIEF CRM'}<span className="dot text-brand">.</span></>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-[15px] text-ink-secondary">
          <Link href={crm} className="hover:text-ink transition-colors">CRM</Link>
          <Link href={chief} className="hover:text-ink transition-colors">CHIEF</Link>
          <a
            href="https://my.helix.co.il"
            className="hover:text-ink transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            האיזור האישי
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher locale={locale} />
          {signedIn ? (
            <Link
              href={crm}
              className="bg-brand hover:bg-brand-hover text-bg font-bold px-4 py-2 rounded-[10px] text-[14px]"
            >
              הכניסה שלי
            </Link>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="bg-brand hover:bg-brand-hover text-bg font-bold px-4 py-2 rounded-[10px] text-[14px]"
            >
              כניסה
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
