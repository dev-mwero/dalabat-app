"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Check, Search, ShoppingCart, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/hooks/useProducts";
import { useVendors } from "@/hooks/useVendors";

const PRODUCTS_PER_PAGE = 8;

const categories = [
  { id: "all", name: "All Provisions" },
  { id: "rice", name: "Rice & Grains" },
  { id: "flour", name: "Flour & Baking" },
  { id: "sugar", name: "Sugar & Sweeteners" },
  { id: "salt", name: "Salt & Spices" },
  { id: "oil", name: "Cooking Oils" },
  { id: "general", name: "General Groceries" },
];

export default function MarketPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(false);

  const { items } = useCart();

  const { data: vendors = [], isLoading: loadingVendors } = useVendors({
    category: selectedCategory === "all" ? undefined : selectedCategory,
    search: searchQuery,
    limit: 100,
  });

  const { data: products = [], isLoading: loadingProducts } = useProducts({
    category: selectedCategory === "all" ? undefined : selectedCategory,
    search: searchQuery,
    inStock: inStockOnly || undefined,
  });

  useEffect(() => {
    setCurrentPage(1);

    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    if (category && categories.some((c) => c.name === category)) {
      setSelectedCategory(category);
    }
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (freeDeliveryOnly) {
      const vendorFee = new Map(
        vendors.map((vendor) => [vendor._id, vendor.deliveryFee]),
      );
      result = result.filter(
        (product) => (vendorFee.get(product.vendorId) ?? Infinity) === 0,
      );
    }

    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return result;
  }, [products, vendors, freeDeliveryOnly, sortOption]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const currency = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  });

  return (
    <div className="bg-surface text-on-surface min-h-screen font-sans">
      {/* TopNavBar */}
      <header className="bg-surface/90 backdrop-blur-lg sticky top-0 z-50 border-b border-outline-variant/10">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto">
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tighter text-primary"
          >
            IIBSO
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/market"
              className="text-primary font-bold border-b-2 border-primary-container pb-1 hover:text-primary-container transition-colors duration-200"
            >
              Discover
            </Link>
            <Link
              href="/vendors"
              className="text-on-surface-variant font-medium hover:text-primary-container transition-colors duration-200"
            >
              Vendors
            </Link>
          </nav>
          <div className="flex items-center gap-6">
            {/* Search Bar */}
            <div className="hidden lg:flex items-center bg-surface-container-low px-4 py-2 rounded-full w-80 group focus-within:ring-2 ring-primary-container transition-all">
              <Search className="text-on-surface-variant w-4 h-4 mr-2" />
              <input
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-on-surface-variant/60 focus:outline-none"
                placeholder="Search provisions and staples..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4 text-primary">
              <Link
                href="/checkout"
                className="active:opacity-80 active:scale-95 transition-all relative"
              >
                <ShoppingCart className="w-6 h-6" />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-container text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {items.length}
                  </span>
                )}
              </Link>
              <Link
                href="/dashboard"
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container/20 flex items-center justify-center bg-surface-container-high text-primary hover:bg-primary hover:text-white transition-colors"
              >
                <Store className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
            <div>
              <h3 className="text-on-surface font-extrabold text-lg mb-6 tracking-tight">
                Refine Results
              </h3>

              {/* Categories */}
              <div className="space-y-4 mb-8">
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
                  Category
                </p>
                <div className="space-y-2">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className="w-full flex items-center gap-3 group cursor-pointer text-left"
                      >
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${isSelected ? "bg-primary-container shadow-lg shadow-primary-container/20" : "bg-surface-container-high group-hover:bg-primary-container/20"}`}
                        >
                          <Check
                            className={`w-3 h-3 ${isSelected ? "text-white" : "text-primary opacity-0 group-hover:opacity-100"}`}
                          />
                        </div>
                        <span
                          className={`text-sm ${isSelected ? "font-bold text-on-surface" : "font-medium text-on-surface-variant group-hover:text-on-surface"}`}
                        >
                          {cat.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-4 mb-8">
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
                  Availability
                </p>
                <label className="flex items-center justify-between gap-3 cursor-pointer group">
                  <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
                    In stock only
                  </span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${inStockOnly ? "bg-primary-container" : "bg-surface-container-high group-hover:bg-on-surface-variant/20"}`}
                  >
                    <span
                      className={`inline-block w-4 h-4 rounded-full bg-white shadow transform transition-transform ${inStockOnly ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </span>
                </label>
                <label className="flex items-center justify-between gap-3 cursor-pointer group">
                  <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
                    Free delivery
                  </span>
                  <input
                    type="checkbox"
                    checked={freeDeliveryOnly}
                    onChange={(e) => setFreeDeliveryOnly(e.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${freeDeliveryOnly ? "bg-primary-container" : "bg-surface-container-high group-hover:bg-on-surface-variant/20"}`}
                  >
                    <span
                      className={`inline-block w-4 h-4 rounded-full bg-white shadow transform transition-transform ${freeDeliveryOnly ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </span>
                </label>
              </div>

              {/* Vendors List */}
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
                  Top Vendors
                </p>
                <div className="space-y-3">
                  {loadingVendors
                    ? ["vendor-sk-1", "vendor-sk-2", "vendor-sk-3"].map(
                        (skey) => (
                          <div
                            key={skey}
                            className="flex items-center gap-3 animate-pulse"
                          >
                            <div className="w-8 h-8 rounded-full bg-surface-container-high" />
                            <div className="h-4 bg-surface-container-high rounded w-24" />
                          </div>
                        ),
                      )
                    : vendors.slice(0, 5).map((vendor) => (
                        <Link
                          href={`/store/${vendor.slug || vendor._id}`}
                          key={vendor._id}
                          className="block group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-white transition-colors">
                              <Store className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-on-surface-variant group-hover:text-primary transition-colors">
                              {vendor.name}
                            </span>
                          </div>
                        </Link>
                      ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Results Grid */}
          <section className="flex-1">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-on-surface mb-2">
                  Everyday Provisions
                </h1>
                <p className="text-on-surface-variant font-medium">
                  Showing {filteredProducts.length} results
                  {searchQuery && (
                    <span>
                      {" "}
                      for{" "}
                      <span className="text-primary italic">
                        &quot;{searchQuery}&quot;
                      </span>
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-surface-container-low px-5 py-2.5 rounded-full text-sm font-bold text-on-surface flex items-center gap-2 hover:bg-surface-container-high transition-colors focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer border-none ring-0"
                >
                  <option value="default">Latest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>
              </div>
            </header>

            {loadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  "product-sk-1",
                  "product-sk-2",
                  "product-sk-3",
                  "product-sk-4",
                  "product-sk-5",
                  "product-sk-6",
                ].map((skey) => (
                  <div
                    key={skey}
                    className="h-80 rounded-xl bg-surface-container-low animate-pulse"
                  />
                ))}
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="text-center py-20 bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 shadow-sm">
                <Search className="mx-auto h-12 w-12 text-on-surface-variant/40 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-on-surface">
                  No results found
                </h3>
                <p className="text-on-surface-variant">
                  Try adjusting your filters or search query.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedProducts.map((product) => {
                  const vendor = vendors.find(
                    (v) => v._id === product.vendorId,
                  );
                  return (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ring-1 ring-outline-variant/10"
                    >
                      <div className="relative h-64 overflow-hidden rounded-xl m-2 bg-surface-container-low">
                        <Image
                          src={
                            product.image ||
                            "https://lh3.googleusercontent.com/aida-public/AB6AXuAR178b1G0_N_uxEMY945SxZjvJzOZjvSe81wKFbjHW89bZzSSXdORps9jUmlmOSaITlQ3p_TbepKBof4woFYHI281amQ67IaDm6mFy4b0xC5agj0tdTU3OBVZ0v2I7rIZRO4PtRxqy9ix21MjhQwDv_CDtnW-Peeu0teQw-w0cONUZMkyAm72Sc9XW8opzwFuuQMTNnHQX8Fh7eeFS9TtRi5fQkrYDaFx3IFrf7NQG2A7DiF_9-jf-fNhrDllfI8XZI_1ojXNEQkk"
                          }
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-6 pt-4 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-2 gap-4">
                          <h3 className="text-xl font-bold text-on-surface tracking-tight leading-tight line-clamp-2">
                            {product.name}
                          </h3>
                          <span className="text-lg font-extrabold text-primary shrink-0">
                            {currency.format(product.price)}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface-variant line-clamp-2 mb-4 leading-relaxed flex-1">
                          {product.description ||
                            "Quality everyday staple, sourced and prepared with care."}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-surface-container-low mt-auto">
                          {vendor ? (
                            <Link
                              href={`/store/${vendor.slug || vendor._id}`}
                              className="text-xs font-bold text-on-surface-variant/80 hover:text-primary flex items-center gap-1 uppercase transition-colors"
                            >
                              <Store className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[120px]">
                                {vendor.name}
                              </span>
                            </Link>
                          ) : (
                            <div />
                          )}
                          <Link
                            href={`/market`}
                            className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center hover:bg-primary-container hover:text-white transition-all shadow-sm"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center">
                <nav className="flex items-center gap-2 bg-surface-container-low p-2 rounded-full">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-50"
                    type="button"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${page === currentPage ? "bg-primary-container text-white shadow-sm" : "text-on-surface hover:bg-surface-container-high"}`}
                        type="button"
                      >
                        {page}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-50"
                    type="button"
                  >
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </button>
                </nav>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Background Decoration */}
      <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary-container/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-secondary-container/10 blur-[100px] rounded-full pointer-events-none" />
    </div>
  );
}
