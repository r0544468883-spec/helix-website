'use client';

import { useState, useTransition } from 'react';
import { Sparkles, Check, X } from 'lucide-react';
import { crmAiSave, crmAiTest, type AiStatus } from '@/app/crm-ai-actions';
import { getDict } from '@/lib/i18n';

const PROVIDERS = [
  { id: 'anthropic', label: 'Claude', sub: 'Anthropic', hint: 'sk-ant-…', model: 'claude-sonnet-5' },
  { id: 'openai', label: 'GPT', sub: 'OpenAI', hint: 'sk-…', model: 'gpt-4o' },
  { id: 'gemini', label: 'Gemini', sub: 'Google', hint: 'AIza…', model: 'gemini-2.5-flash' },
] as const;

export default function CrmAiSettings({ locale, status }: { locale: string; status: AiStatus }) {
  const t = getDict(locale).crm;
  const [provider, setProvider] = useState<string>(status.provider);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(status.configured && status.model !== PROVIDERS.find((p) => p.id === status.provider)?.model ? status.model : '');
  const [enabled, setEnabled] = useState(status.configured ? status.enabled : true);
  const [masked, setMasked] = useState(status.masked);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [busy, startTransition] = useTransition();

  const p = PROVIDERS.find((x) => x.id === provider) ?? PROVIDERS[0];

  function save() {
    setMsg(null);
    startTransition(async () => {
      const r = await crmAiSave({ provider, apiKey, model, enabled });
      if (r.ok) {
        setMsg({ kind: 'ok', text: t.aiSaved });
        if (apiKey) { setMasked(`${apiKey.slice(0, 8)}…`); setApiKey(''); }
      } else {
        setMsg({ kind: 'err', text: r.error === 'key_required' ? t.aiKey : r.error === 'admin_only' ? t.aiAdminOnly : t.aiError });
      }
    });
  }

  function test() {
    setMsg(null);
    startTransition(async () => {
      const r = await crmAiTest();
      setMsg(r.ok ? { kind: 'ok', text: t.aiTestOk } : { kind: 'err', text: `${t.aiTestFail} (${r.error})` });
    });
  }

  if (!status.isAdmin) {
    return <div className="bg-surface border border-border rounded-2xl p-5"><p className="text-ink-secondary text-[14px]">{t.aiAdminOnly}</p></div>;
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-5 rise">
      {/* provider picker */}
      <div>
        <span className="block text-[13px] font-semibold text-ink-secondary mb-2">{t.aiProvider}</span>
        <div className="grid grid-cols-3 gap-2.5">
          {PROVIDERS.map((x) => (
            <button key={x.id} type="button" onClick={() => setProvider(x.id)}
              className={`glow-hover rounded-xl border p-3.5 text-center transition-colors ${
                provider === x.id ? 'border-brand/50 bg-brand/10 plug-glow-mint' : 'border-border bg-soft hover:border-border-strong'
              }`}>
              <span className={`block font-display font-extrabold text-[16px] ${provider === x.id ? 'text-brand-ink' : 'text-ink'}`}>{x.label}</span>
              <span className="block text-[11.5px] text-ink-muted mt-0.5">{x.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* key */}
      <div>
        <span className="block text-[13px] font-semibold text-ink-secondary mb-2">{t.aiKey}</span>
        <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} dir="ltr"
          placeholder={masked ? `${masked} · ${t.aiKeyKeep}` : p.hint} autoComplete="off"
          className="w-full bg-soft border border-border rounded-xl px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-brand/60" />
        <p className="text-[12px] text-ink-muted mt-1.5">{t.aiKeySecure}</p>
      </div>

      {/* model */}
      <div>
        <span className="block text-[13px] font-semibold text-ink-secondary mb-2">{t.aiModel}</span>
        <input type="text" value={model} onChange={(e) => setModel(e.target.value)} dir="ltr" placeholder={p.model}
          className="w-full bg-soft border border-border rounded-xl px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-brand/60" />
      </div>

      {/* enabled */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="size-[18px] accent-[var(--color-brand)]" />
        <span className="text-[14px] text-ink">{t.aiEnabled}</span>
      </label>

      <div className="flex items-center gap-3 flex-wrap">
        <button type="button" onClick={save} disabled={busy}
          className="cta-glow inline-flex items-center gap-2 bg-brand text-on-brand font-bold text-[14px] rounded-xl px-5 py-2.5 disabled:opacity-60">
          <Sparkles size={15} aria-hidden /> {busy ? t.aiWorking : t.aiSave}
        </button>
        {(masked || status.configured) && (
          <button type="button" onClick={test} disabled={busy}
            className="inline-flex items-center gap-2 border border-border text-ink-secondary hover:text-ink font-semibold text-[13.5px] rounded-xl px-4 py-2.5 disabled:opacity-60">
            {t.aiTest}
          </button>
        )}
        {msg && (
          <span className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${msg.kind === 'ok' ? 'text-brand-ink' : 'text-danger'}`}>
            {msg.kind === 'ok' ? <Check size={14} aria-hidden /> : <X size={14} aria-hidden />}{msg.text}
          </span>
        )}
      </div>
    </div>
  );
}
