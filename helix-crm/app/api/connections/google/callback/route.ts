import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { accessRole, isAdminRole } from '@/lib/crm-workspace';
import { publicOrigin } from '@/lib/public-origin';
import { exchangeCode, saveConnection } from '@/lib/crm-google';
import { OAUTH_COOKIE, verifyState } from '@/lib/crm-oauth-state';

export const dynamic = 'force-dynamic';

/**
 * Google's return. It stores a connection only when all of these hold: this browser's
 * signed cookie is intact and unexpired, Google echoed its state, the same user is
 * signed in and is still an admin of that workspace, and the code trades for a
 * refresh token with both data scopes. Anything else stores nothing and says so on
 * the Connections screen. The cookie is cleared either way.
 * openspec: crm-connect-google-and-make, design decision 3.
 */
export async function GET(request: Request) {
  const origin = publicOrigin(request);
  const params = new URL(request.url).searchParams;
  const st = verifyState((await cookies()).get(OAUTH_COOKIE)?.value, process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');
  const locale = st?.locale ?? 'he';
  const done = (msg: string) => {
    const res = NextResponse.redirect(`${origin}/${locale}/dashboard/crm/connections?google=${msg}`);
    res.cookies.set(OAUTH_COOKIE, '', { path: '/api/connections/google', maxAge: 0 });
    return res;
  };

  if (!st || params.get('state') !== st.state) return done('failed');
  const googleError = params.get('error');
  if (googleError) return done(googleError === 'access_denied' ? 'denied' : 'failed');
  const code = params.get('code');
  if (!code) return done('failed');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== st.uid) return done('failed');
  const admin = createAdminClient();
  if (!admin) return done('failed');
  const role = await accessRole(admin, user.id, st.ws);
  if (!role || !isAdminRole(role)) return done('admin');

  const r = await exchangeCode(origin, code, st.verifier);
  if (!r.ok) return done(r.reason === 'scopes' ? 'partial' : 'failed');
  return done((await saveConnection(admin, st.ws, user.id, r)) ? 'connected' : 'failed');
}
