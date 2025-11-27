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
        pathname: '/upload/**',
      },
      {
        protocol: 'https',
        hostname: 'www.modestwear.cloud', // Replace with your domain
        pathname: '/upload/**',
      },
    ],
  },

  // Rewrite rules - bypass Next.js build, let Nginx handle it
  async rewrites() {
    return {
      beforeFiles: [
        // Don't rewrite, let Nginx handle these directly
        {
          source: '/upload/:path*',
          destination: '/upload/:path*',
        },
      ],
    };
  },

  // Cache headers for production
  async headers() {
    return [
      // All uploads - let Nginx serve directly
      {
        source: '/upload/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_PRODUCT_IMAGE_PATH: '/upload/products',
    NEXT_PUBLIC_CATEGORY_IMAGE_PATH: '/upload/categories',
  },
};

export default nextConfig;