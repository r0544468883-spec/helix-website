// Google Ads search-terms waste auditor — the brain behind Free Scan "בדיקה B", and the
// code embodiment of the ops-ads-waste-auditor skill. PURE (no I/O): parse a pasted/uploaded
// search-terms CSV export, classify every term, and total the ₪ leaking on terms that spend
// without converting. Detection only — it proposes negative-keyword CANDIDATES with evidence;
// nothing is ever added to an account here (that's OPS, behind the autonomy gate).
//
// Discipline (mirrors the skill): a term is only proposed for negative on EVIDENCE (cost with
// zero conversions above a floor); thin-volume terms → NEEDS REVIEW, never a forced negative;
// brand/core terms → DO NOT TOUCH even when costly.

export type TermClass = 'keep' | 'negative_candidate' | 'needs_review' | 'do_not_touch';

export type SearchTermRow = {
  term: string;
  cost: number;
  clicks: number;
  impressions: number;
  conversions: number;
};

export type ClassifiedTerm = SearchTermRow & {
  klass: TermClass;
  evidence: string; // Hebrew, RTL report
};

export type WasteAudit = {
  ok: boolean;
  error?: string;
  rows: ClassifiedTerm[];
  totals: {
    terms: number;
    spend: number;
    wasteEstimate: number; // sum(cost) of negative_candidate
    negativeCandidates: number;
    needsReview: number;
  };
  topWaste: ClassifiedTerm[]; // biggest negative candidates first (for the teaser)
};

export type WasteOptions = {
  /** Terms containing any of these are DO NOT TOUCH (brand/core). Lowercased match. */
  brandTerms?: string[];
  /** Min clicks before a 0-conversion term can be a negative candidate. Below = needs review. */
  minClicksForNegative?: number;
  /** Min cost (₪) before a 0-conversion term can be a negative candidate. */
  minCostForNegative?: number;
};

const DEFAULTS: Required<Omit<WasteOptions, 'brandTerms'>> = {
  minClicksForNegative: 8,
  minCostForNegative: 15,
};

// ── CSV parsing (tolerant of Google Ads export quirks) ──

/** Parse one CSV line honoring double-quoted fields (which may contain commas). */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; } else inQ = false;
      } else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ',' || ch === '\t') { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

/** Parse a number from a Google Ads cell: strips ₪/$/commas/spaces, handles "--" and "". */
function num(s: string | undefined): number {
  if (!s) return 0;
  const cleaned = s.replace(/[^\d.\-]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

const HEADER_ALIASES: Record<keyof Omit<SearchTermRow, never>, RegExp> = {
  term: /search term|מונח.?חיפוש|search keyword/i,
  cost: /^cost|עלות/i,
  clicks: /^clicks|קליקים|הקלקות/i,
  impressions: /^impr|impressions|חשיפות/i,
  conversions: /^conv\.?$|conversions|המרות/i,
};

/** Find the header row (Google Ads exports often have title/date rows first) and map columns. */
export function parseSearchTermsCsv(text: string): { ok: boolean; error?: string; rows: SearchTermRow[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { ok: false, error: 'empty', rows: [] };

  let headerIdx = -1;
  let cols: string[] = [];
  for (let i = 0; i < Math.min(lines.length, 8); i++) {
    const c = splitCsvLine(lines[i]);
    if (c.some((h) => HEADER_ALIASES.term.test(h)) && c.some((h) => HEADER_ALIASES.cost.test(h) || HEADER_ALIASES.clicks.test(h))) {
      headerIdx = i;
      cols = c;
      break;
    }
  }
  if (headerIdx === -1) return { ok: false, error: 'no_header', rows: [] };

  const idx = (re: RegExp) => cols.findIndex((h) => re.test(h));
  const iTerm = idx(HEADER_ALIASES.term);
  const iCost = idx(HEADER_ALIASES.cost);
  const iClicks = idx(HEADER_ALIASES.clicks);
  const iImpr = idx(HEADER_ALIASES.impressions);
  const iConv = idx(HEADER_ALIASES.conversions);

  const rows: SearchTermRow[] = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const c = splitCsvLine(lines[i]);
    const term = (iTerm >= 0 ? c[iTerm] : '')?.trim();
    if (!term || /^total|^--|^סה.?כ/i.test(term)) continue; // skip total/summary rows
    rows.push({
      term,
      cost: iCost >= 0 ? num(c[iCost]) : 0,
      clicks: iClicks >= 0 ? num(c[iClicks]) : 0,
      impressions: iImpr >= 0 ? num(c[iImpr]) : 0,
      conversions: iConv >= 0 ? num(c[iConv]) : 0,
    });
  }
  if (rows.length === 0) return { ok: false, error: 'no_rows', rows: [] };
  return { ok: true, rows };
}

// ── classification ──

function classify(r: SearchTermRow, o: Required<Omit<WasteOptions, 'brandTerms'>>, brand: string[]): ClassifiedTerm {
  const t = r.term.toLowerCase();
  if (brand.some((b) => b && t.includes(b))) {
    return { ...r, klass: 'do_not_touch', evidence: 'מונח-מותג/ליבה — לא לשלול גם אם יקר' };
  }
  if (r.conversions > 0) {
    return { ...r, klass: 'keep', evidence: `${r.conversions} המרות — משאירים` };
  }
  // Zero conversions from here on.
  if (r.clicks >= o.minClicksForNegative && r.cost >= o.minCostForNegative) {
    return { ...r, klass: 'negative_candidate', evidence: `₪${r.cost.toFixed(0)} על ${r.clicks} קליקים, 0 המרות — מועמד לשלילה` };
  }
  if (r.clicks > 0 || r.cost > 0) {
    return { ...r, klass: 'needs_review', evidence: `נפח נמוך (${r.clicks} קליקים, ₪${r.cost.toFixed(0)}) — בדיקה אנושית, לא שלילה כפויה` };
  }
  return { ...r, klass: 'keep', evidence: 'אין הוצאה משמעותית' };
}

export function auditSearchTerms(rows: SearchTermRow[], opts: WasteOptions = {}): WasteAudit {
  const o = { ...DEFAULTS, ...opts };
  const brand = (opts.brandTerms ?? []).map((b) => b.toLowerCase().trim()).filter(Boolean);

  const classified = rows.map((r) => classify(r, o, brand));
  const negatives = classified.filter((c) => c.klass === 'negative_candidate');
  const wasteEstimate = negatives.reduce((a, c) => a + c.cost, 0);
  const spend = rows.reduce((a, r) => a + r.cost, 0);

  return {
    ok: true,
    rows: classified,
    totals: {
      terms: rows.length,
      spend: round2(spend),
      wasteEstimate: round2(wasteEstimate),
      negativeCandidates: negatives.length,
      needsReview: classified.filter((c) => c.klass === 'needs_review').length,
    },
    topWaste: [...negatives].sort((a, b) => b.cost - a.cost).slice(0, 10),
  };
}

/** One-shot: parse + audit a raw CSV string. */
export function auditWasteCsv(text: string, opts: WasteOptions = {}): WasteAudit {
  const parsed = parseSearchTermsCsv(text);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error, rows: [], totals: { terms: 0, spend: 0, wasteEstimate: 0, negativeCandidates: 0, needsReview: 0 }, topWaste: [] };
  }
  return auditSearchTerms(parsed.rows, opts);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
