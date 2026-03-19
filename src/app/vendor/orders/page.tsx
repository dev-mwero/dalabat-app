"use client";

import {
  ChevronRight,
  ClipboardList,
  CreditCard,
  MapPin,
  Phone,
  Truck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { VendorRouteNav } from "@/app/vendor/_components/VendorRouteNav";

type Vendor = {
  _id: string;
  name: string;
};

type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type VendorOrder = {
  _id: string;
  contactPhone: string | null;
  items: OrderItem[];
  total: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  paymentMethod: "cash" | "mpesa_auto" | "mpesa_manual";
  paymentStatus: "pending" | "paid" | "failed";
  mpesaCode: string | null;
  deliveryMethod: "delivery" | "pickup";
  deliveryAddress: string | null;
  notes: string | null;
  createdAt: string;
};

type OrdersResponse = {
  data: VendorOrder[];
};

const currency = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

const statusLabels: Record<VendorOrder["status"], string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusClassNames: Record<VendorOrder["status"], string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border border-blue-200",
  preparing: "bg-violet-50 text-violet-700 border border-violet-200",
  ready: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  out_for_delivery: "bg-cyan-50 text-cyan-700 border border-cyan-200",
  delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border border-rose-200",
};

const statusFlow: Record<VendorOrder["status"], VendorOrder["status"] | null> =
  {
    pending: "confirmed",
    confirmed: "preparing",
    preparing: "ready",
    ready: "out_for_delivery",
    out_for_delivery: "delivered",
    delivered: null,
    cancelled: null,
  };

const filterStatuses = [
  "all",
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
] as const;

type FilterStatus = (typeof filterStatuses)[number];

function getOrderRef(order: VendorOrder) {
  const fromNotes = order.notes?.match(/order-ref:([^|\s]+)/)?.[1];
  if (fromNotes) {
    return fromNotes;
  }

  return `ORD-${order._id.slice(-6).toUpperCase()}`;
}

function formatPaymentMethod(order: VendorOrder) {
  if (order.paymentMethod === "cash") {
    return "Cash";
  }

  if (order.paymentMethod === "mpesa_auto") {
    return "M-Pesa";
  }

  if (order.mpesaCode) {
    return `M-Pesa (${order.mpesaCode})`;
  }

  return "M-Pesa (Manual)";
}

