"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/fbq";

interface ProductViewTrackerProps {
    product: {
        id: string | number;
        name: string;
        price: number;
        currency?: string;
        category?: string;
        variantId?: string | number;
    };
}

/**
 * Client component that tracks Facebook Pixel ViewContent event
 * when a product page is viewed
 */
export function ProductViewTracker({ product }: ProductViewTrackerProps) {
    useEffect(() => {
        trackViewContent({
            id: product.id,
            name: product.name,
            price: product.price,
            currency: product.currency,
            category: product.category,
            variantId: product.variantId,
            quantity: 1,
        });
    }, [product.id, product.name, product.price, product.currency, product.category, product.variantId]);

    return null; // This component doesn't render anything
}
