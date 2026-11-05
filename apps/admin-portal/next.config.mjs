/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@simplicion/ui',
    '@simplicion/tenant',
    '@simplicion/commerce',
    '@simplicion/identity',
  ],
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;

