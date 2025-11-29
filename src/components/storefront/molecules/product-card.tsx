"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, Heart, Eye, Truck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "../atoms/price-display";
import { RatingStars } from "../atoms/rating-stars";
import { ProductBadge } from "../atoms/product-badge";
import type { ProductCard as ProductCardType } from "@/types/storefront";
import { useCartStore } from "@/stores/cart.store";
import { useWishlistStore } from "@/stores/wishlist.store";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/storefront/providers/currency-provider";

function truncateWords(text: string, limit: number) {
  const words = (text || "").trim().split(/\s+/);
  return words.length > limit ? words.slice(0, limit).join(" ") + "…" : text;
}

interface ProductCardProps {
  product: ProductCardType;
  className?: string;
  onQuickView?: (productSlug: string) => void;
}

export function ProductCard({ product, className, onQuickView }: ProductCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);
  const [isBuying, setIsBuying] = useState(false);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id));
  const [mounted, setMounted] = useState(false);
  const { currency } = useCurrency();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by deferring wishlist-derived UI until mounted
  const wish = mounted && isInWishlist;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addItem(product.id, undefined, 1);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product.slug);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsBuying(true);
      const res = await fetch("/api/storefront/buy-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error?.message || "Buy Now failed");
      router.push("/checkout?mode=buy-now");
    } catch (err: any) {
      toast.error(err?.message || "Failed to start checkout");
    } finally {
      setIsBuying(false);
    }
  };

  const isOutOfStock = product.stockStatus === "out_of_stock";

  const hasDiscount = typeof product.compareAtPrice === "number" && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;
  const priceFormatted = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(product.price);
  const compareFormatted = hasDiscount
    ? new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(product.compareAtPrice!)
    : null;

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        "group relative block rounded-lg border bg-card transition-shadow hover:shadow-lg overflow-hidden",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-lg bg-muted">
        <Image
          src={
            product.primaryImage && product.primaryImage.startsWith("http")
              ? product.primaryImage
              : "/placeholder-product.svg"
          }
          alt={product.name}
          fill
          className={cn(
            "object-contain transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none motion-reduce:hover:scale-100",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.badge && <ProductBadge type={product.badge} />}
          {isOutOfStock && <ProductBadge type="out-of-stock" />}
        </div>

        {/* Quick Actions - Show on hover */}
        <div
          className={cn(
            "absolute right-2 top-2 flex flex-col gap-2 transition-opacity duration-200",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background",
              wish && "text-red-500"
            )}
            onClick={handleWishlist}
            aria-label={wish ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={cn("h-4 w-4", wish && "fill-current")} />
            <span className="sr-only" suppressHydrationWarning>
              {wish ? "Remove from wishlist" : "Add to wishlist"}
            </span>
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full shadow-md"
            onClick={handleQuickView}
            aria-label="Quick view"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">Quick view</span>
          </Button>
        </div>

        {/* Add to Cart + Buy Now - Show on hover */}
        {/* {!isOutOfStock && (
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 p-2 transition-transform duration-200 translate-y-0",
              !isHovered && "md:translate-y-full"
            )}
          >
            <div className="grid grid-cols-2 gap-2">
              <Button
                className="shadow-md"
                onClick={handleAddToCart}
                disabled={isLoading}
                aria-label="Add to cart"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {isLoading ? "Adding..." : "Add"}
              </Button>
              <Button
                variant="outline"
                className="shadow-md"
                onClick={handleBuyNow}
                disabled={isBuying}
                aria-label="Buy now"
              >
                {isBuying ? "Loading..." : "Buy Now"}
              </Button>
            </div>
          </div>
        )} */}
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4">
        {/* Product Name */}
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-tight group-hover:text-primary transition-colors">
          {truncateWords(product.name, 5)}
        </h3>

        {/* Rating badge */}
        {product.rating > 0 && (
          <div className="mb-2 inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-muted rounded px-1.5 py-0.5">
              {product.rating.toFixed(1)}
              <Star className="h-3.5 w-3.5 text-green-600" fill="currentColor" />
            </span>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
        )}

        {/* Price Row */}
        <div className="mt-1 flex flex-wrap items-baseline gap-2">
          <span className="text-xs text-muted-foreground">{(currency.code || "USD").toUpperCase()}</span>
          <span className="text-xl font-extrabold tracking-tight">{priceFormatted}</span>
          {hasDiscount && (
            <>
              <span className="text-sm text-muted-foreground line-through">{compareFormatted}</span>
              <span className="text-sm font-semibold text-green-600">{discountPercent}% OFF</span>
            </>
          )}
        </div>

        {/* Free Delivery */}
        {/* <div className="mt-2 flex items-center gap-2 text-xs text-blue-700">
          <Truck className="h-4 w-4" />
          <span>Free Delivery</span>
        </div> */}

        {/* Stock Status */}
        {product.stockStatus === "low_stock" && (
          <p className="mt-2 text-xs text-orange-600 dark:text-orange-400">
            Only few left in stock
          </p>
        )}
        {isOutOfStock && (
          <p className="mt-2 text-xs text-muted-foreground">
            Out of stock
          </p>
        )}
      </div>
    </Link>
  );
}
