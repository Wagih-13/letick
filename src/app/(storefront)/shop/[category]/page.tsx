"use client";

import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/storefront/api-client";
import { ProductGrid } from "@/components/storefront/organisms/product-grid";
import { FilterSidebar } from "@/components/storefront/organisms/filter-sidebar";
import { Breadcrumbs } from "@/components/storefront/atoms/breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import Link from "next/link";
import type { ProductListResponse } from "@/types/storefront";

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initedRef = useRef(false);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    sortBy: "newest" as const,
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    minRating: undefined as number | undefined,
    inStock: false,
    categoryIds: undefined as string[] | undefined,
    onSale: false,
    search: undefined as string | undefined,
  });

  // Fetch category details early so it's available to chips/sidebar below
  const { data: category, isLoading: categoryLoading } = useQuery<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    productCount?: number;
    subcategories?: Array<{
      id: string;
      name: string;
      slug: string;
      productCount?: number;
    }>;
  }>({
    queryKey: ["category", categorySlug],
    queryFn: () => api.get(`/api/storefront/categories/${categorySlug}`),
  });

  // Category name map for chips (flatten tree)
  const { data: categoriesData } = useQuery<{ categories: Array<{ id: string; name: string; children?: any[] }> }>({
    queryKey: ["categories"],
    queryFn: () => api.get("/api/storefront/categories"),
  });
  const catMap = useMemo(() => {
    const map = new Map<string, string>();
    const cats = (categoriesData as any)?.data?.categories || categoriesData?.categories || [];
    const walk = (nodes: any[]) => {
      for (const n of nodes) {
        map.set(n.id, n.name);
        if (Array.isArray(n.children) && n.children.length) walk(n.children);
      }
    };
    walk(cats);
    return map;
  }, [categoriesData]);

  // Helpers to expand/compress category selections
  const categoriesTree: any[] = useMemo(
    () => (categoriesData as any)?.data?.categories || categoriesData?.categories || [],
    [categoriesData]
  );
  const collectDescendants = (nodes: any[], targetId: string): Set<string> => {
    const set = new Set<string>();
    const dfs = (n: any) => {
      set.add(n.id);
      if (Array.isArray(n.children)) for (const c of n.children) dfs(c);
    };
    const find = (arr: any[]) => {
      for (const n of arr) {
        if (n.id === targetId) dfs(n);
        else if (Array.isArray(n.children) && n.children.length) find(n.children);
      }
    };
    find(nodes);
    return set;
  };
  const expandCategoryIds = (ids?: string[]) => {
    if (!ids || !ids.length) return [] as string[];
    const out = new Set<string>();
    for (const id of ids) for (const did of collectDescendants(categoriesTree, id)) out.add(did);
    return Array.from(out);
  };
  const hasAncestor = (nodes: any[], id: string, selected: Set<string>): boolean => {
    const parent = new Map<string, string | null>();
    const build = (arr: any[], p: string | null) => {
      for (const n of arr) {
        parent.set(n.id, p);
        if (Array.isArray(n.children) && n.children.length) build(n.children, n.id);
      }
    };
    build(nodes, null);
    let cur = parent.get(id) || null;
    while (cur) {
      if (selected.has(cur)) return true;
      cur = parent.get(cur) || null;
    }
    return false;
  };
  const compressCategoryIds = (ids?: string[]) => {
    if (!ids || !ids.length) return [] as string[];
    const set = new Set(ids);
    return ids.filter((id) => !hasAncestor(categoriesTree, id, set));
  };

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ label: string; onClear?: () => void }> = [];
    if (category?.id) {
      const baseLabel = catMap.get(category.id) || category.name;
      chips.push({ label: baseLabel }); // base category chip without clear action
    }
    const displayIds = compressCategoryIds(filters.categoryIds || []);
    if (displayIds.length) {
      for (const id of displayIds) {
        // skip base category
        if (category?.id && id === category.id) continue;
        const label = catMap.get(id) || "Category";
        chips.push({ label, onClear: () => setFilters((prev) => ({ ...prev, categoryIds: (prev.categoryIds || []).filter((x) => x !== id), page: 1 })) });
      }
    }
    if (filters.minPrice) chips.push({ label: `Min $${filters.minPrice}`, onClear: () => setFilters((p) => ({ ...p, minPrice: undefined, page: 1 })) });
    if (filters.maxPrice) chips.push({ label: `Max $${filters.maxPrice}`, onClear: () => setFilters((p) => ({ ...p, maxPrice: undefined, page: 1 })) });
    if (filters.minRating) chips.push({ label: `${filters.minRating}+ stars`, onClear: () => setFilters((p) => ({ ...p, minRating: undefined, page: 1 })) });
    if (filters.inStock) chips.push({ label: "In stock", onClear: () => setFilters((p) => ({ ...p, inStock: false, page: 1 })) });
    if (filters.onSale) chips.push({ label: "On sale", onClear: () => setFilters((p) => ({ ...p, onSale: false, page: 1 })) });
    if (filters.search) chips.push({ label: `Search: ${filters.search}`, onClear: () => setFilters((p) => ({ ...p, search: undefined, page: 1 })) });
    return chips;
  }, [filters, category?.id, category?.name, catMap]);

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Merge base category into sidebar filters for consistent visuals
  const sidebarFilters = useMemo(() => {
    // Expand for UI so parent selection shows all children checked
    const minimal = new Set<string>(filters.categoryIds || []);
    if (category?.id) minimal.add(category.id);
    return { ...filters, categoryIds: expandCategoryIds(Array.from(minimal)) };
  }, [filters, category?.id, categoriesTree]);

  // Initialize filters from URL on first mount
  useEffect(() => {
    if (initedRef.current) return;
    const sp = searchParams;
    const page = parseInt(sp.get("page") || "1");
    const limit = parseInt(sp.get("limit") || "12");
    const sortBy = (sp.get("sortBy") as any) || "newest";
    const minPrice = sp.get("minPrice") ? Number(sp.get("minPrice")) : undefined;
    const maxPrice = sp.get("maxPrice") ? Number(sp.get("maxPrice")) : undefined;
    const minRating = sp.get("minRating") ? Number(sp.get("minRating")) : undefined;
    const inStock = sp.get("inStock") === "true";
    const onSale = sp.get("onSale") === "true";
    const categoryIds = sp.getAll("categoryId");
    const q = sp.get("q") || sp.get("search") || undefined;
    setFilters((prev) => ({
      ...prev,
      page: Number.isNaN(page) ? 1 : page,
      limit: Number.isNaN(limit) ? 12 : limit,
      sortBy,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      onSale,
      search: q || undefined,
      categoryIds: categoryIds.length ? categoryIds : undefined,
    }));
    initedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update URL when filters change (shallow)
  const lastQsRef = useRef<string | null>(null);

  useEffect(() => {
    if (!initedRef.current) return;
    const params = new URLSearchParams();
    params.set("page", String(filters.page));
    params.set("limit", String(filters.limit));
    params.set("sortBy", filters.sortBy);
    if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
    if (filters.minRating !== undefined) params.set("minRating", String(filters.minRating));
    if (filters.inStock) params.set("inStock", "true");
    if (filters.onSale) params.set("onSale", "true");
    if (filters.search) params.set("q", filters.search);
    if (filters.categoryIds && filters.categoryIds.length) {
      const sorted = [...filters.categoryIds].sort();
      for (const id of sorted) params.append("categoryId", id);
    }
    const qs = params.toString();
    if (qs === lastQsRef.current) return;
    const currentQs = typeof window !== "undefined" ? window.location.search.slice(1) : "";
    if (qs === currentQs) {
      lastQsRef.current = qs;
      return;
    }
    lastQsRef.current = qs;
    router.replace(`${pathname}?${qs}`, { scroll: false });
  }, [filters, pathname, router]);

  // Fetch category details (moved earlier)

  // Fetch products for this category
  const { data, isLoading, error } = useQuery<ProductListResponse>({
    queryKey: ["category-products", categorySlug, filters],
    queryFn: async () => {
      if (!category?.id) return { items: [], total: 0, page: 1, limit: 12, hasMore: false };

      const params = new URLSearchParams();
      params.set("page", filters.page.toString());
      params.set("limit", filters.limit.toString());
      params.set("sortBy", filters.sortBy);
      {
        const minimal = new Set<string>(filters.categoryIds || []);
        minimal.add(category.id);
        const expanded = expandCategoryIds(Array.from(minimal));
        for (const id of expanded) params.append("categoryId", id);
      }
      if (filters.minPrice) params.set("minPrice", filters.minPrice.toString());
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice.toString());
      if (filters.minRating) params.set("minRating", filters.minRating.toString());
      if (filters.inStock) params.set("inStock", "true");
      if (filters.onSale) params.set("onSale", "true");
      if (filters.search) params.set("q", filters.search);

      return api.get(`/api/storefront/products?${params.toString()}`);
    },
    enabled: !!category?.id,
  });

  const handleSortChange = (value: string) => {
    setFilters((prev) => ({ ...prev, sortBy: value as any, page: 1 }));
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sortBy: "newest",
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      inStock: false,
      categoryIds: undefined,
      onSale: false,
      search: undefined,
    });
  };

  const hasActiveFilters =
    filters.minPrice ||
    filters.maxPrice ||
    filters.minRating ||
    filters.inStock ||
    filters.onSale ||
    (filters.categoryIds && filters.categoryIds.length > 0) ||
    !!filters.search;

  if (categoryLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-muted rounded-lg"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The category you're looking for doesn't exist.
          </p>
          <Link href="/shop">
            <Button>Browse All Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: category.name, href: `/shop/${categorySlug}` },
        ]}
        className="mb-6"
      />

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-muted-foreground max-w-3xl">
            {category.description}
          </p>
        )}
      </div>

      {/* Subcategories */}
      {category.subcategories && category.subcategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Subcategories</h2>
          <div className="flex flex-wrap gap-2">
            {category.subcategories.map((sub: any) => (
              <Link key={sub.id} href={`/shop/${sub.slug}`}>
                <Button variant="outline">
                  {sub.name}
                  {sub.productCount > 0 && (
                    <span className="ml-2 text-muted-foreground">
                      ({sub.productCount})
                    </span>
                  )}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* Mobile Filter Button */}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>

          {/* Results count */}
          {data && (
            <p className="text-sm text-muted-foreground">
              Showing {data.items.length} of {data.total} products
            </p>
          )}

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="mr-2 h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Sort by:
          </span>
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className={`lg:block ${showMobileFilters ? "block" : "hidden"}`}>
          <FilterSidebar
            filters={sidebarFilters}
            onFilterChange={(f) => {
              // Normalize to minimal parent-only ids and exclude base category from stored filters
              const next = { ...f } as any;
              if ("categoryIds" in next) {
                let compressed = compressCategoryIds(next.categoryIds || []);
                if (category?.id) {
                  compressed = compressed.filter((id) => id !== category.id);
                }
                next.categoryIds = compressed.length ? compressed : undefined;
              }
              setFilters((prev) => ({ ...prev, ...next, page: 1 }));
            }}
          />
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-3">
          {error && (
            <div className="text-center py-12">
              <p className="text-destructive">
                Failed to load products. Please try again.
              </p>
            </div>
          )}

          <ProductGrid
            products={data?.items || []}
            isLoading={isLoading}
            columns={3}
          />

          {/* Pagination */}
          {data && data.hasMore && (
            <div className="mt-8 text-center">
              <Button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={isLoading}
              >
                Load More
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
