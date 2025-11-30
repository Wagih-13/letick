import dynamic from "next/dynamic";
import { HeroSection } from "@/components/storefront/homepage/hero-section";
import { FeaturedProducts } from "@/components/storefront/homepage/featured-products";
import { CategoryHighlights } from "@/components/storefront/homepage/category-highlights";
import { TrendingProducts } from "@/components/storefront/homepage/trending-products";
import MovingBanner from "@/components/storefront/homepage/moving-banner";
import { SeasonalOffersBanner } from "@/components/storefront/homepage/seasonal-offers-banner";
import { RecentlyViewedCarousel } from "@/components/storefront/organisms/recently-viewed-carousel";
import { RecommendationsRail } from "@/components/storefront/organisms/recommendations-rail";
import { OrganizationSchema } from "@/components/seo/organization-schema";
import { WebsiteSchema } from "@/components/seo/website-schema";

// Lazy load below-the-fold components for better initial page load
// Note: ssr: false not supported in Next.js 16 Server Components
const FashionVideoSection = dynamic(
  () => import("@/components/storefront/homepage/fashion-video").then(mod => ({ default: mod.FashionVideoSection })),
  { loading: () => <div className="h-96 bg-muted animate-pulse rounded-lg" /> }
);
const ReviewsSection = dynamic(
  () => import("@/components/storefront/homepage/reviews-section").then(mod => ({ default: mod.ReviewsSection })),
  { loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg" /> }
);
const NewsletterSection = dynamic(
  () => import("@/components/storefront/homepage/newsletter").then(mod => ({ default: mod.NewsletterSection })),
  { loading: () => <div className="h-48 bg-muted animate-pulse rounded-lg" /> }
);

// Increased revalidation from 60s to 180s (3 minutes) - homepage doesn't change frequently enough for 60s
export const revalidate = 180;

export default async function HomePage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <>
      {/* SEO: Structured Data for Organization and Website */}
      <OrganizationSchema
        socialProfiles={[
          // Add your actual social media URLs
          "https://facebook.com/modestwear",
          "https://instagram.com/modestwear",
          "https://twitter.com/modestwear",
        ]}
      />
      <WebsiteSchema searchUrl={`${baseUrl}/search?q={search_term_string}`} />

      <div className="flex flex-col">
        <HeroSection />
        <SeasonalOffersBanner />
        <MovingBanner text="Letick Store" />
        <FeaturedProducts />
        <TrendingProducts />
        <CategoryHighlights />
        <FashionVideoSection />
        <RecentlyViewedCarousel />
        <RecommendationsRail context="user" title="For you" limit={6} />
        <ReviewsSection />
        <NewsletterSection />
      </div>
    </>
  );
}
