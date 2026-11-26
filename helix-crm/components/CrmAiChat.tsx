'use client';

import { useRef, useState, useTransition } from 'react';
import { Send, Sparkles, Mail, Play } from 'lucide-react';
import { crmAiChat, crmAiWeekly, type ChatMsg } from '@/app/crm-ai-actions';
import { getDict } from '@/lib/i18n';

/** The whole-CRM AI surfaces on the AI screen: free chat ("מי שווה לחזור אליו
 *  היום?") and the weekly summary (run now / run + email me). BYOK — runs on the
 *  workspace's own key. */
export default function CrmAiChat({ locale }: { locale: string }) {
  const t = getDict(locale).crm;
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [err, setErr] = useState('');
  const [busy, startTransition] = useTransition();
  const [weekly, setWeekly] = useState('');
  const [weeklyNote, setWeeklyNote] = useState('');
  const [weeklyBusy, startWeekly] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);

  function send() {
    const q = input.trim();
    if (!q || busy) return;
    const next: ChatMsg[] = [...msgs, { role: 'user', content: q }];
    setMsgs(next); setInput(''); setErr('');
    startTransition(async () => {
      const r = await crmAiChat(next);
      if (r.ok) setMsgs([...next, { role: 'assistant', content: r.text }]);
      else setErr(`${t.aiError} (${r.error})`);
      requestAnimationFrame(() => listRef.current?.scrollTo({ top: 1e6, behavior: 'smooth' }));
    });
  }

  function runWeekly(sendMail: boolean) {
    setWeeklyNote(''); setErr('');
    startWeekly(async () => {
      const r = await crmAiWeekly(sendMail);
      if (r.ok) { setWeekly(r.text); if (r.sent) setWeeklyNote(t.aiWeeklySent); }
      else setErr(`${t.aiError} (${r.error})`);
    });
  }

  return (
    <div className="grid gap-4">
      {/* Chat */}
      <div className="bg-surface border border-border rounded-2xl p-5 rise" style={{ ['--d' as string]: '140ms' }}>
        <h2 className="font-display text-[15px] font-extrabold mb-1">{t.aiChatTitle}</h2>
        <p className="text-[12.5px] text-ink-muted mb-4">{t.aiChatSub}</p>

        {msgs.length > 0 && (
          <div ref={listRef} className="flex flex-col gap-2.5 max-h-[340px] overflow-y-auto mb-4 pe-1">
            {msgs.map((m, i) => (
              <div key={i} className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-line ${
                m.role === 'user' ? 'self-start bg-brand/10 text-ink' : 'self-end bg-soft border border-border text-ink-secondary'
              }`} dir="auto">{m.content}</div>
            ))}
            {busy && <div className="self-end text-[12.5px] text-ink-muted">{t.aiWorking}</div>}
          </div>
        )}

        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={t.aiChatPlaceholder} dir="auto"
            className="flex-1 bg-soft border border-border rounded-xl px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-brand/60" />
          <button type="button" onClick={send} disabled={busy || !input.trim()}
            aria-label={t.aiChatSend}
            className="cta-glow grid place-items-center size-[42px] rounded-xl bg-brand text-on-brand disabled:opacity-50">
            <Send size={17} aria-hidden className="rtl:-scale-x-100" />
          </button>
        </div>
        {err && <p className="mt-2.5 text-[13px] text-danger">{err}</p>}
      </div>

      {/* Weekly summary */}
      <div className="bg-surface border border-border rounded-2xl p-5 rise" style={{ ['--d' as string]: '200ms' }}>
        <h2 className="font-display text-[15px] font-extrabold mb-1">{t.aiWeeklyTitle}</h2>
        <p className="text-[12.5px] text-ink-muted mb-4">{t.aiWeeklySub}</p>
        <div className="flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={() => runWeekly(false)} disabled={weeklyBusy}
            className="glow-hover inline-flex items-center gap-1.5 border border-border bg-soft text-ink-secondary hover:text-ink font-semibold text-[13px] rounded-xl px-3.5 py-2 disabled:opacity-60">
            <Play size={14} aria-hidden /> {weeklyBusy ? t.aiWorking : t.aiWeeklyRun}
          </button>
          <button type="button" onClick={() => runWeekly(true)} disabled={weeklyBusy}
            className="glow-hover inline-flex items-center gap-1.5 border border-brand/30 bg-brand/10 text-brand-ink font-semibold text-[13px] rounded-xl px-3.5 py-2 disabled:opacity-60">
            <Mail size={14} aria-hidden /> {t.aiWeeklySend}
          </button>
          {weeklyNote && <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-ink"><Sparkles size={13} aria-hidden /> {weeklyNote}</span>}
        </div>
        {weekly && (
          <div className="mt-4 bg-soft border border-border rounded-xl p-4">
            <p className="text-[14px] text-ink whitespace-pre-line leading-relaxed" dir="auto">{weekly}</p>
          </div>
        )}
      </div>
    </div>
  );
}
