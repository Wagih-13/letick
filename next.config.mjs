/** @type {import('next').NextConfig} */

const nextConfig = {
  // Image optimization configuration
  images: {
    unoptimized: false, // Disable Next.js image optimization - serve as-is
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.modestwear.cloud', // Replace with your domain
        pathname: '/uploads/**',
      },
    ],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_UPLOADS_PATH: '/uploads',
  },

  // Don't include uploads folder in build
  // Images are served by Nginx at runtime, not bundled
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
};

export default nextConfig;