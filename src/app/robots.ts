import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "hhttp://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/account/",
          "/checkout/",
          "/cart/",
          "/wishlist/",
          "/dashboard/",
          "/*?*sort=*", // Prevent indexing of sorted pages (duplicate content)
          "/*?*page=*", // Prevent indexing of paginated pages individually
        ],
        crawlDelay: 1, // Be gentle on server
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/account/",
          "/checkout/",
          "/cart/",
          "/wishlist/",
          "/dashboard/",
        ],
      },
      {
        userAgent: "Googlebot-Image",
        allow: "/",
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      // Future: add separate sitemaps for images, products if site grows large
      // `${baseUrl}/sitemap-products.xml`,
      // `${baseUrl}/sitemap-images.xml`,
    ],
    host: baseUrl,
  };
}
