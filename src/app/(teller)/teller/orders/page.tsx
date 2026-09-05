"use client";

import { motion } from "framer-motion";
import { ClipboardList, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  paymentMethod: string;
  deliveryMethod: "delivery" | "pickup";
  deliveryAddress: string | null;
  createdAt: string;
};

const currency = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-violet-100 text-violet-700",
  ready: "bg-indigo-100 text-indigo-700",
  out_for_delivery: "bg-cyan-100 text-cyan-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};

const statusFlow: Record<string, string | null> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "out_for_delivery",
  out_for_delivery: "delivered",
  delivered: null,
  cancelled: null,
};

export default function TellerOrdersPage() {
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/user/me");
        const result = await response.json();
        if (result.data?.vendorId) {
          setVendorId(result.data.vendorId);
        } else {
          toast.error("You are not assigned to a vendor store.");
          setLoading(false);
        }
      } catch (_err) {
        toast.error("Failed to load user profile");
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (!vendorId) return;

    async function loadOrders() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/orders?vendorId=${vendorId}&limit=50&sort=newest`,
        );
        if (!response.ok) throw new Error();
        const result = await response.json();
        setOrders(result.data ?? []);
      } catch (_err) {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [vendorId]);

  async function updateStatus(orderId: string, nextStatus: string) {
    setUpdatingOrderId(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) throw new Error();

      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, status: nextStatus as VendorOrder["status"] }
            : o,
        ),
      );
      toast.success("Order updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  if (loading && orders.length === 0) {
    return (
      <div className="p-8 text-on-surface-variant font-medium flex items-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin" />
        Loading live orders...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">
          Active Orders
        </h1>
        <p className="text-on-surface-variant">
          Update order status as you prepare and ship them.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {orders.map((order) => {
          const nextStatus = statusFlow[order.status];
          const isUpdating = updatingOrderId === order._id;

          return (
            <motion.div
              layout
              key={order._id}
              className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">
                    Order #{order._id.slice(-6).toUpperCase()}
                  </p>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[order.status]}`}
                  >
                    {statusLabels[order.status]}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-on-surface">
                    {currency.format(order.total)}
                  </p>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase">
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {order.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-on-surface-variant">
                      <span className="font-bold text-on-surface mr-2">
                        {item.quantity}x
                      </span>
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4 border-t border-outline-variant/10">
                {nextStatus && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => updateStatus(order._id, nextStatus)}
                    className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all text-sm shadow-lg shadow-primary/10"
                  >
                    {isUpdating ? "..." : `Mark as ${statusLabels[nextStatus]}`}
                  </button>
                )}
                {order.status !== "cancelled" &&
                  order.status !== "delivered" && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => updateStatus(order._id, "cancelled")}
                      className="px-4 bg-error-container text-error font-bold py-3 rounded-xl hover:bg-error/10 transition-all text-sm"
                    >
                      Cancel
                    </button>
                  )}
              </div>
            </motion.div>
          );
        })}

        {orders.length === 0 && (
          <div className="col-span-full py-20 text-center bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant/30">
            <ClipboardList className="w-12 h-12 text-on-surface-variant opacity-20 mx-auto mb-4" />
            <p className="text-on-surface-variant font-bold">
              No active orders at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
