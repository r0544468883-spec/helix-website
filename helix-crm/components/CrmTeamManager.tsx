'use client';

import { useRef, useState, useTransition } from 'react';
import type { Dict } from '@/lib/i18n/he';
import { Dialog } from '@/lib/motion/Dialog';
import { crmInviteMember, crmResendInvite, crmCancelInvite, crmSetRole, crmRemoveMember } from '@/app/crm-actions';
import { withTimeout } from '@/lib/use-status-change';
import { OFFERED_ROLES } from '@/lib/crm-roles';
import type { InviteState } from '@/lib/crm-invite-state';

type Member = { user_id: string; role: string; name: string; email: string };
/** A pending invite and the one state the Team screen shows for it (lib/crm-invite-state.ts). */
export type TeamInvite = { id: string; email: string; role: string; state: InviteState };
type Line = { kind: 'ok' | 'err'; text: string };

const secondary = 'inline-flex items-center border border-border hover:border-brand text-ink-secondary hover:text-ink font-semibold px-3 rounded-[10px] text-[13px] min-h-[44px] transition-colors disabled:opacity-50';
const quiet = 'text-ink-muted hover:text-danger text-[13px] min-h-[44px] px-2 disabled:opacity-50';

/**
 * The Team screen: invite someone (the CRM sends the email and says whether it
 * went), each pending invite with what happened to its email, and the members.
 * Removing a member asks first. Only an admin sees any control; everyone else
 * gets the lists. See DESIGN.md §8 — Pending invite row, and §9 — Roles.
 */
