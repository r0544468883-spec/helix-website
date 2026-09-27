// One status per contact — the single field that says where a relationship stands.
// It replaced two overlapping columns (lifecycle_stage × lead_status = 20 combinations
// for one person, two of them named mql and sql). Those columns still exist and are
// still written, but from here: the public /api/v1 routes, CHIEF, and stored automation
// condition graphs read them, so they stay truthful rather than being dropped.
// See DESIGN.md — CRM contact status.

/** Seven ordered progress states, then the two terminal ones. Order is funnel order. */
export const CONTACT_STATUSES = [
  'new',
  'contacted',
  'talking',
  'proposal',
  'signed',
  'paid',
  'client',
  'declined',
  'frozen',
] as const;

export type ContactStatus = (typeof CONTACT_STATUSES)[number];

const STATUS_SET = new Set<string>(CONTACT_STATUSES);

/** Narrow an untrusted value. Anything unrecognised is not a status. */
export function isContactStatus(v: unknown): v is ContactStatus {
  return typeof v === 'string' && STATUS_SET.has(v);
}

/**
 * The legacy pair every status maps to. Written on every contact write so the two
 * old columns never contradict `status`. Nothing sets them by hand any more.
 */
export const STATUS_LEGACY: Record<ContactStatus, { lifecycle_stage: string; lead_status: string }> = {
  new:       { lifecycle_stage: 'lead',        lead_status: 'new' },
  contacted: { lifecycle_stage: 'lead',        lead_status: 'contacted' },
  talking:   { lifecycle_stage: 'sql',         lead_status: 'qualified' },
  proposal:  { lifecycle_stage: 'opportunity', lead_status: 'qualified' },
  signed:    { lifecycle_stage: 'opportunity', lead_status: 'qualified' },
  paid:      { lifecycle_stage: 'customer',    lead_status: 'qualified' },
  client:    { lifecycle_stage: 'customer',    lead_status: 'qualified' },
  declined:  { lifecycle_stage: 'lead',        lead_status: 'unqualified' },
  frozen:    { lifecycle_stage: 'lead',        lead_status: 'contacted' },
};

/**
 * Score contribution per status. Each value is the SUM of the two legacy fields it
 * maps back from, under the old formula — lifecycle (lead 0 · mql 15 · sql 25 ·
 * opportunity 35 · customer 40) plus lead_status (new 0 · contacted 5 · qualified 15 ·
 * unqualified -20). That is deliberate: it means the v19 backfill does not move the
 * score of any contact whose two old fields agreed with each other, so the contact
 * list (ordered by score) does not reshuffle on migration.
 */
export const STATUS_SCORE: Record<ContactStatus, number> = {
  new: 0,
  contacted: 5,
  talking: 40,
  proposal: 50,
  signed: 50,
  paid: 55,
  client: 55,
  declined: -20,
  frozen: 5,
};

/**
 * Chip styling. Nine values cannot be told apart by hue alone in a dark dense UI, so
 * two differ by treatment instead: `new` is the only chip with no fill (absence of
 * colour reads as untouched) and `frozen` is the only one with a dashed border.
 * No hover state — that is what keeps a chip from reading as a button.
 * The Hebrew label always travels with the chip, so hue is never the only carrier
 * of meaning (ת"י 5568).
 */
export const STATUS_BADGE: Record<ContactStatus, string> = {
  new:       'border border-border text-ink-muted',
  contacted: 'bg-sky-500/15 text-sky-400',
  talking:   'bg-indigo-500/15 text-indigo-400',
  proposal:  'bg-amber-500/15 text-amber-400',
  signed:    'bg-violet-500/15 text-violet-400',
  paid:      'bg-brand/15 text-brand',
  client:    'bg-teal-500/20 text-teal-300',
  declined:  'bg-red-500/15 text-red-400',
  frozen:    'bg-slate-500/15 text-slate-400 border border-dashed border-slate-500/40',
};

/** Bare label, no background — for places that already sit on a tinted surface. */
export const STATUS_TEXT: Record<ContactStatus, string> = {
  new:       'text-ink-muted',
  contacted: 'text-sky-400',
  talking:   'text-indigo-400',
  proposal:  'text-amber-400',
  signed:    'text-violet-400',
  paid:      'text-brand',
  client:    'text-teal-300',
  declined:  'text-red-400',
  frozen:    'text-slate-400',
};

/**
 * The reverse of STATUS_LEGACY, for input that still speaks the old language —
 * the public /api/v1/crm/contacts route accepts `lifecycle_stage` / `lead_status`
 * from integrations written before `status` existed. Same ordered CASE as the v19
 * backfill, terminal state first: an `unqualified` opportunity is a person who
 * said no, not a live proposal.
 */
export function statusFromLegacy(lifecycle_stage?: string | null, lead_status?: string | null): ContactStatus {
  if (lead_status === 'unqualified') return 'declined';
  if (lifecycle_stage === 'customer') return 'client';
  if (lifecycle_stage === 'opportunity') return 'proposal';
  if (lifecycle_stage === 'sql') return 'talking';
  if (lifecycle_stage === 'mql') return 'contacted';
  if (lifecycle_stage === 'lead' && lead_status === 'qualified') return 'talking';
  if (lifecycle_stage === 'lead' && lead_status === 'contacted') return 'contacted';
  return 'new';
}

/** Dictionary key for a status label: `cs_new` … `cs_frozen`. */
export function statusKey(s: ContactStatus): `cs_${ContactStatus}` {
  return `cs_${s}`;
}

// ---- "needs a touch" -------------------------------------------------------
// One threshold for both the stalled-deal sweep and the home work queue, so the two
// never disagree about what "gone quiet" means.
export const STALL_DAYS = 14;

/** Statuses where silence is a problem. Paid, client, declined and frozen are not. */
export const ACTIVE_STATUSES: ReadonlySet<ContactStatus> = new Set<ContactStatus>([
  'new', 'contacted', 'talking', 'proposal', 'signed',
]);

const DAY_MS = 86_400_000;

/**
 * True when an active contact has gone STALL_DAYS or more without a touch. A contact
 * never touched counts from when it was created, so a lead added today is not stale.
 */
export function needsTouch(
  status: string,
  lastActivityAt: string | null,
  createdAt: string | null,
  now: number = Date.now(),
): boolean {
  if (!isContactStatus(status) || !ACTIVE_STATUSES.has(status)) return false;
  const since = lastActivityAt ?? createdAt;
  if (!since) return false;
  const t = new Date(since).getTime();
  if (Number.isNaN(t)) return false;
  return Math.floor((now - t) / DAY_MS) >= STALL_DAYS;
}
