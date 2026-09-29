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

/** A signal that adds points to the score. The dictionary names each one (`scoreSignal_*`). */
export type ScoreSignal =
  | 'business_email' | 'company' | 'phone' | 'linkedin' | 'open_deal' | 'status' | 'recent_7' | 'recent_30';

/**
 * למה הניקוד הוא מה שהוא — שקיפות, לא קופסה שחורה. כל אות שמוסיף נקודות, בסדר
 * קבוע, כמפתח שהמילון נותן לו שם: הפונקציה נשארת טהורה ובלי מחרוזות, כי היא נטענת
 * גם בקומפוננטת client. `status` מופיע רק כשהסטטוס מוסיף נקודות (נדחה מוריד), ומי
 * שקורא נותן לו את שם הסטטוס. המגע האחרון נמדד מול `now`.
 */
export function scoreSignals(c: ScoreInput, now: number = Date.now()): ScoreSignal[] {
  const s: ScoreSignal[] = [];
  if (c.is_business) s.push('business_email');
  if (c.company_id) s.push('company');
  if (c.phone) s.push('phone');
  if (c.linkedin_url) s.push('linkedin');
  if (c.hasOpenDeal) s.push('open_deal');
  if (STATUS_SCORE[statusOf(c.status)] > 0) s.push('status');
  if (c.last_activity_at) {
    const days = (now - new Date(c.last_activity_at).getTime()) / 864e5;
    if (days <= 7) s.push('recent_7');
    else if (days <= 30) s.push('recent_30');
  }
  return s;
}
