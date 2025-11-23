"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import type { Cart } from "@/types/storefront";
import { useCurrency } from "@/components/storefront/providers/currency-provider";

interface OrderReviewProps {
  cart: Cart;
  shippingAddress: any;
  shippingMethod: any;
  paymentMethod: any;
  onBack: () => void;
  onPlaceOrder: () => void;
  isPlacingOrder: boolean;
}

export function OrderReview({
  cart,
  shippingAddress,
  shippingMethod,
  paymentMethod,
  onBack,
  onPlaceOrder,
  isPlacingOrder,
}: OrderReviewProps) {
  const { format } = useCurrency();
  return (
    <div className="space-y-6">
      {/* Shipping Address */}
      <div className="border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Shipping Address</h3>
        <div className="text-sm space-y-1">
          <p>{`${shippingAddress.firstName} ${shippingAddress.lastName}`}</p>
          <p>{shippingAddress.addressLine1}</p>
          {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
          <p>{`${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}`}</p>
          <p>{shippingAddress.country}</p>
          <p>{shippingAddress.phone}</p>
        </div>
      </div>

      {/* Shipping Method */}
      <div className="border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Shipping Method</h3>
        <div className="flex justify-between">
          <div>
            <p className="font-medium">{shippingMethod.name}</p>
            <p className="text-sm text-muted-foreground">{shippingMethod.description}</p>
          </div>
          <p className="font-semibold">
            {Number(shippingMethod.price) === 0 ? "FREE" : `${format(Number(shippingMethod.price), { codeOverride: cart.currency })}`}
          </p>
        </div>
      </div>

      {/* Payment Method */}
      <div className="border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Payment Method</h3>
        <p className="text-sm">
          {paymentMethod.type === "card"
            ? "Credit/Debit Card"
            : paymentMethod.type === "cod"
            ? "Cash on Delivery"
            : "PayPal"}
          {paymentMethod.cardNumber && ` ending in ${paymentMethod.cardNumber.slice(-4)}`}
        </p>
      </div>

      {/* Order Items */}
      <div className="border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Order Items ({cart.itemCount})</h3>
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="relative h-16 w-16 rounded bg-muted flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.productName}
                  fill
                  className="object-cover rounded"
                  sizes="64px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.productName}</p>
                {item.variantName && (
                  <p className="text-xs text-muted-foreground">{item.variantName}</p>
                )}
                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold text-sm">{format(item.totalPrice, { codeOverride: cart.currency })}</p>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        {/* Totals */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{format(cart.subtotal, { codeOverride: cart.currency })}</span>
          </div>
          {cart.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{format(cart.discountAmount, { codeOverride: cart.currency })}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>
              {Number(shippingMethod.price) === 0 ? "FREE" : `${format(Number(shippingMethod.price), { codeOverride: cart.currency })}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>{format(cart.taxAmount, { codeOverride: cart.currency })}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{format(cart.totalAmount, { codeOverride: cart.currency })}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={isPlacingOrder}>
          Back
        </Button>
        <Button
          onClick={onPlaceOrder}
          disabled={isPlacingOrder}
          size="lg"
          className="flex-1"
        >
          {isPlacingOrder ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Placing Order...
            </>
          ) : (
            "Place Order"
          )}
        </Button>
      </div>
    </div>
  );
}
