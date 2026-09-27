import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict, isRtl, categoryName } from '@/lib/i18n';
import LaunchCard from '@/components/LaunchCard';
import CategoryCarousel from '@/components/CategoryCarousel';
import type { Top5Item } from '@/lib/top5';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = getDict(locale);
  const rtl = isRtl(locale);
  const supabase = await createClient();

  const { data: category } = await supabase
    .from('categories')
    .select('id, slug, name_he, name_en')
    .eq('slug', slug)
    .maybeSingle();
  if (!category) notFound();

  const { data: products } = await supabase
    .from('products')
    .select(
      `name, slug, tagline, logo_url, status,
       launches (id, votes_count, comments_count, launch_date),
       product_categories!inner (category_id)`
    )
    .eq('product_categories.category_id', category.id)
    .order('created_at', { ascending: false })
    .limit(60);

  const rows = (products ?? [])
    .map((p: Record<string, unknown>) => {
      const launches = (p.launches ?? []) as {
        id: string;
        votes_count: number;
        comments_count: number;
        launch_date: string;
      }[];
      return { product: p, launch: launches[0] ?? null };
    })
    .filter((r) => r.launch);

  const top5: Top5Item[] = [...rows]
    .sort((a, b) => (b.launch!.votes_count ?? 0) - (a.launch!.votes_count ?? 0))
    .slice(0, 5)
    .map((r) => {
      const p = r.product as {
        name: string;
        slug: string;
        tagline: string;
        logo_url: string | null;
        status: string;
      };
      return {
        launchId: r.launch!.id,
        votes: r.launch!.votes_count,
        name: p.name,
        slug: p.slug,
        tagline: p.tagline,
        logoUrl: p.logo_url,
        status: p.status,
      };
    });

  let votedIds = new Set<string>();
  let isLoggedIn = false;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    isLoggedIn = true;
    if (rows.length > 0) {
      const { data: votes } = await supabase
        .from('votes')
        .select('launch_id')
        .eq('user_id', user.id)
        .in(
          'launch_id',
          rows.map((r) => r.launch!.id)
        );
      votedIds = new Set((votes ?? []).map((v: { launch_id: string }) => v.launch_id));
    }
  }

  const path = `/${locale}/categories/${slug}`;

  return (
    <div className="max-w-[1280px] mx-auto px-5 md:px-10 pt-12 pb-10">
      <h1 className="font-display text-[clamp(28px,5vw,44px)] font-extrabold tracking-tight mb-10">
        {categoryName(category, locale)}
      </h1>

      {rows.length === 0 ? (
        <p className="text-ink-secondary">{t.categoriesPage.empty}</p>
      ) : (
        <>
          <section className="mb-14">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.15em] text-brand mb-5">
              {t.categoriesPage.top5}
            </h2>
            <CategoryCarousel
              locale={locale}
              rtl={rtl}
              items={top5}
              statuses={t.statuses}
              prevLabel={t.carousel.prev}
              nextLabel={t.carousel.next}
            />
          </section>

          <section className="max-w-[820px] mx-auto">
            <h2 className="font-display text-[20px] font-extrabold mb-5">
              {t.categoriesPage.allProducts}
            </h2>
            <div className="flex flex-col gap-3">
              {rows.map((r) => (
                <LaunchCard
                  key={r.launch!.id}
                  locale={locale}
                  path={path}
                  isLoggedIn={isLoggedIn}
                  hasVoted={votedIds.has(r.launch!.id)}
                  launch={r.launch!}
                  product={
                    r.product as {
                      name: string;
                      slug: string;
                      tagline: string;
                      logo_url: string | null;
                      status: string;
                    }
                  }
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
