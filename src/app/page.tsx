"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowUpDown, Store } from "lucide-react";
import { Header } from "@/components/Header";
import VendorCard from "@/components/VendorCard";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import CategoryFilter from "@/components/CategoryFilter";
import { useVendors } from "@/hooks/useVendors";
import { useProducts } from "@/hooks/useProducts";
import { motion } from "framer-motion";

const PRODUCTS_PER_PAGE = 8;

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

  const isProductSearch = searchQuery.trim().length > 0;
  const isCategoryFilter = selectedCategory !== "all";

  // Fetch vendors (always needed for the main list and context)
  const { data: vendors = [], isLoading: loadingVendors } = useVendors({
    category: selectedCategory === "all" ? undefined : selectedCategory,
    search: searchQuery,
  });

  // Fetch products (needed if searching or filtering)
  const { data: products = [], isLoading: loadingProducts } = useProducts({
    category: selectedCategory === "all" ? undefined : selectedCategory,
    search: searchQuery,
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortOption]);

  const filteredProducts = useMemo(() => {
    if (!isProductSearch && !isCategoryFilter) return [];
    
    const result = [...products];
    // Sort
    switch (sortOption) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "name": result.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return result;
  }, [products, isProductSearch, isCategoryFilter, sortOption]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Hero */}
      <section className="relative h-48 sm:h-64 overflow-hidden">
        <img
          src="/assets/hero-banner.jpg"
          alt="Fresh food staples"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 to-foreground/30" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
                Your Market,{" "}
                <span className="text-primary">Delivered</span>
              </h1>
              <p className="text-white/80 text-sm sm:text-base max-w-md">
                Rice, flour, sugar, salt & cooking oils from trusted local vendors — delivered to your door.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="container mx-auto px-4 max-w-7xl pt-4">
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
      </section>

      {/* Product Results */}
      {(isProductSearch || isCategoryFilter) && filteredProducts.length > 0 && (
        <section className="container mx-auto px-4 max-w-7xl py-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">
                {isProductSearch ? `Products matching "${searchQuery}"` : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products`}
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} product{filteredProducts.length !== 1 && "s"} found across vendors
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="text-sm bg-secondary text-secondary-foreground border-none rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="default">Default</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="name">Name: A → Z</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedProducts.map((product, index) => {
              const vendor = vendors.find(v => v._id === product.vendorId);
              return (
                <div key={product._id}>
                  <ProductCard product={product} index={index} />
                  {vendor && (
                    <Link
                      href={`/store/${product.vendorId}`}
                      className="text-xs text-muted-foreground hover:text-primary mt-1 block pl-1"
                    >
                      {vendor.name}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-9"
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Vendors */}
      <section className="container mx-auto px-4 max-w-7xl py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">
            {isProductSearch ? "Matching Vendors" : "Top Vendors"}
          </h2>
          <div className="flex items-center gap-3">
            <Link
              href="/vendor/dashboard"
              className="text-xs font-medium text-primary flex items-center gap-1 hover:underline"
            >
              <Store className="h-3 w-3" /> Vendor Portal
            </Link>
            {!loadingVendors && (
              <span className="text-sm text-muted-foreground">
                {vendors.length} vendor{vendors.length !== 1 && "s"}
              </span>
            )}
          </div>
        </div>

        {loadingVendors && vendors.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
             ))}
          </div>
        ) : vendors.length === 0 && filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-muted-foreground text-lg">No results found</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
          </div>
        ) : vendors.length === 0 ? null : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((vendor, index) => (
              <VendorCard key={vendor._id} vendor={vendor} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
