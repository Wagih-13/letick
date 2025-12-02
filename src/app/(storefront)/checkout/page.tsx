"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { CheckoutStepper } from "@/components/storefront/organisms/checkout-stepper";
import { OrderReview } from "@/components/storefront/organisms/order-review";
import { PaymentForm } from "@/components/storefront/organisms/payment-form";
import { ShippingForm } from "@/components/storefront/organisms/shipping-form";
import { ShippingMethodSelector } from "@/components/storefront/organisms/shipping-method-selector";
import { useCurrency } from "@/components/storefront/providers/currency-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart.store";
import { trackInitiateCheckout, trackPurchase } from "@/lib/fbq";

type CheckoutStep = "shipping" | "shipping-method" | "payment" | "review";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = (searchParams.get("mode") ?? "") === "buy-now";
  const cart = useCartStore((state) => (isBuyNow ? state.buyNowCart : state.cart));
  const fetchCart = useCartStore((state) => state.fetchCart);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [shippingMethod, setShippingMethod] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<any>({ type: "cash_on_delivery" });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const { format } = useCurrency();
  const [initTracked, setInitTracked] = useState(false);

  useEffect(() => {
    fetchCart({ mode: isBuyNow ? "buy-now" : "normal" });
  }, [fetchCart, isBuyNow]);

  // Prefill saved shipping address if logged in (also prefill email from profile)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [addrRes, profileRes] = await Promise.all([
          fetch("/api/storefront/account/shipping-address", { cache: "no-store" }),
          fetch("/api/storefront/account/profile", { cache: "no-store" }),
        ]);

        const addrJson = addrRes.ok ? await addrRes.json() : null;
        const profileJson = profileRes.ok ? await profileRes.json() : null;
        const email: string | undefined = profileJson?.data?.email ?? addrJson?.data?.email;

        if (!cancelled) {
          if (addrJson?.success && addrJson.data) {
            setShippingAddress({ ...addrJson.data, ...(email ? { email } : {}) });
          } else if (email) {
            // No saved address but we can still prefill email
            setShippingAddress({ email } as any);
          }
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart && cart.items.length === 0) {
      router.push("/cart");
    }
  }, [cart, router]);

  // Track InitiateCheckout once when cart is loaded and has items
  useEffect(() => {
    if (initTracked) return;
    if (!cart || cart.items.length === 0) return;
    const items = cart.items.map((item) => ({
      id: item.productId,
      quantity: item.quantity,
      item_price: item.unitPrice,
    }));
    trackInitiateCheckout({
      currency: (cart.currency || "EGP") as string,
      value: cart.totalAmount,
      items,
    });
    setInitTracked(true);
  }, [cart, initTracked]);

  const steps = [
    { id: "shipping" as CheckoutStep, label: "Shipping Address", number: 1 },
    { id: "shipping-method" as CheckoutStep, label: "Shipping Method", number: 2 },
    { id: "payment" as CheckoutStep, label: "Payment", number: 3 },
    { id: "review" as CheckoutStep, label: "Review Order", number: 4 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const method = shippingMethod
        ? {
          id: String(shippingMethod.id),
          name: String(shippingMethod.name),
          price: Number(shippingMethod.price) || 0,
          description: shippingMethod.description ?? undefined,
          estimatedDays:
            shippingMethod.estimatedDays !== undefined && shippingMethod.estimatedDays !== null
              ? Number(shippingMethod.estimatedDays)
              : undefined,
          carrier: shippingMethod.carrier ?? undefined,
        }
        : null;

      const res = await fetch("/api/storefront/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress,
          shippingMethod: method,
          paymentMethod,
          customerEmail: shippingAddress?.email,
          customerPhone: shippingAddress?.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const serverMsg = data?.error?.message ?? "Failed to place order";
        const details = Array.isArray(data?.error?.details)
          ? data.error.details
            .map((d: any) => d?.message)
            .filter(Boolean)
            .join("; ")
          : undefined;
        throw new Error(details ? `${serverMsg}: ${details}` : serverMsg);
      }
        try {
        const currencyCode = cart?.currency || "EGP";
        const shippingValue = shippingMethod ? Number(shippingMethod.price) || 0 : 0;
        const items = (cart?.items || []).map((it) => ({
          id: it.variantId || it.productId,
          quantity: Number(it.quantity || 0),
          item_price: Number(it.unitPrice || 0),
        }));
        const value = Number(cart?.totalAmount || 0) + shippingValue;
        const orderNumberTmp = data.data?.orderNumber ?? data.data?.id;
        const eventId = orderNumberTmp ? `ord_${orderNumberTmp}` : undefined;
        trackPurchase({ currency: currencyCode, value, items, eventId });
      } catch {}

      // If this was a Buy Now flow, restore the previous cart cookie before redirect
      if (isBuyNow) {
        try {
          await fetch("/api/storefront/buy-now/restore", { method: "POST" });
          await fetchCart();
        } catch { /* ignore */ }
      }

      const orderNumber = data.data?.orderNumber ?? data.data?.id;
      toast.success("Order placed successfully");
      try {
        if (cart && cart.items.length > 0) {
          const purchaseItems = cart.items.map((item) => ({
            id: item.productId,
            quantity: item.quantity,
            item_price: item.unitPrice,
          }));
          const purchaseValue = cart.totalAmount + (shippingMethod ? (Number(shippingMethod.price) || 0) : 0);
          const purchaseCurrency = (cart.currency || "EGP") as string;
          sessionStorage.setItem(
            "fbq:purchase",
            JSON.stringify({ orderId: orderNumber, currency: purchaseCurrency, value: purchaseValue, items: purchaseItems })
          );
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 250));
      router.push(`/order/${orderNumber}`);
    } catch (error) {
      console.error("Failed to place order:", error);
      toast.error(error instanceof Error ? error.message : "Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!cart) {
    return (
      <div className="container flex justify-center py-16">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Compute shipping and total based on selected method price only
  const effectiveShippingAmount = shippingMethod ? Number(shippingMethod.price) || 0 : 0;
  const computedTotal = cart.totalAmount + (shippingMethod ? effectiveShippingAmount : 0);

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/cart"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center text-sm"
          onClick={async (e) => {
            if (!isBuyNow) return;
            e.preventDefault();
            try {
              await fetch("/api/storefront/buy-now/restore", { method: "POST" });
              await fetchCart();
            } catch { /* ignore */ }
            router.push("/cart");
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
          {isBuyNow && <Badge variant="secondary">Buy Now</Badge>}
        </div>
      </div>

      {/* Mobile sticky footer actions */}
      {/* <div className="sm:hidden" aria-hidden>
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Step {currentStepIndex + 1} of {steps.length}</span>
            <span>{steps[currentStepIndex].label}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleBack} disabled={currentStepIndex === 0}>Back</Button>
            <Button onClick={() => (currentStep === "review" ? void handlePlaceOrder() : handleNext())} disabled={isPlacingOrder}>
              {currentStep === "review" ? (isPlacingOrder ? "Placing..." : "Place Order") : "Next"}
            </Button>
          </div>
        </div>
      </div> */}

      {/* Stepper */}
      <div className="hidden sm:block">
        <CheckoutStepper steps={steps} currentStep={currentStep} />
      </div>
      {/* Compact mobile step indicator */}
      <div className="text-muted-foreground text-xs sm:hidden">
        Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex].label}
      </div>

      {/* Checkout Content */}
      <div className="mt-8 grid grid-cols-1 gap-8 pb-28 sm:pb-0 lg:grid-cols-3">
        {/* Form Area */}
        <div className="lg:col-span-2">
          {currentStep === "shipping" && (
            <ShippingForm
              initialData={shippingAddress}
              onSubmit={(data) => {
                setShippingAddress(data);
                // Try to persist for logged-in users; ignore errors/401
                (async () => {
                  try {
                    await fetch("/api/storefront/account/shipping-address", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(data),
                    });
                  } catch {
                    // Ignore errors when saving shipping address
                  }
                })();
                handleNext();
              }}
            />
          )}

          {currentStep === "shipping-method" && (
            <ShippingMethodSelector
              selectedMethod={shippingMethod}
              onSelect={(method) => {
                setShippingMethod(method);
                handleNext();
              }}
              onBack={handleBack}
            />
          )}

          {currentStep === "payment" && (
            <PaymentForm
              onSubmit={(data) => {
                setPaymentMethod(data);
                handleNext();
              }}
              onBack={handleBack}
            />
          )}

          {currentStep === "review" && (
            <OrderReview
              cart={cart}
              shippingAddress={shippingAddress}
              shippingMethod={shippingMethod}
              paymentMethod={paymentMethod}
              onBack={handleBack}
              onPlaceOrder={handlePlaceOrder}
              isPlacingOrder={isPlacingOrder}
              effectiveShippingAmount={effectiveShippingAmount}
            />
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <div className="sticky top-4 rounded-lg border p-6">
            <h2 className="mb-4 font-semibold">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items ({cart.itemCount})</span>
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
                  {shippingMethod ? (
                    effectiveShippingAmount === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `${format(effectiveShippingAmount, { codeOverride: cart.currency })}`
                    )
                  ) : (
                    <span className="text-xs">Calculated next</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{format(cart.taxAmount, { codeOverride: cart.currency })}</span>
              </div>
              <div className="flex justify-between border-t pt-3 font-semibold">
                <span>Total</span>
                <span>{format(computedTotal, { codeOverride: cart.currency })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
