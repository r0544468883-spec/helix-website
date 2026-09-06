import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '@/app/components/JsonLd';
import ScrollReveal from '../components/ScrollReveal';
import { getArticle } from '../articles/articles-data';
import { CLUSTERS } from '@/lib/clusters';
import { primaryLabelOf } from '@/lib/article-categories';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'מרכז הלמידה',
  description: 'מדריכי עומק על AI שמבצע, לולאות צמיחה וחדירה לשוק הישראלי. מסודר לפי נושא: עמוד-עוגן לכל תחום, ומאמרי המשך סביבו.',
  alternates: { canonical: '/learn' },
};

export default function LearnHubPage() {
  const url = `${SITE.url}/learn`;

  // CollectionPage + one ItemList per cluster (AEO: makes the hub structure legible to engines).
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': url,
    name: 'מרכז הלמידה של HELIX',
    inLanguage: 'he-IL',
    isPartOf: { '@id': `${SITE.url}/#website` },
    hasPart: CLUSTERS.map((c) => ({
      '@type': 'ItemList',
      name: c.title,
      itemListElement: [c.pillarSlug, ...c.spokeSlugs]
        .map((slug) => getArticle(slug))
        .filter(Boolean)
        .map((a, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE.url}/articles/${a!.slug}`,
          name: a!.title,
        })),
    })),
  };

  // Two groups on the hub: the 11 product clusters ("our systems") and the
  // thematic methodology clusters. New clusters default to "systems".
  const METHODOLOGY_IDS = new Set(['agentic-ai', 'growth-loops', 'gtm-israel', 'partnerships']);
  const systemClusters = CLUSTERS.filter((c) => !METHODOLOGY_IDS.has(c.id));
  const methodologyClusters = CLUSTERS.filter((c) => METHODOLOGY_IDS.has(c.id));

  const renderCluster = (cluster: (typeof CLUSTERS)[number]) => {
    const pillar = getArticle(cluster.pillarSlug);
    const spokes = cluster.spokeSlugs.map((s) => getArticle(s)).filter(Boolean);
    if (!pillar) return null;
    return (
      <ScrollReveal key={cluster.id} direction="up">
        <section className="learn-cluster" aria-labelledby={`cl-${cluster.id}`}>
          <div className="learn-cluster-head">
            <span className="learn-cluster-term">{cluster.coinedTerm}</span>
            <h2 id={`cl-${cluster.id}`}>{cluster.title}</h2>
            <p className="learn-cluster-intro">{cluster.intro}</p>
          </div>

          <Link href={`/articles/${pillar.slug}`} className="learn-pillar">
            <span className="learn-pillar-tag">עמוד-עוגן</span>
            <h3>{pillar.title}</h3>
            <p>{pillar.excerpt}</p>
            <span className="learn-pillar-cta">להתחיל מכאן ←</span>
          </Link>

          <ul className="learn-spokes">
            {spokes.map((a) => (
              <li key={a!.slug}>
                <Link href={`/articles/${a!.slug}`}>
                  <span className="learn-spoke-title">{a!.title}</span>
                  <span className="learn-spoke-meta">{primaryLabelOf(a!.slug)} · {a!.readTime}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </ScrollReveal>
    );
  };

  return (
    <>
      <JsonLd
        data={[
          collectionSchema,
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'מרכז הלמידה', url },
          ]),
        ]}
      />

      <ScrollReveal direction="up">
        <div className="page-header container">
          <h1>מרכז הלמידה</h1>
          <p className="page-header-sub">
            לא ערימת מאמרים. {CLUSTERS.length} מסלולים, ולכל מסלול עמוד-עוגן אחד שמסביר את התמונה המלאה, ומאמרי המשך שנכנסים לעומק. מתחילים מהעוגן.
          </p>
        </div>
      </ScrollReveal>

      <div className="container learn-clusters">
        <div className="learn-group-head">
          <span className="learn-group-eyebrow">{systemClusters.length} מערכות</span>
          <h2>המערכות שלנו</h2>
          <p>מסלול לכל מוצר: עמוד-עוגן שמסביר את התמונה המלאה, ושני מאמרי המשך שנכנסים לעומק.</p>
        </div>
        {systemClusters.map(renderCluster)}

        <div className="learn-group-head">
          <span className="learn-group-eyebrow">מתודולוגיה</span>
          <h2>מתודולוגיה וצמיחה</h2>
          <p>העקרונות שמתחת לכל המערכות: AI שמבצע, לולאות צמיחה, חדירה לשוק הישראלי, ושותפויות.</p>
        </div>
        {methodologyClusters.map(renderCluster)}
      </div>

      <div className="container learn-bridge">
        <span>עוד באתר:</span>
        <Link href="/articles">כל המאמרים</Link>
        <Link href="/learn/stats">נתונים מתוארכים</Link>
        <Link href="/compare">השוואות, HELIX מול החלופות</Link>
        <Link href="/use-cases">למי זה מתאים</Link>
      </div>
    </>
  );
}
