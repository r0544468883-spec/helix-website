import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getWorkspace, isAdminRole } from '@/lib/crm-workspace';
import { publicOrigin } from '@/lib/public-origin';
import { consentUrl, googleConfigured } from '@/lib/crm-google';
import { OAUTH_COOKIE, OAUTH_TTL_MS, newState, signState } from '@/lib/crm-oauth-state';

export const dynamic = 'force-dynamic';

/**
 * "חיבור Google": an admin of the active workspace is sent to Google's consent page.
 * The state and the PKCE verifier ride in a signed, httpOnly, 10-minute cookie that
 * only the callback reads. Everyone else is sent back with a message; a signed-out
 * visitor goes to the login page. openspec: crm-connect-google-and-make, decision 3.
 */
export async function GET(request: Request) {
  const origin = publicOrigin(request);
  const locale = new URL(request.url).searchParams.get('locale') === 'en' ? 'en' : 'he';
  const back = (msg: string) => NextResponse.redirect(`${origin}/${locale}/dashboard/crm/connections?google=${msg}`);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/${locale}/login`);
  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  if (!ws || !isAdminRole(ws.role)) return back('admin');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!googleConfigured() || !key) return back('failed');

  const state = newState();
  const { url, verifier } = await consentUrl(origin, state);
  const res = NextResponse.redirect(url);
  res.cookies.set(
    OAUTH_COOKIE,
    signState({ ws: ws.workspaceId, uid: user.id, state, verifier, locale, exp: Date.now() + OAUTH_TTL_MS }, key),
    { httpOnly: true, secure: origin.startsWith('https://'), sameSite: 'lax', path: '/api/connections/google', maxAge: OAUTH_TTL_MS / 1000 },
  );
  return res;
}
