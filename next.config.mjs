/** @type {import('next').NextConfig} */

const nextConfig = {
  // Image optimization configuration
  images: {
    unoptimized: true, // Disable Next.js image optimization - serve as-is
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'yourdomain.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.yourdomain.com',
        pathname: '/uploads/**',
      },
    ],
  },


  async headers() {
    return [
      {
        source: '/Storefront/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
       {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          }
        ],
      },
    ];
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