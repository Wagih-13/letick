import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  function truncateWords(text: string, limit: number) {
    const words = (text || "").trim().split(/\s+/);
    return words.length > limit ? words.slice(0, limit).join(" ") + "…" : text;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center flex-wrap space-x-1 text-sm", className)}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
            )}
            {isLast ? (
              <span className="font-medium text-foreground" aria-current="page">
                <span className="sm:hidden">{truncateWords(item.label, 3)}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
