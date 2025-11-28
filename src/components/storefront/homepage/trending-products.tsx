import { ProductCardSkeleton } from "../atoms/product-card-skeleton";
import { ProductGrid } from "../organisms/product-grid";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { storefrontProductsService } from "@/server/storefront/services/products.service";

async function getTrendingProducts() {
  try {
    // Read directly from DB via service (server component)
    const data = await storefrontProductsService.getTrending(8);
    return Array.isArray(data) ? data : [];
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
