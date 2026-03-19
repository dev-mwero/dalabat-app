"use client";

import { format, subDays } from "date-fns";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarIcon,
  DollarSign,
  Download,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { VendorRouteNav } from "@/app/vendor/_components/VendorRouteNav";

type Vendor = {
  _id: string;
  name: string;
};

type Order = {
  _id: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    name: string;
    quantity: number;
    lineTotal: number;
  }>;
};

type DashboardSummary = {
  stats: {
    activeOrders: number;
    completedOrders: number;
    productCount: number;
    revenue: number;
  };
};

type Preset = "7d" | "14d" | "30d";

const presetDays: Record<Preset, number> = {
  "7d": 7,
  "14d": 14,
  "30d": 30,
};

const currency = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

function buildDayKeys(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - i - 1);
    return {
      key: format(date, "yyyy-MM-dd"),
      label: format(date, "MMM d"),
    };
  });
}

export default function VendorAnalyticsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [preset, setPreset] = useState<Preset>("14d");
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
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
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [summaryRes, ordersRes] = await Promise.all([
          fetch(`/api/vendor/dashboard/summary?vendorId=${vendorId}`, {
            signal: controller.signal,
          }),
          fetch(`/api/orders?vendorId=${vendorId}&limit=200&sort=newest`, {
            signal: controller.signal,
          }),
        ]);

        if (!summaryRes.ok || !ordersRes.ok) {
          throw new Error("Failed to load analytics");
        }

        const summaryJson = await summaryRes.json();
        const ordersJson = await ordersRes.json();

        setSummary(summaryJson.data as DashboardSummary);
        setOrders((ordersJson.data ?? []) as Order[]);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setError("Unable to load analytics");
      } finally {
        setLoading(false);
      }
    }

    loadData();

    return () => {
      controller.abort();
    };
  }, [vendorId]);

  const days = presetDays[preset];

  const revenueSeries = useMemo(() => {
    const keys = buildDayKeys(days);
    const map = new Map(
      keys.map((d) => [d.key, { date: d.label, revenue: 0, orders: 0 }]),
    );

    for (const order of orders) {
      const key = format(new Date(order.createdAt), "yyyy-MM-dd");
      const bucket = map.get(key);
      if (!bucket) {
        continue;
      }

      bucket.revenue += Number(order.total ?? 0);
      bucket.orders += 1;
    }

    return keys.map(
      (d) => map.get(d.key) ?? { date: d.label, revenue: 0, orders: 0 },
    );
  }, [days, orders]);

  const statusBreakdown = useMemo(() => {
    const counts = new Map<string, number>();

    for (const order of orders) {
      counts.set(order.status, (counts.get(order.status) ?? 0) + 1);
    }

    const colorByStatus: Record<string, string> = {
      pending: "#f59e0b",
      confirmed: "#3b82f6",
      preparing: "#8b5cf6",
      ready: "#6366f1",
      out_for_delivery: "#06b6d4",
      delivered: "#10b981",
      cancelled: "#f43f5e",
    };

    return [...counts.entries()].map(([name, value]) => ({
      name,
      value,
      color: colorByStatus[name] ?? "#94a3b8",
    }));
  }, [orders]);

  const topProducts = useMemo(() => {
    const aggregates = new Map<
      string,
      { name: string; sold: number; revenue: number }
    >();

    for (const order of orders) {
      for (const item of order.items) {
        const existing = aggregates.get(item.name);
        if (existing) {
          existing.sold += Number(item.quantity ?? 0);
          existing.revenue += Number(item.lineTotal ?? 0);
        } else {
          aggregates.set(item.name, {
            name: item.name,
            sold: Number(item.quantity ?? 0),
            revenue: Number(item.lineTotal ?? 0),
          });
        }
      }
    }

    return [...aggregates.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered",
  ).length;
  const completionRate =
    totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;
  const averageOrderValue =
    totalOrders > 0
      ? orders.reduce((sum, order) => sum + Number(order.total ?? 0), 0) /
        totalOrders
      : 0;

  function handleExportCSV() {
    const lines = ["Date,Revenue (KES),Orders"];

    for (const point of revenueSeries) {
      lines.push(`${point.date},${point.revenue},${point.orders}`);
    }

    lines.push("", "Top Products,Units Sold,Revenue (KES)");

    for (const product of topProducts) {
      lines.push(`${product.name},${product.sold},${product.revenue}`);
    }

    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-${preset}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-4 sm:p-6">
        <div className="mx-auto max-w-6xl rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
          Loading analytics...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background p-4 sm:p-6">
        <div className="mx-auto max-w-6xl rounded-xl border border-red-200 bg-red-50 p-8 text-sm text-red-700">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <VendorRouteNav />
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">
              Analytics & Reports
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track store performance and sales trends.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(["7d", "14d", "30d"] as Preset[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setPreset(key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  preset === key
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background text-foreground"
                }`}
              >
                {presetDays[key]} days
              </button>
            ))}

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
          </div>
        </header>

        <section className="max-w-sm space-y-1">
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
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: "Revenue",
              value: currency.format(summary?.stats.revenue ?? 0),
              change: "+",
              icon: DollarSign,
              up: true,
            },
            {
              label: "Orders",
              value: `${totalOrders}`,
              change: `${summary?.stats.activeOrders ?? 0} active`,
              icon: ShoppingCart,
              up: true,
            },
            {
              label: "Avg. Order",
              value: currency.format(averageOrderValue),
              change: `${completionRate.toFixed(1)}% completed`,
              icon: TrendingUp,
              up: completionRate >= 60,
            },
            {
              label: "Products",
              value: `${summary?.stats.productCount ?? 0}`,
              change: `${deliveredOrders} delivered`,
              icon: Users,
              up: true,
            },
          ].map((stat) => (
            <article
              key={stat.label}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <stat.icon className="h-4 w-4 text-primary" />
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                    stat.up ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {stat.up ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-foreground">Revenue Trend</h2>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarIcon className="h-3.5 w-3.5" /> Last {presetDays[preset]}{" "}
              days
            </span>
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="hsl(25, 95%, 53%)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(25, 95%, 53%)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(30, 20%, 90%)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(20, 5%, 45%)"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="hsl(20, 5%, 45%)"
                  tickFormatter={(value) =>
                    `${Math.round(Number(value) / 1000)}k`
                  }
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(30,20%,90%)",
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [
                    currency.format(value),
                    "Revenue",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(25, 95%, 53%)"
                  fill="url(#revenueGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <h2 className="mb-4 font-bold text-foreground">Orders by Day</h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueSeries}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(30, 20%, 90%)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    stroke="hsl(20, 5%, 45%)"
                  />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(20, 5%, 45%)" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid hsl(30,20%,90%)",
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [value, "Orders"]}
                  />
                  <Bar
                    dataKey="orders"
                    fill="hsl(25, 95%, 53%)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <h2 className="mb-4 font-bold text-foreground">
              Order Status Share
            </h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid hsl(30,20%,90%)",
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [value, "Orders"]}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        <section className="rounded-xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <h2 className="font-bold text-foreground">Top Selling Products</h2>
          </div>
          <div className="divide-y divide-border">
            {topProducts.map((product, index) => (
              <div
                key={product.name}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-xs font-bold text-muted-foreground">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.sold} units sold
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-foreground">
                  {currency.format(product.revenue)}
                </span>
              </div>
            ))}
            {topProducts.length === 0 && (
              <div className="p-6 text-sm text-muted-foreground">
                No product sales data yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
