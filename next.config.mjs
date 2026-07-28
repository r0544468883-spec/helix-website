/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async redirects() {
    return [
      // Generic "tools" page replaced by the "התוכנות של HELIX" products hub.
      { source: '/services/tools', destination: '/products', permanent: true },
    ];
  },
};

export default nextConfig;
