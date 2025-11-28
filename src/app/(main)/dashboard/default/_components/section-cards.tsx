"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function SectionCards() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any | null>(null);

  const money = useMemo(
    () => new Intl.NumberFormat(undefined, { style: "currency", currency: data?.currency || "EGP" }),
    [data?.currency],
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/dashboard/overview?range=30d`);
        const j = await res.json();
        if (!res.ok) throw new Error(j?.error?.message || "Failed to load overview");
        if (mounted) setData(j.data || null);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const revenueChangeUp = Number(data?.revenueChangePct ?? 0) >= 0;
  const ordersChangeUp = Number(data?.ordersChangePct ?? 0) >= 0;
  const customersChangeUp = Number(data?.newCustomersChangePct ?? 0) >= 0;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {money.format(Number(data?.revenue ?? 0))}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {revenueChangeUp ? <TrendingUp /> : <TrendingDown />}
              {`${revenueChangeUp ? "+" : ""}${Number(data?.revenueChangePct ?? 0)}%`}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {revenueChangeUp ? "Trending up this period" : "Down this period"} {revenueChangeUp ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">Paid order revenue</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>New Customers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{Number(data?.newCustomers ?? 0).toLocaleString()}</CardTitle>
          <CardAction>
            <Badge variant="outline">
              {customersChangeUp ? <TrendingUp /> : <TrendingDown />}
              {`${customersChangeUp ? "+" : ""}${Number(data?.newCustomersChangePct ?? 0)}%`}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {customersChangeUp ? "Growing acquisition" : "Acquisition down"} {customersChangeUp ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">New users created</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Orders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{Number(data?.ordersCount ?? 0).toLocaleString()}</CardTitle>
          <CardAction>
            <Badge variant="outline">
              {ordersChangeUp ? <TrendingUp /> : <TrendingDown />}
              {`${ordersChangeUp ? "+" : ""}${Number(data?.ordersChangePct ?? 0)}%`}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {ordersChangeUp ? "Order volume up" : "Order volume down"} {ordersChangeUp ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">All order statuses</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Avg Order Value</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{money.format(Number(data?.avgOrderValue ?? 0))}</CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Average of paid orders</div>
          <div className="text-muted-foreground">Per selected period</div>
        </CardFooter>
      </Card>
    </div>
  );
}
