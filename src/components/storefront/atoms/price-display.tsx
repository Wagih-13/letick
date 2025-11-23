import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/storefront/providers/currency-provider";

interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number;
  className?: string;
  showCurrency?: boolean;
}

export function PriceDisplay({
  price,
  compareAtPrice,
  className,
  showCurrency = true,
}: PriceDisplayProps) {
  const { format } = useCurrency();
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  return (
    <div className={cn("flex items-center flex-wrap gap-1 ", className)}>
      <span className="text-m font-bold">
        {showCurrency ? format(price) : price.toFixed(2)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-xs text-muted-foreground line-through">
            {showCurrency ? format(compareAtPrice) : compareAtPrice.toFixed(2)}
          </span>
          <span className="text-xs font-small text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
            -{discountPercent}%
          </span>
        </>
      )}
    </div>
  );
}
