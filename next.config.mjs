/** @type {import('next').NextConfig} */

const nextConfig = {
  // إعدادات الأداء والسلامة العامة (لم تتغير)
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  // إعدادات تحسين الصور
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 420, 640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // يمكن ترك هذا الإعداد عالياً لأنه يخص الصور التي يعالجها Next.js ويضيف لها بصمة فريدة (Fingerprint)
    minimumCacheTTL: 31536000, // cache optimized images for up to 1 year 
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/uploads/**',
      }
    ],
  },


  // تهيئة رؤوس (Headers) التخزين المؤقت
  async headers() {
    return [
      // 1. ملفات Next.js الثابتة (الكود والأصول)
      // آمنة للتخزين القوي (immutable) لأن Next.js يغير اسمها عند كل بناء (Build).
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },

      // 2. ملفات المستخدم المُحمّلة (User Uploads) - **التعديل هنا** 🚀
      // (Cache-Control: public, max-age=0, must-revalidate)
      // - max-age=0: لا يمكن استخدام النسخة المخزنة مؤقتاً دون التحقق.
      // - must-revalidate: يجب إعادة التحقق مع الخادم في كل مرة.
      // هذا يضمن أن المتصفح سيرسل طلب تحقق (If-Modified-Since) على الفور.
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          // يمكن أيضاً استخدام 'no-cache'
        ],
      },
    ];
  },

  // ... (بقية الإعدادات كما هي)


  env: {
    NEXT_PUBLIC_UPLOADS_PATH: '/uploads',
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
    reactRemoveProperties: true,
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['@/components/ui', 'date-fns', 'lucide-react'],
  },

};

export default nextConfig;