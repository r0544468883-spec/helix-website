import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '@/app/components/JsonLd';
import ScrollReveal from '../components/ScrollReveal';
import { COMPARISONS } from './compare-data';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'השוואות',
  description: 'HELIX מול לעשות לבד, מול לשכור עובד או סוכנות, ומול כלי SaaS גלובלי. השוואות כנות, כולל מתי דווקא החלופה עדיפה.',
  alternates: { canonical: '/compare' },
};

export default function CompareHubPage() {
  const url = `${SITE.url}/compare`;
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'השוואות', url },
          ]),
        ]}
      />
      <ScrollReveal direction="up">
        <div className="page-header container">
          <h1>השוואות</h1>
          <p className="page-header-sub">
            בלי spin. לכל השוואה יש גם סעיף אחד שאומר מתי דווקא החלופה עדיפה, כי אם נמכור לכם משהו שלא צריך, זה חוזר אלינו.
          </p>
        </div>
      </ScrollReveal>

      <div className="container">
        <ScrollReveal className="compare-hub" direction="up" stagger staggerDelay={0.08}>
          {COMPARISONS.map((c) => (
            <Link key={c.slug} href={`/compare/${c.slug}`} className="compare-card">
              <h2>{c.title}</h2>
              <p>{c.excerpt}</p>
              <span className="compare-card-cta">להשוואה המלאה ←</span>
            </Link>
          ))}
        </ScrollReveal>
      </div>

      <div className="container learn-bridge">
        <span>עוד באתר:</span>
        <Link href="/learn">מרכז הלמידה</Link>
        <Link href="/use-cases">למי זה מתאים</Link>
      </div>
    </>
  );
}
