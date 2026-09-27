import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict, formatDate } from '@/lib/i18n';
import DashboardProductRow from '@/components/DashboardProductRow';
import BecomeMakerPrompt from '@/components/BecomeMakerPrompt';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://helix-stage.vercel.app';

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  logo_url: string | null;
  status: string;
  launches: { id: string; launch_date: string; votes_count: number; comments_count: number }[];
  waitlist_signups: { email: string }[];
};

export default async function DashboardPage({
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
        <BecomeMakerPrompt
          path={`/${locale}/dashboard`}
          title={t.becomeMaker.title}
          text={t.becomeMaker.text}
          button={t.becomeMaker.button}
        />
      </div>
    );
  }

  const { data: products } = await supabase
    .from('products')
    .select(
      `id, name, slug, tagline, logo_url, status, created_at,
       launches (id, launch_date, votes_count, comments_count),
       waitlist_signups (email)`
    )
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  const rows = (products ?? []) as unknown as ProductRow[];

  const totals = rows.reduce(
    (acc, p) => {
      const launch = p.launches?.[0];
      acc.votes += launch?.votes_count ?? 0;
      acc.comments += launch?.comments_count ?? 0;
      acc.waitlist += p.waitlist_signups?.length ?? 0;
      return acc;
    },
    { votes: 0, comments: 0, waitlist: 0 }
  );

  return (
    <div className="max-w-[900px] mx-auto px-5 md:px-10 pt-12 pb-10">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
        <h1 className="font-display text-[clamp(28px,5vw,40px)] font-extrabold tracking-tight">
          {t.dashboard.title}
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/dashboard/crm`}
            className="border border-border hover:border-brand text-ink-secondary hover:text-ink font-semibold px-4 py-2.5 rounded-[10px] transition-colors"
          >
            CRM
          </Link>
          <Link
            href={`/${locale}/dashboard/email`}
            className="border border-border hover:border-brand text-ink-secondary hover:text-ink font-semibold px-4 py-2.5 rounded-[10px] transition-colors"
          >
            {t.email.navLabel}
          </Link>
          <Link
            href={`/${locale}/submit`}
            className="bg-brand hover:bg-brand-hover text-bg font-bold px-5 py-2.5 rounded-[10px] transition-colors"
          >
            {t.dashboard.newProduct}
          </Link>
        </div>
      </div>
      <p className="text-ink-secondary text-[15px] mb-8">{t.dashboard.subtitle}</p>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: t.dashboard.totalVotes, value: totals.votes },
          { label: t.dashboard.totalComments, value: totals.comments },
          { label: t.dashboard.totalWaitlist, value: totals.waitlist },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface border border-border rounded-2xl p-5 text-center">
            <div className="font-mono text-[26px] font-bold text-brand">{value}</div>
            <div className="text-[13px] text-ink-secondary mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* HELIX Guard — post-connection unlock: security + accessibility scan for AI-built products */}
      <div className="bg-surface border border-border rounded-2xl p-5 mb-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="font-display font-extrabold text-[17px] flex items-center gap-2">
            🛡️ HELIX Guard
            <span className="text-[11px] font-semibold bg-brand/15 text-brand px-2 py-0.5 rounded-full">
              {locale === 'en' ? 'Coming soon' : 'בקרוב'}
            </span>
          </div>
          <p className="text-[13px] text-ink-secondary mt-1 max-w-[520px]">
            {locale === 'en'
              ? 'Built your product with AI? Scan your code for security holes (RLS, secrets, IDOR) and Israeli accessibility (ת״י 5568) — with paste-ready fixes.'
              : 'בניתם עם AI? סרקו את הקוד לחורי אבטחה (RLS, secrets, IDOR) ולנגישות (ת״י 5568) — עם תיקונים מוכנים להדבקה.'}
          </p>
        </div>
        <Link
          href={`/${locale}/early`}
          className="shrink-0 border border-brand text-brand hover:bg-brand hover:text-bg font-semibold px-4 py-2 rounded-[10px] transition-colors text-[14px]"
        >
          {locale === 'en' ? 'Join the list' : 'הצטרפו לרשימה'}
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-10 text-center">
          <p className="text-ink-secondary text-[16px]">{t.dashboard.empty}</p>
          <Link
            href={`/${locale}/submit`}
            className="inline-block mt-4 bg-brand hover:bg-brand-hover text-bg font-semibold px-5 py-2.5 rounded-[10px] transition-colors"
          >
            {t.dashboard.emptyCta}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((p) => {
            const launch = p.launches?.[0];
            return (
              <DashboardProductRow
                key={p.id}
                locale={locale}
                shareUrl={`${SITE_URL}/${locale}/products/${p.slug}`}
                labels={t.dashboard}
                shareLabels={t.share}
                statuses={t.statuses}
                publishedDate={launch ? formatDate(launch.launch_date, locale) : ''}
                product={p}
                stats={{
                  votes: launch?.votes_count ?? 0,
                  comments: launch?.comments_count ?? 0,
                }}
                waitlistEmails={(p.waitlist_signups ?? []).map((w) => w.email)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
