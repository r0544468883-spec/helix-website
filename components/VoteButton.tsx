'use client';

import { useOptimistic, useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronUp } from 'lucide-react';
import { toggleVote } from '@/app/actions';

type Props = {
  launchId: string;
  votes: number;
  hasVoted: boolean;
  isLoggedIn: boolean;
  locale: string;
  path: string;
};

export default function VoteButton({ launchId, votes, hasVoted, isLoggedIn, locale, path }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic({ votes, hasVoted });
  // Hero (STAGE): a restrained spring pop on upvote — satisfying, not celebratory.
  // No confetti/rockets: the brand's value is honest feedback over empty fanfare.
  const [pop, setPop] = useState(0);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      router.push(`/${locale}/login`);
      return;
    }
    if (!optimistic.hasVoted) setPop((p) => p + 1); // only pop when adding a vote
    startTransition(async () => {
      setOptimistic((cur) => ({
        votes: cur.hasVoted ? cur.votes - 1 : cur.votes + 1,
        hasVoted: !cur.hasVoted,
      }));
      await toggleVote(launchId, path);
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={isPending}
      className={`flex flex-col items-center justify-center w-14 h-16 rounded-2xl border transition-colors shrink-0 ${
        optimistic.hasVoted
          ? 'bg-brand text-bg border-brand'
          : 'bg-surface border-border hover:border-brand text-ink'
      }`}
      aria-pressed={optimistic.hasVoted}
    >
      <ChevronUp key={pop} size={18} strokeWidth={2.5} className={pop ? 'vote-pop' : ''} />
      <span className="text-[15px] font-bold leading-none mt-1">{optimistic.votes}</span>
    </button>
  );
}
