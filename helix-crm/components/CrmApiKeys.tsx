'use client';

import { useState } from 'react';
import { crmCreateApiKey, crmRevokeApiKey } from '@/app/crm-actions';

// client-safe copy (crm-api.ts pulls in node:crypto — never import it here)
const API_SCOPES = ['contacts:read', 'contacts:write', 'deals:read', 'deals:write', 'activities:write'] as const;

type KeyRow = {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

type Dict = {
  apiTitle: string; apiSubtitle: string; apiCreate: string; apiName: string; apiNameHint: string;
  apiScopes: string; apiGenerate: string; apiSecretOnce: string; apiCopy: string; apiCopied: string;
  apiDone: string; apiKeys: string; apiNoKeys: string; apiLastUsed: string; apiNever: string;
  apiRevoke: string; apiRevoked: string; apiActive: string; onlyAdmin: string;
  apiBaseUrl: string; apiDocsHint: string;
};

const SCOPE_LABEL: Record<string, string> = {
  'contacts:read': 'contacts:read', 'contacts:write': 'contacts:write',
  'deals:read': 'deals:read', 'deals:write': 'deals:write', 'activities:write': 'activities:write',
};

export default function CrmApiKeys({
  locale, isAdmin, keys, baseUrl, t,
}: { locale: string; isAdmin: boolean; keys: KeyRow[]; baseUrl: string; t: Dict }) {
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<string[]>([...API_SCOPES]);
  const [busy, setBusy] = useState(false);
  const [fresh, setFresh] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const toggle = (s: string) =>
    setScopes((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const create = async () => {
    if (!name.trim() || !scopes.length || busy) return;
    setBusy(true);
    const res = await crmCreateApiKey({ locale, name: name.trim(), scopes });
    setBusy(false);
    if ('key' in res && res.key) {
      setFresh(res.key);
      setName('');
      setScopes([...API_SCOPES]);
    }
  };

  const copy = async () => {
    if (!fresh) return;
    try {
      await navigator.clipboard.writeText(fresh);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* noop */ }
  };

  const revoke = async (id: string) => {
    await crmRevokeApiKey({ locale, id });
  };

  return (
    <div className="space-y-8">
      {/* Base URL + הסבר */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <div className="text-[13px] text-ink-secondary mb-1">{t.apiBaseUrl}</div>
        <code className="block text-[13px] font-mono text-ink bg-bg border border-border rounded-lg px-3 py-2 overflow-x-auto" dir="ltr">
          {baseUrl}/api/v1/crm/&#123;contacts|deals|activities&#125;
        </code>
        <p className="text-[13px] text-ink-secondary mt-2" dir="ltr">
          Authorization: Bearer <span className="font-mono">hxk_live_…</span>
        </p>
        <p className="text-[13px] text-ink-secondary mt-1">{t.apiDocsHint}</p>
      </div>

      {/* מפתח טרי — מוצג פעם אחת */}
      {fresh && (
        <div className="border-2 border-brand/60 bg-brand/5 rounded-2xl p-5">
          <div className="text-[14px] font-semibold text-ink mb-1">{t.apiDone}</div>
          <p className="text-[13px] text-ink-secondary mb-3">{t.apiSecretOnce}</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[13px] font-mono bg-bg border border-border rounded-lg px-3 py-2 overflow-x-auto" dir="ltr">{fresh}</code>
            <button onClick={copy} className="shrink-0 bg-brand text-white text-[13px] font-semibold px-3 py-2 rounded-lg">
              {copied ? t.apiCopied : t.apiCopy}
            </button>
          </div>
        </div>
      )}

      {/* יצירה — admin בלבד */}
      {isAdmin ? (
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="text-[15px] font-bold mb-3">{t.apiCreate}</div>
          <label className="block text-[13px] text-ink-secondary mb-1">{t.apiName}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.apiNameHint}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-[14px] mb-4"
          />
          <div className="text-[13px] text-ink-secondary mb-2">{t.apiScopes}</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {API_SCOPES.map((s) => (
              <button
                key={s}
                onClick={() => toggle(s)}
                className={`text-[12px] font-mono px-3 py-1.5 rounded-full border transition-colors ${
                  scopes.includes(s) ? 'border-brand bg-brand/10 text-ink' : 'border-border text-ink-secondary'
                }`}
                dir="ltr"
              >
                {SCOPE_LABEL[s]}
              </button>
            ))}
          </div>
          <button
            onClick={create}
            disabled={busy || !name.trim() || !scopes.length}
            className="bg-brand text-white font-semibold px-5 py-2.5 rounded-[10px] disabled:opacity-50"
          >
            {t.apiGenerate}
          </button>
        </div>
      ) : (
        <p className="text-[14px] text-ink-secondary">{t.onlyAdmin}</p>
      )}

      {/* רשימת מפתחות */}
      <div>
        <div className="text-[15px] font-bold mb-3">{t.apiKeys}</div>
        {keys.length === 0 ? (
          <p className="text-[14px] text-ink-secondary">{t.apiNoKeys}</p>
        ) : (
          <div className="space-y-2">
            {keys.map((k) => (
              <div key={k.id} className="bg-surface border border-border rounded-xl p-3.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold text-ink">{k.name}</div>
                  <code className="text-[12px] font-mono text-ink-secondary" dir="ltr">{k.prefix}…</code>
                </div>
                <div className="flex flex-wrap gap-1">
                  {k.scopes.map((s) => (
                    <span key={s} className="text-[11px] font-mono text-ink-secondary bg-bg border border-border rounded px-1.5 py-0.5" dir="ltr">{s}</span>
                  ))}
                </div>
                <div className="text-[12px] text-ink-secondary ms-auto">
                  {t.apiLastUsed}: {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US') : t.apiNever}
                </div>
                {k.revoked_at ? (
                  <span className="text-[12px] text-red-500 font-semibold">{t.apiRevoked}</span>
                ) : isAdmin ? (
                  <button onClick={() => revoke(k.id)} className="text-[12px] text-red-500 hover:underline font-semibold">{t.apiRevoke}</button>
                ) : (
                  <span className="text-[12px] text-brand font-semibold">{t.apiActive}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
