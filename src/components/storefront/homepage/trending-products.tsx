import { ProductCardSkeleton } from "../atoms/product-card-skeleton";
import { ProductGrid } from "../organisms/product-grid";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getTrendingProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/storefront/products/trending?limit=8`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    });

    if (!res.ok) {
      throw new Error("Failed to fetch trending products");
    }

    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error fetching trending products:", error);
    return [];
  }
}

export async function TrendingProducts() {
  const products = await getTrendingProducts();

  if (products.length === 0) {
    return null; // Don't render section if no trending products
  }

  return (
    <section className="py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Trending Now</h2>
          <p className="text-muted-foreground mt-2">
            Most popular products this week
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/shop?sortBy=popular">View All</Link>
        </Button>
      </div>
      <ProductGrid products={products} columns={4} />
    </section>
  );
}
