import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
import { PRODUCTS_DATA } from './products/products-data';
import { STARTUPS_DATA } from './startups/startups-data';
import { ARTICLES } from './articles/articles-data';

// Output depends on nothing per-request; required by `output: 'export'`.
export const dynamic = 'force-static';

type Entry = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
};

// Static routes with hand-tuned priority / change frequency.
const STATIC_ROUTES: Entry[] = [
  { path: '/', changeFrequency: 'monthly', priority: 1 },

  // Products hub + software overview
  { path: '/products', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/software', changeFrequency: 'weekly', priority: 0.7 },

  // Services
  { path: '/services/websites', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/services/ecommerce', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/services/development', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/services/automation', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/services/marketing', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/services/growth', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/services/sales-consulting', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/services/ai-consulting', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/services/tools', changeFrequency: 'monthly', priority: 0.6 },

  // Startups hub + readiness scanner
  { path: '/startups', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/startups/readiness', changeFrequency: 'weekly', priority: 0.7 },

  // Content & lead-magnet tools
  { path: '/articles', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/glossary', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/podcast', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/ai-checker', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/vibe-code', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/first-users', changeFrequency: 'weekly', priority: 0.9 },

  // Legal / a11y
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/accessibility', changeFrequency: 'yearly', priority: 0.3 },
];

// Dynamic product & startup detail pages, derived from the same data the pages render.
const PRODUCT_ROUTES: Entry[] = PRODUCTS_DATA.map((p) => ({
  path: `/products/${p.slug}`,
  changeFrequency: 'monthly',
  priority: 0.8,
}));

const STARTUP_ROUTES: Entry[] = STARTUPS_DATA.map((s) => ({
  path: `/startups/${s.slug}`,
  changeFrequency: 'monthly',
  priority: 0.7,
}));

const ARTICLE_ROUTES: Entry[] = ARTICLES.map((a) => ({
  path: `/articles/${a.slug}`,
  changeFrequency: 'monthly',
  priority: 0.7,
}));

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [...STATIC_ROUTES, ...PRODUCT_ROUTES, ...STARTUP_ROUTES, ...ARTICLE_ROUTES].map((e) => ({
    url: e.path === '/' ? SITE.url : `${SITE.url}${e.path}`,
    lastModified: now,
    changeFrequency: e.changeFrequency,
    priority: e.priority,
  }));
}
