"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/storefront/molecules/product-card";
import type { ProductCard as ProductCardType } from "@/types/storefront";

export function RecentlyViewedCarousel() {
  const [items, setItems] = useState<ProductCardType[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("recently_viewed") || "[]";
      const arr: Array<{ id: string; name: string; slug: string; price: number | string; primaryImage?: string }> = JSON.parse(raw);
      const mapped: ProductCardType[] = (arr || []).slice(0, 12).map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: typeof p.price === "string" ? parseFloat(p.price) : (p.price || 0),
        compareAtPrice: undefined,
        primaryImage: p.primaryImage || "/placeholder-product.svg",
        images: p.primaryImage ? [p.primaryImage] : [],
        rating: 0,
        reviewCount: 0,
        stockStatus: "in_stock",
        isFeatured: false,
        badge: undefined,
      }));
      setItems(mapped);
    } catch {}
  }, []);

  if (!items.length) return null;

  return (
    <section aria-labelledby="recently-viewed-heading" className="my-10">
      <h2 id="recently-viewed-heading" className="text-xl font-semibold mb-4">Recently viewed</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
