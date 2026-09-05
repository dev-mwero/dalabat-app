"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Search, Store } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import VendorCard from "@/components/VendorCard";
import { useVendors } from "@/hooks/useVendors";

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f"];

export default function VendorsDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: vendors = [], isLoading } = useVendors({ search: searchQuery });

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return vendors;
    const q = searchQuery.trim().toLowerCase();
    return vendors.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(q) ||
        (vendor.description ?? "").toLowerCase().includes(q) ||
        (vendor.location ?? "").toLowerCase().includes(q),
    );
  }, [vendors, searchQuery]);

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-6xl space-y-8 px-4 py-8">
        <header>
          <Link
            href="/market"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to market
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                Vendor Directory
              </h1>
              <p className="mt-1 text-muted-foreground">
                Every trusted provisions store on the IIBSO marketplace.
              </p>
            </div>

            <div className="relative sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendors..."
                className="w-full rounded-full border border-border bg-card py-2.5 pl-9 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SKELETON_KEYS.map((key) => (
              <div
                key={key}
                className="h-64 animate-pulse rounded-lg bg-card border border-border"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card/50 py-16 text-center">
            <Store className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 font-medium text-foreground">No vendors found</p>
            <p className="text-sm text-muted-foreground">
              Try a different search or check back soon.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((vendor, index) => (
              <VendorCard key={vendor._id} vendor={vendor} index={index} />
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
