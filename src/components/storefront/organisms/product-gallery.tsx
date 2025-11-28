"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/storefront";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fallback if no images
  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* Main Image Slider */}
      <div className="relative aspect-[4/5] bg-muted rounded-lg overflow-hidden group">
        {/* Current Image */}
        <Image
          src={images[currentIndex].url}
          alt={images[currentIndex].altText || `${productName} - Image ${currentIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={currentIndex === 0}
        />

        {/* Navigation Arrows - Only show if more than 1 image */}
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
              onClick={goToNext}
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Slider - Only show if more than 1 image */}
      {images.length > 1 && (
        <div className="relative">
          {/* Thumbnails Container */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToIndex(index)}
                className={cn(
                  "relative flex-shrink-0 aspect-[4/5] w-20 rounded-md overflow-hidden border-1 transition-all",
                  currentIndex === index
                    ? "border-primary ring-1 ring-primary ring-offset-1"
                    : "border-transparent hover:border-muted-foreground/50"
                )}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={image.url}
                  alt={image.altText || `${productName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>

          {/* Thumbnail Navigation Arrows (for mobile) */}
          {images.length > 4 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-sm md:hidden"
                onClick={() => {
                  const container = document.querySelector('.overflow-x-auto');
                  if (container) {
                    container.scrollBy({ left: -160, behavior: 'smooth' });
                  }
                }}
                aria-label="Scroll thumbnails left"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-sm md:hidden"
                onClick={() => {
                  const container = document.querySelector('.overflow-x-auto');
                  if (container) {
                    container.scrollBy({ left: 160, behavior: 'smooth' });
                  }
                }}
                aria-label="Scroll thumbnails right"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
