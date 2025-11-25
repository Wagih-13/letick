"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "./quantity-selector";
import { useCartStore } from "@/stores/cart.store";
import type { CartItem as CartItemType } from "@/types/storefront";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCurrency } from "@/components/storefront/providers/currency-provider";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const isLoading = useCartStore((state) => state.isLoading);
  const { format } = useCurrency();

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(item.id, newQuantity);
  };

  const handleRemove = () => {
    removeItem(item.id);
    setShowRemoveDialog(false);
  };

  const itemTotal = item.totalPrice;
  const hasDiscount = false; // Cart items don't have compareAtPrice
  const discount = 0;

  return (
    <>
      <div className="p-4 sm:p-6">
        <div className="flex gap-4">
          {/* Product Image */}
          <Link
            href={`/product/${item.productSlug}`}
            className="relative h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 rounded-lg overflow-hidden border bg-muted"
          >
            <Image
              src={item.image}
              alt={item.productName}
              fill
              className="object-cover"
              sizes="112px"
            />
          </Link>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${item.productSlug}`}
                  className="font-semibold hover:underline line-clamp-2"
                >
                  {item.productName}
                </Link>
                
                {/* Variant Info */}
                {item.variantName && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.variantName}
                  </p>
                )}
                {item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {Object.entries(item.variantOptions)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" • ")}
                  </p>
                )}
                
                {/* SKU */}
                <p className="text-xs text-muted-foreground mt-1">
                  SKU: {item.sku}
                </p>
              </div>

              {/* Remove Button - Desktop */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowRemoveDialog(true)}
                disabled={isLoading}
                className="hidden sm:flex"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span className="sr-only">Remove item</span>
              </Button>
            </div>

            {/* Price and Quantity */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center flex-wrap gap-1">
                {/* Quantity Selector */}
                <QuantitySelector
                  value={item.quantity}
                  onChange={handleQuantityChange}
                  max={99}
                  className="scale-90 origin-left"
                />

                {/* Remove Button - Mobile */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRemoveDialog(true)}
                  disabled={isLoading}
                  className="sm:hidden text-muted-foreground"
                >
                  <Trash2 className="h-4 w-4 mr-2 " />
                 
                </Button>
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="font-semibold">
                  {format(itemTotal)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(item.unitPrice)} each
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove item from cart?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{item.productName}" from your cart?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
