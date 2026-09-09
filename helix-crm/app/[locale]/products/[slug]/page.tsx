import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getDict, formatDate, categoryName } from '@/lib/i18n';
import VoteButton from '@/components/VoteButton';
import CommentForm from '@/components/CommentForm';
import WaitlistForm from '@/components/WaitlistForm';
import ShareButtons from '@/components/ShareButtons';
import ReviewForm from '@/components/ReviewForm';
import StarRating from '@/components/StarRating';
import VerifiedBadge from '@/components/VerifiedBadge';
import BadgeEmbed from '@/components/BadgeEmbed';
import TrackView from '@/components/TrackView';
import BetaJoinButton from '@/components/BetaJoinButton';
import VideoEmbed from '@/components/VideoEmbed';
import PmfSurvey from '@/components/PmfSurvey';
import { toolSlug } from '@/lib/slugify';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://helix-stage.vercel.app';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const supabase = await createClient();
    const { data: product } = await supabase
      .from('products')
      .select('name, tagline, description, logo_url')
      .eq('slug', slug)
      .maybeSingle();
    if (!product) return {};
    const title = `${product.name} — ${product.tagline}`;
    const description = product.description?.slice(0, 160) ?? product.tagline;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: product.logo_url ? [product.logo_url] : [],
      },
      twitter: { card: 'summary_large_image', title, description },
    };
  } catch {
    return {};
  }
}

