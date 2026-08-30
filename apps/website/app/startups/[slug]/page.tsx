import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { STARTUPS_DATA, getStartup } from '../startups-data';
import StartupPageClient from '../StartupPageClient';

export function generateStaticParams() {
  return STARTUPS_DATA.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const startup = getStartup(slug);
  if (!startup) return {};
  return {
    title: `${startup.name} | HELIX`,
    description: startup.subtitle,
  };
}

export default async function StartupServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const startup = getStartup(slug);
  if (!startup) notFound();
  return <StartupPageClient startup={startup} />;
}
