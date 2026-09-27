import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';
import WaitlistForm from '@/components/WaitlistForm';
import BetaJoinButton from '@/components/BetaJoinButton';
import TrackView from '@/components/TrackView';
import VideoEmbed from '@/components/VideoEmbed';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const supabase = await createClient();
    const { data: p } = await supabase
      .from('products')
      .select('name, tagline, landing_headline, logo_url, landing_enabled')
      .eq('slug', slug)
      .maybeSingle();
    if (!p || !p.landing_enabled) return {};
    const title = p.landing_headline || `${p.name} — ${p.tagline}`;
    return {
      title,
      description: p.tagline,
      openGraph: { title, description: p.tagline, images: p.logo_url ? [p.logo_url] : [] },
    };
  } catch {
    return {};
  }
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = getDict(locale);
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select(
      'id, name, slug, tagline, description, logo_url, video_url, screenshots, landing_enabled, landing_headline, landing_subheadline, landing_cta, beta_enabled, beta_whatsapp_url, beta_note'
    )
    .eq('slug', slug)
    .maybeSingle();

  if (!product || !product.landing_enabled) notFound();

  const headline = product.landing_headline || product.name;
  const subheadline = product.landing_subheadline || product.tagline;
  const screenshots = (product.screenshots ?? []) as string[];

  return (
    <div className="max-w-[720px] mx-auto px-5 md:px-10 pt-16 pb-16 text-center">
      <TrackView productId={product.id} surface="landing" />

      {product.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.logo_url}
          alt=""
          className="w-20 h-20 rounded-2xl border border-border object-cover mx-auto mb-6"
        />
      ) : (
        <span className="w-20 h-20 rounded-2xl bg-soft border border-border flex items-center justify-center text-3xl font-extrabold text-ink-secondary mx-auto mb-6">
          {product.name.charAt(0).toUpperCase()}
        </span>
      )}

      <h1 className="font-display text-[clamp(30px,6vw,52px)] font-black tracking-tight leading-[1.05]" dir="auto">
        {headline}
      </h1>
      <p className="text-ink-secondary text-[18px] mt-4 max-w-lg mx-auto" dir="auto">
        {subheadline}
      </p>

      <div className="bg-surface border border-border rounded-2xl p-6 mt-10 text-start">
        <h2 className="font-bold text-[18px] mb-1">{product.landing_cta || t.landing.waitlistTitle}</h2>
        <p className="text-ink-secondary text-[14px] mb-4">{product.tagline}</p>
        <WaitlistForm
          productId={product.id}
          placeholder={t.product.emailPlaceholder}
          buttonLabel={product.landing_cta || t.landing.defaultCta}
          doneLabel={t.product.waitlistDone}
          shareBase={`${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://helix-stage.vercel.app'}/${locale}/products/${product.slug}`}
          refLabels={{
            position: t.product.waitlistPosition,
            boost: t.product.waitlistBoost,
            copy: t.product.waitlistCopy,
            copied: t.product.waitlistCopied,
          }}
        />
      </div>

      {product.beta_enabled && product.beta_whatsapp_url && (
        <div className="mt-6 text-start">
          <BetaJoinButton
            productId={product.id}
            whatsappUrl={product.beta_whatsapp_url}
            label={t.beta.join}
            note={product.beta_note}
          />
        </div>
      )}

      {product.video_url && (
        <div className="mt-10">
          <VideoEmbed url={product.video_url} />
        </div>
      )}

      {product.description && (
        <p className="text-[16px] leading-relaxed mt-10 whitespace-pre-line text-start" dir="auto">
          {product.description}
        </p>
      )}

      {screenshots.length > 0 && (
        <div className="mt-8 flex gap-4 overflow-x-auto pb-2">
          {screenshots.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={url}
              alt=""
              className="h-56 rounded-2xl border border-border object-cover shrink-0"
            />
          ))}
        </div>
      )}

      <div className="mt-12 text-[13px] text-ink-muted">
        <Link href={`/${locale}/products/${product.slug}`} className="hover:text-brand transition-colors">
          {product.name}
        </Link>
        {' · '}
        {t.landing.poweredBy}
      </div>
    </div>
  );
}
