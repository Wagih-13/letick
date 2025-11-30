import Link from "next/link";

import { Button } from "@/components/ui/button";
import { storefrontProductsService } from "@/server/storefront/services/products.service";

import { ProductGrid } from "../organisms/product-grid";

async function getFeaturedProducts() {
  try {
    const data = await storefrontProductsService.getFeatured(8);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  if (products.length === 0) {
    return null; // Don't render section if no featured products
  }

  return (
    <section className="py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
          <p className="text-muted-foreground mt-2">Handpicked items just for you</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/shop">View All</Link>
        </Button>
      </div>
      <ProductGrid products={products} columns={3} />
    </section>
  );
}
