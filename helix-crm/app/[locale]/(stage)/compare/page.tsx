import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getDict, formatDate, categoryName } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

type P = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  logo_url: string | null;
  website_url: string | null;
  status: string;
  launches: { votes_count: number; launch_date: string }[];
  product_categories: { categories: { name_he: string; name_en: string } | { name_he: string; name_en: string }[] }[];
};

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ids?: string }>;
}) {
  const { locale } = await params;
  const { ids } = await searchParams;
  const t = getDict(locale);

  const slugs = (ids ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  let products: P[] = [];
  const ratings = new Map<string, number>();

  if (slugs.length > 0) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from('products')
        .select(
          'id, name, slug, tagline, logo_url, website_url, status, launches(votes_count, launch_date), product_categories(categories(name_he, name_en))'
        )
        .in('slug', slugs);
      products = (data ?? []) as P[];
      // סדר לפי סדר הבחירה
      products.sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug));

      if (products.length > 0) {
        const { data: reviews } = await supabase
          .from('reviews')
          .select('product_id, rating')
          .in(
            'product_id',
            products.map((p) => p.id)
          );
        const agg = new Map<string, { sum: number; n: number }>();
        for (const r of (reviews ?? []) as { product_id: string; rating: number }[]) {
          const e = agg.get(r.product_id) ?? { sum: 0, n: 0 };
          e.sum += r.rating;
          e.n += 1;
          agg.set(r.product_id, e);
        }
        for (const [pid, e] of agg) ratings.set(pid, Math.round((e.sum / e.n) * 10) / 10);
      }
    } catch {
      // אין חיבור
    }
  }

  return (
    <div className="max-w-[1000px] mx-auto px-5 md:px-10 pt-12 pb-10">
      <h1 className="font-display text-[clamp(28px,5vw,40px)] font-extrabold tracking-tight mb-8">
        {t.compare.title}
      </h1>

      {products.length < 2 ? (
        <p className="text-ink-secondary">{t.compare.empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr>
                <th className="p-3"></th>
                {products.map((p) => (
                  <th key={p.id} className="p-3 text-start align-bottom min-w-[160px]">
                    <Link href={`/${locale}/products/${p.slug}`} className="flex flex-col gap-2">
                      {p.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.logo_url} alt="" className="w-12 h-12 rounded-xl border border-border object-cover" />
                      ) : (
                        <span className="w-12 h-12 rounded-xl bg-soft border border-border flex items-center justify-center text-lg font-extrabold text-ink-secondary">
                          {p.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="font-bold text-ink hover:text-brand transition-colors" dir="auto">
                        {p.name}
                      </span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: t.compare.tagline, render: (p: P) => p.tagline },
                {
                  label: t.compare.categories,
                  render: (p: P) =>
                    (p.product_categories ?? [])
                      .map((pc) => {
                        const c = Array.isArray(pc.categories) ? pc.categories[0] : pc.categories;
                        return c ? categoryName(c, locale) : '';
                      })
                      .filter(Boolean)
                      .join(', '),
                },
                { label: t.compare.votes, render: (p: P) => String(p.launches?.[0]?.votes_count ?? 0) },
                {
                  label: t.compare.rating,
                  render: (p: P) => (ratings.has(p.id) ? `⭐ ${ratings.get(p.id)}` : '—'),
                },
                { label: t.compare.status, render: (p: P) => t.statuses[p.status] },
                {
                  label: t.compare.published,
                  render: (p: P) => (p.launches?.[0] ? formatDate(p.launches[0].launch_date, locale) : '—'),
                },
              ].map((row, i) => (
                <tr key={row.label} className={i % 2 ? 'bg-surface/40' : ''}>
                  <td className="p-3 font-semibold text-ink-muted whitespace-nowrap align-top">{row.label}</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-3 align-top" dir="auto">
                      {row.render(p)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="p-3 font-semibold text-ink-muted align-top">{t.compare.website}</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 align-top">
                    {p.website_url ? (
                      <a
                        href={p.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand hover:text-brand-hover font-semibold"
                      >
                        {t.compare.visit} ↗
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
