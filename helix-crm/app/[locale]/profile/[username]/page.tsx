import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Pencil, Linkedin, Globe } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getDict, formatDate } from '@/lib/i18n';
import LaunchCard from '@/components/LaunchCard';
import VerifiedBadge from '@/components/VerifiedBadge';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale, username } = await params;
  const t = getDict(locale);
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, username, avatar_url, role_title, company, bio, linkedin_url, website_url, is_verified, created_at')
    .eq('username', username)
    .maybeSingle();
  if (!profile) notFound();

  const { data: products } = await supabase
    .from('products')
    .select(
      'name, slug, tagline, logo_url, status, launches (id, votes_count, comments_count)'
    )
    .eq('owner_id', profile.id)
    .order('created_at', { ascending: false });

  const rows = (products ?? [])
    .map((p: Record<string, unknown>) => {
      const launches = (p.launches ?? []) as {
        id: string;
        votes_count: number;
        comments_count: number;
      }[];
      return { product: p, launch: launches[0] ?? null };
    })
    .filter((r) => r.launch);

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

  const path = `/${locale}/profile/${username}`;

  return (
    <div className="max-w-[820px] mx-auto px-5 md:px-10 pt-12 pb-10">
      <div className="flex items-center gap-5 mb-12">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt=""
            className="w-20 h-20 rounded-full border border-border"
          />
        ) : (
          <span className="w-20 h-20 rounded-full bg-soft border border-border flex items-center justify-center text-3xl font-extrabold text-ink-secondary">
            {(profile.name ?? profile.username).charAt(0).toUpperCase()}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-[clamp(24px,4vw,32px)] font-extrabold tracking-tight">
              {profile.name ?? profile.username}
            </h1>
            {profile.is_verified && <VerifiedBadge label={t.reviews.verified} />}
          </div>
          {(profile.role_title || profile.company) && (
            <p className="text-ink-secondary text-[15px]">
              {[profile.role_title, profile.company].filter(Boolean).join(' · ')}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 flex-wrap text-[13px]">
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand hover:text-brand-hover font-semibold">
                <Linkedin size={13} /> {t.profile.linkedin}
              </a>
            )}
            {profile.website_url && (
              <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand hover:text-brand-hover font-semibold">
                <Globe size={13} /> {t.profile.website}
              </a>
            )}
            <span className="text-ink-muted">
              {t.profile.joined} {formatDate(profile.created_at, locale)}
            </span>
          </div>
        </div>
        {user?.id === profile.id && (
          <Link
            href={`/${locale}/profile/edit`}
            className="flex items-center gap-1.5 border border-border hover:border-brand text-ink-secondary hover:text-ink rounded-[10px] px-3 py-2 text-[13px] font-semibold transition-colors shrink-0"
          >
            <Pencil size={14} />
            {t.profile.edit}
          </Link>
        )}
      </div>

      {profile.bio && (
        <p className="text-[16px] leading-relaxed text-ink-secondary -mt-8 mb-12 whitespace-pre-line" dir="auto">
          {profile.bio}
        </p>
      )}

      <h2 className="font-extrabold text-[20px] mb-5">{t.profile.products}</h2>
      {rows.length === 0 ? (
        <p className="text-ink-secondary">{t.profile.noProducts}</p>
      ) : (
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
      )}
    </div>
  );
}
