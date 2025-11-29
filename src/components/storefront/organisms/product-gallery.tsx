"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/types/storefront";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "./product-gallery.css";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  // Fallback if no images
  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image Swiper */}
      <Swiper
        style={
          {
            "--swiper-navigation-color": "#fff",
            "--swiper-pagination-color": "#fff",
          } as React.CSSProperties
        }
        spaceBetween={10}
        navigation={true}
        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
        modules={[FreeMode, Navigation, Thumbs]}
        className="aspect-[4/5] bg-muted rounded-lg overflow-hidden"
      >
        {images.map((image, index) => (
          <SwiperSlide key={image.id}>
            <div className="relative w-full h-full">
              <Image
                src={image.url}
                alt={image.altText || `${productName} - Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={index === 0}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thumbnail Swiper - Only show if more than 1 image */}
      {images.length > 1 && (
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={10}
          slidesPerView={4}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Navigation, Thumbs]}
          className="mySwiper"
          breakpoints={{
            640: {
              slidesPerView: 5,
            },
            768: {
              slidesPerView: 6,
            },
          }}
        >
          {images.map((image, index) => (
            <SwiperSlide key={image.id}>
              <img
                src={image.url}
                alt={image.altText || `${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover rounded-md cursor-pointer"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}
