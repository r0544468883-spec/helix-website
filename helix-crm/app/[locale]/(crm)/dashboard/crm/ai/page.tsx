import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';
import { getWorkspace } from '@/lib/crm-workspace';
import { getAiSettings, maskKey, defaultModelFor, type AiProvider } from '@/lib/crm-ai';
import CrmAiSettings from '@/components/CrmAiSettings';
import CrmAiChat from '@/components/CrmAiChat';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string }>;

export default async function CrmAiPage({ params }: { params: Params }) {
  const { locale } = await params;
  const t = getDict(locale).crm;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);
  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  if (!ws) {
    return <div className="max-w-[680px] mx-auto px-5 md:px-10 pt-20 text-center"><p className="text-ink-secondary">{t.setupPending}</p></div>;
  }

  const s = await getAiSettings(ws.workspaceId);
  const provider = (s?.provider ?? 'anthropic') as AiProvider;
  const status = {
    configured: !!s,
    enabled: s?.enabled ?? false,
    provider,
    model: s?.model || defaultModelFor(provider),
    masked: s ? maskKey(s.api_key) : null,
    isAdmin: ws.role === 'admin',
  };

  return (
    <div className="plug-ambient">
      <div className="max-w-[680px] mx-auto px-5 md:px-10 pt-8 md:pt-10 pb-20">
        <h1 className="font-display text-[26px] md:text-[30px] font-extrabold tracking-tight"><span className="plug-gradient-text">{t.aiTitle}</span></h1>
        <p className="text-[14px] text-ink-secondary mt-1.5 mb-7">{t.aiSubtitle}</p>

        <CrmAiSettings locale={locale} status={status} />

        {/* The whole-CRM AI surfaces, once a key is connected and enabled. */}
        {status.configured && status.enabled && (
          <div className="mt-4">
            <CrmAiChat locale={locale} />
          </div>
        )}

        <div className="bg-surface border border-border rounded-2xl p-5 mt-4 rise" style={{ ['--d' as string]: '80ms' }}>
          <h2 className="font-display text-[15px] font-extrabold mb-3">{t.aiWhat}</h2>
          <ul className="flex flex-col gap-2 text-[13.5px] text-ink-secondary">
            <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-brand shrink-0" />{t.aiWhat1}</li>
            <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-brand shrink-0" />{t.aiWhat2}</li>
            <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-brand shrink-0" />{t.aiWhat3}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
