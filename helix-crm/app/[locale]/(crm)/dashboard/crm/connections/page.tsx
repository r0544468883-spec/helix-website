import Link from 'next/link';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getWorkspace, isAdminRole, canWrite } from '@/lib/crm-workspace';
import { publicOriginFromHeaders } from '@/lib/public-origin';
import { getDict } from '@/lib/i18n';
import CrmConnections, { type GoogleState } from '@/components/CrmConnections';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string }>;
type Search = Promise<{ google?: string }>;

const MESSAGES = ['connected', 'failed', 'denied', 'admin', 'partial'] as const;
type Message = (typeof MESSAGES)[number];

/**
 * "חיבורים": the workspace's Google connection and its Facebook leads through Make.
 * Everyone sees what is connected; an admin connects, disconnects and makes the
 * Make key. See DESIGN.md §8 — Connections screen. openspec: crm-connect-google-and-make.
 */
export default async function ConnectionsPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { locale } = await params;
  const { google: rawMsg } = await searchParams;
  const tc = getDict(locale).crm;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);
  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  if (!ws) {
    return <div className="max-w-[680px] mx-auto px-5 pt-20 text-center"><p className="text-ink-secondary">{tc.setupPending}</p></div>;
  }

  const admin = createAdminClient();
  // Before migration v23 there is no table: the read errors and reads as not connected.
  let google: GoogleState = { kind: 'none' };
  let makeKeyPrefix: string | null = null;
  if (admin) {
    const [{ data: conn }, { data: key }] = await Promise.all([
      admin.from('crm_connections').select('account_email, connected_at, status')
        .eq('workspace_id', ws.workspaceId).eq('provider', 'google').maybeSingle(),
      admin.from('crm_api_keys').select('prefix')
        .eq('workspace_id', ws.workspaceId).eq('name', 'Make · Facebook Lead Ads').is('revoked_at', null)
        .order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);
    if (conn) {
      const date = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'he-IL', { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'Asia/Jerusalem' })
        .format(new Date(conn.connected_at as string));
      google = conn.status === 'lapsed'
        ? { kind: 'lapsed', email: conn.account_email as string }
        : { kind: 'connected', email: conn.account_email as string, since: date };
    }
    makeKeyPrefix = (key?.prefix as string | undefined) ?? null;
  }
  const configured = !!process.env.GOOGLE_CONNECT_CLIENT_ID && !!process.env.GOOGLE_CONNECT_CLIENT_SECRET;
  const origin = publicOriginFromHeaders(await headers());
  const message = (MESSAGES as readonly string[]).includes(rawMsg ?? '') ? (rawMsg as Message) : null;

  return (
    <div className="max-w-[760px] mx-auto px-5 md:px-10 pt-12 pb-16">
      <Link href={`/${locale}/dashboard/crm`} className="text-brand-ink text-[14px] font-semibold">← {tc.title}</Link>
      <h1 className="font-display text-[clamp(26px,4vw,36px)] font-extrabold tracking-tight mt-3">{tc.connTitle}</h1>
      <p className="text-ink-secondary text-[15px] mb-8">{tc.connSubtitle}</p>
      <CrmConnections
        locale={locale}
        isAdmin={isAdminRole(ws.role)}
        canWrite={canWrite(ws.role)}
        google={google}
        googleConfigured={configured}
        message={message}
        makeKeyPrefix={makeKeyPrefix}
        apiUrl={`${origin}/api/v1/crm/contacts`}
        t={tc}
      />
    </div>
  );
}
