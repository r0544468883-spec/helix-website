import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getDict, formatDate } from '@/lib/i18n';
import PostVoteButton from '@/components/PostVoteButton';
import PostReplyForm from '@/components/PostReplyForm';
import VerifiedBadge from '@/components/VerifiedBadge';

export const dynamic = 'force-dynamic';

type Profile = {
  name: string | null;
  username: string;
  avatar_url: string | null;
  is_verified: boolean;
};

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = getDict(locale);
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('posts')
    .select(
      'id, body, type, topic, votes_count, comments_count, created_at, product_id, profiles (name, username, avatar_url, is_verified), products (name, slug)'
    )
    .eq('id', id)
    .maybeSingle();
  if (!post) notFound();

  const author = (Array.isArray(post.profiles) ? post.profiles[0] : post.profiles) as Profile | null;
  const product = Array.isArray(post.products) ? post.products[0] : post.products;

  const { data: replyRows } = await supabase
    .from('post_comments')
    .select('id, body, created_at, user_id, profiles (name, username, avatar_url, is_verified)')
    .eq('post_id', id)
    .order('created_at', { ascending: true });
  const replies = (replyRows ?? []).map((r: Record<string, unknown>) => ({
    ...r,
    profiles: Array.isArray(r.profiles) ? r.profiles[0] : r.profiles,
  })) as { id: string; body: string; created_at: string; user_id: string; profiles: Profile | null }[];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(user);
  let hasVoted = false;
  if (user) {
    const { data: vote } = await supabase
      .from('post_votes')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', id)
      .maybeSingle();
    hasVoted = Boolean(vote);
  }

  const path = `/${locale}/community/${id}`;
  const topicLabel = post.topic
    ? (t.community as Record<string, string>)[`topic${post.topic}`] ?? post.topic
    : null;

  return (
    <div className="max-w-[720px] mx-auto px-5 md:px-10 pt-12 pb-10">
      <Link
        href={`/${locale}/community`}
        className="text-brand hover:text-brand-hover text-[14px] font-semibold"
      >
        ← {t.community.backToCommunity}
      </Link>

      <div className="flex items-start gap-4 mt-5">
        <PostVoteButton
          postId={post.id}
          votes={post.votes_count}
          hasVoted={hasVoted}
          isLoggedIn={isLoggedIn}
          locale={locale}
          path={path}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {author?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={author.avatar_url} alt="" className="w-8 h-8 rounded-full border border-border" />
            ) : (
              <span className="w-8 h-8 rounded-full bg-soft border border-border flex items-center justify-center text-[13px] font-bold">
                {(author?.name ?? '?').charAt(0).toUpperCase()}
              </span>
            )}
            <Link
              href={`/${locale}/profile/${author?.username}`}
              className="font-semibold text-[14px] hover:text-brand transition-colors"
            >
              {author?.name ?? author?.username}
            </Link>
            {author?.is_verified && <VerifiedBadge label={t.reviews.verified} />}
            <span
              className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${
                post.type === 'show_il'
                  ? 'bg-brand/10 text-brand'
                  : 'bg-soft text-ink-secondary border border-border'
              }`}
            >
              {post.type === 'show_il' ? t.community.showIl : t.community.buildInPublic}
            </span>
            {topicLabel && (
              <span className="text-[11px] font-semibold rounded-full px-2 py-0.5 border border-border text-ink-secondary">
                {topicLabel}
              </span>
            )}
            <span className="text-[12px] text-ink-muted ms-auto">
              {formatDate(post.created_at, locale)}
            </span>
          </div>
          <p className="text-[17px] leading-relaxed whitespace-pre-line" dir="auto">
            {post.body}
          </p>
          {product && (
            <Link
              href={`/${locale}/products/${product.slug}`}
              className="inline-block mt-3 text-brand hover:text-brand-hover text-[14px] font-semibold"
              dir="auto"
            >
              {product.name} ←
            </Link>
          )}
        </div>
      </div>

      <section className="mt-12">
        <h2 className="font-extrabold text-[20px] mb-6 flex items-center gap-2">
          <MessageCircle size={18} />
          {t.community.replies} ({replies.length})
        </h2>

        {isLoggedIn ? (
          <PostReplyForm
            postId={post.id}
            path={path}
            placeholder={t.community.replyPlaceholder}
            sendLabel={t.community.send}
          />
        ) : (
          <Link
            href={`/${locale}/login`}
            className="inline-block text-brand hover:text-brand-hover font-semibold"
          >
            {t.community.loginToReply}
          </Link>
        )}

        <div className="flex flex-col gap-4 mt-8">
          {replies.length === 0 && (
            <p className="text-ink-muted text-[15px]">{t.community.noReplies}</p>
          )}
          {replies.map((r) => (
            <div key={r.id} className="bg-surface border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                {r.profiles?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.profiles.avatar_url} alt="" className="w-7 h-7 rounded-full border border-border" />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-soft border border-border flex items-center justify-center text-[12px] font-bold">
                    {(r.profiles?.name ?? '?').charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="font-semibold text-[14px]">
                  {r.profiles?.name ?? r.profiles?.username}
                </span>
                {r.profiles?.is_verified && <VerifiedBadge label={t.reviews.verified} />}
                <span className="text-[12px] text-ink-muted ms-auto">
                  {formatDate(r.created_at, locale)}
                </span>
              </div>
              <p className="text-[15px] leading-relaxed whitespace-pre-line" dir="auto">
                {r.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
