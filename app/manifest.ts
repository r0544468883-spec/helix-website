import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.defaultTitle,
    short_name: 'HELIX.',
    description: SITE.defaultDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#FAFAF8',
    theme_color: '#FAFAF8',
    lang: 'he',
    dir: 'rtl',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
