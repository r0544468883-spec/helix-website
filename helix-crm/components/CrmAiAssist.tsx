'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Sparkles, Copy, Check } from 'lucide-react';
import { crmAiAssist, type AssistKind } from '@/app/crm-ai-actions';
import { getDict } from '@/lib/i18n';

/** The lead's AI box: summarize / draft follow-up / next step, on the workspace's
 *  own key (BYOK). Not configured → a quiet CTA to the AI settings screen. */
export default function CrmAiAssist({ locale, contactId, configured }: { locale: string; contactId: string; configured: boolean }) {
  const t = getDict(locale).crm;
  const [kind, setKind] = useState<AssistKind | null>(null);
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);
  const [busy, startTransition] = useTransition();

  function run(k: AssistKind) {
    setKind(k); setErr(''); setCopied(false);
    startTransition(async () => {
      const r = await crmAiAssist(contactId, k);
      if (r.ok) setText(r.text);
      else { setText(''); setErr(`${t.aiError} (${r.error})`); }
    });
  }

  async function copy() {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ }
  }

  const actions: { k: AssistKind; label: string }[] = [
    { k: 'summary', label: t.aiSummarize },
    { k: 'email', label: t.aiDraftEmail },
    { k: 'next', label: t.aiNextStep },
  ];

  return (
    <section className="bg-surface border border-border rounded-2xl p-5 plug-glow-purple">
      <div className="flex items-center gap-2 mb-3.5">
        <span className="grid place-items-center size-8 rounded-lg bg-accent/15 text-accent-ink"><Sparkles size={16} aria-hidden /></span>
        <h2 className="font-display text-[15.5px] font-extrabold">{t.aiAssistTitle}</h2>
      </div>

      {!configured ? (
        <p className="text-[13.5px] text-ink-secondary">
          {t.aiNotConfigured}{' '}
          <Link href={`/${locale}/dashboard/crm/ai`} className="text-brand-ink font-semibold hover:underline">{t.aiGoSetup} ←</Link>
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {actions.map((a) => (
              <button key={a.k} type="button" onClick={() => run(a.k)} disabled={busy}
                className={`glow-hover rounded-xl border px-3.5 py-2 text-[13px] font-semibold transition-colors disabled:opacity-60 ${
                  kind === a.k ? 'border-accent/50 bg-accent/10 text-accent-ink' : 'border-border bg-soft text-ink-secondary hover:text-ink'
                }`}>
                {busy && kind === a.k ? t.aiWorking : a.label}
              </button>
            ))}
          </div>

          {err && <p className="mt-3 text-[13px] text-danger">{err}</p>}
          {text && !busy && (
            <div className="mt-4 bg-soft border border-border rounded-xl p-4">
              <p className="text-[14px] text-ink whitespace-pre-line leading-relaxed" dir="auto">{text}</p>
              <button type="button" onClick={copy}
                className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand-ink hover:underline">
                {copied ? <><Check size={13} aria-hidden /> {t.aiCopied}</> : <><Copy size={13} aria-hidden /> {t.aiCopy}</>}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
