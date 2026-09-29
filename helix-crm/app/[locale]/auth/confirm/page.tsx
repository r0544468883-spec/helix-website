import type { Metadata } from 'next';
import { getDict } from '@/lib/i18n';
import { isAccessLinkShape } from '@/lib/crm-access-rules';
import AccessConfirmForm, { AccessLinkUsed } from '@/components/AccessConfirmForm';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string }>;
type Search = Promise<{ token_hash?: string | string[]; type?: string | string[]; invite?: string | string[] }>;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  return { title: getDict(locale).auth.confirmTitle, robots: { index: false, follow: false } };
}

/**
 * The page an emailed invite or sign-in link opens, outside both route groups like
 * the public quote page: no nav, no login wall. It shows one "כניסה" button and
 * signs in only when it is pressed (app/auth-actions.ts). A code of the wrong shape
 * never reaches Supabase. See DESIGN.md §9 — A page opened from an email link.
 */
export default async function AccessConfirmPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { locale } = await params;
  const { token_hash: rawToken, type: rawType, invite: rawInvite } = await searchParams;
  const tokenHash = Array.isArray(rawToken) ? rawToken[0] : rawToken;
  const type = Array.isArray(rawType) ? rawType[0] : rawType;
  // An invite email's link names its invite, so the press joins that workspace.
  const invite = Array.isArray(rawInvite) ? rawInvite[0] : rawInvite;
  const inviteId = invite && UUID_RE.test(invite) ? invite : undefined;
  const t = getDict(locale).auth;
  const labels = {
    text: t.confirmText,
    button: t.confirmButton,
    pending: t.confirmPending,
    used: t.confirmUsed,
    usedHint: t.confirmUsedHint,
    toLogin: t.confirmToLogin,
  };

  return (
    <main id="main-content" className="min-h-screen bg-bg">
      <div className="max-w-[480px] mx-auto px-4 pt-24 pb-10 flex flex-col items-center text-center">
        <p className="font-display text-[20px] font-black tracking-tight" dir="ltr">
          HELIX<span className="text-brand-ink">.</span>
        </p>
        <h1 className="font-display text-[clamp(24px,5vw,32px)] font-extrabold tracking-tight mt-6 mb-3">{t.confirmTitle}</h1>
        {isAccessLinkShape(tokenHash, type) ? (
          <AccessConfirmForm locale={locale} tokenHash={tokenHash} type={type as string} inviteId={inviteId} labels={labels} />
        ) : (
          <AccessLinkUsed locale={locale} labels={labels} />
        )}
      </div>
    </main>
  );
}
