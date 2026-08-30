'use client';

import { useState, useTransition, useEffect } from 'react';
import { joinWaitlist } from '@/app/actions';

type RefLabels = { position: string; boost: string; copy: string; copied: string };

type Props = {
  productId: string;
  placeholder: string;
  buttonLabel: string;
  doneLabel: string;
  shareBase: string;
  refLabels: RefLabels;
};

export default function WaitlistForm({
  productId,
  placeholder,
  buttonLabel,
  doneLabel,
  shareBase,
  refLabels,
}: Props) {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{ position: number; code: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [ref, setRef] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get('ref');
    if (r) setRef(r);
  }, []);

  if (result) {
    const shareUrl = `${shareBase}?ref=${result.code}`;
    return (
      <div>
        <p className="text-brand font-semibold text-[15px]">{doneLabel}</p>
        {result.position > 0 && (
          <p className="text-ink text-[16px] font-bold mt-1">
            {refLabels.position.replace('{n}', String(result.position))}
          </p>
        )}
        <p className="text-ink-secondary text-[13px] mt-1 mb-2">{refLabels.boost}</p>
        <div className="flex gap-2">
          <input
            readOnly
            value={shareUrl}
            dir="ltr"
            className="flex-1 bg-surface border border-border rounded-[10px] px-3 py-2 text-[13px] font-mono outline-none"
          />
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(shareUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="bg-brand hover:bg-brand-hover text-bg font-semibold px-4 py-2 rounded-[10px] text-[13px] whitespace-nowrap transition-colors"
          >
            {copied ? refLabels.copied : refLabels.copy}
          </button>
        </div>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await joinWaitlist(productId, email, ref);
      if (res?.ok) setResult({ position: res.position ?? 0, code: res.code ?? '' });
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        dir="ltr"
        className="flex-1 bg-surface border border-border rounded-[10px] px-4 py-2.5 text-[15px] outline-none focus:border-brand transition-colors"
      />
      <button
        type="submit"
        disabled={isPending}
        className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-bg font-semibold px-5 py-2.5 rounded-[10px] transition-colors"
      >
        {buttonLabel}
      </button>
    </form>
  );
}
