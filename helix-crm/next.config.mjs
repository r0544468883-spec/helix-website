import path from 'node:path';
import { fileURLToPath } from 'node:url';

// This app lives as a subdirectory of the helix-website repo, which has its own
// package-lock.json at the repo root. Without an explicit outputFileTracingRoot
// Next picks the repo root as the workspace root and lays out .next/standalone
// in a monorepo shape the App Hosting adapter can't find (routes-manifest.json
// ENOENT at build). Pin the root to this directory.
const appRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: appRoot,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'media.licdn.com' },
    ],
  },
  experimental: {
    // The business logo is uploaded through a server action: up to 1 MB of file,
    // plus the multipart envelope, over the 1 MB default.
    serverActions: { bodySizeLimit: '2mb' },
  },
  // A client's quote page is reachable by its link only: never indexed.
  async headers() {
    return [{ source: '/:locale/q/:token', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }];
  },
};

export default nextConfig;
