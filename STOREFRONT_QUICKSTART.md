# 🚀 Storefront Quick Start Guide

> **Reference**: This document consolidates the detailed specs in `.kiro/specs/customer-storefront/` into a developer-friendly quick-start guide.

---

## 📚 Full Documentation

- **Requirements**: [`.kiro/specs/customer-storefront/requirements.md`](.kiro/specs/customer-storefront/requirements.md)
- **Design Document**: [`.kiro/specs/customer-storefront/design.md`](.kiro/specs/customer-storefront/design.md)
- **Implementation Tasks**: [`.kiro/specs/customer-storefront/tasks.md`](.kiro/specs/customer-storefront/tasks.md)

---

## 🎯 Project Overview

Building a modern e-commerce storefront using:
- **Backend**: 95% complete (products, cart, orders, shipping, reviews, discounts)
- **Frontend**: To be built following this plan
- **Timeline**: 9 weeks across 17 phases
- **Target**: Lighthouse score > 90, < 2.5s LCP, WCAG 2.1 AA compliant

---

## 🏗️ Complete Folder Structure

```
src/
├── app/
│   ├── (storefront)/                 # 🆕 PUBLIC PAGES
│   │   ├── layout.tsx                # Storefront header/footer layout
│   │   ├── page.tsx                  # Homepage (ISR, 60s revalidation)
│   │   │
│   │   ├── shop/
│   │   │   ├── page.tsx              # All products (ISR)
│   │   │   └── [category]/
│   │   │       └── page.tsx          # Category page (ISR)
│   │   │
│   │   ├── product/
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # Product detail (SSR)
│   │   │
│   │   ├── search/
│   │   │   └── page.tsx              # Search results (CSR)
│   │   │
│   │   ├── cart/
│   │   │   └── page.tsx              # Shopping cart (CSR)
│   │   │
│   │   ├── checkout/
│   │   │   ├── page.tsx              # Main checkout (CSR)
│   │   │   ├── information/
│   │   │   │   └── page.tsx          # Shipping info step
│   │   │   ├── shipping/
│   │   │   │   └── page.tsx          # Shipping method step
│   │   │   ├── payment/
│   │   │   │   └── page.tsx          # Payment step
│   │   │   └── confirmation/
│   │   │       └── page.tsx          # Order confirmation
│   │   │
│   │   └── account/                  # 🔒 PROTECTED
│   │       ├── layout.tsx            # Account sidebar
│   │       ├── page.tsx              # Dashboard
│   │       ├── orders/
│   │       │   ├── page.tsx          # Order history
│   │       │   └── [id]/
│   │       │       └── page.tsx      # Order details
│   │       ├── addresses/
│   │       │   └── page.tsx          # Address management
│   │       ├── wishlist/
│   │       │   └── page.tsx          # Wishlist
│   │       └── settings/
│   │           └── page.tsx          # Account settings
│   │
│   ├── api/
│   │   └── storefront/               # 🆕 PUBLIC APIs
│   │       ├── products/
│   │       │   ├── route.ts          # GET list with filters
│   │       │   ├── featured/route.ts # GET featured products
│   │       │   ├── trending/route.ts # GET trending products
│   │       │   └── [slug]/
│   │       │       ├── route.ts      # GET product details
│   │       │       ├── reviews/route.ts
│   │       │       └── related/route.ts
│   │       ├── categories/
│   │       │   ├── route.ts          # GET category tree
│   │       │   └── [slug]/
│   │       │       └── products/route.ts
│   │       ├── cart/
│   │       │   ├── route.ts          # GET/POST cart
│   │       │   ├── items/route.ts    # POST/PATCH/DELETE items
│   │       │   ├── merge/route.ts    # POST merge guest cart
│   │       │   └── discount/route.ts # POST apply discount
│   │       ├── checkout/
│   │       │   ├── validate/route.ts
│   │       │   └── orders/route.ts   # POST create order
│   │       ├── shipping/
│   │       │   └── methods/route.ts  # GET shipping options
│   │       ├── account/
│   │       │   ├── orders/route.ts
│   │       │   ├── addresses/route.ts
│   │       │   └── wishlist/route.ts
│   │       └── search/
│   │           ├── route.ts          # GET search results
│   │           └── suggestions/route.ts
│   │
│   └── (main)/                       # ✅ EXISTING ADMIN
│       └── dashboard/...
│
├── components/
│   ├── storefront/                   # 🆕 STOREFRONT COMPONENTS
│   │   ├── atoms/                    # Basic building blocks
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── rating-stars.tsx
│   │   │   └── price-display.tsx
│   │   ├── molecules/                # Simple combinations
│   │   │   ├── product-card.tsx
│   │   │   ├── search-bar.tsx
│   │   │   ├── cart-icon.tsx
│   │   │   └── address-card.tsx
│   │   ├── organisms/                # Complex components
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   ├── product-grid.tsx
│   │   │   ├── product-gallery.tsx
│   │   │   ├── cart-drawer.tsx
│   │   │   └── filter-sidebar.tsx
│   │   └── templates/                # Page layouts
│   │       ├── shop-layout.tsx
│   │       └── checkout-layout.tsx
│   └── ui/                           # ✅ EXISTING shadcn/ui
│
├── lib/
│   ├── storefront/                   # 🆕 STOREFRONT UTILS
│   │   ├── api-client.ts             # API wrapper with error handling
│   │   ├── cart-utils.ts             # Cart calculations
│   │   ├── price-utils.ts            # Price formatting
│   │   ├── seo-utils.ts              # Meta tags, JSON-LD
│   │   └── tracking.ts               # Analytics events
│   └── ...existing utils
│
├── hooks/
│   ├── storefront/                   # 🆕 STOREFRONT HOOKS
│   │   ├── use-cart.ts               # Cart operations
│   │   ├── use-wishlist.ts           # Wishlist operations
│   │   ├── use-products.ts           # Product queries (React Query)
│   │   └── use-checkout.ts           # Checkout state
│   └── ...existing hooks
│
├── server/
│   ├── storefront/                   # 🆕 STOREFRONT BACKEND
│   │   ├── controllers/
│   │   │   ├── products.controller.ts
│   │   │   ├── cart.controller.ts
│   │   │   ├── checkout.controller.ts
│   │   │   └── reviews.controller.ts
│   │   ├── services/
│   │   │   ├── products.service.ts
│   │   │   ├── cart.service.ts
│   │   │   ├── checkout.service.ts
│   │   │   └── search.service.ts
│   │   └── repositories/
│   │       ├── products.repository.ts
│   │       └── cart.repository.ts
│   └── ...existing admin services
│
└── types/
    └── storefront.ts                 # 🆕 STOREFRONT TYPES
```

