import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '@/app/components/JsonLd';
import ScrollReveal from '../components/ScrollReveal';
import { USE_CASES } from './use-cases-data';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'למי זה מתאים',
  description: 'HELIX לסוכנויות שיווק, לעסקים קטנים, לסטארטאפים ולצוותי מכירות. אותה מערכת, מותאמת לכאב של כל קהל.',
  alternates: { canonical: '/use-cases' },
};

export default function UseCasesHubPage() {
  const url = `${SITE.url}/use-cases`;
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'למי זה מתאים', url },
          ]),
        ]}
      />
      <ScrollReveal direction="up">
        <div className="page-header container">
          <h1>למי זה מתאים</h1>
          <p className="page-header-sub">אותה מערכת, ארבעה כאבים שונים. בחרו את מי שהכי דומה לכם.</p>
        </div>
      </ScrollReveal>

      <div className="container">
        <ScrollReveal className="usecase-hub" direction="up" stagger staggerDelay={0.08}>
          {USE_CASES.map((u) => (
            <Link key={u.slug} href={`/use-cases/${u.slug}`} className="usecase-card">
              <span className="usecase-card-persona">{u.persona}</span>
              <h2>{u.title}</h2>
              <p>{u.excerpt}</p>
              <span className="usecase-card-cta">לעמוד המלא ←</span>
            </Link>
          ))}
        </ScrollReveal>
      </div>

      <div className="container learn-bridge">
        <span>עוד באתר:</span>
        <Link href="/learn">מרכז הלמידה</Link>
        <Link href="/compare">השוואות</Link>
      </div>
    </>
  );
}
