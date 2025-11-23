import { HeroSection } from "@/components/storefront/homepage/hero-section";
import { FeaturedProducts } from "@/components/storefront/homepage/featured-products";
import { CategoryHighlights } from "@/components/storefront/homepage/category-highlights";
import { FashionVideoSection } from "@/components/storefront/homepage/fashion-video";
import { TrendingProducts } from "@/components/storefront/homepage/trending-products";
import { ReviewsSection } from "@/components/storefront/homepage/reviews-section";
import { NewsletterSection } from "@/components/storefront/homepage/newsletter";
import MovingBanner from "@/components/storefront/homepage/moving-banner";
import { RecentlyViewedCarousel } from "@/components/storefront/organisms/recently-viewed-carousel";
import { RecommendationsRail } from "@/components/storefront/organisms/recommendations-rail";
import { SeasonalOffersBanner } from "@/components/storefront/homepage/seasonal-offers-banner";

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export default async function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <SeasonalOffersBanner />
      <MovingBanner text="Modest Wear" />
      <FeaturedProducts />
      <TrendingProducts />
      <CategoryHighlights />
      <FashionVideoSection />
      <RecentlyViewedCarousel />
      <RecommendationsRail context="user" title="For you" limit={6} />
      <ReviewsSection />
      <NewsletterSection />
    </div>
  );
}
