import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Mail, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getDict, formatDate } from '@/lib/i18n';
import BecomeMakerPrompt from '@/components/BecomeMakerPrompt';

export const dynamic = 'force-dynamic';

type Campaign = {
  id: string;
  subject: string;
  segment: string;
  status: string;
  recipients: number;
  opens: number;
  clicks: number;
  created_at: string;
};

export default async function EmailCenterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getDict(locale);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .maybeSingle();
  if (profile?.user_type === 'consumer') {
    return (
      <div className="max-w-[680px] mx-auto px-5 md:px-10 pt-20 pb-10">
        <BecomeMakerPrompt path={`/${locale}/dashboard/email`} title={t.becomeMaker.title} text={t.becomeMaker.text} button={t.becomeMaker.button} />
      </div>
    );
  }

  const { data: campaigns } = await supabase
    .from('email_campaigns')
    .select('id, subject, segment, status, recipients, opens, clicks, created_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  const rows = (campaigns ?? []) as Campaign[];
  const statusLabel: Record<string, string> = {
    draft: t.email.statusDraft,
    sending: t.email.statusSending,
    sent: t.email.statusSent,
  };

  return (
    <div className="max-w-[900px] mx-auto px-5 md:px-10 pt-12 pb-10">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <h1 className="font-display text-[clamp(28px,5vw,40px)] font-extrabold tracking-tight flex items-center gap-2">
          <Mail size={28} className="text-brand" />
          {t.email.title}
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/dashboard/email/contacts`}
            className="border border-border hover:border-brand text-ink-secondary hover:text-ink font-semibold px-4 py-2.5 rounded-[10px] transition-colors"
          >
            {t.email.contacts}
          </Link>
          <Link
            href={`/${locale}/dashboard/email/new`}
            className="cta-glow bg-brand hover:bg-brand-hover text-bg font-bold px-5 py-2.5 rounded-[10px] flex items-center gap-2"
          >
            <Plus size={16} />
            {t.email.newCampaign}
          </Link>
        </div>
      </div>
      <p className="text-ink-secondary text-[15px] mb-8">{t.email.subtitle}</p>

      {rows.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-10 text-center">
          <p className="text-ink-secondary">{t.email.noCampaigns}</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-border rounded-2xl">
          <table className="w-full text-[14px] min-w-[560px]">
            <thead>
              <tr className="bg-soft text-ink-muted text-[12px] uppercase">
                <th className="text-start p-3 font-semibold">{t.email.subject}</th>
                <th className="text-start p-3 font-semibold">{t.email.status}</th>
                <th className="text-start p-3 font-semibold">{t.email.recipients}</th>
                <th className="text-start p-3 font-semibold">{t.email.opens}</th>
                <th className="text-start p-3 font-semibold">{t.email.clicks}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="font-semibold" dir="auto">{c.subject}</div>
                    <div className="text-ink-muted text-[12px] font-mono">{formatDate(c.created_at, locale)}</div>
                  </td>
                  <td className="p-3">
                    <span className={`text-[12px] font-semibold rounded-full px-2 py-0.5 ${c.status === 'sent' ? 'bg-brand/10 text-brand' : 'bg-soft text-ink-secondary border border-border'}`}>
                      {statusLabel[c.status] ?? c.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono">{c.recipients}</td>
                  <td className="p-3 font-mono">
                    {c.opens}
                    {c.recipients > 0 && (
                      <span className="text-ink-muted text-[12px] ms-1">
                        ({Math.round((c.opens / c.recipients) * 100)}%)
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-mono">
                    {c.clicks}
                    {c.recipients > 0 && (
                      <span className="text-ink-muted text-[12px] ms-1">
                        ({Math.round((c.clicks / c.recipients) * 100)}%)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
