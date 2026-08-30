'use client';

import { useState } from 'react';

// HELIX CHIEF — chat UI. Talks to /api/chief, renders the reply + the action
// trace (done / pending-approval / suggested) with approve-deny controls.
// Degrades to a friendly "coming soon" panel when the API key isn't set (503).

type Action = {
  agent: string;
  tool: string;
  input: Record<string, unknown>;
  status: 'done' | 'pending_approval' | 'suggested' | 'blocked_entitlement' | 'error';
  autonomy?: string;
  result?: unknown;
  error?: string;
};
type ChiefMsg = { role: 'user' | 'chief'; text: string; actions?: Action[] };

const STATUS_META: Record<Action['status'], { label: string; cls: string }> = {
  done: { label: 'בוצע', cls: 'bg-brand/15 text-brand' },
  pending_approval: { label: 'ממתין לאישור', cls: 'bg-amber-500/15 text-amber-400' },
  suggested: { label: 'הוצע', cls: 'bg-sky-500/15 text-sky-400' },
  blocked_entitlement: { label: 'דורש שדרוג', cls: 'bg-fuchsia-500/15 text-fuchsia-400' },
  error: { label: 'שגיאה', cls: 'bg-red-500/15 text-red-400' },
};

const SUGGESTIONS = [
  'מי הלקוחות הכי חמים שלי?',
  'תמצא ליד חם ותכין לו פולואפ',
  'הוסף ליד חדש: דנה כהן, dana@acme.co.il',
];

export default function ChiefChat({ locale }: { locale: string }) {
  const [msgs, setMsgs] = useState<ChiefMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);
  const [approved, setApproved] = useState<Record<string, boolean>>({});

  async function send(text: string) {
    const message = text.trim();
    if (!message || loading) return;
    setInput('');
    setMsgs((m) => [...m, { role: 'user', text: message }]);
    setLoading(true);
    try {
      const res = await fetch('/api/chief', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message, locale }),
      });
      if (res.status === 503) {
        setNotConfigured(true);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setMsgs((m) => [...m, { role: 'chief', text: `משהו השתבש (${data.error || res.status}).` }]);
        return;
      }
      setMsgs((m) => [...m, { role: 'chief', text: data.reply || '', actions: data.actions || [] }]);
    } catch {
      setMsgs((m) => [...m, { role: 'chief', text: 'לא הצלחתי להתחבר לשרת. נסה שוב.' }]);
    } finally {
      setLoading(false);
    }
  }

  if (notConfigured) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 px-6">
        <div className="text-5xl mb-4">🧠</div>
        <h2 className="font-display text-2xl font-black mb-3">HELIX CHIEF יופעל בקרוב</h2>
        <p className="text-ink-secondary leading-relaxed">
          המוח מוכן והמסך בנוי — נותר רק לחבר את מפתח ה-AI. ברגע שהוא יוגדר,
          תוכל לבקש מ-CHIEF למצוא לידים, לתאם פגישות ולנסח פולואפים ישירות מכאן.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4 py-8 px-4">
      {msgs.length === 0 && (
        <div className="text-center py-10">
          <div className="text-4xl mb-3">🧠</div>
          <h2 className="font-display text-xl font-black mb-2">שלום, אני HELIX CHIEF</h2>
          <p className="text-ink-secondary mb-6">בקש ממני משהו על הלקוחות שלך — אני אמצא, אכין, ואבצע בשליטתך.</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-[14px] border border-border rounded-full px-4 py-2 hover:border-brand hover:text-brand transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {msgs.map((m, i) => (
        <div key={i} className={m.role === 'user' ? 'self-end max-w-[85%]' : 'self-start w-full'}>
          <div
            className={
              m.role === 'user'
                ? 'bg-brand text-bg rounded-2xl rounded-br-sm px-4 py-2.5'
                : 'bg-white/5 border border-border rounded-2xl rounded-bl-sm px-4 py-3'
            }
          >
            {m.role === 'chief' && <div className="text-[11px] font-bold text-brand mb-1">HELIX CHIEF</div>}
            <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>

            {m.actions && m.actions.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                {m.actions.map((a, j) => {
                  const meta = STATUS_META[a.status];
                  const key = `${i}-${j}`;
                  return (
                    <div key={j} className="flex items-center gap-2 text-[13px] border-t border-border/60 pt-2">
                      <span className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-bold ${meta.cls}`}>
                        {meta.label}
                      </span>
                      <span className="text-ink-secondary truncate">
                        {a.agent} · {a.tool}
                      </span>
                      {a.status === 'pending_approval' && !approved[key] && (
                        <span className="mr-auto flex gap-1.5">
                          <button
                            onClick={() => setApproved((s) => ({ ...s, [key]: true }))}
                            className="bg-brand text-bg text-[12px] font-bold rounded px-2.5 py-1"
                          >
                            אישור
                          </button>
                          <button
                            onClick={() => setApproved((s) => ({ ...s, [key]: false, [`${key}-d`]: true }))}
                            className="border border-border text-[12px] rounded px-2.5 py-1"
                          >
                            דחייה
                          </button>
                        </span>
                      )}
                      {approved[key] && <span className="mr-auto text-[12px] text-brand">אושר · ביצוע בקרוב</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ))}

      {loading && <div className="self-start text-ink-secondary text-sm px-4">CHIEF חושב…</div>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-4 mt-2 flex gap-2 bg-bg/90 backdrop-blur-md p-2 rounded-2xl border border-border"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="בקש מ-HELIX CHIEF…"
          className="flex-1 bg-transparent px-3 py-2 outline-none text-[15px]"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-brand hover:bg-brand-hover disabled:opacity-40 text-bg font-bold px-5 py-2 rounded-xl"
        >
          שליחה
        </button>
      </form>
    </div>
  );
}
