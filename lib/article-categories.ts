// Single source of truth for the blog taxonomy.
// One clean set of categories, and one map from article slug to the categories
// it belongs to (primary first). This supersedes the free-text `category` field
// on each article in articles-data.ts, so the blog filter, the article badge,
// the Learn Hub, and the glossary all speak the same language, no second system.
//
// An article may belong to more than one category on purpose: an e-commerce
// piece that is also a marketing piece shows up under both filters.

export type CategorySlug =
  | 'ai'
  | 'marketing'
  | 'sales'
  | 'ecommerce'
  | 'data'
  | 'ops'
  | 'strategy';

export interface Category {
  slug: CategorySlug;
  label: string;
}

// Display order for the filter chips (and the glossary index).
export const CATEGORIES: Category[] = [
  { slug: 'ai', label: 'בינה מלאכותית וסוכנים' },
  { slug: 'marketing', label: 'שיווק וצמיחה' },
  { slug: 'sales', label: 'מכירות ולקוחות' },
  { slug: 'ecommerce', label: 'איקומרס' },
  { slug: 'data', label: 'ניתוח נתונים ו-BI' },
  { slug: 'ops', label: 'תפעול ופרודוקטיביות' },
  { slug: 'strategy', label: 'אסטרטגיה וצמיחה עסקית' },
];

const LABEL: Record<CategorySlug, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.label]),
) as Record<CategorySlug, string>;

export const labelOf = (slug: CategorySlug): string => LABEL[slug];

// Article slug -> its categories, primary first. Primary drives the card badge
// and the Learn Hub spoke meta; every entry drives which filter chips show it.
export const ARTICLE_CATS: Record<string, CategorySlug[]> = {
  // בינה מלאכותית וסוכנים
  'capability-engineering-era': ['ai'],
  'ai-skills-vs-rag-finetuning-mcp': ['ai'],
  'why-ai-teams-rot': ['ai'],
  'how-to-work-with-claude': ['ai'],
  'agent-symphony-hallucinations': ['ai'],
  'helix-chief-agent': ['ai'],
  'agentic-ai-layer': ['ai'],
  'ai-marketing-tools': ['ai'],
  'ai-agents-bd': ['ai'],
  'ai-content-human': ['ai'],
  'hebrew-ocr': ['ai'],

  // שיווק וצמיחה (חלקם גם איקומרס)
  'viral-waitlist': ['marketing'],
  'purchase-intent-signals': ['marketing', 'ecommerce'],
  'cookieless-first-party-data': ['marketing', 'ecommerce'],
  'behavioral-automation': ['marketing', 'ecommerce'],
  'geo-vs-seo': ['marketing'],
  'ai-overviews-visibility': ['marketing'],
  'llms-txt-schema-guide': ['marketing'],
  'social-media-automation': ['marketing'],
  'social-content-roi': ['marketing'],
  'brand-voice-ai': ['marketing'],
  'conversion-rate-optimization-guide': ['marketing', 'ecommerce'],
  'funnel-drop-off-analysis': ['marketing', 'ecommerce'],
  'retention-vs-acquisition': ['marketing'],
  'referral-loop-viral-growth': ['marketing'],
  'mql-sql-lead-recycling-loop': ['marketing'],
  'rule-of-seven-growth-hacking': ['marketing'],
  'marketing-loop-vs-funnel': ['marketing'],
  'attribution-explained': ['marketing'],
  'budget-loop': ['marketing'],
  'viral-loop': ['marketing'],
  'plg-small-business': ['marketing'],
  'cohort-retention': ['marketing'],
  'reading-a-campaign': ['marketing'],

  // מכירות ולקוחות (חלקם גם איקומרס)
  'sales-chatbot-website': ['sales', 'ecommerce'],
  'reduce-cart-abandonment-agent': ['sales', 'ecommerce'],
  'ai-customer-service-ecommerce': ['sales', 'ecommerce'],
  'free-crm-small-business': ['sales'],
  'hubspot-alternative': ['sales'],
  'ai-crm-agent': ['sales'],
  'ai-sdr-lead-automation': ['sales'],
  'lead-enrichment-guide': ['sales'],
  'sdr-cost-human-vs-ai': ['sales'],

  // ניתוח נתונים ו-BI
  'ceo-kpi-dashboard': ['data'],
  'bi-dashboard-without-analyst': ['data'],
  'power-bi-alternative': ['data'],

  // תפעול ופרודוקטיביות
  'ai-meeting-summary': ['ops'],
  'hebrew-meeting-transcription': ['ops'],
  'meeting-productivity': ['ops'],
  'digital-signature-legal-israel': ['ops'],
  'smart-forms-business': ['ops'],
  'docusign-alternative': ['ops'],

  // אסטרטגיה וצמיחה עסקית
  'startup-distribution-no-budget': ['strategy'],
  'product-market-fit-guide': ['strategy'],
  'partner-program-vs-white-label': ['strategy'],
  'beachhead-market': ['strategy'],
  'icp-target-audience': ['strategy'],
  'gtm-israel': ['strategy'],
  'first-month-free-does-it-work': ['strategy'],
  'transparent-pricing': ['strategy'],
  'dev-and-marketer-not-talking': ['strategy'],
  'project-spec-guide': ['strategy'],
};

/** Category slugs an article belongs to, primary first. Falls back to strategy. */
export function catSlugsOf(articleSlug: string): CategorySlug[] {
  return ARTICLE_CATS[articleSlug] ?? ['strategy'];
}

/** The primary (first) category slug for an article. */
export function primaryCatOf(articleSlug: string): CategorySlug {
  return catSlugsOf(articleSlug)[0];
}

/** The primary category label, for the card badge and spoke meta. */
export function primaryLabelOf(articleSlug: string): string {
  return labelOf(primaryCatOf(articleSlug));
}
