"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  Store,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Vendor = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  rating: number;
  isVerified: boolean;
  status: "active" | "suspended" | "pending";
  totalSales?: number;
  category: string;
};

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVendors() {
      try {
        const response = await fetch("/api/vendors?limit=100");
        const result = await response.json();
        // Enriching with some mock admin-only data
        const enriched = result.data.map((v: any) => ({
          ...v,
          status: "active",
          totalSales: Math.floor(Math.random() * 500) + 50,
          isVerified: v.rating > 4.5,
        }));
        setVendors(enriched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadVendors();
  }, []);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
            Vendor Directory
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Managing {vendors.length} storefronts across the platform.
          </p>
        </div>
        <button className="bg-slate-900 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-slate-200 flex items-center gap-2 hover:bg-slate-800 transition-all">
          <Plus className="w-5 h-5" />
          Onboard Vendor
        </button>
      </header>

      {/* Filters */}
      <section className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full bg-slate-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:ring-2 ring-slate-200"
            placeholder="Search by store name or slug..."
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </section>

      {/* Vendor Table */}
      <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Storefront
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Category
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Rating
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Status
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Sales
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
                          <div className="w-full h-full flex items-center justify-center text-lg">
                            🏪
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-900">
                            {vendor.name}
                          </p>
                          {vendor.isVerified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-medium tracking-tight">
                          /{vendor.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-tight">
                      {vendor.category || "General"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold text-slate-700">
                        {vendor.rating.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Active
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-black text-slate-900">
                      {vendor.totalSales} orders
                    </p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/store/${vendor.slug}`}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-bold text-sm">
              Synchronizing Vendor Database...
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
