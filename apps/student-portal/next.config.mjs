/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@simplicion/ui',
    '@simplicion/tenant',
    '@simplicion/catalog',
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

