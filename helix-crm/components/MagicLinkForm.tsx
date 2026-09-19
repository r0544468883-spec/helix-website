'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Props = {
  locale: string;
  labels: {
    emailPlaceholder: string;
    button: string;
    sending: string;
    sent: string;
    error: string;
    notInvited: string;
  };
};

export default function MagicLinkForm({ locale, labels }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error' | 'notInvited'>('idle');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    setStatus('sending');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          // המערכת בהזמנה בלבד — לא יוצרים משתמש חדש מטופס ההתחברות.
          // (זו אופציה של signInWithOtp בלבד; מסלול ה-OAuth נאכף ב-DB,
          // בטריגר public.handle_new_user.)
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/${locale}`,
        },
      });
      if (!error) return setStatus('sent');
      // Supabase מחזיר otp_disabled / signup_disabled כשהכתובת לא קיימת
      // ו-shouldCreateUser=false.
      const code = (error as { code?: string }).code ?? '';
      const notInvited =
        error.status === 422 || code.includes('disabled') || /signups? not allowed/i.test(error.message);
      setStatus(notInvited ? 'notInvited' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <p className="text-brand font-semibold text-[15px] text-center max-w-xs">{labels.sent}</p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 w-full max-w-xs">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={labels.emailPlaceholder}
        dir="ltr"
        className="w-full bg-surface border border-border rounded-[10px] px-4 py-3 text-[15px] outline-none focus:border-brand transition-colors text-center"
      />
      <button
        type="submit"
        disabled={status === 'sending'}
        className="cta-glow bg-brand hover:bg-brand-hover disabled:opacity-50 text-bg font-bold px-5 py-3 rounded-[10px]"
      >
        {status === 'sending' ? labels.sending : labels.button}
      </button>
      {status === 'error' && (
        <p className="text-red-400 text-[13px] text-center">{labels.error}</p>
      )}
      {status === 'notInvited' && (
        <p className="text-red-400 text-[13px] text-center">{labels.notInvited}</p>
      )}
    </form>
  );
}
