"use client";

import {
  CheckCircle,
  ClipboardList,
  Clock,
  DollarSign,
  Package,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Vendor = {
  _id: string;
  name: string;
};

type DashboardSummary = {
  stats: {
    activeOrders: number;
    completedOrders: number;
    productCount: number;
    revenue: number;
  };
  recentOrders: Array<{
    _id: string;
    total: number;
    status: string;
    items: Array<{ quantity: number }>;
    createdAt: string;
  }>;
  lowStock: Array<{
    _id: string;
    name: string;
    stockQuantity: number;
  }>;
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

const statusClassNames: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border border-blue-200",
  preparing: "bg-violet-50 text-violet-700 border border-violet-200",
  ready: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  out_for_delivery: "bg-cyan-50 text-cyan-700 border border-cyan-200",
  delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border border-rose-200",
};

function formatStatus(value: string) {
  return statusLabels[value] ?? value;
}

function getStatusClassName(value: string) {
  return (
    statusClassNames[value] ??
    "bg-muted text-muted-foreground border border-border"
  );
}

export default function VendorDashboardPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadVendors() {
      try {
        setLoading(true);
        setError(null);

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
      } finally {
        setLoading(false);
      }
    }

    loadVendors();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!vendorId) {
      return;
    }

    const controller = new AbortController();

    async function loadSummary() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/vendor/dashboard/summary?vendorId=${vendorId}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load dashboard summary");
        }

        const result = await response.json();
        setSummary(result.data as DashboardSummary);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        setError("Unable to load dashboard summary");
      } finally {
        setLoading(false);
      }
    }

    loadSummary();

    return () => {
      controller.abort();
    };
  }, [vendorId]);

  const currentVendorName = useMemo(
    () => vendors.find((vendor) => vendor._id === vendorId)?.name,
    [vendorId, vendors],
  );

  if (loading && !summary) {
    return (
      <main className="min-h-screen bg-background p-4 sm:p-6">
        <div className="mx-auto max-w-5xl rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
          Loading dashboard...
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

  if (!vendorId || !summary) {
    return (
      <main className="min-h-screen bg-background p-4 sm:p-6">
        <div className="mx-auto max-w-5xl rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
          No vendor data found yet.
        </div>
      </main>
    );
  }

  const stats = [
    {
      label: "Active Orders",
      value: summary.stats.activeOrders,
      icon: Clock,
      color: "text-blue-600",
    },
    {
      label: "Completed",
      value: summary.stats.completedOrders,
      icon: CheckCircle,
      color: "text-emerald-600",
    },
    {
      label: "Products",
      value: summary.stats.productCount,
      icon: Package,
      color: "text-purple-600",
    },
    {
      label: "Revenue",
      value: currency.format(summary.stats.revenue),
      icon: DollarSign,
      color: "text-primary",
    },
  ];

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="space-y-3">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">
              Welcome back{currentVendorName ? `, ${currentVendorName}` : ""}!
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Here is what is happening with your store today.
            </p>
          </div>

          <div className="max-w-sm space-y-1">
            <label
              htmlFor="vendor-selector"
              className="text-xs font-medium text-muted-foreground"
            >
              Vendor
            </label>
            <select
              id="vendor-selector"
              value={vendorId}
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

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="flex items-center gap-2 font-bold text-foreground">
              <ClipboardList className="h-4 w-4 text-primary" />
              Recent Orders
            </h2>
            <Link
              href="/vendor/orders"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-border">
            {summary.recentOrders.slice(0, 6).map((order) => {
              const itemCount = order.items.reduce(
                (sum, item) => sum + item.quantity,
                0,
              );

              return (
                <div
                  key={order._id}
                  className="flex items-center justify-between gap-2 p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      #{order._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {itemCount} item{itemCount === 1 ? "" : "s"} •{" "}
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusClassName(order.status)}`}
                    >
                      {formatStatus(order.status)}
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {currency.format(order.total)}
                    </span>
                  </div>
                </div>
              );
            })}

            {summary.recentOrders.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No recent orders yet.
              </div>
            )}
          </div>
        </section>

        {summary.lowStock.length > 0 && (
          <section className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
            <h2 className="mb-3 flex items-center gap-2 font-bold text-foreground">
              <TrendingUp className="h-4 w-4 text-amber-600" />
              Low Stock Alert
            </h2>
            <div className="space-y-2">
              {summary.lowStock.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-foreground">{product.name}</span>
                  <span className="font-medium text-amber-700">
                    {product.stockQuantity} left
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/vendor/inventory"
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              Manage inventory →
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
