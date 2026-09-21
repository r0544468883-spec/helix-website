import type { Metadata } from 'next';
import GuidePage from '../GuidePage';
import { getGuide } from '@/lib/guides';

const guide = getGuide('chatgpt-ads')!;

export const metadata: Metadata = {
  title: guide.meta.title,
  description: guide.meta.description,
  alternates: { canonical: `/guides/${guide.slug}` },
  robots: { index: true, follow: true },
  openGraph: {
    title: guide.meta.ogTitle,
    description: guide.meta.ogDescription,
    url: `/guides/${guide.slug}`,
    type: 'website',
    images: guide.meta.cover ? [{ url: guide.meta.cover, width: 1280, height: 720 }] : undefined,
  },
};

export default function ChatGptAdsGuidePage() {
  return <GuidePage config={guide} />;
}
