import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getDict, formatDate } from '@/lib/i18n';
import { MessageCircle } from 'lucide-react';
import PostForm from '@/components/PostForm';
import VerifiedBadge from '@/components/VerifiedBadge';
import PostVoteButton from '@/components/PostVoteButton';

export const dynamic = 'force-dynamic';

type PostRow = {
  id: string;
  body: string;
  type: string;
  topic: string | null;
  votes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    name: string | null;
    username: string;
    avatar_url: string | null;
    is_verified: boolean;
  } | null;
};

export default async function CommunityPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { locale } = await params;
  const { t: tabParam } = await searchParams;
  const tab = tabParam === 'show_il' ? 'show_il' : tabParam === 'build' ? 'build_in_public' : 'all';
  const t = getDict(locale);

  let posts: PostRow[] = [];
  let canPost = false;
  let isLoggedIn = false;
  let votedIds = new Set<string>();
  try {
    const supabase = await createClient();
    let query = supabase
      .from('posts')
      .select(
        'id, body, type, topic, votes_count, comments_count, created_at, profiles (name, username, avatar_url, is_verified)'
      )
      .order('votes_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(60);
    if (tab !== 'all') query = query.eq('type', tab);
    const { data } = await query;
    posts = (data ?? []).map((p: Record<string, unknown>) => ({
      ...p,
      profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles,
    })) as PostRow[];

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      isLoggedIn = true;
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .maybeSingle();
      canPost = profile?.user_type === 'maker';
      if (posts.length > 0) {
        const { data: votes } = await supabase
          .from('post_votes')
          .select('post_id')
          .eq('user_id', user.id)
          .in(
            'post_id',
            posts.map((p) => p.id)
          );
        votedIds = new Set((votes ?? []).map((v: { post_id: string }) => v.post_id));
      }
    }
  } catch {
    // אין חיבור עדיין
  }

  const tabs: { key: string; label: string; href: string }[] = [
    { key: 'all', label: t.community.all, href: `/${locale}/community` },
    { key: 'build_in_public', label: t.community.buildInPublic, href: `/${locale}/community?t=build` },
    { key: 'show_il', label: t.community.showIl, href: `/${locale}/community?t=show_il` },
  ];

  return (
    <div className="max-w-[720px] mx-auto px-5 md:px-10 pt-12 pb-10">
      <h1 className="font-display text-[clamp(28px,5vw,44px)] font-extrabold tracking-tight mb-2">
        {t.community.title}
      </h1>
      <p className="text-ink-secondary text-[15px] mb-8">{t.community.subtitle}</p>

      {canPost ? (
        <div className="mb-8">
          <PostForm locale={locale} t={t.community} />
        </div>
      ) : (
        <p className="text-ink-muted text-[14px] mb-8">{t.community.makersOnly}</p>
      )}

      <div className="flex gap-2 mb-6">
        {tabs.map((tb) => (
          <Link
            key={tb.key}
            href={tb.href}
            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border transition-colors ${
              tab === tb.key
                ? 'bg-ink text-bg border-ink'
                : 'bg-surface border-border text-ink-secondary hover:border-border-strong'
            }`}
          >
            {tb.label}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <p className="text-ink-secondary">{t.community.empty}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((p) => {
            const topicLabel = p.topic
              ? (t.community as Record<string, string>)[`topic${p.topic}`] ?? p.topic
              : null;
            return (
              <div key={p.id} className="bg-surface border border-border rounded-2xl p-5 flex gap-4">
                <PostVoteButton
                  postId={p.id}
                  votes={p.votes_count}
                  hasVoted={votedIds.has(p.id)}
                  isLoggedIn={isLoggedIn}
                  locale={locale}
                  path={tab === 'all' ? `/${locale}/community` : `/${locale}/community?t=${tabParam}`}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {p.profiles?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.profiles.avatar_url}
                        alt=""
                        className="w-8 h-8 rounded-full border border-border"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-soft border border-border flex items-center justify-center text-[13px] font-bold">
                        {(p.profiles?.name ?? '?').charAt(0).toUpperCase()}
                      </span>
                    )}
                    <Link
                      href={`/${locale}/profile/${p.profiles?.username}`}
                      className="font-semibold text-[14px] hover:text-brand transition-colors"
                    >
                      {p.profiles?.name ?? p.profiles?.username}
                    </Link>
                    {p.profiles?.is_verified && <VerifiedBadge label={t.reviews.verified} />}
                    <span
                      className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${
                        p.type === 'show_il'
                          ? 'bg-brand/10 text-brand'
                          : 'bg-soft text-ink-secondary border border-border'
                      }`}
                    >
                      {p.type === 'show_il' ? t.community.showIl : t.community.buildInPublic}
                    </span>
                    {topicLabel && (
                      <span className="text-[11px] font-semibold rounded-full px-2 py-0.5 border border-border text-ink-secondary">
                        {topicLabel}
                      </span>
                    )}
                    <span className="text-[12px] text-ink-muted ms-auto">
                      {formatDate(p.created_at, locale)}
                    </span>
                  </div>
                  <Link href={`/${locale}/community/${p.id}`} className="block">
                    <p className="text-[15px] leading-relaxed whitespace-pre-line line-clamp-4" dir="auto">
                      {p.body}
                    </p>
                  </Link>
                  <Link
                    href={`/${locale}/community/${p.id}`}
                    className="inline-flex items-center gap-1.5 mt-3 text-ink-muted hover:text-brand text-[13px] font-semibold transition-colors"
                  >
                    <MessageCircle size={14} />
                    {p.comments_count} {t.community.replies}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
