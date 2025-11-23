"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, FileText, Truck } from "lucide-react";
import type { Product } from "@/types/storefront";

interface ProductTabsProps {
  product: Product;
}

export function ProductTabs({ product }: ProductTabsProps) {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
        <TabsTrigger value="description" className="gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Description</span>
        </TabsTrigger>
        <TabsTrigger value="specifications" className="gap-2">
          <Package className="h-4 w-4" />
          <span className="hidden sm:inline">Specifications</span>
        </TabsTrigger>
        <TabsTrigger value="shipping" className="gap-2">
          <Truck className="h-4 w-4" />
          <span className="hidden sm:inline">Shipping</span>
        </TabsTrigger>
      </TabsList>

      {/* Description Tab */}
      <TabsContent value="description" className="mt-6 space-y-4">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {product.description ? (
            <div
              dangerouslySetInnerHTML={{ __html: product.description }}
              className="text-muted-foreground leading-relaxed"
            />
          ) : (
            <p className="text-muted-foreground">
              No description available for this product.
            </p>
          )}
        </div>
      </TabsContent>

      {/* Specifications Tab */}
      <TabsContent value="specifications" className="mt-6">
        <div className="border rounded-lg divide-y">
          <div className="grid grid-cols-2 gap-4 p-4">
            <span className="font-medium">SKU</span>
            <span className="text-muted-foreground">{product.sku}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 p-4">
            <span className="font-medium">Status</span>
            <span className="text-muted-foreground capitalize">
              {product.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 p-4">
            <span className="font-medium">Stock Status</span>
            <span className="text-muted-foreground capitalize">
              {product.stockStatus.replace("_", " ")}
            </span>
          </div>
          {product.categories && product.categories.length > 0 && (
            <div className="grid grid-cols-2 gap-4 p-4">
              <span className="font-medium">Categories</span>
              <span className="text-muted-foreground">
                {product.categories.map((c) => c.name).join(", ")}
              </span>
            </div>
          )}
          {product.variants && product.variants.length > 0 && (
            <div className="grid grid-cols-2 gap-4 p-4">
              <span className="font-medium">Available Variants</span>
              <span className="text-muted-foreground">
                {product.variants.length} options
              </span>
            </div>
          )}
        </div>
      </TabsContent>

      {/* Shipping Tab */}
      <TabsContent value="shipping" className="mt-6 space-y-4">
        <div className="border rounded-lg p-6 space-y-4">
          <div className="flex items-start gap-4">
            <Truck className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold mb-1">Free Shipping</h3>
              <p className="text-sm text-muted-foreground">
                Free standard shipping on orders over $50. Expedited shipping
                available at checkout.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Package className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold mb-1">Easy Returns</h3>
              <p className="text-sm text-muted-foreground">
                30-day return policy. Items must be in original condition with
                tags attached.
              </p>
            </div>
          </div>
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-2">Estimated Delivery Times:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Standard Shipping: 5-7 business days</li>
              <li>• Express Shipping: 2-3 business days</li>
              <li>• Overnight Shipping: 1 business day</li>
            </ul>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
