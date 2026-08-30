import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';

export const revalidate = 300;

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(locale);
  return {
    title: t.testers.title,
    description: t.testers.metaDesc,
    alternates: { canonical: `/${locale}/testers` },
  };
}

type Prod = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  logo_url: string | null;
  status: string;
  beta_note: string | null;
};

export default async function TestersPage({ params }: { params: Params }) {
  const { locale } = await params;
  const t = getDict(locale);
  const dir = locale === 'en' ? 'ltr' : 'rtl';
  const supabase = await createClient();

  const { data } = await supabase
    .from('products')
    .select('id, name, slug, tagline, logo_url, status, beta_note')
    .eq('beta_enabled', true)
    .order('created_at', { ascending: false })
    .limit(60);

  const products = (data ?? []) as Prod[];

  return (
    <div dir={dir} className="max-w-[900px] mx-auto px-5 md:px-10 pt-12 pb-16">
      <span className="inline-flex items-center gap-2 text-[13px] text-brand font-semibold mb-3">
        <span className="w-2 h-2 rounded-full bg-brand animate-pulse" /> {t.testers.badge}
      </span>
      <h1 className="font-display text-[clamp(28px,5vw,42px)] font-extrabold tracking-tight">{t.testers.title}</h1>
      <p className="text-ink-secondary text-[16px] mt-3 mb-10 max-w-xl">{t.testers.subtitle}</p>

      {products.length === 0 ? (
        <p className="text-ink-muted text-[15px]">{t.testers.empty}</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-surface border border-border rounded-2xl p-5 flex flex-col">
              <div className="flex items-start gap-3">
                {p.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover border border-border shrink-0" />
                ) : (
                  <span className="w-12 h-12 rounded-xl bg-soft border border-border flex items-center justify-center font-extrabold text-ink-secondary shrink-0">{p.name.charAt(0).toUpperCase()}</span>
                )}
                <div className="min-w-0">
                  <span className="font-bold text-[16px]" dir="auto">{p.name}</span>
                  <p className="text-ink-secondary text-[14px]" dir="auto">{p.tagline}</p>
                </div>
              </div>
              {p.beta_note && <p className="text-ink text-[14px] mt-3 line-clamp-3" dir="auto">{p.beta_note}</p>}
              <Link
                href={`/${locale}/products/${p.slug}`}
                className="mt-4 bg-brand hover:bg-brand-hover text-bg font-semibold px-4 py-2.5 rounded-[10px] text-[14px] text-center transition-colors"
              >
                {t.testers.join}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
