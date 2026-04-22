"use client";

import {
  CheckCircle,
  ClipboardList,
  Clock,
  DollarSign,
  Package,
  TrendingUp,
  Plus
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

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-violet-100 text-violet-700",
  ready: "bg-indigo-100 text-indigo-700",
  out_for_delivery: "bg-cyan-100 text-cyan-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};

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
        if (!response.ok) throw new Error("Failed to load vendors");
        const result = await response.json();
        const list = (result.data ?? []) as Vendor[];
        setVendors(list);
        setVendorId(list[0]?._id ?? null);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Unable to load vendors");
      } finally {
        setLoading(false);
      }
    }
    loadVendors();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!vendorId) return;
    const controller = new AbortController();
    async function loadSummary() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/vendor/dashboard/summary?vendorId=${vendorId}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Failed to load dashboard summary");
        const result = await response.json();
        setSummary(result.data as DashboardSummary);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Unable to load dashboard summary");
      } finally {
        setLoading(false);
      }
    }
    loadSummary();
    return () => controller.abort();
  }, [vendorId]);

  const currentVendorName = useMemo(() => vendors.find((v) => v._id === vendorId)?.name, [vendorId, vendors]);

  if (loading && !summary) {
    return <div className="p-8 text-center text-on-surface-variant animate-pulse">Loading dashboard...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-error bg-error-container rounded-xl">{error}</div>;
  }
  if (!vendorId || !summary) {
    return <div className="p-8 text-center text-on-surface-variant">No vendor data found yet.</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Greeting & Editorial Header */}
      <section className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Welcome back{currentVendorName ? `, ${currentVendorName}` : ""}</h2>
          <p className="text-on-surface-variant text-lg">Your pantry is buzzing today. Here’s what’s happening.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          <select
            value={vendorId}
            onChange={(event) => setVendorId(event.target.value)}
            className="h-12 rounded-full border border-outline-variant/30 bg-surface-container-low px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary text-on-surface cursor-pointer"
          >
            {vendors.map((vendor) => (
              <option key={vendor._id} value={vendor._id}>
                {vendor.name}
              </option>
            ))}
          </select>
          <button className="bg-primary-container text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-primary-container/20 flex items-center justify-center gap-2 hover:opacity-90 transition-all shrink-0">
            <Plus className="w-5 h-5" />
            New Product
          </button>
        </div>
      </section>

      {/* Key Metrics Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {/* Revenue Card (Primary Highlight) */}
        <div className="md:col-span-1 bg-gradient-to-br from-primary to-primary-container p-6 rounded-xl text-white shadow-xl flex flex-col justify-between min-h-[160px]">
          <div className="flex justify-between items-start">
            <DollarSign className="w-8 h-8 bg-white/20 p-1.5 rounded-lg" />
          </div>
          <div>
            <p className="text-sm opacity-80 font-medium">Total Revenue</p>
            <h3 className="text-3xl font-extrabold">{currency.format(summary.stats.revenue)}</h3>
          </div>
        </div>
        
        {/* Active Orders */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm flex flex-col justify-between min-h-[160px]">
          <div className="flex justify-between items-start">
            <Clock className="w-8 h-8 text-primary bg-primary-fixed p-1.5 rounded-lg" />
          </div>
          <div>
            <p className="text-sm text-on-surface-variant font-medium">Active Orders</p>
            <h3 className="text-3xl font-extrabold text-on-surface">{summary.stats.activeOrders}</h3>
          </div>
        </div>
        
        {/* Products */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm flex flex-col justify-between min-h-[160px]">
          <div className="flex justify-between items-start">
            <Package className="w-8 h-8 text-tertiary bg-tertiary-fixed p-1.5 rounded-lg" />
          </div>
          <div>
            <p className="text-sm text-on-surface-variant font-medium">Live Products</p>
            <h3 className="text-3xl font-extrabold text-on-surface">{summary.stats.productCount}</h3>
          </div>
        </div>
        
        {/* Completed */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm flex flex-col justify-between min-h-[160px]">
          <div className="flex justify-between items-start">
            <CheckCircle className="w-8 h-8 text-secondary bg-secondary-fixed p-1.5 rounded-lg" />
          </div>
          <div>
            <p className="text-sm text-on-surface-variant font-medium">Completed</p>
            <h3 className="text-3xl font-extrabold text-on-surface">{summary.stats.completedOrders}</h3>
          </div>
        </div>
      </section>

      {/* Table & Analytics Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table (2/3 width) */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
          <div className="p-6 flex justify-between items-center border-b border-surface-container-low">
            <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              Recent Orders
            </h3>
            <Link href="/vendor/orders" className="text-sm font-semibold text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Items</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {summary.recentOrders.slice(0, 5).map((order) => {
                  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  const statusLabel = statusLabels[order.status] || order.status;
                  const statusColor = statusColors[order.status] || "bg-surface-container-high text-on-surface-variant";
                  return (
                    <tr key={order._id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium">#{order._id.slice(-6).toUpperCase()}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{itemCount} items</td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm font-bold">{currency.format(order.total)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center w-fit gap-1 uppercase ${statusColor}`}>
                          <span className={`w-1.5 h-1.5 rounded-full bg-current opacity-80`}></span> {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {summary.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm text-on-surface-variant">
                      No recent orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Feature / Low Stock Alerts (1/3 width) */}
        <div className="space-y-6">
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
            <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Low Stock Alerts
            </h3>
            {summary.lowStock.length > 0 ? (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {summary.lowStock.map(product => (
                  <div key={product._id} className="flex items-center gap-4 border-b border-surface-container-low pb-3 last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-lg bg-error-container/20 flex items-center justify-center text-error font-bold text-xs">
                      {product.stockQuantity}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold line-clamp-1">{product.name}</p>
                      <p className="text-xs text-error font-medium">Critical Stock</p>
                    </div>
                  </div>
                ))}
                <Link href="/vendor/inventory" className="block w-full text-center text-xs font-bold text-primary mt-4 hover:underline">
                  Manage Inventory →
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-on-surface-variant bg-surface-container-low rounded-lg">
                All products are sufficiently stocked.
              </div>
            )}
          </div>

          {/* Promo Card (Stitch Design feature) */}
          <div className="relative overflow-hidden bg-on-tertiary-fixed text-white p-6 rounded-xl min-h-[200px] flex flex-col justify-end">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
            <img 
              className="absolute inset-0 w-full h-full object-cover opacity-80" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCd9_ixC6zBhtJkwogFJums3mER7L4FKTHS4qTs_cx9MOPQyDzzMdQ6O_W9Wy7fj_Oy12XdVqtLPO6t5mZaY7WsQixUcSZJDlOhM2a5mi5F12CppFWataVt008rb6slBzMdUMHdmJFSeL8835iViQZ3h-osfbETBxkVckKYxTHVKEkJgkPTXRZ0awdyaLI-Xq5jSsODryQO0jpu8Hg4Kj2ekQww4MSdaHn_FNsZgw4daX3DUgHhgrHc2X2NbL2A2CtRHWLQTF3LGnU" 
              alt="Promotion"
            />
            <div className="relative z-20">
              <h4 className="text-lg font-extrabold leading-tight">Grow your business with Pantry Plus</h4>
              <p className="text-xs opacity-80 mt-2 mb-4">Get featured in our daily editorial newsletters reaching 100k+ foodies.</p>
              <button className="bg-white text-on-tertiary-fixed text-xs font-bold py-2 px-4 rounded-full w-fit hover:bg-opacity-90 transition-all">Learn More</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
