'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { confirmAccessLink, type ConfirmState } from '@/app/auth-actions';

type Labels = { text: string; button: string; pending: string; used: string; usedHint: string; toLogin: string };

/**
 * The confirm page's one button. The press, not the page load, signs in, so a mail
 * scanner that opens the link leaves it usable. A used or expired code gives way
 * to the way forward; a failure that another press may fix keeps the button.
 * See DESIGN.md §9 — A page opened from an email link.
 */
export default function AccessConfirmForm({
  locale,
  tokenHash,
  type,
  labels,
}: {
  locale: string;
  tokenHash: string;
  type: string;
  labels: Labels;
}) {
  const [state, action, pending] = useActionState<ConfirmState, FormData>(confirmAccessLink, null);

  if (state?.error === 'used') return <AccessLinkUsed locale={locale} labels={labels} />;

  return (
    <form action={action} className="w-full max-w-xs mt-3 flex flex-col gap-4">
      <p className="text-ink-secondary text-[16px]">{labels.text}</p>
      <input type="hidden" name="token_hash" value={tokenHash} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-brand hover:bg-brand-hover disabled:opacity-50 text-on-brand font-bold px-5 py-3 rounded-[10px] min-h-[44px]"
      >
        {pending ? labels.pending : labels.button}
      </button>
      {state?.error === 'failed' && <p role="alert" className="text-danger text-[13px]">{state.message}</p>}
    </form>
  );
}

/** A code that was used, expired or never valid: say so, and where to get a new one. */
export function AccessLinkUsed({ locale, labels }: { locale: string; labels: Pick<Labels, 'used' | 'usedHint' | 'toLogin'> }) {
  return (
    <div className="w-full max-w-xs mt-3 flex flex-col items-center gap-3">
      <p role="alert" className="w-full rounded-[10px] border border-border bg-surface px-4 py-3 text-[14px] font-semibold text-ink">
        {labels.used}
      </p>
      <p className="text-ink-secondary text-[14px]">{labels.usedHint}</p>
      <Link
        href={`/${locale}/login`}
        className="inline-flex items-center justify-center border border-border hover:border-brand text-ink-secondary hover:text-ink font-semibold px-4 py-2.5 rounded-[10px] min-h-[44px] transition-colors"
      >
        {labels.toLogin}
      </Link>
    </div>
  );
}
