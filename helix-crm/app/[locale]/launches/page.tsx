import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';
import LaunchCard from '@/components/LaunchCard';

export const dynamic = 'force-dynamic';

type LaunchRow = {
  id: string;
  votes_count: number;
  comments_count: number;
  launch_date: string;
  products: {
    name: string;
    slug: string;
    tagline: string;
    logo_url: string | null;
    status: string;
  };
};

export default async function LaunchesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { locale } = await params;
  const { t: tabParam } = await searchParams;
  const tab: 'new' | 'top' = tabParam === 'top' ? 'top' : 'new';
  const t = getDict(locale);

  let launches: LaunchRow[] = [];
  let votedIds = new Set<string>();
  let isLoggedIn = false;

  try {
    const supabase = await createClient();
    let query = supabase
      .from('launches')
      .select(
        'id, votes_count, comments_count, launch_date, products!inner(name, slug, tagline, logo_url, status)'
      );

    if (tab === 'top') {
      query = query.order('votes_count', { ascending: false });
    } else {
      query = query.order('launch_date', { ascending: false }).order('created_at', {
        ascending: false,
      });
    }

    const { data } = await query.limit(60);
    launches = (data ?? []).map((l: Record<string, unknown>) => ({
      ...l,
      products: Array.isArray(l.products) ? l.products[0] : l.products,
    })) as LaunchRow[];

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      isLoggedIn = true;
      if (launches.length > 0) {
        const { data: votes } = await supabase
          .from('votes')
          .select('launch_id')
          .eq('user_id', user.id)
          .in(
            'launch_id',
            launches.map((l) => l.id)
          );
        votedIds = new Set((votes ?? []).map((v: { launch_id: string }) => v.launch_id));
      }
    }
  } catch {
    // אין חיבור עדיין
  }

  const path = tab === 'new' ? `/${locale}/launches` : `/${locale}/launches?t=top`;
  const tabs: { key: 'new' | 'top'; label: string }[] = [
    { key: 'new', label: t.feed.newest },
    { key: 'top', label: t.feed.top },
  ];

  return (
    <div className="max-w-[820px] mx-auto px-5 md:px-10 pt-12 pb-10">
      <h1 className="font-display text-[clamp(28px,5vw,44px)] font-extrabold tracking-tight mb-8">
        {t.feed.title}
      </h1>

      <div className="flex gap-2 mb-6">
        {tabs.map(({ key, label }) => (
          <Link
            key={key}
            href={key === 'new' ? `/${locale}/launches` : `/${locale}/launches?t=top`}
            className={`px-4 py-2 rounded-full text-[14px] font-semibold border transition-colors ${
              tab === key
                ? 'bg-ink text-bg border-ink'
                : 'bg-surface border-border text-ink-secondary hover:border-border-strong'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {launches.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-10 text-center">
          <p className="text-ink-secondary text-[16px]">{t.feed.empty}</p>
          <Link
            href={`/${locale}/submit`}
            className="inline-block mt-4 bg-brand hover:bg-brand-hover text-bg font-semibold px-5 py-2.5 rounded-[10px] transition-colors"
          >
            {t.feed.emptyCta}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3 pb-10">
          {launches.map((l) => (
            <LaunchCard
              key={l.id}
              locale={locale}
              path={path}
              isLoggedIn={isLoggedIn}
              hasVoted={votedIds.has(l.id)}
              launch={l}
              product={l.products}
            />
          ))}
        </div>
      )}
    </div>
  );
}