export default async function ProductPage({
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
      `id, name, slug, tagline, description, logo_url, website_url, video_url, status, owner_id, screenshots, alternative_to, beta_enabled, beta_whatsapp_url, beta_note,
       profiles (name, username, avatar_url),
       launches (id, launch_date, votes_count, comments_count),
       product_categories (categories (id, slug, name_he, name_en))`
    )
    .eq('slug', slug)
    .maybeSingle();

  if (!product) notFound();

  const screenshots = (product.screenshots ?? []) as string[];
  const alternativeTo = (product.alternative_to ?? []) as string[];

  const owner = Array.isArray(product.profiles) ? product.profiles[0] : product.profiles;
  const launch = (product.launches ?? [])[0] ?? null;
  const categories = (product.product_categories ?? [])
    .map((pc: { categories: unknown }) =>
      Array.isArray(pc.categories) ? pc.categories[0] : pc.categories
    )
    .filter(Boolean) as { id: number; slug: string; name_he: string; name_en: string }[];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(user);
  const isOwner = user?.id === product.owner_id;

  let hasVoted = false;
  let comments: {
    id: string;
    body: string;
    created_at: string;
    user_id: string;
    profiles: {
      name: string | null;
      username: string;
      avatar_url: string | null;
      is_verified: boolean;
    } | null;
  }[] = [];

  if (launch) {
    if (user) {
      const { data: vote } = await supabase
        .from('votes')
        .select('id')
        .eq('user_id', user.id)
        .eq('launch_id', launch.id)
        .maybeSingle();
      hasVoted = Boolean(vote);
    }
    const { data: rows } = await supabase
      .from('comments')
      .select('id, body, created_at, user_id, profiles (name, username, avatar_url, is_verified)')
      .eq('launch_id', launch.id)
      .order('created_at', { ascending: true });
    comments = (rows ?? []).map((c: Record<string, unknown>) => ({
      ...c,
      profiles: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles,
    })) as typeof comments;
  }

  // ביקורות ודירוגים
  type ReviewRow = {
    id: string;
    user_id: string;
    rating: number;
    pros: string | null;
    cons: string | null;
    body: string | null;
    created_at: string;
    profiles: {
      name: string | null;
      username: string;
      avatar_url: string | null;
      role_title: string | null;
      company: string | null;
      is_verified: boolean;
    } | null;
  };
  const { data: reviewRows } = await supabase
    .from('reviews')
    .select(
      'id, user_id, rating, pros, cons, body, created_at, profiles (name, username, avatar_url, role_title, company, is_verified)'
    )
    .eq('product_id', product.id)
    .order('created_at', { ascending: false });
  const reviews = (reviewRows ?? []).map((r: Record<string, unknown>) => ({
    ...r,
    profiles: Array.isArray(r.profiles) ? r.profiles[0] : r.profiles,
  })) as ReviewRow[];
  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : 0;
  const myReview = user ? reviews.find((r) => r.user_id === user.id) : undefined;

  let waitlistCount = 0;
  if (isOwner) {
    const { count } = await supabase
      .from('waitlist_signups')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', product.id);
    waitlistCount = count ?? 0;
  }

  const path = `/${locale}/products/${product.slug}`;
  const shareUrl = `${SITE_URL}${path}`;
  const isPreLaunch = product.status === 'pre_launch';
  const launchDate = launch ? new Date(launch.launch_date) : null;

  return (
    <div className="max-w-[820px] mx-auto px-5 md:px-10 pt-12 pb-10">
      <TrackView productId={product.id} surface="product" />
      <div className="flex items-start gap-5">
        {product.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.logo_url}
            alt={product.name}
            className="w-20 h-20 rounded-2xl border border-border object-cover shrink-0"
          />
        ) : (
          <span className="w-20 h-20 rounded-2xl bg-soft border border-border flex items-center justify-center text-3xl font-extrabold text-ink-secondary shrink-0">
            {product.name.charAt(0).toUpperCase()}
          </span>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[clamp(26px,4vw,36px)] font-extrabold tracking-tight" dir="auto">
              {product.name}
            </h1>
            <span className="text-[12px] font-semibold uppercase tracking-wide border border-border rounded-full px-2.5 py-1 text-ink-secondary">
              {t.statuses[product.status]}
            </span>
          </div>
          <p className="text-ink-secondary text-[17px] mt-1" dir="auto">
            {product.tagline}
          </p>
          {owner && (
            <p className="text-[14px] text-ink-muted mt-2">
              {t.product.by}{' '}
              <Link
                href={`/${locale}/profile/${owner.username}`}
                className="text-ink font-semibold hover:text-brand transition-colors"
              >
                {owner.name ?? owner.username}
              </Link>
              {launchDate && (
                <>
                  {' · '}
                  {t.product.publishedOn}
                  {'-'}
                  {formatDate(launchDate, locale)}
                </>
              )}
            </p>
          )}
        </div>

        {launch && (
          <VoteButton
            launchId={launch.id}
            votes={launch.votes_count}
            hasVoted={hasVoted}
            isLoggedIn={isLoggedIn}
            locale={locale}
            path={path}
          />
        )}
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/${locale}/categories/${c.slug}`}
              className="text-[13px] font-semibold border border-border rounded-full px-3 py-1 text-ink-secondary hover:border-brand hover:text-ink transition-colors"
            >
              {categoryName(c, locale)}
            </Link>
          ))}
        </div>
      )}

      {alternativeTo.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mt-6">
          <span className="text-[14px] text-ink-muted">{t.alternatives.onProduct}</span>
          {alternativeTo.map((name) => (
            <Link
              key={name}
              href={`/${locale}/alternatives/${toolSlug(name)}`}
              className="text-[13px] font-semibold bg-brand/10 text-brand rounded-full px-3 py-1 hover:bg-brand/20 transition-colors"
              dir="auto"
            >
              {name}
            </Link>
          ))}
        </div>
      )}

      {product.description && (
        <p className="text-[17px] leading-relaxed mt-8 whitespace-pre-line" dir="auto">
          {product.description}
        </p>
      )}

      {product.video_url && (
        <div className="mt-8">
          <VideoEmbed url={product.video_url} />
        </div>
      )}

      {screenshots.length > 0 && (
        <div className="mt-8 flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
          {screenshots.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={url}
              alt=""
              className="h-56 rounded-2xl border border-border object-cover shrink-0 snap-start"
            />
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-5">
        {isPreLaunch ? (
          <div className="bg-soft border border-border rounded-2xl p-6">
            <h2 className="font-bold text-[18px]">{t.product.waitlistTitle}</h2>
            <p className="text-ink-secondary text-[15px] mt-1 mb-4">{t.product.waitlistText}</p>
            <WaitlistForm
              productId={product.id}
              placeholder={t.product.emailPlaceholder}
              buttonLabel={t.product.waitlistButton}
              doneLabel={t.product.waitlistDone}
              shareBase={`${SITE_URL}/${locale}/products/${product.slug}`}
              refLabels={{
                position: t.product.waitlistPosition,
                boost: t.product.waitlistBoost,
                copy: t.product.waitlistCopy,
                copied: t.product.waitlistCopied,
              }}
            />
            {isOwner && (
              <p className="text-[13px] text-ink-muted mt-4">
                {waitlistCount} {t.product.waitlistCount}
              </p>
            )}
          </div>
        ) : (
          product.website_url && (
            <a
              href={product.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-bg font-bold px-6 py-3 rounded-[10px] transition-colors"
            >
              {t.product.visit}
              <ExternalLink size={16} />
            </a>
          )
        )}

        {product.beta_enabled && product.beta_whatsapp_url && (
          <BetaJoinButton
            productId={product.id}
            whatsappUrl={product.beta_whatsapp_url}
            label={t.beta.join}
            note={product.beta_note}
          />
        )}

        <div>
          <p className="text-[13px] font-semibold text-ink-muted mb-2">{t.product.share}</p>
          <ShareButtons
            url={shareUrl}
            title={`${product.name} — ${product.tagline}`}
            labels={t.share}
          />
        </div>

        {isOwner && (
          <BadgeEmbed siteUrl={SITE_URL} locale={locale} slug={product.slug} t={t.badge} />
        )}
      </div>

      {!isPreLaunch && (
        <section className="mt-14">
          <PmfSurvey productId={product.id} labels={t.pmf} />
        </section>
      )}

      <section className="mt-14">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <h2 className="font-extrabold text-[22px]">
            {t.reviews.title} ({reviews.length})
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <StarRating value={avgRating} size={18} />
              <span className="font-mono font-bold text-[15px]">{avgRating}</span>
            </div>
          )}
        </div>

        {isLoggedIn ? (
          <ReviewForm
            productId={product.id}
            path={path}
            t={t.reviews}
            initial={
              myReview
                ? {
                    rating: myReview.rating,
                    pros: myReview.pros ?? '',
                    cons: myReview.cons ?? '',
                    body: myReview.body ?? '',
                  }
                : undefined
            }
          />
        ) : (
          <Link
            href={`/${locale}/login`}
            className="inline-block text-brand hover:text-brand-hover font-semibold"
          >
            {t.reviews.loginToReview}
          </Link>
        )}

        <div className="flex flex-col gap-4 mt-8">
          {reviews.length === 0 && (
            <p className="text-ink-muted text-[15px]">{t.reviews.empty}</p>
          )}
          {reviews.map((r) => {
            const roleLine = [r.profiles?.role_title, r.profiles?.company]
              .filter(Boolean)
              .join(' · ');
            return (
              <div key={r.id} className="bg-surface border border-border rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {r.profiles?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.profiles.avatar_url}
                      alt=""
                      className="w-7 h-7 rounded-full border border-border"
                    />
                  ) : (
                    <span className="w-7 h-7 rounded-full bg-soft border border-border flex items-center justify-center text-[12px] font-bold">
                      {(r.profiles?.name ?? '?').charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="font-semibold text-[14px]">
                    {r.profiles?.name ?? r.profiles?.username}
                  </span>
                  {r.profiles?.is_verified && <VerifiedBadge label={t.reviews.verified} />}
                  <StarRating value={r.rating} size={14} />
                  <span className="text-[12px] text-ink-muted ms-auto">
                    {formatDate(r.created_at, locale)}
                  </span>
                </div>
                {roleLine && <p className="text-[12px] text-ink-muted mb-2">{roleLine}</p>}
                {(r.pros || r.cons) && (
                  <div className="grid sm:grid-cols-2 gap-2 mb-2 text-[14px]">
                    {r.pros && (
                      <p className="text-ink-secondary">
                        <span className="text-brand font-semibold">+ {t.reviews.prosLabel}: </span>
                        {r.pros}
                      </p>
                    )}
                    {r.cons && (
                      <p className="text-ink-secondary">
                        <span className="text-ink-muted font-semibold">− {t.reviews.consLabel}: </span>
                        {r.cons}
                      </p>
                    )}
                  </div>
                )}
                {r.body && (
                  <p className="text-[15px] leading-relaxed whitespace-pre-line" dir="auto">
                    {r.body}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {launch && (
        <section className="mt-14">
          <h2 className="font-extrabold text-[22px] mb-6">
            {t.product.comments} ({comments.length})
          </h2>

          {isLoggedIn ? (
            <CommentForm
              launchId={launch.id}
              path={path}
              placeholder={t.product.commentPlaceholder}
              sendLabel={t.product.send}
            />
          ) : (
            <Link
              href={`/${locale}/login`}
              className="inline-block text-brand hover:text-brand-hover font-semibold"
            >
              {t.product.loginToComment}
            </Link>
          )}

          <div className="flex flex-col gap-4 mt-8">
            {comments.length === 0 && (
              <p className="text-ink-muted text-[15px]">{t.product.noComments}</p>
            )}
            {comments.map((c) => {
              const isMaker = c.user_id === product.owner_id;
              return (
                <div key={c.id} className="bg-surface border border-border rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {c.profiles?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.profiles.avatar_url}
                        alt=""
                        className="w-7 h-7 rounded-full border border-border"
                      />
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-soft border border-border flex items-center justify-center text-[12px] font-bold">
                        {(c.profiles?.name ?? '?').charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="font-semibold text-[14px]">
                      {c.profiles?.name ?? c.profiles?.username}
                    </span>
                    {isMaker && (
                      <span className="text-[11px] font-bold uppercase tracking-wide bg-brand/10 text-brand rounded-full px-2 py-0.5">
                        {t.product.maker}
                      </span>
                    )}
                    {c.profiles?.is_verified && <VerifiedBadge label={t.reviews.verified} />}
                    <span className="text-[12px] text-ink-muted ms-auto">
                      {formatDate(c.created_at, locale)}
                    </span>
                  </div>
                  <p className="text-[15px] leading-relaxed whitespace-pre-line" dir="auto">
                    {c.body}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
