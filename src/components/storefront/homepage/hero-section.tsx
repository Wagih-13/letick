"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative h-[90vh] min-h-[600px] w-full ">
      {/* Background Image */}
      <div className="w-[100vw ] absolute inset-0"
        style={{ marginInline: "calc(50% - 50vw)" }}>
        <Image
          src="/Storefront/images/4523587.jpg"
          alt="Fashion Hero Background"
          fill
          priority
          className="object-cover object-center"
          quality={90}
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Centered Content */}
      <div className="relative h-full flex items-end justify-center px-4">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Title */}

          {/* Shop Now Button */}
          <div className="mt-8">
            <Button asChild size="xl" className="h-12 px-8 text-base rounded-full bg-white text-black hover:bg-white/90 transition-all shadow-xl" style={{ marginBottom: "50px" }}>
              <Link href="/shop">Shop Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
