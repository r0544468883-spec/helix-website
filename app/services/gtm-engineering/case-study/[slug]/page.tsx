import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import GtmCaseStudyPage from '@/app/components/GtmCaseStudyPage';
import JsonLd from '@/app/components/JsonLd';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import { CASE_STUDIES, getCaseStudy } from '../../case-studies-data';

export function generateStaticParams() {
  return CASE_STUDIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) return { title: 'Case Study | HELIX' };
  return {
    title: `${cs.title} · Case Study | HELIX`,
    description: cs.summary.slice(0, 200),
  };
}

export default async function CaseStudyRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) notFound();

  const crumbs = breadcrumbSchema([
    { name: 'בית', url: SITE.url },
    { name: 'GTM Engineering', url: `${SITE.url}/services/gtm-engineering` },
    { name: 'Case Study', url: `${SITE.url}/services/gtm-engineering/case-study/${cs.slug}` },
  ]);

  return (
    <>
      <JsonLd data={[crumbs]} />
      <GtmCaseStudyPage cs={cs} />
    </>
  );
}
