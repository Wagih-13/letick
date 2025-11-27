
///////////////////
/** @type {import('next').NextConfig} */
const path = require('path');
const fs = require('fs');

// External public folder path on VPS
const externalPublicPath = '/home/wagih/modestwear/public';

// Ensure the path exists
if (!fs.existsSync(externalPublicPath)) {
  fs.mkdirSync(externalPublicPath, { recursive: true });
}

const nextConfig = {
  // Image optimization configuration
   reactCompiler: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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

  // Rewrite rules for static files
  async rewrites() {
    return {
      beforeFiles: [
        // Products with year/month structure
        {
          source: '/upload/products/:year/:month/:filename',
          destination: '/upload/products/:year/:month/:filename',
        },
        // Categories
        {
          source: '/upload/categories/:filename',
          destination: '/upload/categories/:filename',
        },
        // Catch all uploads
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
      // Products images caching
      {
        source: '/upload/products/:year/:month/:filename',
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
      // Categories images caching
      {
        source: '/upload/categories/:filename',
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
      // All uploads catch-all
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
    NEXT_PUBLIC_EXTERNAL_PUBLIC_PATH: externalPublicPath,
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@public': externalPublicPath,
    };
    return config;
  },

  // Serve files from external public directory
  staticPageGenerationTimeout: 1000,
};

module.exports = nextConfig;