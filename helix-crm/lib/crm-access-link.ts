import 'server-only';
import { Resend } from 'resend';
import type { createAdminClient } from '@/lib/supabase/admin';
import { buildAuthEmail, type AuthEmailKind } from '@/lib/auth-emails';
import { decideLimit, linkTypeFor, accessLinkUrl, HOUR_MS, LINK_LIMITS } from '@/lib/crm-access-rules';

/**
 * The one place an access email is made: an invite, or a sign-in link. Supabase's
 * admin API makes the one-time link and sends nothing; Resend sends the email; every
 * attempt is logged in crm_auth_link_sends for the limits. Deliberately not a
 * 'use server' file: every export there is a public endpoint, and this takes a
 * service-role client. See openspec/changes/crm-team-invites/design.md, decisions 1-5.
 *
 * Nothing here logs an address.
 */

type Admin = NonNullable<ReturnType<typeof createAdminClient>>;

const DEFAULT_FROM = 'HELIX CRM <crm@helix.co.il>';

export type AccessLinkResult =
  | { ok: true; emailId: string }
  | { ok: false; error: 'too_soon'; retryInSeconds: number }
  | { ok: false; error: 'hourly_limit' | 'ip_limit' | 'not_invited' }
  | { ok: false; error: 'unavailable' | 'link_failed' | 'send_failed'; reason: string };

/** Whether an address may join: an unexpired invite to any workspace, or the allowlist. */
async function mayJoin(admin: Admin, email: string): Promise<boolean> {
  const [{ data: inv }, { data: allowed }] = await Promise.all([
    admin.from('crm_invites').select('id').eq('email', email).gt('expires_at', new Date().toISOString()).limit(1),
    admin.from('auth_allowlist').select('email').eq('email', email).limit(1),
  ]);
  return (inv?.length ?? 0) > 0 || (allowed?.length ?? 0) > 0;
}

export async function sendAccessLink(
  admin: Admin,
  input: {
    kind: AuthEmailKind;
    /** From normalizeEmail. */
    email: string;
    locale: 'he' | 'en';
    /** publicOriginFromHeaders of the request that asked. */
    origin: string;
    /** The sign-in form's caller; the IP limit applies only when set. */
    ip?: string | null;
    workspaceId?: string | null;
    /** An invite's row: its link names it, so the press joins that workspace. */
    inviteId?: string | null;
    /** An invite's names; its sender's address becomes the reply-to. */
    invite?: { inviterName: string; inviterEmail: string | null; workspaceName: string; roleLabel: string };
  },
): Promise<AccessLinkResult> {
  const { kind, email, locale, origin } = input;
  if (!origin) return { ok: false, error: 'link_failed', reason: 'no public origin' };
  const now = Date.now();
  const since = new Date(now - HOUR_MS).toISOString();

  // 1) The limits, from the log.
  const [byAddress, byIp] = await Promise.all([
    admin.from('crm_auth_link_sends').select('created_at').eq('email', email).gte('created_at', since)
      .order('created_at', { ascending: false }).limit(LINK_LIMITS.perAddressPerHour + 1),
    input.ip
      ? admin.from('crm_auth_link_sends').select('created_at').eq('ip', input.ip).gte('created_at', since)
        .limit(LINK_LIMITS.perIpPerHour + 1)
      : Promise.resolve({ data: null, error: null }),
  ]);
  if (byAddress.error || byIp.error) {
    console.error('[access-link] limits unreadable', (byAddress.error ?? byIp.error)?.message);
    return { ok: false, error: 'unavailable', reason: 'limits' };
  }
  const times = (rows: { created_at: string }[] | null) => (rows ?? []).map((r) => Date.parse(r.created_at));
  const verdict = decideLimit(times(byAddress.data), input.ip ? times(byIp.data) : null, now);
  if (!verdict.ok) {
    return verdict.reason === 'too_soon'
      ? { ok: false, error: 'too_soon', retryInSeconds: verdict.retryInSeconds }
      : { ok: false, error: verdict.reason };
  }

  // 2) Log the request before anything else, so a refused or failed one still counts.
  const { error: logErr } = await admin.from('crm_auth_link_sends').insert({
    email, kind, ip: input.ip ?? null, workspace_id: input.workspaceId ?? null,
  });
  if (logErr) {
    console.error('[access-link] log insert failed', logErr.message);
    return { ok: false, error: 'unavailable', reason: 'log' };
  }
  // Housekeeping: the limits read one hour back; keep two days.
  await admin.from('crm_auth_link_sends').delete().lt('created_at', new Date(now - 48 * HOUR_MS).toISOString());

  // 3) The link type, from the account's state.
  const { data: state, error: stateErr } = await admin.rpc('crm_account_state', { p_email: email });
  if (stateErr || (state !== 'none' && state !== 'invited' && state !== 'active')) {
    console.error('[access-link] account state unreadable', stateErr?.message ?? String(state));
    return { ok: false, error: 'unavailable', reason: 'account state' };
  }
  const joinable = kind === 'invite' || (state !== 'active' && (await mayJoin(admin, email)));
  const type = linkTypeFor(state, joinable);
  if (!type) return { ok: false, error: 'not_invited' };

  // 4) The one-time link. Supabase sends nothing here. An account that exists but was
  //    never used (an old Supabase invite) may refuse a second invite link; a magic
  //    link then signs it in instead, with whatever verification type Supabase names.
  let { data: gen, error: genErr } = await admin.auth.admin.generateLink({ type, email });
  if (genErr && type === 'invite' && state === 'invited') {
    ({ data: gen, error: genErr } = await admin.auth.admin.generateLink({ type: 'magiclink', email }));
  }
  const props = gen?.properties;
  if (genErr || !props?.hashed_token || !props.verification_type) {
    console.error('[access-link] generateLink failed', type, genErr?.code ?? genErr?.name, genErr?.message);
    return { ok: false, error: 'link_failed', reason: genErr?.message ?? 'no token' };
  }
  const link = accessLinkUrl({
    origin, locale, kind, hashedToken: props.hashed_token, verificationType: props.verification_type, inviteId: input.inviteId,
  });

  // 5) The email.
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: 'send_failed', reason: 'RESEND_API_KEY is not set' };
  const mail = buildAuthEmail({
    kind,
    locale,
    link,
    loginUrl: `${origin}/${locale}/login`,
    inviterName: input.invite?.inviterName,
    workspaceName: input.invite?.workspaceName,
    roleLabel: input.invite?.roleLabel,
  });
  try {
    const { data: sent, error: sendErr } = await new Resend(key).emails.send({
      from: process.env.RESEND_AUTH_FROM || DEFAULT_FROM,
      to: email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      ...(kind === 'invite' && input.invite?.inviterEmail ? { replyTo: input.invite.inviterEmail } : {}),
      tags: [{ name: 'kind', value: kind }],
    });
    if (sendErr || !sent?.id) {
      console.error('[access-link] Resend refused', kind, sendErr?.name, sendErr?.message);
      return { ok: false, error: 'send_failed', reason: sendErr?.message ?? 'no id' };
    }
    return { ok: true, emailId: sent.id };
  } catch (e) {
    console.error('[access-link] Resend unreachable', kind, e instanceof Error ? e.message : String(e));
    return { ok: false, error: 'send_failed', reason: 'unreachable' };
  }
}
