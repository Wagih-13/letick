import dynamic from "next/dynamic";

import { OrganizationSchema } from "@/components/seo/organization-schema";
import { WebsiteSchema } from "@/components/seo/website-schema";
import { CategoryHighlights } from "@/components/storefront/homepage/category-highlights";
import { FeaturedProducts } from "@/components/storefront/homepage/featured-products";
import { HeroSection } from "@/components/storefront/homepage/hero-section";
import MovingBanner from "@/components/storefront/homepage/moving-banner";
import { SeasonalOffersBanner } from "@/components/storefront/homepage/seasonal-offers-banner";
import { TrendingProducts } from "@/components/storefront/homepage/trending-products";
import { RecentlyViewedCarousel } from "@/components/storefront/organisms/recently-viewed-carousel";
import { RecommendationsRail } from "@/components/storefront/organisms/recommendations-rail";

// Lazy load below-the-fold components for better initial page load
// Note: ssr: false not supported in Next.js 16 Server Components
const FashionVideoSection = dynamic(
  () => import("@/components/storefront/homepage/fashion-video").then((mod) => ({ default: mod.FashionVideoSection })),
  { loading: () => <div className="bg-muted h-96 animate-pulse rounded-lg" /> },
);
const ReviewsSection = dynamic(
  () => import("@/components/storefront/homepage/reviews-section").then((mod) => ({ default: mod.ReviewsSection })),
  { loading: () => <div className="bg-muted h-64 animate-pulse rounded-lg" /> },
);
const NewsletterSection = dynamic(
  () => import("@/components/storefront/homepage/newsletter").then((mod) => ({ default: mod.NewsletterSection })),
  { loading: () => <div className="bg-muted h-48 animate-pulse rounded-lg" /> },
);

// Increased revalidation from 60s to 180s (3 minutes) - homepage doesn't change frequently enough for 60s
export const revalidate = 180;

export default async function HomePage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <>
      {/* SEO: Structured Data for Organization and Website */}
      <OrganizationSchema
        socialProfiles={[
          // Add your actual social media URLs
          "https://facebook.com/le-tick",
          "https://instagram.com/le-tick",
          "https://twitter.com/le-tick",
        ]}
      />
      <WebsiteSchema searchUrl={`${baseUrl}/search?q={search_term_string}`} />

      <div className="flex flex-col">
        <HeroSection />
        <SeasonalOffersBanner />
        <MovingBanner text="Letick Store" />
        <CategoryHighlights />
        <FeaturedProducts />
        <TrendingProducts />
        <FashionVideoSection />
        <RecentlyViewedCarousel />
        <RecommendationsRail context="user" title="For you" limit={6} />
        <ReviewsSection />
        <NewsletterSection />
      </div>
    </>
  );
}
