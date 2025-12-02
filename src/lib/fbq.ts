/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Facebook Pixel (fbq) helper utilities
 * Provides type-safe wrappers around the Meta Pixel tracking functions
 */

// Extend Window interface to include fbq
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: (...args: any[]) => void;
  }
}

/**
 * Safely execute fbq command if available
 */
function fbq(...args: any[]): void {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq(...args);
  }
}

/**
 * Track ViewContent event
 * @param params - Product details
 */
export function trackViewContent(params: {
  id: string | number;
  name?: string;
  price?: number;
  currency?: string;
  category?: string;
  variantId?: string | number;
  quantity?: number;
}): void {
  const contentId = params.variantId ?? params.id;
  fbq("track", "ViewContent", {
    content_ids: [String(contentId)],
    content_type: "product",
    content_name: params.name,
    content_category: params.category,
    value: params.price,
    currency: params.currency ?? process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "EGP",
    contents: [
      {
        id: String(contentId),
        quantity: params.quantity ?? 1,
        item_price: params.price,
      },
    ],
  });
}

/**
 * Track AddToCart event
 * @param params - Product details
 */
export function trackAddToCart(params: {
  id: string | number;
  name?: string;
  price?: number;
  currency?: string;
  category?: string;
  variantId?: string | number;
  quantity?: number;
}): void {
  const contentId = params.variantId ?? params.id;
  fbq("track", "AddToCart", {
    content_ids: [String(contentId)],
    content_type: "product",
    content_name: params.name,
    content_category: params.category,
    value: params.price,
    currency: params.currency ?? process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "EGP",
    contents: [
      {
        id: String(contentId),
        quantity: params.quantity ?? 1,
        item_price: params.price,
      },
    ],
  });
}

/**
 * Track AddToWishlist event
 * @param params - Product details
 */
export function trackAddToWishlist(params: {
  id: string | number;
  name?: string;
  price?: number;
  currency?: string;
  category?: string;
  variantId?: string | number;
}): void {
  const contentId = params.variantId ?? params.id;
  fbq("track", "AddToWishlist", {
    content_ids: [String(contentId)],
    content_type: "product",
    content_name: params.name,
    content_category: params.category,
    value: params.price,
    currency: params.currency ?? process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "EGP",
    contents: [
      {
        id: String(contentId),
        quantity: 1,
        item_price: params.price,
      },
    ],
  });
}

/**
 * Track InitiateCheckout event
 * @param params - Checkout details
 */
export function trackInitiateCheckout(params: {
  currency: string;
  value: number;
  items: Array<{
    id: string | number;
    quantity: number;
    item_price: number;
  }>;
}): void {
  fbq("track", "InitiateCheckout", {
    content_ids: params.items.map((item) => String(item.id)),
    content_type: "product",
    value: params.value,
    currency: params.currency,
    num_items: params.items.reduce((sum, item) => sum + item.quantity, 0),
    contents: params.items.map((item) => ({
      id: String(item.id),
      quantity: item.quantity,
      item_price: item.item_price,
    })),
  });
}

/**
 * Track Purchase event
 * @param params - Purchase details
 */
export function trackPurchase(params: {
  currency: string;
  value: number;
  items: Array<{
    id: string | number;
    quantity: number;
    item_price: number;
  }>;
}): void {
  fbq("track", "Purchase", {
    content_ids: params.items.map((item) => String(item.id)),
    content_type: "product",
    value: params.value,
    currency: params.currency,
    num_items: params.items.reduce((sum, item) => sum + item.quantity, 0),
    contents: params.items.map((item) => ({
      id: String(item.id),
      quantity: item.quantity,
      item_price: item.item_price,
    })),
  });
}
