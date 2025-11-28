"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Truck, Package, Zap } from "lucide-react";
import { toast } from "sonner";
import type { ShippingMethod } from "@/types/storefront";
import { useCurrency } from "@/components/storefront/providers/currency-provider";

interface ShippingMethodSelectorProps {
  selectedMethod: ShippingMethod | null;
  onSelect: (method: ShippingMethod) => void;
  onBack: () => void;
}

// Fetched at runtime
type ApiMethod = ShippingMethod;

export function ShippingMethodSelector({
  selectedMethod,
  onSelect,
  onBack,
}: ShippingMethodSelectorProps) {
  const [selected, setSelected] = useState<string>(selectedMethod?.id || "");
  const [methods, setMethods] = useState<ApiMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { format } = useCurrency();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // Cache shipping methods for 10 minutes (600 seconds)
        const res = await fetch("/api/storefront/shipping/methods", {
          next: { revalidate: 600 }
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data?.error?.message || "Failed to load shipping methods");
        if (!mounted) return;
        setMethods(data.data || []);
        // Maintain previous selection if possible, else default to first
        const initial = selectedMethod?.id || data.data?.[0]?.id || "";
        setSelected(initial);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load shipping methods");
        toast.error(e?.message || "Failed to load shipping methods");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    const method = methods.find((m) => m.id === selected);
    if (method) {
      const normalized = {
        ...method,
        price: Number(method.price),
        description: (method as any)?.description ?? undefined,
      } as ApiMethod;
      onSelect(normalized);
      toast.success(`Shipping: ${method.name}`);
    }
  };

  const getIcon = (methodId: string) => {
    switch (methodId) {
      case "standard":
        return Package;
      case "express":
        return Truck;
      case "overnight":
        return Zap;
      default:
        return Package;
    }
  };

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Shipping Method</h2>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading shipping methods...</div>
      ) : error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : methods.length === 0 ? (
        <div className="text-sm text-muted-foreground">No shipping methods available.</div>
      ) : (
        <RadioGroup value={selected} onValueChange={setSelected}>
          <div className="space-y-4">
            {methods.map((method) => {
              const Icon = getIcon(method.id);
              const isSelected = selected === method.id;

              return (
                <div
                  key={method.id}
                  className={`flex items-start space-x-3 p-4 border-2 rounded-lg transition-all cursor-pointer ${isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/20"
                    }`}
                  onClick={() => setSelected(method.id)}
                >
                  <RadioGroupItem value={method.id} id={method.id} />
                  <div className="flex-1">
                    <Label
                      htmlFor={method.id}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-semibold">{method.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {method.description}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold">
                        {method.price === 0 ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          format(Number(method.price))
                        )}
                      </div>
                    </Label>
                  </div>
                </div>
              );
            })}
          </div>
        </RadioGroup>
      )}

      {/* Actions */}
      <div className="flex gap-4 mt-6">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selected || loading || !!error}
          className="flex-1 sm:flex-initial"
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}
