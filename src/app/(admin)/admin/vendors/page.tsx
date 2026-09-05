"use client";

import { motion } from "framer-motion";
import {
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  Star,
  Store,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type Vendor = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  rating: number;
  reviewCount: number;
  location: string;
  deliveryFee: number;
  deliveryTime: string;
  minimumOrder: number;
  isOpen: boolean;
  createdAt: string;
};

const currency = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadVendors = useCallback(async (query = "") => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/vendors?limit=100${query ? `&q=${encodeURIComponent(query)}` : ""}`,
      );
      if (!response.ok) throw new Error();
      const result = await response.json();
      setVendors(result.data ?? []);
    } catch {
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadVendors(searchQuery), 250);
    return () => clearTimeout(timer);
  }, [searchQuery, loadVendors]);

  async function toggleOpen(vendor: Vendor) {
    setUpdatingId(vendor._id);
    try {
      const response = await fetch(`/api/vendors/${vendor._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: !vendor.isOpen }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update store");
      }
      setVendors((prev) =>
        prev.map((v) =>
          v._id === vendor._id ? { ...v, isOpen: !v.isOpen } : v,
        ),
      );
      toast.success(vendor.isOpen ? "Store closed" : "Store opened");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteVendor(vendor: Vendor) {
    const confirmed = window.confirm(
      `Delete "${vendor.name}" and all of its products? This cannot be undone.`,
    );
    if (!confirmed) return;

    setUpdatingId(vendor._id);
    try {
      const response = await fetch(`/api/vendors/${vendor._id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete store");
      }
      setVendors((prev) => prev.filter((v) => v._id !== vendor._id));
      toast.success("Storefront deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 mb-2">
            Vendor Directory
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            {vendors.length} storefronts across the platform.
          </p>
        </div>
        <Link
          href="/register?role=vendor"
          className="bg-slate-900 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-slate-200 flex items-center gap-2 hover:bg-slate-800 transition-all"
        >
          <Plus className="w-5 h-5" />
          Onboard Vendor
        </Link>
      </header>

      {/* Filters */}
      <section className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:ring-2 ring-slate-200"
            placeholder="Search by store name, location, or slug..."
            type="search"
          />
        </div>
        <button
          type="button"
          onClick={() => loadVendors()}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-slate-50 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </section>

      {/* Vendor Table */}
      <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {loading && vendors.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-bold text-sm">
              Loading storefronts...
            </p>
          </div>
        ) : vendors.length === 0 ? (
          <div className="p-16 text-center">
            <Store className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-bold text-slate-700">
              No storefronts found
            </p>
            <p className="text-sm text-slate-400">
              Try a different search, or onboard a new vendor.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Storefront
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Location
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Rating
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Delivery
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    State
                  </th>
                  <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {vendors.map((vendor) => (
                  <motion.tr
                    layout
                    key={vendor._id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden relative bg-slate-100 border border-slate-200">
                          {vendor.image ? (
                            <Image
                              src={vendor.image}
                              alt={vendor.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Store className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {vendor.name}
                          </p>
                          <p className="text-xs text-slate-400 font-medium tracking-tight">
                            /{vendor.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-tight">
                        {vendor.location.split(",")[0]}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-bold text-slate-700">
                          {vendor.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({vendor.reviewCount})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-slate-700">
                        {vendor.deliveryFee > 0
                          ? currency.format(vendor.deliveryFee)
                          : "Free"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {vendor.deliveryTime}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <button
                        type="button"
                        onClick={() => toggleOpen(vendor)}
                        disabled={updatingId === vendor._id}
                        className={`flex items-center gap-2 font-bold text-xs uppercase tracking-widest disabled:opacity-50 ${vendor.isOpen ? "text-emerald-600" : "text-slate-400"}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${vendor.isOpen ? "bg-emerald-500" : "bg-slate-300"}`}
                        />
                        {vendor.isOpen ? "Open" : "Closed"}
                      </button>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/store/${vendor.slug}`}
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                          title="View storefront"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => deleteVendor(vendor)}
                          disabled={updatingId === vendor._id}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all disabled:opacity-50"
                          title="Delete storefront"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
