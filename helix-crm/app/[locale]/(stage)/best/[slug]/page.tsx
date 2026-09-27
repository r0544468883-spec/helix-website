import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getDict, categoryName } from '@/lib/i18n';

export const revalidate = 3600;

type Params = Promise<{ locale: string; slug: string }>;

async function getCategory(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('categories')
    .select('id, slug, name_he, name_en')
    .eq('slug', slug)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = getDict(locale);
  const cat = await getCategory(slug);
  if (!cat) return { title: 'HELIX STAGE' };
  const name = categoryName(cat, locale);
  const title = t.best.title.replace('{cat}', name);
  return {
    title,
    description: t.best.metaDesc.replace('{cat}', name),
    alternates: { canonical: `/${locale}/best/${slug}` },
    openGraph: { title, description: t.best.metaDesc.replace('{cat}', name), type: 'website' },
  };
}

type Prod = { id: string; name: string; slug: string; tagline: string; logo_url: string | null; votes: number };

export default async function BestPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const t = getDict(locale);
  const dir = locale === 'en' ? 'ltr' : 'rtl';
  const supabase = await createClient();

  const cat = await getCategory(slug);
  if (!cat) notFound();
  const name = categoryName(cat, locale);

  const { data: pcs } = await supabase
    .from('product_categories')
    .select('products (id, name, slug, tagline, logo_url, launches (votes_count))')
    .eq('category_id', cat.id);

  const products: Prod[] = (pcs ?? [])
    .map((pc: Record<string, unknown>) => {
      const p = (Array.isArray(pc.products) ? pc.products[0] : pc.products) as {
        id: string; name: string; slug: string; tagline: string; logo_url: string | null;
        launches: { votes_count: number }[] | null;
      } | null;
      if (!p) return null;
      const votes = (p.launches ?? []).reduce((a, l) => a + (l.votes_count ?? 0), 0);
      return { id: p.id, name: p.name, slug: p.slug, tagline: p.tagline, logo_url: p.logo_url, votes };
    })
    .filter((p): p is Prod => !!p)
    .sort((a, b) => b.votes - a.votes);

  return (
    <div dir={dir} className="max-w-[760px] mx-auto px-5 md:px-10 pt-12 pb-16">
      <p className="text-brand text-[13px] font-semibold mb-2">
        <Link href={`/${locale}/categories`} className="hover:underline">{t.best.crumb}</Link>
      </p>
      <h1 className="font-display text-[clamp(26px,5vw,40px)] font-extrabold tracking-tight">
        {t.best.title.replace('{cat}', name)}
      </h1>
      <p className="text-ink-secondary text-[16px] mt-3 mb-10 max-w-xl">
        {t.best.intro.replace('{cat}', name).replace('{n}', String(products.length))}
      </p>

      {products.length === 0 ? (
        <p className="text-ink-muted text-[15px]">{t.best.empty}</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {products.map((p, i) => (
            <li key={p.id}>
              <Link
                href={`/${locale}/products/${p.slug}`}
                className="flex items-center gap-4 bg-surface border border-border hover:border-brand rounded-2xl p-4 transition-colors"
              >
                <span className="font-mono font-extrabold text-[20px] text-ink-muted w-8 shrink-0 text-center">{i + 1}</span>
                {p.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover border border-border shrink-0" />
                ) : (
                  <span className="w-12 h-12 rounded-xl bg-soft border border-border flex items-center justify-center font-extrabold text-ink-secondary shrink-0">{p.name.charAt(0).toUpperCase()}</span>
                )}
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-[16px]" dir="auto">{p.name}</span>
                  <p className="text-ink-secondary text-[14px] truncate" dir="auto">{p.tagline}</p>
                </div>
                <span className="font-mono text-brand font-bold text-[14px] shrink-0">▲ {p.votes}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