---

## 🔧 Tech Stack Decisions

### Frontend
- ✅ **Next.js 15**: App Router with hybrid rendering (ISR/SSR/CSR)
- ✅ **React Query**: Data fetching, caching, optimistic updates
- ✅ **Zustand**: Client state (cart, wishlist, filters)
- ✅ **TailwindCSS + shadcn/ui**: Styling (already in use)
- ✅ **React Hook Form + Zod**: Forms and validation
- 🆕 **Embla Carousel**: Product image galleries
- 🆕 **next-intl**: Internationalization (optional)

### Backend
- ✅ **PostgreSQL + Drizzle**: Database (already in use)
- ✅ **NextAuth v5**: Authentication (already in use)
- 🆕 **Stripe SDK**: Payment processing
- 🆕 **SendGrid/Mailgun**: Transactional emails

### DevOps & Testing
- 🆕 **Playwright**: E2E testing
- 🆕 **React Testing Library**: Component testing
- 🆕 **Vitest**: Unit testing
- 🆕 **Storybook**: Component documentation
- 🆕 **Lighthouse CI**: Performance monitoring

---

## 📋 Implementation Phases (9 Weeks)

### **Week 1-2: Foundation**
- [x] Project structure and routing
- [x] API client with React Query
- [x] Design system (atomic components)
- [x] Authentication integration

### **Week 3-4: Product Catalog**
- [ ] Homepage with ISR
- [ ] Product listing with filters
- [ ] Product detail with SSR
- [ ] Search with autocomplete
- [ ] Category pages

### **Week 5-6: Shopping Experience**
- [ ] Cart with Zustand + localStorage
- [ ] Multi-step checkout
- [ ] Stripe payment integration
- [ ] Order confirmation
- [ ] Email notifications

### **Week 7: Account Features**
- [ ] Account dashboard
- [ ] Order history with tracking
- [ ] Address management
- [ ] Wishlist
- [ ] Profile settings

### **Week 8: Advanced Features**
- [ ] Product reviews with images
- [ ] Quick view modal
- [ ] Related products
- [ ] Real-time inventory
- [ ] Back-in-stock notifications
- [ ] Promotional banners

### **Week 9: Polish & Launch**
- [ ] Mobile optimization + PWA
- [ ] SEO (sitemap, structured data)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance optimization (Core Web Vitals)
- [ ] Analytics integration (GA4)
- [ ] Testing (unit, integration, E2E)
- [ ] Production deployment

---

## 🎨 Key Design Patterns

### 1. Rendering Strategy

| Page | Strategy | Reason | Revalidation |
|------|----------|--------|--------------|
| Homepage | **ISR** | High traffic, semi-dynamic | 60s |
| Category | **ISR** | SEO critical | 60s |
| Product | **SSR** | Real-time inventory | On-demand |
| Search | **CSR** | User-specific | N/A |
| Cart | **CSR** | User-specific | N/A |
| Checkout | **CSR** | Secure, private | N/A |
| Account | **CSR** | Protected | N/A |

### 2. Data Fetching with React Query

