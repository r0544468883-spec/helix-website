// Static-export mode: used by `npm run build:static` to produce a server-less
// bundle for the free Firebase Hosting tier. The API routes cannot exist in
// this mode (Next.js refuses to export route handlers), so the build script
// moves app/api aside first. Every form on the site is therefore inert in a
// static build. Normal `npm run build` is unaffected.
const isStaticExport = process.env.STATIC_EXPORT === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // App Hosting runs the server on Cloud Run, where next/image optimization
  // would run in-process via sharp. Every image source here is a static file
  // in /public, so optimizing at request time buys nothing and costs CPU.
  // Static export requires this too.
  images: { unoptimized: true },
  // NOTE: redirects() is a server feature — Next.js IGNORES it under
  // output:'export'. For the static Firebase build these same redirects are
  // reproduced in firebase.json (hosting.redirects). Keep both in sync.
  ...(isStaticExport
    ? { output: 'export' }
    : {
        async redirects() {
          return [
            // Generic "tools" page replaced by the "התוכנות של HELIX" products hub.
            { source: '/services/tools', destination: '/products', permanent: true },
            // The old sales page was the SDR product — now lives at /products/sdr.
            { source: '/services/sales', destination: '/products/sdr', permanent: true },
          ];
        },
        async headers() {
          // Force each free-guide PDF to DOWNLOAD (not open inline) with a proper
          // Hebrew filename, regardless of the browser or client-side JS. filename*
          // must be ASCII, so we percent-encode the UTF-8 name here.
          // One line per guide. Keep in sync with lib/guides.ts.
          const DOWNLOAD_PDFS = [
            { source: '/guides/chatgpt-ads-guide.pdf', name: 'הליקס - מדריך לממומן ב-ChatGPT.pdf' },
          ];
          return DOWNLOAD_PDFS.map(({ source, name }) => ({
            source,
            headers: [
              { key: 'Content-Type', value: 'application/pdf' },
              { key: 'Content-Disposition', value: `attachment; filename*=UTF-8''${encodeURIComponent(name)}` },
            ],
          }));
        },
      }),
};

export default nextConfig;
