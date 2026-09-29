import type { Dict } from '@/lib/i18n/he';
import type { AccessLinkResult } from '@/lib/crm-access-link';

/**
 * What happened to an invite's email, and how the Team screen says it.
 * `crm_invites.last_error` holds a short code: 'unavailable', 'link', or
 * 'send: <Resend's message>'. See openspec/changes/crm-team-invites/design.md,
 * decision 6.
 */

/** The code stored on the invite for a failed send; null for a send the limits refused. */
export function inviteErrorCode(res: AccessLinkResult): string | null {
  if (res.ok) return null;
  switch (res.error) {
    case 'too_soon':
    case 'hourly_limit':
    case 'ip_limit':
      return null;
    case 'unavailable':
      return 'unavailable';
    case 'link_failed':
    case 'not_invited':
      return 'link';
    case 'send_failed':
      return `send: ${res.reason}`.slice(0, 300);
  }
}

/** The stored code in words: Resend's own message, or the dictionary's. */
export function inviteReasonText(code: string, t: Dict['crm']): string {
  if (code === 'unavailable') return t.inviteErrUnavailable;
  if (code === 'link') return t.inviteErrLink;
  if (code.startsWith('send: ')) return code.slice(6);
  return code;
}

// Resend's last_event values after which nothing changes for our purposes.
export const SETTLED_DELIVERY = new Set([
  'delivered', 'opened', 'clicked', 'bounced', 'suppressed', 'complained', 'failed', 'canceled',
]);

export type InviteStateRow = {
  created_at: string;
  expires_at: string;
  last_sent_at: string | null;
  last_error: string | null;
  email_id: string | null;
  delivery: string | null;
};
export type InviteStateKey = 'expired' | 'failed' | 'bounced' | 'complained' | 'delivered' | 'delayed' | 'sent' | 'invited';
export type InviteState = { key: InviteStateKey; text: string; danger: boolean };

/**
 * The one state a pending invite shows. Expiry wins; then a failed last attempt;
 * then what Resend reported for the last email; an invite the CRM never sent
 * (made before v22) says when it was made. Dates are the Israeli day and time.
 */
export function inviteState(row: InviteStateRow, now: Date, locale: string, t: Dict['crm']): InviteState {
  const tag = locale === 'en' ? 'en-GB' : 'he-IL';
  const day = new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'numeric', timeZone: 'Asia/Jerusalem' });
  const time = new Intl.DateTimeFormat(tag, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jerusalem' });
  const at = (iso: string) => `${day.format(new Date(iso))} ${time.format(new Date(iso))}`;

  if (Date.parse(row.expires_at) <= now.getTime()) {
    return { key: 'expired', text: t.inviteStExpired.replace('{date}', day.format(new Date(row.expires_at))), danger: false };
  }
  if (row.last_error) {
    return { key: 'failed', text: t.inviteStFailed.replace('{reason}', inviteReasonText(row.last_error, t)), danger: true };
  }
  if (row.email_id) {
    switch (row.delivery) {
      case 'bounced':
      case 'suppressed':
        return { key: 'bounced', text: t.inviteStBounced, danger: true };
      case 'complained':
        return { key: 'complained', text: t.inviteStComplained, danger: true };
      case 'failed':
      case 'canceled':
        return { key: 'failed', text: t.inviteStFailed.replace('{reason}', t.inviteErrProvider), danger: true };
      case 'delivered':
      case 'opened':
      case 'clicked':
        return { key: 'delivered', text: t.inviteStDelivered, danger: false };
      case 'delivery_delayed':
        return { key: 'delayed', text: t.inviteStDelayed, danger: false };
      default:
        return { key: 'sent', text: t.inviteStSent.replace('{when}', at(row.last_sent_at ?? row.created_at)), danger: false };
    }
  }
  return { key: 'invited', text: t.inviteStInvited.replace('{date}', day.format(new Date(row.created_at))), danger: false };
}
