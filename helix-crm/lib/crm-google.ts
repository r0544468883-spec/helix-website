import 'server-only';
import { OAuth2Client, CodeChallengeMethod } from 'google-auth-library';
import { people, type people_v1 } from '@googleapis/people';
import { calendar, type calendar_v3 } from '@googleapis/calendar';
import type { createAdminClient } from '@/lib/supabase/admin';

/**
 * A workspace's Google connection, server-side only: the consent URL (PKCE, offline
 * access), the code exchange, keeping the refresh token in Vault through the v23
 * functions, a fresh access token per request, lapsing on invalid_grant, revoking,
 * and the thin People and Calendar calls. The refresh token never leaves this file:
 * no export returns it and no log line prints it.
 * openspec: crm-connect-google-and-make, design decisions 3, 4 and 7.
 */

type Admin = NonNullable<ReturnType<typeof createAdminClient>>;

const PROVIDER = 'google';
export const GOOGLE_SCOPES = [
  'openid',
  'email',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly',
] as const;
const DATA_SCOPES = [GOOGLE_SCOPES[2], GOOGLE_SCOPES[3]];
export const PERSON_FIELDS = 'names,emailAddresses,phoneNumbers,organizations';

export function googleConfigured(): boolean {
  return !!process.env.GOOGLE_CONNECT_CLIENT_ID && !!process.env.GOOGLE_CONNECT_CLIENT_SECRET;
}

/** Must equal, character for character, an address registered on the OAuth client. */
export function callbackUrl(origin: string): string {
  return `${origin}/api/connections/google/callback`;
}

function oauth(origin?: string): OAuth2Client {
  return new OAuth2Client({
    clientId: process.env.GOOGLE_CONNECT_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CONNECT_CLIENT_SECRET,
    redirectUri: origin ? callbackUrl(origin) : undefined,
  });
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([p, new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);
}

function isInvalidGrant(e: unknown): boolean {
  const data = (e as { response?: { data?: { error?: string } } })?.response?.data;
  return data?.error === 'invalid_grant' || (e instanceof Error && /invalid_grant/.test(e.message));
}

/** Google's consent page, and the PKCE verifier to keep until Google returns. */
export async function consentUrl(origin: string, state: string): Promise<{ url: string; verifier: string }> {
  const c = oauth(origin);
  const { codeVerifier, codeChallenge } = await c.generateCodeVerifierAsync();
  const url = c.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [...GOOGLE_SCOPES],
    state,
    code_challenge_method: CodeChallengeMethod.S256,
    code_challenge: codeChallenge,
  });
  return { url, verifier: codeVerifier };
}

export type Exchange =
  | { ok: true; refreshToken: string; email: string; scopes: string[] }
  | { ok: false; reason: 'no_refresh' | 'scopes' | 'no_email' | 'failed' };

/** Trades Google's code for a refresh token; both data scopes must have been granted. */
export async function exchangeCode(origin: string, code: string, verifier: string): Promise<Exchange> {
  const c = oauth(origin);
  try {
    const { tokens } = await withTimeout(c.getToken({ code, codeVerifier: verifier, redirect_uri: callbackUrl(origin) }), 10_000);
    if (!tokens.refresh_token) return { ok: false, reason: 'no_refresh' };
    const scopes = (tokens.scope ?? '').split(' ').filter(Boolean);
    if (!DATA_SCOPES.every((s) => scopes.includes(s))) {
      // Google lets a person untick a scope; half a connection is none.
      await withTimeout(c.revokeToken(tokens.refresh_token), 5_000).catch(() => undefined);
      return { ok: false, reason: 'scopes' };
    }
    const ticket = tokens.id_token
      ? await c.verifyIdToken({ idToken: tokens.id_token, audience: process.env.GOOGLE_CONNECT_CLIENT_ID })
      : null;
    const email = ticket?.getPayload()?.email?.trim().toLowerCase();
    if (!email) return { ok: false, reason: 'no_email' };
    return { ok: true, refreshToken: tokens.refresh_token, email, scopes };
  } catch (e) {
    console.error('[google] code exchange failed', e instanceof Error ? e.message : String(e));
    return { ok: false, reason: 'failed' };
  }
}

async function readToken(admin: Admin, workspaceId: string): Promise<string | null> {
  const { data, error } = await admin.rpc('crm_connection_token', { p_workspace: workspaceId, p_provider: PROVIDER });
  if (error) return null;
  return typeof data === 'string' && data ? data : null;
}

async function revoke(token: string): Promise<boolean> {
  try {
    await withTimeout(oauth().revokeToken(token), 5_000);
    return true;
  } catch {
    return false;
  }
}

/**
 * Stores a new connection for the workspace, replacing any before it. A different
 * account's old token is revoked at Google; the same account's is not, since both
 * belong to one grant and revoking the old could revoke the new.
 */
export async function saveConnection(
  admin: Admin,
  workspaceId: string,
  userId: string,
  c: { refreshToken: string; email: string; scopes: string[] },
): Promise<boolean> {
  const { data: before } = await admin.from('crm_connections').select('account_email')
    .eq('workspace_id', workspaceId).eq('provider', PROVIDER).maybeSingle();
  const oldToken = before && before.account_email !== c.email ? await readToken(admin, workspaceId) : null;
  const { error } = await admin.rpc('crm_connection_save', {
    p_workspace: workspaceId, p_provider: PROVIDER, p_email: c.email, p_scopes: c.scopes, p_token: c.refreshToken, p_user: userId,
  });
  if (error) {
    console.error('[google] connection not saved', error.message);
    return false;
  }
  if (oldToken) await revoke(oldToken);
  return true;
}

