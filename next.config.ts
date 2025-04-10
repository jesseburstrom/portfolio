import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  basePath: '/portfolio',
  images: {
    domains: ['images.unsplash.com'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**', },
      { protocol: 'https', hostname: 'via.placeholder.com', port: '', pathname: '/**', },
    ],
    unoptimized: true,
  },
  output: 'export',
};

export default nextConfig;
