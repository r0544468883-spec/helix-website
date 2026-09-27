// תעדוף לידים — ניקוד 0..100 מסיגנלים אמיתיים. שקוף ומוסבר (לא "קופסה שחורה").
// עדיפות: hot ≥70 · warm 40-69 · cold <40.
//
// הניקוד נגזר מ-status (עמודה אחת) ולא משתי העמודות שקדמו לה. הטבלה עצמה יושבת
// ב-lib/crm-status.ts, ומשקלי המצבים הם הסכום של הצמד הישן שכל status ממופה ממנו,
// כדי שהמיגרציה (v19) לא תזיז את הניקוד של איש קשר שבו שתי העמודות הישנות הסכימו.

import { STATUS_SCORE, isContactStatus, type ContactStatus } from './crm-status';

export type ScoreInput = {
  is_business?: boolean | null;
  company_id?: string | null;
  status?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
  last_activity_at?: string | null;
  hasOpenDeal?: boolean;
};

function statusOf(s: string | null | undefined): ContactStatus {
  return isContactStatus(s) ? s : 'new';
}

export function scoreContact(c: ScoreInput): number {
  let s = 0;
  if (c.is_business) s += 25;
  if (c.company_id) s += 10;
  s += STATUS_SCORE[statusOf(c.status)];
  if (c.phone) s += 5;
  if (c.linkedin_url) s += 5;
  if (c.hasOpenDeal) s += 20;
  if (c.last_activity_at) {
    const days = (Date.now() - new Date(c.last_activity_at).getTime()) / 864e5;
    if (days <= 7) s += 20;
    else if (days <= 30) s += 10;
  }
  return Math.max(0, Math.min(100, s));
}

export type Tier = 'hot' | 'warm' | 'cold';

export function scoreTier(score: number): Tier {
  return score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold';
}

/**
 * הסבר קצר לניקוד — כדי שהמייסד יבין למה הליד חם (שקיפות).
 * `statusLabel` מאפשר למי שקורא לתרגם את הסטטוס; בלעדיו מוחזר המפתח עצמו.
 * לא מייבאים כאן את המילון: crm-score נטען גם בקומפוננטת client, ומילון שלם
 * בבאנדל בשביל מחרוזת אחת הוא מחיר מיותר.
 */
export function scoreReasons(c: ScoreInput, statusLabel?: (s: ContactStatus) => string): string[] {
  const r: string[] = [];
  const st = statusOf(c.status);
  if (c.is_business) r.push('מייל עסקי');
  if (c.hasOpenDeal) r.push('עסקה פתוחה');
  if (st !== 'new') r.push(`סטטוס: ${statusLabel ? statusLabel(st) : st}`);
  if (c.last_activity_at) {
    const days = (Date.now() - new Date(c.last_activity_at).getTime()) / 864e5;
    if (days <= 7) r.push('פעיל לאחרונה');
  }
  return r;
}
