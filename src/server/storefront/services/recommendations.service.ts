import { storefrontProductsRepository } from "../repositories/products.repository";
import { storefrontProductsService } from "./products.service";
import { storefrontCartService } from "./cart.service";
import { storefrontWishlistRepository } from "../repositories/wishlist.repository";
import { auth } from "@/auth";
import type { ProductCard } from "@/types/storefront";

export class RecommendationsService {
  private async popularFallback(limit: number): Promise<ProductCard[]> {
    // Try trending first
    const trending = await storefrontProductsService.getTrending(limit);
    if (trending && trending.length) return trending;

    // Then featured
    const featured = await storefrontProductsService.getFeatured(limit);
    if (featured && featured.length) return featured;

    // Finally newest
    try {
      const newest = await storefrontProductsService.list({ page: 1, limit, sortBy: "newest" });
      return newest.items;
    } catch {
      return [];
    }
  }
  /**
   * Recommend products for a given productId based on its categories.
   */
  async forProduct(productId: string, limit = 8): Promise<ProductCard[]> {
    try {
      const product = await storefrontProductsRepository.getById(productId);
      if (!product) return [];
      const catIds = (product.categories ?? []).map((c: any) => c.id);
      const items = await storefrontProductsRepository.recommendByCategoryIds(catIds, [productId], limit);
      if (!items || items.length === 0) {
        return await this.popularFallback(limit);
      }
      return items.map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        price: parseFloat(item.price),
        compareAtPrice: item.compareAtPrice ? parseFloat(item.compareAtPrice) : undefined,
        primaryImage: item.primaryImageUrl ?? "/placeholder-product.svg",
        images: item.primaryImageUrl ? [item.primaryImageUrl] : [],
        rating: item.rating ? parseFloat(item.rating) : 0,
        reviewCount: Number(item.reviewCount ?? 0),
        stockStatus: item.stockStatus,
        isFeatured: !!item.isFeatured,
        badge: undefined,
      }));
    } catch (error) {
      console.error("Error in recommendations.forProduct:", error);
      return [];
    }
  }

  /**
   * Recommend products based on items in the cart (by overlapping categories), excluding items already in cart.
   */
  // eslint-disable-next-line complexity
  async forCart(cartId: string | undefined, limit = 8): Promise<ProductCard[]> {
    try {
      if (!cartId) return await this.popularFallback(limit);
      const cart = await storefrontCartService.getCart(cartId);
      if (!cart || cart.items.length === 0) return await this.popularFallback(limit);

      const excludeProductIds = cart.items.map((it) => it.productId);
      const catIdSet = new Set<string>();
      for (const it of cart.items) {
        try {
          const p = await storefrontProductsRepository.getById(it.productId);
          for (const c of p?.categories ?? []) catIdSet.add(c.id);
        } catch {
          // Ignore errors for individual products
        }
      }
      const catIds = Array.from(catIdSet);
      if (catIds.length === 0) return await this.popularFallback(limit);

      const items = await storefrontProductsRepository.recommendByCategoryIds(catIds, excludeProductIds, limit);
      if (!items || items.length === 0) {
        return await storefrontProductsService.getTrending(limit);
      }
      return items.map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        price: parseFloat(item.price),
        compareAtPrice: item.compareAtPrice ? parseFloat(item.compareAtPrice) : undefined,
        primaryImage: item.primaryImageUrl ?? "/placeholder-product.svg",
        images: item.primaryImageUrl ? [item.primaryImageUrl] : [],
        rating: item.rating ? parseFloat(item.rating) : 0,
        reviewCount: Number(item.reviewCount ?? 0),
        stockStatus: item.stockStatus,
        isFeatured: !!item.isFeatured,
        badge: undefined,
      }));
    } catch (error) {
      console.error("Error in recommendations.forCart:", error);
      return [];
    }
  }

  /**
   * Recommend products for a user, using wishlist categories first, fallback to trending.
   */
  // eslint-disable-next-line complexity
  async forUser(limit = 8): Promise<ProductCard[]> {
    try {
      const session = await auth();
      const userId = (session as any)?.user?.id as string | undefined;
      if (!userId) return await this.popularFallback(limit);

      const wishlist = await storefrontWishlistRepository.listItems(userId);
      const excludeProductIds = wishlist.map((w: any) => w.productId);
      const catIdSet = new Set<string>();
      for (const w of wishlist) {
        try {
          const p = await storefrontProductsRepository.getById(w.productId);
          for (const c of p?.categories ?? []) catIdSet.add(c.id);
        } catch {
          // Ignore errors for individual wishlist items
        }
      }
      const catIds = Array.from(catIdSet);

      if (catIds.length === 0) return await storefrontProductsService.getTrending(limit);

      const items = await storefrontProductsRepository.recommendByCategoryIds(catIds, excludeProductIds, limit);
      if (!items || items.length === 0) {
        return await this.popularFallback(limit);
      }
      return items.map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        price: parseFloat(item.price),
        compareAtPrice: item.compareAtPrice ? parseFloat(item.compareAtPrice) : undefined,
        primaryImage: item.primaryImageUrl ?? "/placeholder-product.svg",
        images: item.primaryImageUrl ? [item.primaryImageUrl] : [],
        rating: item.rating ? parseFloat(item.rating) : 0,
        reviewCount: Number(item.reviewCount ?? 0),
        stockStatus: item.stockStatus,
        isFeatured: !!item.isFeatured,
        badge: undefined,
      }));
    } catch (error) {
      console.error("Error in recommendations.forUser:", error);
      return [];
    }
  }
}

export const recommendationsService = new RecommendationsService();
