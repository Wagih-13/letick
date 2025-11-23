import Link from "next/link";
import { storefrontReviewsService } from "@/server/storefront/services/reviews.service";

export async function ReviewsSection() {
  // Fetch latest approved reviews across products
  const reviews = await storefrontReviewsService.listRecent(4);

  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="py-12">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight">What Customers Say</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl border ring-1 ring-border bg-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-sm">{r.authorName}</div>
              <div className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</div>
            </div>

            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  viewBox="0 0 20 20"
                  className={`h-4 w-4 ${i < r.rating ? "fill-yellow-500" : "fill-muted-foreground/30"}`}
                >
                  <path d="M10 15l-5.878 3.09L5.64 11.18.76 7.41l6.08-.53L10 1l3.16 5.88 6.08.53-4.88 3.77 1.52 6.91z" />
                </svg>
              ))}
            </div>

            {r.title && <div className="text-sm font-medium">{r.title}</div>}
            <p className="text-sm text-muted-foreground line-clamp-4">{r.comment}</p>

            <div className="mt-auto pt-2 text-xs text-muted-foreground">
              For <Link className="underline underline-offset-2" href={`/product/${r.product.slug}`}>{r.product.name}</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
