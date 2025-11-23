"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryRailProps {
  activeCategoryId?: string | undefined;
  onSelect: (categoryId?: string) => void;
}

export function CategoryRail({ activeCategoryId, onSelect }: CategoryRailProps) {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/storefront/categories", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && res.ok && data?.success) {
          const cats = data.data?.categories || [];
          setItems(cats);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 lg:-mx-8 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
          <Button
            variant={activeCategoryId ? "ghost" : "default"}
            size="sm"
            onClick={() => onSelect(undefined)}
            className={cn("whitespace-nowrap", !activeCategoryId && "shadow-sm")}
          >
            All
          </Button>
          {items.map((c: any) => (
            <Button
              key={c.id}
              variant={activeCategoryId === c.id ? "default" : "outline"}
              size="sm"
              onClick={() => onSelect(c.id)}
              className="whitespace-nowrap"
            >
              {c.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
