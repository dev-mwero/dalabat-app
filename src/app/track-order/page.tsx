"use client";

import {
  ArrowLeft,
  CheckCircle2,
  ChefHat,
  Clock,
  MapPin,
  Package,
  Phone,
  Search,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

type VendorSummary = {
  _id: string;
  name: string;
  location?: string;
  deliveryFee?: number;
};

type OrderItem = {
  productId: string;
  name?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type TrackedOrder = {
  _id: string;
  status: OrderStatus;
  vendorId: VendorSummary | string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: "cash" | "mpesa_auto" | "mpesa_manual";
  paymentStatus: "pending" | "paid" | "failed";
  contactPhone: string | null;
  deliveryMethod: "delivery" | "pickup";
  deliveryAddress: string | null;
  notes: string | null;
  createdAt: string;
};

type TimelineStep = {
  label: string;
  description: string;
  icon: typeof CheckCircle2;
  completed: boolean;
  active: boolean;
  isCancelled?: boolean;
};

const currency = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

const statusBadgeClass: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border border-blue-200",
  preparing: "bg-violet-50 text-violet-700 border border-violet-200",
  ready: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  out_for_delivery: "bg-cyan-50 text-cyan-700 border border-cyan-200",
  delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border border-rose-200",
};

const statusLabel: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Being Prepared",
  ready: "Ready",
  out_for_delivery: "On the Way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function extractOrderRef(order: TrackedOrder) {
  return (
    order.notes?.match(/order-ref:([^|\s]+)/)?.[1] ??
    `ORD-${order._id.slice(-6).toUpperCase()}`
  );
}

function getVendorName(vendorId: TrackedOrder["vendorId"]) {
  if (typeof vendorId === "string") {
    return "Vendor";
  }

  return vendorId.name;
}

function buildTimeline(order: TrackedOrder): TimelineStep[] {
  if (order.status === "cancelled") {
    return [
      {
        label: "Order Cancelled",
        description: "This order was cancelled and will not be fulfilled.",
        icon: Package,
        completed: true,
        active: true,
        isCancelled: true,
      },
    ];
  }

  const isDelivery = order.deliveryMethod === "delivery";
  const flow: OrderStatus[] = [
    "pending",
    "confirmed",
    "preparing",
    "ready",
    ...(isDelivery ? (["out_for_delivery"] as const) : []),
    "delivered",
  ];

  const currentIndex = flow.indexOf(order.status);

  return flow.map((status, index) => {
    const labels: Record<OrderStatus, string> = {
      pending: "Order Received",
      confirmed: "Order Confirmed",
      preparing: "Being Prepared",
      ready: isDelivery ? "Ready for Dispatch" : "Ready for Pickup",
      out_for_delivery: "On the Way",
      delivered: isDelivery ? "Delivered" : "Picked Up",
      cancelled: "Cancelled",
    };

    const descriptions: Record<OrderStatus, string> = {
      pending: "We have received your order request.",
      confirmed: "The vendor confirmed your order details.",
      preparing: "The vendor is packing your items.",
      ready: isDelivery
        ? "Your order is packed and ready to leave the store."
        : "Your order is ready for collection.",
      out_for_delivery: "Your rider is heading to your location.",
      delivered: isDelivery
        ? "Your order has been delivered."
        : "Your pickup order has been completed.",
      cancelled: "This order was cancelled.",
    };

    const iconMap: Record<OrderStatus, typeof CheckCircle2> = {
      pending: Clock,
      confirmed: CheckCircle2,
      preparing: ChefHat,
      ready: Package,
      out_for_delivery: Truck,
      delivered: CheckCircle2,
      cancelled: Package,
    };

    return {
      label: labels[status],
      description: descriptions[status],
      icon: iconMap[status],
      completed: currentIndex >= index,
      active: currentIndex === index,
    };
  });
}

export default function TrackOrderPage() {
  const [searchId, setSearchId] = useState("");
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeline = useMemo(() => (order ? buildTimeline(order) : []), [order]);

  async function handleSearch() {
    const trimmed = searchId.trim().toUpperCase();
    if (!trimmed) {
      return;
    }

    setLoading(true);
    setError(null);
    setTrackingId(trimmed);

    try {
      const response = await fetch(
        `/api/orders/${encodeURIComponent(trimmed)}`,
      );
      if (!response.ok) {
        if (response.status === 404) {
          setOrder(null);
          setError(
            "Order not found. Double-check your order ID and try again.",
          );
          return;
        }

        throw new Error("Failed to load order");
      }

      const result = await response.json();
      setOrder(result.data as TrackedOrder);
      setError(null);
    } catch {
      setOrder(null);
      setError("Unable to track this order right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-2xl space-y-6 px-4 py-8">
        <header>
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to store
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            Track Your Order
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your order ID to see real-time status updates.
          </p>
        </header>

        <section className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="e.g. DLB-123456"
              value={searchId}
              onChange={(event) => setSearchId(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void handleSearch();
                }
              }}
              className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              void handleSearch();
            }}
            disabled={loading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Tracking..." : "Track"}
          </button>
        </section>

        {error && (
          <section className="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-medium text-rose-700">{error}</p>
          </section>
        )}

        {order && (
          <div className="space-y-4">
            <section className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Order
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {extractOrderRef(order)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${statusBadgeClass[order.status]}`}
                >
                  {statusLabel[order.status]}
                </span>
              </div>

              <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(order.createdAt).toLocaleString()}
                </span>
                <span className="hidden sm:inline">·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {order.deliveryAddress ??
                    (order.deliveryMethod === "pickup"
                      ? "Pickup from store"
                      : "Address pending")}
                </span>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold text-foreground">
                Order Progress
              </h2>
              <div className="space-y-0">
                {timeline.map((step, index) => (
                  <div key={step.label} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                          step.isCancelled
                            ? "bg-rose-100 text-rose-700"
                            : step.active
                              ? "bg-primary text-primary-foreground"
                              : step.completed
                                ? "bg-primary/15 text-primary"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <step.icon className="h-5 w-5" />
                      </div>
                      {index < timeline.length - 1 && (
                        <div
                          className={`min-h-[2rem] w-0.5 ${
                            step.completed ? "bg-primary/30" : "bg-border"
                          }`}
                        />
                      )}
                    </div>

                    <div className="pb-6">
                      <p
                        className={`text-sm font-medium ${
                          step.isCancelled
                            ? "text-rose-700"
                            : step.active
                              ? "text-primary"
                              : step.completed
                                ? "text-foreground"
                                : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">
                  Items from {getVendorName(order.vendorId)}
                </h2>
                {order.contactPhone && (
                  <a
                    href={`tel:${order.contactPhone}`}
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <Phone className="h-3 w-3" /> Contact
                  </a>
                )}
              </div>

              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-foreground">
                      {item.name ?? "Item"}{" "}
                      <span className="text-muted-foreground">
                        ×{item.quantity}
                      </span>
                    </span>
                    <span className="font-medium text-foreground">
                      {currency.format(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="my-3 h-px bg-border" />

              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{currency.format(order.subtotal)}</span>
                </div>
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery fee</span>
                    <span>{currency.format(order.deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 font-semibold text-foreground">
                  <span>Total</span>
                  <span>{currency.format(order.total)}</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {!order && !error && trackingId && !loading && (
          <section className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              No data available for {trackingId}.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