export async function markLapsed(admin: Admin, workspaceId: string, reason: string): Promise<void> {
  await admin.from('crm_connections').update({ status: 'lapsed', last_error: reason.slice(0, 200) })
    .eq('workspace_id', workspaceId).eq('provider', PROVIDER);
}

export type GoogleAuth =
  | { ok: true; auth: OAuth2Client }
  | { ok: false; reason: 'unconfigured' | 'none' | 'lapsed' | 'unavailable' };

/**
 * An authorised client for the workspace, with a fresh access token, or why not.
 * Google refusing the refresh token (invalid_grant) lapses the connection.
 */
export async function googleAuth(admin: Admin, workspaceId: string): Promise<GoogleAuth> {
  if (!googleConfigured()) return { ok: false, reason: 'unconfigured' };
  // Before v23 there is no table: the error reads as no connection.
  const { data: row, error } = await admin.from('crm_connections').select('status')
    .eq('workspace_id', workspaceId).eq('provider', PROVIDER).maybeSingle();
  if (error || !row) return { ok: false, reason: 'none' };
  if (row.status === 'lapsed') return { ok: false, reason: 'lapsed' };
  const token = await readToken(admin, workspaceId);
  if (!token) return { ok: false, reason: 'unavailable' };
  const client = oauth();
  client.setCredentials({ refresh_token: token });
  try {
    await withTimeout(client.getAccessToken(), 8_000);
    return { ok: true, auth: client };
  } catch (e) {
    if (isInvalidGrant(e)) {
      await markLapsed(admin, workspaceId, 'invalid_grant');
      return { ok: false, reason: 'lapsed' };
    }
    console.error('[google] access token failed', e instanceof Error ? e.message : String(e));
    return { ok: false, reason: 'unavailable' };
  }
}

/** Revokes at Google (best-effort, 5 s) and removes the row and its secret. */
export async function disconnect(admin: Admin, workspaceId: string): Promise<{ removed: boolean; revoked: boolean }> {
  const token = await readToken(admin, workspaceId);
  const revoked = token ? await revoke(token) : true;
  const { error } = await admin.rpc('crm_connection_delete', { p_workspace: workspaceId, p_provider: PROVIDER });
  if (error) console.error('[google] connection not deleted', error.message);
  return { removed: !error, revoked };
}

/** The account's contacts, up to `max`, within `budgetMs`. */
export async function listPeople(
  auth: OAuth2Client,
  max = 2000,
  budgetMs = 10_000,
): Promise<{ ok: true; people: people_v1.Schema$Person[]; truncated: boolean } | { ok: false; lapsed: boolean }> {
  const api = people({ version: 'v1', auth });
  const started = Date.now();
  const out: people_v1.Schema$Person[] = [];
  let pageToken: string | undefined;
  try {
    do {
      const left = budgetMs - (Date.now() - started);
      if (left <= 0) return { ok: false, lapsed: false };
      const res = await api.people.connections.list(
        { resourceName: 'people/me', pageSize: 1000, pageToken, personFields: PERSON_FIELDS, sortOrder: 'FIRST_NAME_ASCENDING' },
        { timeout: left },
      );
      out.push(...(res.data.connections ?? []));
      pageToken = res.data.nextPageToken ?? undefined;
    } while (pageToken && out.length < max);
    return { ok: true, people: out.slice(0, max), truncated: !!pageToken || out.length > max };
  } catch (e) {
    console.error('[google] contacts list failed', e instanceof Error ? e.message : String(e));
    return { ok: false, lapsed: isInvalidGrant(e) };
  }
}

/** The named contacts, re-read from Google in chunks of 200 (getBatchGet's limit). */
export async function getPeople(
  auth: OAuth2Client,
  resourceNames: string[],
): Promise<{ ok: true; people: people_v1.Schema$Person[] } | { ok: false; lapsed: boolean }> {
  const api = people({ version: 'v1', auth });
  const out: people_v1.Schema$Person[] = [];
  try {
    for (let i = 0; i < resourceNames.length; i += 200) {
      const res = await api.people.getBatchGet(
        { resourceNames: resourceNames.slice(i, i + 200), personFields: PERSON_FIELDS },
        { timeout: 10_000 },
      );
      for (const r of res.data.responses ?? []) if (r.person) out.push(r.person);
    }
    return { ok: true, people: out };
  } catch (e) {
    console.error('[google] contacts get failed', e instanceof Error ? e.message : String(e));
    return { ok: false, lapsed: isInvalidGrant(e) };
  }
}

/** Events on the primary calendar that mention `email`, in the window; the caller filters attendees. */
export async function listEvents(
  auth: OAuth2Client,
  email: string,
  timeMin: Date,
  timeMax: Date,
  timeoutMs: number,
): Promise<{ ok: true; events: calendar_v3.Schema$Event[] } | { ok: false; lapsed: boolean }> {
  const api = calendar({ version: 'v3', auth });
  try {
    const res = await api.events.list(
      {
        calendarId: 'primary', q: email, timeMin: timeMin.toISOString(), timeMax: timeMax.toISOString(),
        singleEvents: true, orderBy: 'startTime', maxResults: 100,
      },
      { timeout: timeoutMs },
    );
    return { ok: true, events: res.data.items ?? [] };
  } catch (e) {
    console.error('[google] calendar list failed', e instanceof Error ? e.message : String(e));
    return { ok: false, lapsed: isInvalidGrant(e) };
  }
}
