import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://helix-stage.vercel.app';

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: p } = await supabase.from('products').select('name, tagline, logo_url').eq('slug', slug).maybeSingle();
  if (!p) return { title: 'One-Pager' };
  return {
    title: `${p.name} — ${p.tagline}`,
    description: p.tagline,
    openGraph: { title: p.name, description: p.tagline, images: p.logo_url ? [p.logo_url] : [] },
  };
}

export default async function OnePagerPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const t = getDict(locale);
  const dir = locale === 'en' ? 'ltr' : 'rtl';
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select(
      `id, name, slug, tagline, description, logo_url, website_url, screenshots, status,
       profiles!products_owner_id_fkey (name, username, avatar_url, role_title, company, linkedin_url)`
    )
    .eq('slug', slug)
    .maybeSingle();

  if (!product) notFound();

  const owner = (Array.isArray(product.profiles) ? product.profiles[0] : product.profiles) as {
    name: string | null;
    username: string | null;
    role_title: string | null;
    company: string | null;
    linkedin_url: string | null;
  } | null;
  const shots = (product.screenshots ?? []) as string[];
  const op = t.onepager;

  return (
    <div dir={dir} className="max-w-[760px] mx-auto px-6 md:px-10 py-14">
      {/* hero */}
      <div className="text-center">
        {product.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.logo_url} alt="" className="w-20 h-20 rounded-3xl object-cover border border-border mx-auto mb-5" />
        )}
        <h1 className="font-display text-[clamp(30px,6vw,48px)] font-extrabold tracking-tight">{product.name}</h1>
        <p className="text-ink-secondary text-[clamp(16px,3vw,20px)] mt-3 max-w-xl mx-auto">{product.tagline}</p>
        <div className="flex items-center gap-3 justify-center mt-6 flex-wrap">
          {product.website_url && (
            <a href={product.website_url} target="_blank" rel="noopener noreferrer" className="bg-brand hover:bg-brand-hover text-bg font-bold px-6 py-3 rounded-[12px] transition-colors">
              {op.visit}
            </a>
          )}
          <Link href={`/${locale}/products/${product.slug}`} className="border border-border hover:border-brand text-ink-secondary hover:text-ink font-semibold px-6 py-3 rounded-[12px] transition-colors">
            {op.onStage}
          </Link>
        </div>
      </div>

      {/* description / pitch */}
      {product.description && (
        <div className="mt-14">
          <p className="text-ink text-[clamp(16px,3vw,19px)] leading-relaxed whitespace-pre-line text-center max-w-2xl mx-auto">
            {product.description}
          </p>
        </div>
      )}

      {/* screenshots */}
      {shots.length > 0 && (
        <div className="mt-14 grid gap-4">
          {shots.slice(0, 3).map((s, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={s} alt="" className="w-full rounded-2xl border border-border" />
          ))}
        </div>
      )}

      {/* founder */}
      {owner && (
        <div className="mt-14 text-center">
          <p className="text-[13px] text-ink-muted uppercase tracking-wide mb-2">{op.by}</p>
          <p className="font-bold text-[18px]">{owner.name ?? owner.username}</p>
          {(owner.role_title || owner.company) && (
            <p className="text-ink-secondary text-[14px]">{[owner.role_title, owner.company].filter(Boolean).join(' · ')}</p>
          )}
          {owner.linkedin_url && (
            <a href={owner.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-brand text-[14px] font-semibold mt-1 inline-block">LinkedIn ↗</a>
          )}
        </div>
      )}

      {/* footer */}
      <div className="mt-16 pt-6 border-t border-border text-center">
        <p className="font-display font-extrabold text-[15px]">HELIX STAGE<span className="text-brand">.</span></p>
        <p className="text-ink-muted text-[12px] mt-1" dir="ltr">{SITE_URL.replace(/^https?:\/\//, '')}/{locale}/onepager/{product.slug}</p>
      </div>
    </div>
  );
}
