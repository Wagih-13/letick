"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Offer = {
  id: string;
  name: string;
  type: "percentage" | "fixed_amount" | "free_shipping";
  value: string;
  scope: string;
  startsAt?: string | null;
  endsAt?: string | null;
  metadata?: any;
};

export function SeasonalOffersBanner() {
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        // Cache offers for 5 minutes (300 seconds)
        const res = await fetch("/api/storefront/offers", {
          next: { revalidate: 300 }
        });
        const data = await res.json();
        if (!aborted && res.ok && data?.success) {
          const items = Array.isArray(data.data?.items) ? data.data.items : [];
          const seasonal = items.filter((o: any) => o.startsAt || o.endsAt);
          setOffers(seasonal.slice(0, 4));
        }
      } catch { }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  if (!offers.length) return null;

  const renderValue = (o: Offer) => {
    if (o.type === "percentage") return `${parseFloat(o.value)}% off`;
    if (o.type === "fixed_amount") return `$${parseFloat(o.value).toFixed(2)} off`;
    return "Free shipping";
  };

  return (
    <div className="w-full border-y bg-muted/40">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="mb-2 text-sm text-muted-foreground">Seasonal offers</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {offers.map((o) => (
            <div key={o.id} className="rounded-lg border bg-background p-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary">{renderValue(o)}</Badge>
                  {o.metadata?.offerKind === "bundle" && <Badge variant="default">Bundle</Badge>}
                </div>
                <div className="font-medium truncate" title={o.name}>{o.name}</div>
                {(o.endsAt || o.startsAt) && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {o.startsAt ? `From ${new Date(o.startsAt).toLocaleDateString()}` : "Now"}
                    {o.endsAt ? ` · Until ${new Date(o.endsAt).toLocaleDateString()}` : ""}
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/shop/sale">Shop</a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
