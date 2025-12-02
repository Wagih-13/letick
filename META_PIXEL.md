# Meta Pixel Integration Summary

## Environment Variables
Set these in your `.env.local` (or `.env`) and restart the server:

```
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=YOUR_PIXEL_ID
NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN
NEXT_PUBLIC_DEFAULT_CURRENCY=EGP
```

## Base Setup
- **Global injection**: `src/app/layout.tsx`
  - Loads Meta Pixel via `next/script` and fires `PageView`.
  - Uses `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` for `fbq('init')`.
  - Includes `<noscript>` image fallback.

## FBQ Helper
- **File**: `src/lib/fbq.ts`
- **Safely wraps** `window.fbq` and exports helpers:
  - `trackViewContent({ id, name?, price?, currency, category?, variantId?, quantity? })`
  - `trackAddToCart({ id, name?, price?, currency, category?, variantId?, quantity? })`
  - `trackAddToWishlist({ id, name?, price?, currency, category?, variantId? })`
  - `trackInitiateCheckout({ currency, value, items: [{ id, quantity, item_price }] })`
  - `trackPurchase({ currency, value, items: [{ id, quantity, item_price }] })`
- Sends `content_ids`, `contents`, `value`, and `currency` in each event.

## Event Wiring (Client)
- **ViewContent** and **AddToCart**
  - `src/components/storefront/organisms/product-info.tsx`
  - `ViewContent` fires on product view and variant change.
  - `AddToCart` fires after adding an item.
- **AddToWishlist**
  - `src/components/storefront/organisms/product-info.tsx` (product page)
  - `src/components/storefront/molecules/product-card.tsx` (grid cards)
  - Only fires when the item is newly added (not removed).
- **InitiateCheckout**
  - `src/app/(storefront)/checkout/page.tsx`
  - Fires once when checkout loads and cart has items.
- **Purchase**
  - `src/app/(storefront)/order/[id]/page.tsx`
  - Fetches order details then fires once with final value and items.

## API Update for Purchase Mapping
- **File**: `src/app/api/storefront/orders/[id]/route.ts`
- Now returns `variantId` for each order item so Purchase events can prefer variant IDs.

## Catalog Feed (for Event-to-Catalog Matching)
- **Endpoint**: `/api/storefront/catalog/feed`
  - JSON: `/api/storefront/catalog/feed`
  - CSV: `/api/storefront/catalog/feed?format=csv`
- **ID alignment**:
  - Item `id` = variant `id` (preferred for Meta matching).
  - `item_group_id` = product `id` (groups variants).
- **Fields**: `id, item_group_id, title, description, availability, condition, price, link, image_link`.
- Uses `NEXT_PUBLIC_SITE_URL` for product links and `NEXT_PUBLIC_DEFAULT_CURRENCY` for prices.

## Testing
- In Meta Events Manager → Test Events:
  - Visit a product page → expect `ViewContent`.
  - Add to cart → `AddToCart`.
  - Open checkout → `InitiateCheckout`.
  - Place order → `Purchase`.
  - Add to wishlist → `AddToWishlist`.
- Confirm “Matched to catalog” after you configure the Catalog feed in Commerce Manager.

## Notes
- Events prefer variant IDs for `content_ids` when available to improve catalog matching.
- Duplicate prevention: key events use refs to fire once per page load.
- Consider gating `fbq` under consent if you use a CMP.

## Next Steps
- Set your actual `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` and deploy.
- Add the catalog feed URL in Commerce Manager and schedule updates.
- Verify matching and event quality in Events Manager.