function timeAgo(createdAt: string) {
  const created = new Date(createdAt).getTime();
  const mins = Math.floor((Date.now() - created) / 60_000);
  if (mins < 60) {
    return `${Math.max(1, mins)}m ago`;
  }

  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${Math.floor(hours / 24)}d ago`;
}

export default function VendorOrdersPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadVendors() {
      try {
        const response = await fetch("/api/vendors?limit=50&sort=rating_desc", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load vendors");
        }

        const result = await response.json();
        const list = (result.data ?? []) as Vendor[];
        setVendors(list);
        setVendorId(list[0]?._id ?? null);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        setError("Unable to load vendors");
      }
    }

    loadVendors();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!vendorId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadOrders() {
      try {
        setLoading(true);
        setError(null);

        const statusQuery =
          filterStatus === "all"
            ? ""
            : `&status=${encodeURIComponent(filterStatus)}`;

        const response = await fetch(
          `/api/orders?vendorId=${vendorId}&limit=100&sort=newest${statusQuery}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load orders");
        }

        const result = (await response.json()) as OrdersResponse;
        setOrders(result.data ?? []);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        setError("Unable to load orders");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();

    return () => {
      controller.abort();
    };
  }, [filterStatus, vendorId]);

  const statusCounts = useMemo(() => {
    const countByStatus: Record<string, number> = {
      all: orders.length,
      pending: 0,
      confirmed: 0,
      preparing: 0,
      ready: 0,
      out_for_delivery: 0,
    };

    for (const order of orders) {
      if (countByStatus[order.status] !== undefined) {
        countByStatus[order.status] += 1;
      }
    }

    return countByStatus;
  }, [orders]);

  async function patchOrderStatus(
    orderId: string,
    nextStatus: VendorOrder["status"],
  ) {
    setUpdatingOrderId(orderId);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const payload = await response.json();
        toast.error(payload.error ?? "Failed to update order");
        return;
      }

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: nextStatus } : order,
        ),
      );

      setSelectedOrder((prev) =>
        prev && prev._id === orderId ? { ...prev, status: nextStatus } : prev,
      );

      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update order");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function cancelOrder(orderId: string) {
    await patchOrderStatus(orderId, "cancelled");
  }

  if (loading && orders.length === 0) {
    return (
      <main className="min-h-screen bg-background p-4 sm:p-6">
        <div className="mx-auto max-w-5xl rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
          Loading orders...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background p-4 sm:p-6">
        <div className="mx-auto max-w-5xl rounded-xl border border-red-200 bg-red-50 p-8 text-sm text-red-700">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <VendorRouteNav />
        <section className="space-y-2">
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-foreground">
            <ClipboardList className="h-6 w-6 text-primary" /> Orders
          </h1>
          <p className="text-sm text-muted-foreground">
            {orders.length} total orders
          </p>

          <div className="max-w-sm space-y-1">
            <label
              htmlFor="vendor-selector"
              className="text-xs font-medium text-muted-foreground"
            >
              Vendor
            </label>
            <select
              id="vendor-selector"
              value={vendorId ?? ""}
              onChange={(event) => setVendorId(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {vendors.map((vendor) => (
                <option key={vendor._id} value={vendor._id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="flex gap-2 overflow-x-auto pb-1">
          {filterStatuses.map((status) => {
            const isActive = filterStatus === status;
            const label = status === "all" ? "All" : statusLabels[status];

            return (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {label}
                <span className="ml-1 opacity-70">
                  {statusCounts[status] ?? 0}
                </span>
              </button>
            );
          })}
        </section>

        <section className="space-y-2">
          {orders.map((order) => {
            const nextStatus = statusFlow[order.status];
            const itemCount = order.items.reduce(
              (sum, item) => sum + item.quantity,
              0,
            );

            return (
              <article
                key={order._id}
                className="cursor-pointer rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">
                      {getOrderRef(order)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClassNames[order.status]}`}
                    >
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {timeAgo(order.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">
                      {order.contactPhone ?? "Guest order"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {itemCount} item{itemCount === 1 ? "" : "s"} ·{" "}
                      {order.deliveryMethod === "delivery"
                        ? "Delivery"
                        : "Pickup"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {currency.format(order.total)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {nextStatus &&
                  !["delivered", "cancelled"].includes(order.status) && (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        disabled={updatingOrderId === order._id}
                        className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={(event) => {
                          event.stopPropagation();
                          void patchOrderStatus(order._id, nextStatus);
                        }}
                      >
                        Mark as {statusLabels[nextStatus]}
                      </button>
                    </div>
                  )}
              </article>
            );
          })}

          {orders.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <ClipboardList className="mx-auto mb-3 h-12 w-12 opacity-40" />
              <p>No orders found</p>
            </div>
          )}
        </section>

        {selectedOrder && (
          <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                  {getOrderRef(selectedOrder)}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClassNames[selectedOrder.status]}`}
                  >
                    {statusLabels[selectedOrder.status]}
                  </span>
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Created {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2 rounded-lg bg-secondary/50 p-3">
                <p className="text-sm font-semibold text-foreground">
                  Order Details
                </p>
                {selectedOrder.contactPhone && (
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" /> {selectedOrder.contactPhone}
                  </p>
                )}
                {selectedOrder.deliveryAddress && (
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />{" "}
                    {selectedOrder.deliveryAddress}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-md border border-border px-2 py-1 text-xs text-foreground">
                    <Truck className="mr-1 inline h-3 w-3" />
                    {selectedOrder.deliveryMethod === "delivery"
                      ? "Delivery"
                      : "Pickup"}
                  </span>
                  <span className="rounded-md border border-border px-2 py-1 text-xs text-foreground">
                    <CreditCard className="mr-1 inline h-3 w-3" />
                    {formatPaymentMethod(selectedOrder)}
                  </span>
                  <span className="rounded-md border border-border px-2 py-1 text-xs text-foreground">
                    Payment: {selectedOrder.paymentStatus}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-foreground">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium text-foreground">
                        {currency.format(item.lineTotal)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-border pt-2 text-sm font-bold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">
                      {currency.format(selectedOrder.total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {statusFlow[selectedOrder.status] &&
                  !["delivered", "cancelled"].includes(
                    selectedOrder.status,
                  ) && (
                    <button
                      type="button"
                      disabled={updatingOrderId === selectedOrder._id}
                      className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => {
                        const nextStatus = statusFlow[selectedOrder.status];
                        if (!nextStatus) {
                          return;
                        }

                        void patchOrderStatus(selectedOrder._id, nextStatus);
                      }}
                    >
                      Mark as{" "}
                      {
                        statusLabels[
                          statusFlow[
                            selectedOrder.status
                          ] as VendorOrder["status"]
                        ]
                      }
                    </button>
                  )}
                {!["delivered", "cancelled"].includes(selectedOrder.status) && (
                  <button
                    type="button"
                    disabled={updatingOrderId === selectedOrder._id}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => {
                      void cancelOrder(selectedOrder._id);
                    }}
                  >
                    Cancel order
                  </button>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
