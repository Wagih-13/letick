/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
  
  },
   images: {
    domains: ['modestwear.cloud', 'www.modestwear.cloud'], // أي دومين هتجيب منه صور
    unoptimized: true, // لو الصور محلية على السيرفر ومش عايز Next.js يعمل optimization
    // remotePatterns: [
    //   { protocol: "https", hostname: "**" },
    //   { protocol: "http", hostname: "**" },
    // ],  
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/dashboard/default",
        permanent: false, 
      },
    ];
  },
}

export default nextConfig
