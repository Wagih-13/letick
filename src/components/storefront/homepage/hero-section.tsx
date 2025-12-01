"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-[600px] w-full" style={{ height: "100vh" }}>
      {/* Background Image */}
      <div className="w-[100vw ] absolute inset-0" style={{ marginInline: "calc(50% - 50vw)" }}>
        <Image
          src="/Storefront/images/heroSection.webp"
          alt="LUXURY WATCHES"
          fill
          priority
          className="object-cover object-center"
          quality={90}
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Centered Content */}
      <div className="relative flex h-full items-center justify-center px-4">
        <div className="mx-auto max-w-4xl space-y-6 text-center">
          {/* Title */}
          <h1
            className="mt-20 mb-4 text-center text-4xl font-bold text-white text-xl sm:width-[90%] md:text-4xl lg:text-5xl"
            style={{ width: "80%", margin: "20px auto", lineHeight: "1.3" }}
          >
            Elevate Your Style with Timeless Luxury Watches & Exquisite Leather Wallets
          </h1>
          <p className="mx-auto hidden sm:block w-[500px] text-center text-sm text-white" style={{ width: "70%", margin: "20px auto" }}>
            Discover the perfect blend of craftsmanship and sophistication. Our curated collection of luxury timepieces
            and premium leather wallets offers unmatched elegance for the discerning individual.
          </p>
          {/* Shop Now Button */}
          <div className="mt-8">
            <Button
              asChild
              size="xl"
              className="h-12 rounded-full bg-white px-8 text-base text-black shadow-xl transition-all hover:bg-white/90"
              style={{ marginBottom: "50px" }}
            >
              <Link href="/shop">Shop Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
