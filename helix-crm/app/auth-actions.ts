'use server';

import type { EmailOtpType } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendAccessLink } from '@/lib/crm-access-link';
import { normalizeEmail, isAccessLinkShape } from '@/lib/crm-access-rules';
import { publicOriginFromHeaders } from '@/lib/public-origin';
import { getDict } from '@/lib/i18n';

// The two actions a signed-out visitor may call, and nothing else: every export of
// a 'use server' file is a public endpoint. The link-and-send logic stays in
// lib/crm-access-link.ts, which takes a service-role client and is never exported
// from here. openspec: crm-team-invites (crm-sign-in).

export type SignInLinkAnswer =
  | { ok: true }
  | { ok: false; error: 'invalid' | 'not_invited' | 'too_soon' | 'limit' | 'failed'; message: string };

/**
 * The sign-in page's "send me a link": the CRM makes the link and emails it through
 * Resend. An address with no account, no unexpired invite and no allowlist entry
 * gets the "not invited" answer and no email, as before.
 */
export async function requestSignInLink(input: { email: string; locale: string }): Promise<SignInLinkAnswer> {
  const locale = input?.locale === 'en' ? 'en' : 'he';
  const t = getDict(locale).auth;
  const email = normalizeEmail(input?.email);
  if (!email) return { ok: false, error: 'invalid', message: t.magicInvalid };
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: 'failed', message: t.magicSendFailed };

  const h = await headers();
  // The first hop is the caller. A caller can prepend its own, so this limit is a
  // courtesy; the per-address limits are the guard (design.md, decision 5).
  const ip = (h.get('x-forwarded-for') ?? '').split(',')[0]?.trim() || null;
  const res = await sendAccessLink(admin, {
    kind: 'sign_in', email, locale, origin: publicOriginFromHeaders(h), ip,
  });
  if (res.ok) return { ok: true };
  switch (res.error) {
    case 'not_invited':
      return { ok: false, error: 'not_invited', message: t.magicNotInvited };
    case 'too_soon':
      return { ok: false, error: 'too_soon', message: t.magicTooSoon.replace('{seconds}', String(res.retryInSeconds)) };
    case 'hourly_limit':
    case 'ip_limit':
      return { ok: false, error: 'limit', message: t.magicLimit };
    default:
      return { ok: false, error: 'failed', message: t.magicSendFailed };
  }
}

export type ConfirmState = { error: 'used' | 'failed'; message: string } | null;

/**
 * The confirm page's one button (useActionState). Exchanges the emailed code for a
 * session, written as cookies in this response, then opens the CRM, where a first
 * sign-in claims its invite. Only a press gets here, so a mail scanner that fetches
 * the link doesn't use it up.
 */
export async function confirmAccessLink(_prev: ConfirmState, form: FormData): Promise<ConfirmState> {
  const locale = form.get('locale') === 'en' ? 'en' : 'he';
  const t = getDict(locale).auth;
  const tokenHash = form.get('token_hash');
  const type = form.get('type');
  if (!isAccessLinkShape(tokenHash, type)) return { error: 'used', message: t.confirmUsed };

  const supabase = await createClient();
  // Supabase that doesn't answer must not hold the press: 12 seconds, then "try again".
  const verified = await Promise.race([
    supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as EmailOtpType }),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 12_000)),
  ]);
  if (!verified) return { error: 'failed', message: t.confirmFailed };
  const { error } = verified;
  if (error) {
    // A 4xx is an expired, used or foreign code; anything else is worth another press.
    const status = (error as { status?: number }).status ?? 0;
    const used = status >= 400 && status < 500;
    console.error('[auth/confirm] verifyOtp failed', error.code ?? error.name, status);
    return used ? { error: 'used', message: t.confirmUsed } : { error: 'failed', message: t.confirmFailed };
  }
  redirect(`/${locale}/dashboard/crm`);
}
