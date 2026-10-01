import Link from 'next/link';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getActiveBranding, getWorkspace, listAccessibleWorkspaces, type AccessibleWorkspace, type Branding } from '@/lib/crm-workspace';
import { getDict } from '@/lib/i18n';
import LocaleSwitcher from './LocaleSwitcher';
import { CrmMenuButton, CrmSettingsButton } from './CrmNavMenu';
import CrmProfileMenu from './CrmProfileMenu';
import { THEME_COOKIE, themeFrom } from '@/lib/theme';

// HELIX CHIEF CRM — lean product nav (de-STAGE'd). Signed in on a CRM screen it is
// the logo, the settings gear and the profile menu, which holds language, theme,
// the account portal and sign-out (crm-sidebar-four-screens, 2026-10-01). Signed
// out, and on the STAGE pages, it keeps the language switch and sign-in/out.
// CHIEF is hidden from navigation (2026-09-27); /chief still works by direct URL.
// When operating inside a branded (agency/client) workspace, the logo + accent
// follow that workspace's white-label branding.
export default async function Nav({ locale, crmMenu = false }: { locale: string; crmMenu?: boolean }) {
  const t = getDict(locale);
  let signedIn = false;
  let branding: Branding = {};
  // The profile menu's facts: who, which workspaces, which one is active.
  let email = '';
  let workspaces: AccessibleWorkspace[] = [];
  let activeId: string | null = null;
  let activeName = t.crm.wsFallback;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    signedIn = !!user;
    if (user) {
      const who = { id: user.id, email: user.email };
      if (crmMenu) {
        const [b, ws, list] = await Promise.all([
          getActiveBranding(supabase, who),
          getWorkspace(supabase, who),
          listAccessibleWorkspaces({ id: user.id }),
        ]);
        branding = b;
        workspaces = list;
        email = user.email ?? '';
        activeId = ws?.workspaceId ?? null;
        const name = list.find((w) => w.id === activeId)?.name;
        if (name) activeName = name;
        else if (activeId) {
          // Without the service role the list is empty (a local run): ask as the user.
          const { data } = await supabase.from('crm_workspaces').select('name').eq('id', activeId).maybeSingle();
          if (data?.name) activeName = data.name as string;
        }
      } else {
        branding = await getActiveBranding(supabase, who);
      }
    }
  } catch {
    // אין עדיין חיבור ל-Supabase — הניווט עובד גם בלי
  }

  const crm = `/${locale}/dashboard/crm`;
  // Same reading as the root layout, so the theme item matches the page on the first render.
  const theme = themeFrom((await cookies()).get(THEME_COOKIE)?.value);
  const crmSignedIn = crmMenu && signedIn;

  const accent = branding.primary_color && /^#[0-9a-fA-F]{3,8}$/.test(branding.primary_color) ? branding.primary_color : null;
  const brandName = branding.brand_name?.trim();
  // inline var override → header CTAs/logo dot follow the workspace accent
  const headerStyle = accent ? ({ ['--brand' as string]: accent, ['--brand-hover' as string]: accent }) : undefined;

  return (
    <header className="sticky top-0 z-50 bg-bg/85 backdrop-blur-md border-b border-border" style={headerStyle}>
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          {/* Below lg the CRM side menu collapses behind this button, on the same edge. */}
          {crmSignedIn && <CrmMenuButton locale={locale} />}
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
        </div>

        {crmSignedIn ? (
          // No CRM link (the logo and "אנשי קשר" open the same screen), and no
          // language, theme or sign-out of its own: those are the profile menu's.
          <div className="flex items-center gap-1 shrink-0">
            <CrmSettingsButton locale={locale} />
            <CrmProfileMenu
              locale={locale}
              email={email}
              workspaces={workspaces}
              activeId={activeId}
              activeName={activeName}
              initialTheme={theme}
            />
          </div>
        ) : (
          <>
            <nav className="hidden md:flex items-center gap-6 text-[15px] text-ink-secondary">
              <Link href={crm} className="hover:text-ink transition-colors">CRM</Link>
              <a
                href="https://my.helix.co.il"
                className="hover:text-ink transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.shell.portalNewTab}
              >
                {t.shell.portal}
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <LocaleSwitcher locale={locale} />
              {signedIn ? (
                // No "my area" button here: it linked to the CRM home, i.e. the page you are on.
                <form action={`/auth/signout?locale=${locale}`} method="post">
                  <button
                    type="submit"
                    className="text-ink-secondary hover:text-ink transition-colors text-[14px] min-h-[44px] px-2"
                  >
                    {t.auth.logout}
                  </button>
                </form>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  className="bg-brand hover:bg-brand-hover text-on-brand font-bold px-4 py-2 rounded-[10px] text-[14px] min-h-[44px] flex items-center"
                >
                  {t.shell.signIn}
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
