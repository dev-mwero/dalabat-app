"use client";

import {
  ClipboardList,
  CreditCard,
  MapPin,
  Phone,
  Truck,
  Mail
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

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

const statusColors: Record<VendorOrder["status"], string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-violet-100 text-violet-700",
  ready: "bg-indigo-100 text-indigo-700",
  out_for_delivery: "bg-cyan-100 text-cyan-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};

const statusFlow: Record<VendorOrder["status"], VendorOrder["status"] | null> = {
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

function timeAgo(createdAt: string) {
  const created = new Date(createdAt).getTime();
  const mins = Math.floor((Date.now() - created) / 60_000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}

export default function VendorOrdersPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [orders, setOrders] = useState<VendorOrder[]>([]);
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

        if (!response.ok) throw new Error("Failed to load vendors");

        const result = await response.json();
        const list = (result.data ?? []) as Vendor[];
        setVendors(list);
        setVendorId(list[0]?._id ?? null);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Unable to load vendors");
      }
    }
    loadVendors();
    return () => controller.abort();
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
          { signal: controller.signal }
        );

        if (!response.ok) throw new Error("Failed to load orders");

        const result = (await response.json()) as OrdersResponse;
        setOrders(result.data ?? []);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Unable to load orders");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
    return () => controller.abort();
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

      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update order");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  if (loading && orders.length === 0) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8 animate-pulse text-on-surface-variant">
        Loading orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8 text-error bg-error-container rounded-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Order Management</h1>
          <p className="text-on-surface-variant text-lg">Track and manage your customer orders with precision.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={vendorId ?? ""}
            onChange={(event) => setVendorId(event.target.value)}
            className="h-12 rounded-full border border-outline-variant/30 bg-surface-container-low px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary text-on-surface cursor-pointer"
          >
            {vendors.map((vendor) => (
              <option key={vendor._id} value={vendor._id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {filterStatuses.map((status) => {
          const isActive = filterStatus === status;
          const label = status === "all" ? "All Orders" : statusLabels[status];
          const count = status === "all" ? "" : ` (${statusCounts[status] ?? 0})`;

          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-2 rounded-full text-sm transition-all whitespace-nowrap ${
                isActive
                  ? "bg-primary-container text-white font-bold shadow-md shadow-primary-container/10"
                  : "bg-surface-container-high text-on-surface-variant font-medium hover:bg-surface-container-highest"
              }`}
            >
              {label}{count}
            </button>
          );
        })}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {orders.map((order) => {
          const nextStatus = statusFlow[order.status];
          const isUpdating = updatingOrderId === order._id;

          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={order._id} 
              className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10 transition-transform hover:-translate-y-1 duration-300"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-xs text-on-surface-variant font-bold block mb-1 uppercase tracking-widest">{getOrderRef(order)} • {timeAgo(order.createdAt)}</span>
                  <h3 className="text-xl font-bold text-on-surface">Guest Customer</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${statusColors[order.status]}`}>
                  <span className="w-1.5 h-1.5 bg-current rounded-full opacity-80"></span>
                  {statusLabels[order.status]}
                </span>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  {order.contactPhone && (
                    <div className="flex flex-1 items-center gap-3 p-3 bg-surface-container-low rounded-lg">
                      <Phone className="w-4 h-4 text-primary-container" />
                      <span className="text-sm text-on-surface-variant font-medium">{order.contactPhone}</span>
                    </div>
                  )}
                  <div className="flex flex-1 items-center gap-3 p-3 bg-surface-container-low rounded-lg">
                    {order.deliveryMethod === "delivery" ? <Truck className="w-4 h-4 text-primary-container" /> : <MapPin className="w-4 h-4 text-primary-container" />}
                    <span className="text-sm text-on-surface-variant font-medium truncate max-w-[150px]">
                      {order.deliveryMethod === "delivery" ? order.deliveryAddress || "Delivery" : "Pickup"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={`${item.productId}-${idx}`} className="flex justify-between items-center text-sm border-b border-surface-container-low/50 pb-2 last:border-0 last:pb-0">
                      <span className="text-on-surface-variant">
                        <span className="font-bold text-on-surface mr-2">{item.quantity}x</span>
                        {item.name}
                      </span>
                      <span className="font-bold">{currency.format(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-surface-container-low">
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">Total Amount</p>
                  <p className="text-xl font-extrabold text-on-surface">{currency.format(order.total)}</p>
                </div>
                <div className="flex gap-2">
                  {nextStatus && !["delivered", "cancelled"].includes(order.status) && (
                    <button 
                      disabled={isUpdating}
                      onClick={() => patchOrderStatus(order._id, nextStatus)}
                      className="px-6 py-2.5 rounded-full bg-primary-container text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {isUpdating ? "Updating..." : `Mark as ${statusLabels[nextStatus]}`}
                    </button>
                  )}
                  {!["delivered", "cancelled"].includes(order.status) && (
                    <button 
                      disabled={isUpdating}
                      onClick={() => patchOrderStatus(order._id, "cancelled")}
                      className="px-4 py-2.5 rounded-full bg-error-container text-error font-bold text-sm hover:bg-error/20 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {orders.length === 0 && (
          <div className="lg:col-span-2 py-12 text-center text-muted-foreground bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant/30">
            <ClipboardList className="mx-auto mb-3 h-12 w-12 opacity-40 text-on-surface-variant" />
            <p className="font-medium text-on-surface-variant">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
