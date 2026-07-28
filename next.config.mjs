/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async redirects() {
    return [
      // Generic "tools" page replaced by the "התוכנות של HELIX" products hub.
      { source: '/services/tools', destination: '/products', permanent: true },
      // The old sales page was the SDR product — now lives at /products/sdr.
      { source: '/services/sales', destination: '/products/sdr', permanent: true },
    ];
  },
};

export default nextConfig;
