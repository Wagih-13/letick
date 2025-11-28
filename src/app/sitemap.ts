import { db } from "@/shared/db";
import { schema } from "@/shared/db";
import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Static routes with priorities
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/shop/new`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shop/sale`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/returns`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    // Fetch categories from database
    const categories = await db
      .select({
        slug: schema.categories.slug,
        updatedAt: schema.categories.updatedAt,
      })
      .from(schema.categories)
      .where(eq(schema.categories.isActive, true));

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${baseUrl}/shop/${cat.slug}`,
      lastModified: cat.updatedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

    // Fetch products from database - using 'active' status instead of 'published'
    const products = await db
      .select({
        slug: schema.products.slug,
        updatedAt: schema.products.updatedAt,
      })
      .from(schema.products)
      .where(eq(schema.products.status, "active"));

    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Fallback to static routes only if database query fails
    return staticRoutes;
  }
}

