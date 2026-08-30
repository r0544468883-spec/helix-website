// תעדוף לידים — ניקוד 0..100 מסיגנלים אמיתיים. שקוף ומוסבר (לא "קופסה שחורה").
// עדיפות: hot ≥70 · warm 40-69 · cold <40.

export type ScoreInput = {
  is_business?: boolean | null;
  company_id?: string | null;
  lifecycle_stage?: string | null;
  lead_status?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
  last_activity_at?: string | null;
  hasOpenDeal?: boolean;
};

const LIFECYCLE: Record<string, number> = {
  lead: 0,
  mql: 15,
  sql: 25,
  opportunity: 35,
  customer: 40,
};
const LEAD_STATUS: Record<string, number> = {
  new: 0,
  contacted: 5,
  qualified: 15,
  unqualified: -20,
};

export function scoreContact(c: ScoreInput): number {
  let s = 0;
  if (c.is_business) s += 25;
  if (c.company_id) s += 10;
  s += LIFECYCLE[c.lifecycle_stage ?? 'lead'] ?? 0;
  s += LEAD_STATUS[c.lead_status ?? 'new'] ?? 0;
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

/** הסבר קצר לניקוד — כדי שהמייסד יבין למה הליד חם (שקיפות). */
export function scoreReasons(c: ScoreInput): string[] {
  const r: string[] = [];
  if (c.is_business) r.push('מייל עסקי');
  if (c.hasOpenDeal) r.push('עסקה פתוחה');
  if ((c.lifecycle_stage ?? 'lead') !== 'lead') r.push(`שלב: ${c.lifecycle_stage}`);
  if (c.lead_status === 'qualified') r.push('מוסמך');
  if (c.last_activity_at) {
    const days = (Date.now() - new Date(c.last_activity_at).getTime()) / 864e5;
    if (days <= 7) r.push('פעיל לאחרונה');
  }
  return r;
}
