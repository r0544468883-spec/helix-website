import type { Tier } from './crm-score';

// One place for the score-tier styling. It used to be a TIER_STYLE map copy-pasted
// into the board page and the contact record page, and the two had already drifted
// apart from the amber documented in DESIGN.md §3 by styling `warm` as yellow-500
// while ChiefChat used amber-400. See DESIGN.md §3 — status hues.

/** Badge: tinted background + matching foreground. */
export const TIER_BADGE: Record<Tier, string> = {
  hot: 'bg-emerald-50 text-brand-ink dark:bg-brand/15',
  warm: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  cold: 'bg-ink/5 text-ink-muted',
};

/** Bare label, no background. */
export const TIER_TEXT: Record<Tier, string> = {
  hot: 'text-brand-ink',
  warm: 'text-amber-700 dark:text-amber-400',
  cold: 'text-ink-muted',
};
