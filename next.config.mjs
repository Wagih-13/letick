/** @type {import('next').NextConfig} */

const nextConfig = {
  // Image configuration
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.modestwear.cloud', // غيّر باسم دومينك
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'modestwear.cloud',
        pathname: '/uploads/**',
      },
    ],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_UPLOADS_PATH: '/uploads',
  },

  // Headers للـ static files
  async headers() {
    return [
      {
        source: '/uploads/:path*',
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

  // دعم الـ streaming والـ ISR
  experimental: {
    isrMemoryCacheSize: 52 * 1024 * 1024, // 52MB
  },

  // تحسينات الأداء
  swcMinify: true,
  compress: true,
  
  // دعم الـ API routes
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
    responseLimit: '50mb',
  },

  // تجاهل التحذيرات غير الضرورية
  eslint: {
    ignoreDuringBuilds: false,
  },

  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;