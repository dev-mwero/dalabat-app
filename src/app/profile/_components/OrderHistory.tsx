"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  type LucideIcon,
  Package,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface Order {
  _id: string;
  vendorId: {
    _id: string;
    name: string;
  };
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
}

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: LucideIcon;
  }
> = {
  pending: { label: "Pending", variant: "outline", icon: Clock },
  confirmed: { label: "Confirmed", variant: "secondary", icon: CheckCircle2 },
  preparing: { label: "Preparing", variant: "secondary", icon: Package },
  ready: { label: "Ready", variant: "secondary", icon: Package },
  out_for_delivery: {
    label: "Out for Delivery",
    variant: "default",
    icon: Truck,
  },
  delivered: { label: "Delivered", variant: "default", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", variant: "destructive", icon: XCircle },
};

export function OrderHistory() {
  const { user } = useUser();
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const {
    data: orders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-orders", user?.id],
    queryFn: async () => {
      const resp = await fetch(`/api/orders?customerClerkId=${user?.id}`);
      if (!resp.ok) throw new Error("Failed to fetch orders");
      const json = await resp.json();
      return json.data as Order[];
    },
    enabled: !!user?.id,
  });

  const toggleOrder = (orderId: string) => {
    const next = new Set(expandedOrders);
    if (next.has(orderId)) next.delete(orderId);
    else next.add(orderId);
    setExpandedOrders(next);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {["order-skeleton-1", "order-skeleton-2", "order-skeleton-3"].map(
          (key) => (
            <Skeleton key={key} className="h-32 w-full rounded-xl" />
          ),
        )}
      </div>
    );
  }

  if (error || !orders) {
    return (
      <div className="text-center py-10 text-destructive">
        Failed to load your orders. Please try again.
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 bg-muted/30 rounded-2xl border-2 border-dashed border-border mt-4">
        <div className="text-5xl mb-4">🛍️</div>
        <h3 className="text-lg font-bold mb-1">No orders yet</h3>
        <p className="text-muted-foreground text-sm mb-6">
          Start shopping from our amazing vendors!
        </p>
        <Link href="/">
          <Button>Browse Marketplace</Button>
        </Link>
      </div>
    );
  }

  const currency = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  });

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center gap-2 mb-2">
        <ShoppingBag className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Your Orders</h2>
      </div>

      {orders.map((order) => {
        const config = statusConfig[order.status] || statusConfig.pending;
        const Icon = config.icon;
        const isExpanded = expandedOrders.has(order._id);

        return (
          <Card
            key={order._id}
            className="overflow-hidden border-border transition-all hover:border-primary/50"
          >
            <button
              type="button"
              className="w-full p-4 flex items-center justify-between cursor-pointer select-none text-left"
              onClick={() => toggleOrder(order._id)}
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base">
                    {order.vendorId?.name || "Unknown Vendor"}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(order.createdAt), "MMM d, yyyy • h:mm a")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="font-bold text-sm">
                    {currency.format(order.total)}
                  </p>
                  <Badge
                    variant={config.variant}
                    className="gap-1 mt-1 font-medium"
                  >
                    <Icon className="h-3 w-3" />
                    {config.label}
                  </Badge>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </button>

            {/* Mobile-only status/total row (if collapsed) */}
            {!isExpanded && (
              <div className="px-4 pb-4 sm:hidden flex items-center justify-between border-t border-border/50 pt-2">
                <Badge variant={config.variant} className="gap-1 font-medium">
                  <Icon className="h-3 w-3" />
                  {config.label}
                </Badge>
                <p className="font-bold text-sm">
                  {currency.format(order.total)}
                </p>
              </div>
            )}

            {isExpanded && (
              <CardContent className="border-t border-border/50 bg-secondary/20 pt-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Order Items
                </h5>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={`${order._id}-${item.productId}-${item.name}`}
                      className="flex justify-between items-center text-sm"
                    >
                      <div className="flex gap-2">
                        <span className="font-medium text-primary">
                          x{item.quantity}
                        </span>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">
                        {currency.format(item.lineTotal)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-3 mt-3 border-t border-border flex justify-between items-center font-bold">
                    <span>Total Paid</span>
                    <span className="text-primary text-lg">
                      {currency.format(order.total)}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Link
                    href={`/track-order?id=${order._id}`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                    >
                      <Truck className="h-4 w-4" /> Track Status
                    </Button>
                  </Link>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
