'use client';

import { useState, useTransition } from 'react';
import { submitPmf } from '@/app/actions';

type Labels = {
  title: string;
  question: string;
  very: string;
  somewhat: string;
  not: string;
  benefitPrompt: string;
  benefitPlaceholder: string;
  submit: string;
  done: string;
};

const OPTIONS: { key: 'very' | 'somewhat' | 'not'; labelKey: keyof Labels }[] = [
  { key: 'very', labelKey: 'very' },
  { key: 'somewhat', labelKey: 'somewhat' },
  { key: 'not', labelKey: 'not' },
];

export default function PmfSurvey({ productId, labels }: { productId: string; labels: Labels }) {
  const [choice, setChoice] = useState<'very' | 'somewhat' | 'not' | null>(null);
  const [benefit, setBenefit] = useState('');
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (done) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-5 text-center">
        <p className="text-brand font-semibold text-[15px]">{labels.done}</p>
      </div>
    );
  }

  function pick(key: 'very' | 'somewhat' | 'not') {
    setChoice(key);
    // "not" / "somewhat" — submit immediately (no benefit follow-up needed)
    if (key !== 'very') {
      startTransition(async () => {
        await submitPmf(productId, key, '');
        setDone(true);
      });
    }
  }

  function submitBenefit() {
    if (!choice) return;
    startTransition(async () => {
      await submitPmf(productId, choice, benefit);
      setDone(true);
    });
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <h3 className="font-bold text-[16px] mb-1">{labels.title}</h3>
      <p className="text-ink-secondary text-[14px] mb-4">{labels.question}</p>

      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        {OPTIONS.map((o) => (
          <button
            key={o.key}
            type="button"
            disabled={isPending}
            onClick={() => pick(o.key)}
            className={`flex-1 border rounded-[10px] px-4 py-3 text-[14px] font-semibold transition-colors disabled:opacity-50 ${
              choice === o.key
                ? 'border-brand bg-brand/10 text-brand'
                : 'border-border hover:border-brand text-ink-secondary hover:text-ink'
            }`}
          >
            {labels[o.labelKey]}
          </button>
        ))}
      </div>

      {choice === 'very' && (
        <div className="mt-4">
          <label className="block text-[13px] text-ink-secondary mb-2">{labels.benefitPrompt}</label>
          <textarea
            value={benefit}
            onChange={(e) => setBenefit(e.target.value)}
            placeholder={labels.benefitPlaceholder}
            rows={2}
            dir="auto"
            className="w-full bg-bg border border-border rounded-[10px] px-4 py-2.5 text-[15px] outline-none focus:border-brand transition-colors mb-3"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={submitBenefit}
            className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-bg font-semibold px-5 py-2.5 rounded-[10px] transition-colors"
          >
            {labels.submit}
          </button>
        </div>
      )}
    </div>
  );
}
