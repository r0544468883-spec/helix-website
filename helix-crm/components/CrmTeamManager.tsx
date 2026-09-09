'use client';

import { useState, useTransition } from 'react';
import type { Dict } from '@/lib/i18n/he';
import { crmInviteMember, crmSetRole, crmRemoveMember } from '@/app/crm-actions';

type Member = { user_id: string; role: string; name: string; email: string };
type Invite = { id: string; email: string; role: string };

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
  invites: Invite[];
  t: Dict['crm'];
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [isPending, startTransition] = useTransition();

  const roleLabel = (r: string) => (r === 'admin' ? t.roleAdmin : t.roleMember);

  function invite() {
    if (!email.trim()) return;
    startTransition(async () => {
      const res = await crmInviteMember({ locale, email, role });
      if (res?.ok) setEmail('');
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* invite (admin only) */}
      {isAdmin && (
        <div className="bg-surface border border-border rounded-2xl p-5">
          <h2 className="font-bold text-[16px] mb-3">{t.invite}</h2>
          <div className="flex flex-wrap gap-2">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.inviteEmail} dir="ltr" className="flex-1 min-w-[200px] bg-bg border border-border rounded-[10px] px-3 py-2.5 text-[15px] outline-none focus:border-brand" />
            <select value={role} onChange={(e) => setRole(e.target.value)} className="bg-bg border border-border rounded-[10px] px-3 py-2.5 text-[15px] outline-none focus:border-brand">
              <option value="member">{t.roleMember}</option>
              <option value="admin">{t.roleAdmin}</option>
            </select>
            <button onClick={invite} disabled={isPending} className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-bg font-semibold px-5 py-2.5 rounded-[10px]">{t.invite}</button>
          </div>
          <p className="text-ink-muted text-[12px] mt-3">{t.inviteHint}</p>
        </div>
      )}

      {/* members */}
      <div>
        <h2 className="font-bold text-[16px] mb-3">{t.members} ({members.length})</h2>
        <div className="flex flex-col gap-2">
          {members.map((m) => (
            <div key={m.user_id} className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3">
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
                    onChange={(e) => startTransition(() => { void crmSetRole({ locale, userId: m.user_id, role: e.target.value }); })}
                    className="bg-bg border border-border rounded-[10px] px-2 py-1.5 text-[13px] outline-none focus:border-brand"
                  >
                    <option value="member">{t.roleMember}</option>
                    <option value="admin">{t.roleAdmin}</option>
                  </select>
                  <button onClick={() => startTransition(() => { void crmRemoveMember({ locale, userId: m.user_id }); })} disabled={isPending} className="text-ink-muted hover:text-red-400 text-[13px]">{t.remove}</button>
                </>
              ) : (
                <span className={`text-[12px] font-semibold px-2.5 py-0.5 rounded-full ${m.role === 'admin' ? 'bg-brand/15 text-brand' : 'border border-border text-ink-muted'}`}>{roleLabel(m.role)}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* pending invites */}
      {invites.length > 0 && (
        <div>
          <h2 className="font-bold text-[16px] mb-3">{t.pending} ({invites.length})</h2>
          <div className="flex flex-col gap-2">
            {invites.map((i) => (
              <div key={i.id} className="flex items-center gap-3 bg-surface border border-border border-dashed rounded-xl p-3">
                <span className="flex-1 text-[14px] text-ink-secondary" dir="ltr">{i.email}</span>
                <span className="text-[12px] text-ink-muted">{roleLabel(i.role)}</span>
                {isAdmin && (
                  <button onClick={() => startTransition(() => { void crmRemoveMember({ locale, email: i.email }); })} disabled={isPending} className="text-ink-muted hover:text-red-400 text-[13px]">{t.remove}</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!isAdmin && <p className="text-ink-muted text-[13px]">{t.onlyAdmin}</p>}
    </div>
  );
}
