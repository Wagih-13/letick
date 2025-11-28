import { ProductGrid } from "../organisms/product-grid";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getFeaturedProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://modestwear.cloud";
    const res = await fetch(`${baseUrl}/api/storefront/products/featured?limit=8`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    });

    if (!res.ok) {
      throw new Error("Failed to fetch featured products");
    }

    const data = await res.json();
    return data.success ? data.data : [];
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
          <p className="text-muted-foreground mt-2">
            Handpicked items just for you
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/shop">View All</Link>
        </Button>
      </div>
      <ProductGrid products={products} columns={4} />
    </section>
  );
}