```typescript
// Product query hook
export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProduct(slug),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Cart mutation with optimistic update
export function useAddToCart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (item: CartItem) => addToCart(item),
    onMutate: async (newItem) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      
      // Snapshot previous value
      const previous = queryClient.getQueryData(['cart']);
      
      // Optimistically update
      queryClient.setQueryData(['cart'], (old: Cart) => ({
        ...old,
        items: [...old.items, newItem],
      }));
      
      return { previous };
    },
    onError: (err, newItem, context) => {
      // Rollback on error
      queryClient.setQueryData(['cart'], context?.previous);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
```

### 3. Cart State Management (Zustand)

```typescript
// src/stores/cart.store.ts
interface CartState {
  cart: Cart | null;
  isOpen: boolean;
  
  // Actions
  fetchCart: () => Promise<void>;
  addItem: (productId: string, variantId?: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyDiscount: (code: string) => Promise<void>;
  openDrawer: () => void;
  closeDrawer: () => void;
  
  // Computed
  itemCount: number;
  subtotal: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      isOpen: false,
      
      fetchCart: async () => {
        const data = await fetchCartAPI();
        set({ cart: data });
      },
      
      addItem: async (productId, variantId, quantity = 1) => {
        await addToCartAPI({ productId, variantId, quantity });
        await get().fetchCart();
        set({ isOpen: true }); // Open drawer
      },
      
      get itemCount() {
        return get().cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
      },
      
      get subtotal() {
        return get().cart?.subtotal ?? 0;
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);
```

### 4. API Endpoint Examples

```typescript
// GET /api/storefront/products
interface ProductListQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'name' | 'newest' | 'popular';
  search?: string;
  inStock?: boolean;
}

// Response
interface ProductListResponse {
  items: ProductCard[];
  total: number;
  page: number;
  hasMore: boolean;
}

// GET /api/storefront/products/[slug]
interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: ProductImage[];
  variants: ProductVariant[];
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  rating: number;
  reviewCount: number;
  categories: Category[];
  metaTitle: string;
  metaDescription: string;
}

// POST /api/storefront/cart/items
interface AddToCartRequest {
  productId: string;
  variantId?: string;
  quantity: number;
}

// POST /api/storefront/checkout/orders
interface PlaceOrderRequest {
  cartId: string;
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethodId: string;
  paymentMethod: 'credit_card' | 'paypal' | 'cash_on_delivery';
  paymentDetails?: PaymentDetails;
  customerNote?: string;
}
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install @tanstack/react-query zustand embla-carousel-react next-intl
npm install --save-dev playwright @testing-library/react vitest
```

### 2. Configure React Query

```typescript
// src/app/(storefront)/layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <main>{children}</main>
      <Footer />
    </QueryClientProvider>
  );
}
```

### 3. Create First API Route

```typescript
// src/app/api/storefront/products/route.ts
import { NextRequest } from 'next/server';
import { ProductsController } from '@/server/storefront/controllers/products.controller';

export async function GET(request: NextRequest) {
  return ProductsController.list(request);
}
```

### 4. Build First Page

```typescript
// src/app/(storefront)/shop/page.tsx
import { ProductGrid } from '@/components/storefront/organisms/product-grid';
import { FilterSidebar } from '@/components/storefront/organisms/filter-sidebar';

export default async function ShopPage() {
  // Fetch products with ISR
  const products = await fetchProducts();
  
  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <FilterSidebar />
        </aside>
        <main className="lg:col-span-3">
          <ProductGrid products={products} />
        </main>
      </div>
    </div>
  );
}

export const revalidate = 60; // ISR: revalidate every 60 seconds
```

---

## 📊 Success Metrics

### Performance Targets
- ✅ LCP < 2.5s
- ✅ FID < 100ms
- ✅ CLS < 0.1
- ✅ Lighthouse score > 90

### Business Targets
- ✅ Conversion rate > 2.5%
- ✅ Cart abandonment < 70%
- ✅ Average order value > $75
- ✅ Mobile traffic > 60%

### Quality Targets
- ✅ WCAG 2.1 Level AA compliance
- ✅ 80% test coverage
- ✅ Zero critical security vulnerabilities
- ✅ 99.9% uptime

---

## 📖 Next Steps

1. **Review detailed specs**: Read through `.kiro/specs/customer-storefront/` for complete requirements
2. **Choose starting phase**: Recommend starting with Phase 1 (Foundation)
3. **Set up development environment**: Install dependencies and configure tools
4. **Create first route**: Build homepage or product listing first
5. **Iterate**: Follow the 17-phase plan in `tasks.md`

---

## 🔗 Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Stripe Integration Guide](https://stripe.com/docs/payments/accept-a-payment)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Ready to start building?** The detailed implementation tasks are in `.kiro/specs/customer-storefront/tasks.md`. Begin with Phase 1 and work through the 17 phases systematically.
