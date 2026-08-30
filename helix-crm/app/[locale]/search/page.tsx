import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';
import LaunchCard from '@/components/LaunchCard';
import SearchBox from '@/components/SearchBox';

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

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  const t = getDict(locale);
  const query = (q ?? '').trim();

  let launches: LaunchRow[] = [];
  let votedIds = new Set<string>();
  let isLoggedIn = false;

  if (query) {
    try {
      const supabase = await createClient();
      const escaped = query.replace(/[%_]/g, '\\$&');
      const { data: products } = await supabase
        .from('products')
        .select(
          'slug, name, tagline, logo_url, status, launches(id, votes_count, comments_count, launch_date)'
        )
        .or(`name.ilike.%${escaped}%,tagline.ilike.%${escaped}%`)
        .limit(40);

      launches = (products ?? [])
        .map((p: Record<string, unknown>) => {
          const l = ((p.launches ?? []) as LaunchRow[])[0];
          if (!l) return null;
          return {
            id: l.id,
            votes_count: l.votes_count,
            comments_count: l.comments_count,
            launch_date: l.launch_date,
            products: {
              name: p.name as string,
              slug: p.slug as string,
              tagline: p.tagline as string,
              logo_url: p.logo_url as string | null,
              status: p.status as string,
            },
          };
        })
        .filter(Boolean) as LaunchRow[];

      launches.sort((a, b) => b.votes_count - a.votes_count);

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
  }

  const path = `/${locale}/search?q=${encodeURIComponent(query)}`;

  return (
    <div className="max-w-[820px] mx-auto px-5 md:px-10 pt-12 pb-10">
      <h1 className="font-display text-[clamp(28px,5vw,40px)] font-extrabold tracking-tight mb-6">
        {t.search.title}
      </h1>
      <SearchBox
        locale={locale}
        placeholder={t.search.placeholder}
        buttonLabel={t.search.button}
        initial={query}
      />

      {query && (
        <p className="text-ink-muted text-[14px] mt-6 mb-4">
          {launches.length} {t.search.results} “{query}”
        </p>
      )}

      {query && launches.length === 0 ? (
        <p className="text-ink-secondary mt-6">{t.search.empty}</p>
      ) : (
        <div className="flex flex-col gap-3 mt-2">
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

      {!query && (
        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            href={`/${locale}/categories`}
            className="text-brand hover:text-brand-hover font-semibold text-[15px]"
          >
            {t.nav.categories} ←
          </Link>
        </div>
      )}
    </div>
  );
}
