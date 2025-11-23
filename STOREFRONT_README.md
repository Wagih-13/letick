# 🛍️ Next.js E-Commerce Storefront

A complete, production-ready e-commerce storefront built with Next.js 15, TypeScript, and modern web technologies.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Available Pages](#available-pages)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Performance](#performance)
- [SEO](#seo)

---

## ✨ Features

### Customer Features
- 🏠 **Homepage** - Featured products, trending items, category highlights
- 🔍 **Product Discovery** - Browse, search, filter, and sort products
- 📦 **Product Details** - Image gallery with zoom, variants, reviews, related products
- 👁️ **Quick View** - Fast product preview modal
- ❤️ **Wishlist** - Save favorite products (persisted to localStorage)
- 🛒 **Shopping Cart** - Add/remove items, apply discounts, real-time updates
- 💳 **Checkout** - Multi-step checkout flow (shipping, method, payment, review)
- 📊 **Account Dashboard** - Order history, profile, addresses, settings
- 📝 **Order Tracking** - View order details and shipping status
- ⭐ **Product Reviews** - Read and write reviews with images
- 🎯 **Categories** - Browse products by category with breadcrumbs

### Technical Features
- 🚀 **Next.js 15** - App Router, Server Components, ISR
- 📱 **Fully Responsive** - Mobile-first design
- ♿ **Accessible** - WCAG 2.1 AA compliant
- 🎨 **Modern UI** - Tailwind CSS + shadcn/ui components
- 🔄 **Real-time Updates** - React Query for data fetching
- 💾 **Persistent State** - Zustand with localStorage
- 🔒 **Type-Safe** - Full TypeScript coverage
- 🎭 **Optimistic UI** - Instant feedback on user actions
- 📈 **SEO Optimized** - Meta tags, structured data, sitemap
- ⚡ **Performance** - Code splitting, lazy loading, image optimization

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

### Backend
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **API**: Next.js API Routes
- **Authentication**: NextAuth.js v5

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd next-shadcn-admin-dashboard-main
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# App
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

4. **Run database migrations**
```bash
npm run db:push
```

5. **Seed the database (optional)**
```bash
npm run db:seed
```

6. **Start the development server**
```bash
npm run dev
```

7. **Open your browser**
```
http://localhost:3000
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (storefront)/              # Public storefront pages
│   │   ├── page.tsx               # Homepage
│   │   ├── shop/                  # Product listing & categories
│   │   ├── product/[slug]/        # Product detail pages
│   │   ├── search/                # Search results
│   │   ├── cart/                  # Shopping cart
│   │   ├── checkout/              # Checkout flow
│   │   ├── wishlist/              # Wishlist page
│   │   ├── account/               # User account area
│   │   ├── order/[id]/            # Order confirmation
│   │   ├── not-found.tsx          # 404 page
│   │   ├── error.tsx              # Error page
│   │   └── loading.tsx            # Loading page
│   ├── api/                       # API routes
│   │   └── storefront/            # Storefront API endpoints
│   ├── sitemap.ts                 # Sitemap generation
│   └── robots.ts                  # Robots.txt
│
├── components/
│   └── storefront/
│       ├── atoms/                 # Basic components
│       ├── molecules/             # Composite components
│       ├── organisms/             # Complex components
│       ├── layout/                # Layout components
│       ├── cart/                  # Cart components
│       └── homepage/              # Homepage sections
│
├── server/
│   └── storefront/
│       ├── controllers/           # API controllers
│       ├── services/              # Business logic
│       └── repositories/          # Database queries
│
├── stores/
│   ├── cart.store.ts             # Shopping cart state
│   └── wishlist.store.ts         # Wishlist state
│
├── types/
│   └── storefront.ts             # TypeScript types
│
└── lib/
    ├── storefront/
    │   └── api-client.ts         # API client wrapper
    └── utils.ts                  # Utility functions
```

---

## 📄 Available Pages

### Public Pages
- `/` - Homepage
- `/shop` - All products
- `/shop/[category]` - Category pages
- `/product/[slug]` - Product details
- `/search?q=...` - Search results
- `/cart` - Shopping cart
- `/wishlist` - Saved products
- `/checkout` - Checkout flow

### Account Pages (Authenticated)
- `/account` - Dashboard
- `/account/orders` - Order history
- `/account/orders/[id]` - Order details
- `/account/profile` - Profile management
- `/account/addresses` - Address book
- `/account/settings` - Account settings

### Other Pages
- `/order/[id]` - Order confirmation
- `/404` - Not found
- `/error` - Error page

---

## 🔄 State Management

### Cart Store (Zustand)
```typescript
import { useCartStore } from "@/stores/cart.store";

// In your component
const cart = useCartStore((state) => state.cart);
const addItem = useCartStore((state) => state.addItem);
const itemCount = useCartStore((state) => state.itemCount);
```

**Available Actions:**
- `fetchCart()` - Load cart from API
- `addItem(productId, variantId, quantity)` - Add product to cart
- `updateQuantity(itemId, quantity)` - Update item quantity
- `removeItem(itemId)` - Remove item from cart
- `applyDiscount(code)` - Apply discount code
- `openDrawer()` / `closeDrawer()` - Control cart drawer

### Wishlist Store (Zustand)
```typescript
import { useWishlistStore } from "@/stores/wishlist.store";

// In your component
const items = useWishlistStore((state) => state.items);
const toggleItem = useWishlistStore((state) => state.toggleItem);
const isInWishlist = useWishlistStore((state) => state.isInWishlist);
```

**Available Actions:**
- `addItem(product)` - Add to wishlist
- `removeItem(productId)` - Remove from wishlist
- `toggleItem(product)` - Add or remove
- `isInWishlist(productId)` - Check if in wishlist
- `clearWishlist()` - Clear all items

---

## 🔌 API Integration

### API Client
```typescript
import { api } from "@/lib/storefront/api-client";

// GET request
const products = await api.get("/api/storefront/products");

// POST request
const cart = await api.post("/api/storefront/cart/items", {
  productId: "123",
  quantity: 1,
});
```

### Available Endpoints
- `GET /api/storefront/products` - List products
- `GET /api/storefront/products/[slug]` - Get product
- `GET /api/storefront/products/featured` - Featured products
- `GET /api/storefront/products/trending` - Trending products
- `GET /api/storefront/categories` - List categories
- `GET /api/storefront/cart` - Get cart
- `POST /api/storefront/cart/items` - Add to cart
- `PATCH /api/storefront/cart/items` - Update cart item
- `DELETE /api/storefront/cart/items` - Remove from cart

---

## 🚢 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment
```bash
# Build the project
npm run build

# Start production server
npm run start
```

### Docker
```bash
# Build image
docker build -t nextjs-storefront .

# Run container
docker run -p 3000:3000 nextjs-storefront
```

---

## 🔐 Environment Variables

### Required
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key"
```

### Optional
```env
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
NEXT_PUBLIC_API_URL="https://yourdomain.com"
NODE_ENV="production"
```

---

## ⚡ Performance

### Optimizations Implemented
- ✅ **ISR (Incremental Static Regeneration)** - Homepage, product pages
- ✅ **React Query Caching** - Client-side data caching
- ✅ **Code Splitting** - Automatic with Next.js
- ✅ **Image Optimization** - Next/Image with lazy loading
- ✅ **Font Optimization** - Next/Font
- ✅ **Bundle Analysis** - Use `npm run analyze`

### Performance Tips
- Use ISR for frequently updated pages
- Enable React Query devtools in development
- Monitor bundle size with `@next/bundle-analyzer`
- Use lighthouse for performance audits

---

## 🔍 SEO

### Implemented SEO Features
- ✅ **Dynamic Metadata** - Per-page titles and descriptions
- ✅ **Structured Data** - JSON-LD for products
- ✅ **Sitemap** - Auto-generated at `/sitemap.xml`
- ✅ **Robots.txt** - Proper crawler instructions
- ✅ **Open Graph Tags** - Social media previews
- ✅ **Canonical URLs** - Prevent duplicate content
- ✅ **Alt Text** - All images have descriptions

### SEO Checklist
- [ ] Add meta descriptions to all pages
- [ ] Implement breadcrumb schema
- [ ] Add FAQ schema where applicable
- [ ] Set up Google Search Console
- [ ] Configure Google Analytics
- [ ] Test with Lighthouse SEO audit

---

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests (if configured)
npm run test
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://zustand-demo.pmnd.rs/)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🎉 Credits

Built with ❤️ using Next.js and modern web technologies.

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Contact support team
- Check documentation

---

**Happy selling! 🛍️**