export default function CrmTeamManager({
  locale,
  isAdmin,
  currentUserId,
  members,
  invites,
  t,
}: {
  locale: string;
  isAdmin: boolean;
  currentUserId: string;
  members: Member[];
  invites: TeamInvite[];
  t: Dict['crm'];
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [formLine, setFormLine] = useState<Line | null>(null);
  const [rowLine, setRowLine] = useState<({ id: string } & Line) | null>(null);
  const [membersErr, setMembersErr] = useState<string | null>(null);
  const [removing, setRemoving] = useState<Member | null>(null);
  const [isPending, startTransition] = useTransition();
  const inFlight = useRef(false);

  const roleLabel = (r: string) =>
    r === 'admin' ? t.roleAdmin
    : r === 'viewer' ? t.roleViewer
    : r === 'agency_admin' ? t.roleAgencyAdmin
    : t.roleMember;

  // An action's own message wins; an expired session is named as one.
  const messageOf = (res: unknown, fallback: string): string => {
    if (!res || typeof res !== 'object') return fallback;
    if ('error' in res && (res as { error?: unknown }).error === 'auth') return t.sessionExpired;
    const m = 'message' in res ? (res as { message?: unknown }).message : undefined;
    return typeof m === 'string' && m ? m : fallback;
  };

  // One action at a time: a double press must not send two emails.
  function run(task: () => Promise<void>) {
    if (inFlight.current) return;
    inFlight.current = true;
    startTransition(async () => {
      try { await task(); } finally { inFlight.current = false; }
    });
  }

  function invite() {
    if (!email.trim()) { setFormLine({ kind: 'err', text: t.errEmailRequired }); return; }
    setFormLine(null);
    run(async () => {
      const res = await withTimeout(crmInviteMember({ locale, email, role }));
      if (res && 'error' in res && res.error === 'timeout') { setFormLine({ kind: 'err', text: t.inviteTimeout }); return; }
      if (res && 'ok' in res && res.ok) {
        setEmail('');
        // Saved either way: red only when the email failed, not when it was just too soon.
        const failed = 'reason' in res && res.reason === 'send_failed';
        setFormLine({ kind: failed ? 'err' : 'ok', text: res.message });
        return;
      }
      setFormLine({ kind: 'err', text: messageOf(res, t.errInviteFailed) });
    });
  }

  function resend(id: string) {
    setRowLine(null);
    run(async () => {
      const res = await withTimeout(crmResendInvite({ locale, id }));
      if (res && 'error' in res && res.error === 'timeout') { setRowLine({ id, kind: 'err', text: t.inviteTimeout }); return; }
      const ok = !!res && 'ok' in res && res.ok;
      setRowLine({ id, kind: ok ? 'ok' : 'err', text: messageOf(res, t.errInviteFailed) });
    });
  }

  function cancelInvite(id: string) {
    setRowLine(null);
    run(async () => {
      const res = await withTimeout(crmCancelInvite({ locale, id }));
      if (!res || !('ok' in res) || !res.ok) setRowLine({ id, kind: 'err', text: messageOf(res, t.errCancelInviteFailed) });
    });
  }

  function changeRole(userId: string, next: string) {
    setMembersErr(null);
    run(async () => {
      const res = await withTimeout(crmSetRole({ locale, userId, role: next }));
      if (!res || !('ok' in res) || !res.ok) setMembersErr(messageOf(res, t.errInviteFailed));
    });
  }

  function confirmRemove() {
    const m = removing;
    setRemoving(null);
    if (!m) return;
    setMembersErr(null);
    run(async () => {
      const res = await withTimeout(crmRemoveMember({ locale, userId: m.user_id }));
      if (!res || !('ok' in res) || !res.ok) setMembersErr(messageOf(res, t.errRemoveFailed));
    });
  }

  const roleOptions = OFFERED_ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>);
  const anyDelivered = invites.some((i) => i.state.key === 'delivered');
  const [askBefore, askAfter = ''] = t.removeAsk.split('{name}');

  return (
    <div className="flex flex-col gap-8">
      {/* invite (admin only) */}
      {isAdmin && (
        <div className="bg-surface border border-border rounded-2xl p-5">
          <h2 className="font-bold text-[16px] mb-3">{t.invite}</h2>
          <div className="flex flex-wrap gap-2">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') invite(); }}
              type="email"
              placeholder={t.inviteEmail}
              aria-label={t.inviteEmail}
              dir="ltr"
              className="flex-1 min-w-[200px] bg-bg border border-border rounded-[10px] px-3 py-2.5 text-[15px] outline-none focus:border-brand min-h-[44px]"
            />
            <select value={role} onChange={(e) => setRole(e.target.value)} aria-label={t.roleLabel} className="bg-bg border border-border rounded-[10px] px-3 py-2.5 text-[15px] outline-none focus:border-brand min-h-[44px]">
              {roleOptions}
            </select>
            <button type="button" onClick={invite} disabled={isPending} className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-on-brand font-semibold px-5 py-2.5 rounded-[10px] min-h-[44px]">{t.invite}</button>
          </div>
          {formLine && (
            <p role={formLine.kind === 'err' ? 'alert' : 'status'} className={`text-[13px] mt-2 ${formLine.kind === 'err' ? 'text-danger' : 'text-ink-secondary'}`}>
              {formLine.text}
            </p>
          )}
          <p className="text-ink-muted text-[12px] mt-3">{t.inviteHint}</p>
          <p className="text-ink-muted text-[12px] mt-1">{t.roleHint}</p>
        </div>
      )}

      {/* members */}
      <div>
        <h2 className="font-bold text-[16px] mb-3">{t.members} ({members.length})</h2>
        <div className="flex flex-col gap-2">
          {members.map((m) => (
            <div key={m.user_id} className="flex flex-wrap items-center gap-3 bg-surface border border-border rounded-xl p-3">
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-[15px]" dir="auto">
                  {m.name} {m.user_id === currentUserId && <span className="text-ink-muted text-[12px]">({t.you})</span>}
                </span>
                {m.email && <p className="text-ink-secondary text-[13px] truncate" dir="ltr">{m.email}</p>}
              </div>
              {isAdmin && m.user_id !== currentUserId ? (
                <>
                  <select
                    defaultValue={m.role}
                    onChange={(e) => changeRole(m.user_id, e.target.value)}
                    aria-label={`${t.roleLabel}: ${m.name}`}
                    className="bg-bg border border-border rounded-[10px] px-2 py-1.5 text-[13px] outline-none focus:border-brand min-h-[44px]"
                  >
                    {/* an inherited agency_admin keeps its label until changed */}
                    {m.role === 'agency_admin' && <option value="agency_admin">{t.roleAgencyAdmin}</option>}
                    {roleOptions}
                  </select>
                  <button type="button" onClick={() => setRemoving(m)} disabled={isPending} className={quiet}>{t.remove}</button>
                </>
              ) : (
                <span className={`text-[12px] font-semibold px-2.5 py-0.5 rounded-full ${m.role === 'admin' ? 'bg-brand/15 text-brand-ink' : 'border border-border text-ink-muted'}`}>{roleLabel(m.role)}</span>
              )}
            </div>
          ))}
        </div>
        {membersErr && <p role="alert" className="text-danger text-[13px] mt-2">{membersErr}</p>}
      </div>

      {/* pending invites: each with what happened to its email */}
      {invites.length > 0 && (
        <div>
          <h2 className="font-bold text-[16px] mb-3">{t.pending} ({invites.length})</h2>
          <div className="flex flex-col gap-2">
            {invites.map((i) => (
              <div key={i.id}>
                <div className="bg-surface border border-border border-dashed rounded-xl p-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="flex-1 min-w-[180px] truncate text-[14px] text-ink-secondary" dir="ltr">{i.email}</span>
                  <span className="text-[12px] text-ink-muted">{roleLabel(i.role)}</span>
                  <span className={`basis-full sm:basis-auto text-[12px] ${i.state.danger ? 'text-danger' : 'text-ink-secondary'}`}>{i.state.text}</span>
                  {isAdmin && (
                    <div className="flex flex-wrap gap-2 ms-auto">
                      <button type="button" onClick={() => resend(i.id)} disabled={isPending} className={secondary}>{t.inviteResend}</button>
                      <button type="button" onClick={() => cancelInvite(i.id)} disabled={isPending} className={quiet}>{t.inviteCancel}</button>
                    </div>
                  )}
                </div>
                {rowLine?.id === i.id && (
                  <p role={rowLine.kind === 'err' ? 'alert' : 'status'} className={`text-[13px] mt-1 ${rowLine.kind === 'err' ? 'text-danger' : 'text-ink-secondary'}`}>
                    {rowLine.text}
                  </p>
                )}
              </div>
            ))}
          </div>
          {anyDelivered && <p className="text-ink-muted text-[12px] mt-2">{t.inviteSpamHint}</p>}
        </div>
      )}

      {!isAdmin && <p className="text-ink-muted text-[13px]">{t.onlyAdmin}</p>}

      {/* Removing someone asks first, by name. */}
      <Dialog open={removing !== null} onClose={() => setRemoving(null)} width={420}>
        {removing && (
          <div className="text-ink">
            <p className="font-bold text-[16px] mb-2">
              {askBefore}<span dir="auto">{removing.name}</span>{askAfter}
            </p>
            <p className="text-ink-secondary text-[14px] mb-4">{t.removeAskBody}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={confirmRemove}
                className="bg-danger hover:bg-danger/90 text-on-danger font-semibold px-5 py-2.5 rounded-[10px] min-h-[44px]"
              >
                {t.removeYes}
              </button>
              <button
                type="button"
                onClick={() => setRemoving(null)}
                className="border border-border text-ink-secondary hover:text-ink px-5 py-2.5 rounded-[10px] min-h-[44px]"
              >
                {t.promptDismiss}
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
