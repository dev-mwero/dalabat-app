"use client";

import { format, subDays } from "date-fns";
import { CalendarIcon, Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

type Preset = "7d" | "14d" | "30d" | "90d";

const presetDays: Record<Preset, number> = {
  "7d": 7,
  "14d": 14,
  "30d": 30,
  "90d": 90,
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
  const [preset, setPreset] = useState<Preset>("30d");
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
      pending: "#dae2fd", // secondary-container
      confirmed: "#9d4300", // primary
      preparing: "#8c9cb4", // tertiary-container
      ready: "#f97316", // primary-container
      out_for_delivery: "#06b6d4",
      delivered: "#10b981", // green
      cancelled: "#ffdad6", // error-container
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

  if (loading && !summary) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8 animate-pulse text-on-surface-variant">
        Loading analytics...
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
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Header & Date Picker */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
            Analytics & Reports
          </h1>
          <p className="text-on-surface-variant font-medium">
            Tracking your pantry's performance and growth metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={vendorId ?? ""}
            onChange={(event) => setVendorId(event.target.value)}
            className="h-10 rounded-full border border-outline-variant/30 bg-surface-container-low px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary text-on-surface cursor-pointer"
          >
            {vendors.map((vendor) => (
              <option key={vendor._id} value={vendor._id}>
                {vendor.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 bg-surface-container-lowest p-1.5 rounded-full shadow-sm border border-outline-variant/10">
            <button
              onClick={() => setPreset("30d")}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${preset === "30d" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-low"}`}
              type="button"
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setPreset("90d")}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${preset === "90d" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-low"}`}
              type="button"
            >
              Quarterly
            </button>
            <div className="h-6 w-px bg-outline-variant/30"></div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors"
              type="button"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Metric Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 group hover:bg-orange-50/50 transition-colors duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 flex items-center justify-center bg-primary-container/10 rounded-xl text-primary-container">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +12.5%
            </span>
          </div>
          <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-wider mb-1">
            Total Revenue
          </p>
          <h3 className="text-3xl font-extrabold text-on-surface">
            {currency.format(summary?.stats.revenue ?? 0)}
          </h3>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 group hover:bg-orange-50/50 transition-colors duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 flex items-center justify-center bg-secondary-container rounded-xl text-on-secondary-container">
              <span className="material-symbols-outlined">shopping_cart</span>
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +8.2%
            </span>
          </div>
          <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-wider mb-1">
            Total Orders
          </p>
          <h3 className="text-3xl font-extrabold text-on-surface">
            {totalOrders}
          </h3>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 group hover:bg-orange-50/50 transition-colors duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 flex items-center justify-center bg-tertiary-container/20 rounded-xl text-tertiary-container">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
              -2.4%
            </span>
          </div>
          <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-wider mb-1">
            Avg. Order Value
          </p>
          <h3 className="text-3xl font-extrabold text-on-surface">
            {currency.format(averageOrderValue)}
          </h3>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 group hover:bg-orange-50/50 transition-colors duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-xl text-primary">
              <span className="material-symbols-outlined">inventory</span>
            </div>
            <span className="text-xs font-bold text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-full">
              Stable
            </span>
          </div>
          <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-wider mb-1">
            Active Products
          </p>
          <h3 className="text-3xl font-extrabold text-on-surface">
            {summary?.stats.productCount ?? 0}
          </h3>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="text-xl font-bold text-on-surface">
                Revenue Trend
              </h4>
              <p className="text-sm text-on-surface-variant">
                Daily earnings for the current period
              </p>
            </div>
            <button
              className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg"
              type="button"
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 min-h-[300px]">
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
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) =>
                    `${Math.round(Number(value) / 1000)}k`
                  }
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: number) => [
                    currency.format(value),
                    "Revenue",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f97316"
                  fill="url(#revenueGradient)"
                  strokeWidth={3}
                  activeDot={{
                    r: 6,
                    fill: "#f97316",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 flex flex-col">
          <div>
            <h4 className="text-xl font-bold text-on-surface mb-1">
              Order Status
            </h4>
            <p className="text-sm text-on-surface-variant">
              Fulfillment distribution
            </p>
          </div>
          <div className="flex-1 relative min-h-[250px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: number) => [value, "Orders"]}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-extrabold text-on-surface">
                {completionRate.toFixed(0)}%
              </span>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">
                Success Rate
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6">
            {statusBreakdown.slice(0, 4).map((status) => (
              <div key={status.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: status.color }}
                ></div>
                <span className="text-xs font-bold text-on-surface capitalize">
                  {status.name.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Selling Products Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <div className="px-8 py-6 border-b border-surface-container flex justify-between items-center bg-surface-container-low/30">
          <h4 className="text-xl font-bold text-on-surface">
            Top Selling Products
          </h4>
          <button
            className="text-sm font-bold text-primary hover:underline"
            type="button"
          >
            View All Inventory
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-on-surface-variant text-xs font-bold uppercase tracking-widest border-b border-surface-container bg-surface-container-lowest">
                <th className="px-8 py-4">Product Name</th>
                <th className="px-8 py-4">Sales</th>
                <th className="px-8 py-4">Revenue</th>
                <th className="px-8 py-4 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {topProducts.map((product) => (
                <tr
                  key={product.name}
                  className="hover:bg-surface-container-low/50 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <p className="font-bold text-on-surface">{product.name}</p>
                  </td>
                  <td className="px-8 py-5 font-semibold text-on-surface">
                    {product.sold}
                  </td>
                  <td className="px-8 py-5 font-extrabold text-on-surface">
                    {currency.format(product.revenue)}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="material-symbols-outlined text-green-500">
                      trending_up
                    </span>
                  </td>
                </tr>
              ))}
              {topProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-8 text-center text-on-surface-variant text-sm"
                  >
                    No sales data available for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
