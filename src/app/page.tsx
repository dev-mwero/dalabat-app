"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Vendor = {
  _id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  location: string;
  deliveryFee: number;
  minimumOrder: number;
  categories: string[];
  isOpen: boolean;
};

type Product = {
  _id: string;
  vendorId: string;
  name: string;
  description: string;
  image: string;
  price: number;
  unit: string;
  category: string;
  inStock: boolean;
  stockQuantity: number;
};

const CATEGORIES = ["all", "rice", "flour", "sugar", "salt", "oil"];
const PRODUCTS_PER_PAGE = 8;

const currency = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

function sortProducts(products: Product[], sortOption: string) {
  const sorted = [...products];

  switch (sortOption) {
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      return sorted;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      return sorted;
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      return sorted;
    default:
      return sorted;
  }
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isProductSearch = searchQuery.trim().length > 0;
  const isCategoryFilter = selectedCategory !== "all";

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [vendorsRes, productsRes] = await Promise.all([
          fetch("/api/vendors?limit=50&sort=rating_desc", {
            signal: controller.signal,
          }),
          fetch("/api/products?limit=200&sort=name_asc", {
            signal: controller.signal,
          }),
        ]);

        if (!vendorsRes.ok || !productsRes.ok) {
          throw new Error("Failed to load marketplace data");
        }

        const vendorsJson = await vendorsRes.json();
        const productsJson = await productsRes.json();

        setVendors(vendorsJson.data ?? []);
        setProducts(productsJson.data ?? []);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setError("Unable to load marketplace data");
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => {
      controller.abort();
    };
  }, []);

  const filteredVendors = useMemo(() => {
    let result = vendors;
    const q = searchQuery.trim().toLowerCase();

    if (q) {
      result = result.filter(
        (vendor) =>
          vendor.name.toLowerCase().includes(q) ||
          vendor.location.toLowerCase().includes(q),
      );
    }

    if (isCategoryFilter) {
      result = result.filter((vendor) =>
        vendor.categories.includes(selectedCategory),
      );
    }

    return result;
  }, [vendors, searchQuery, selectedCategory, isCategoryFilter]);

  const filteredProducts = useMemo(() => {
    let result = products;
    const q = searchQuery.trim().toLowerCase();

    if (isCategoryFilter) {
      result = result.filter(
        (product) => product.category === selectedCategory,
      );
    }

    if (q) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q),
      );
    }

    if (!isProductSearch && !isCategoryFilter) {
      return [];
    }

    return sortProducts(result, sortOption);
  }, [
    products,
    searchQuery,
    selectedCategory,
    isCategoryFilter,
    isProductSearch,
    sortOption,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
  );
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [currentPage, filteredProducts]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-6xl p-6">Loading marketplace...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-6xl p-6">
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-gradient-to-r from-zinc-900 to-zinc-700 px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">
            Daalabat Marketplace
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Your staples market, delivered.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-200">
            Browse top local vendors for rice, flour, sugar, salt, and oils.
            Search across stores or filter by category.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-3 px-6 py-5 sm:grid-cols-[1fr_auto]">
        <input
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search vendors, products, or locations"
          className="h-11 rounded-lg border border-border bg-card px-4 text-sm outline-none ring-0 placeholder:text-muted-foreground focus:border-zinc-500"
        />
        <Link
          href="/vendor/dashboard"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium hover:bg-muted"
        >
          Vendor Portal
        </Link>
      </section>

      <section className="mx-auto flex max-w-6xl flex-wrap gap-2 px-6 pb-4">
        {CATEGORIES.map((category) => {
          const active = selectedCategory === category;
          return (
            <button
              type="button"
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setCurrentPage(1);
              }}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                active
                  ? "bg-zinc-900 text-white"
                  : "border border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {category}
            </button>
          );
        })}
      </section>

      {(isProductSearch || isCategoryFilter) && filteredProducts.length > 0 && (
        <section className="mx-auto max-w-6xl border-y border-border px-6 py-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">
                {isProductSearch
                  ? `Products matching "${searchQuery}"`
                  : `${selectedCategory} products`}
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} products found
              </p>
            </div>
            <select
              value={sortOption}
              onChange={(event) => {
                setSortOption(event.target.value);
                setCurrentPage(1);
              }}
              className="h-9 rounded-md border border-border bg-card px-3 text-sm"
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {paginatedProducts.map((product) => (
              <article
                key={product._id}
                className="rounded-xl border border-border bg-card p-3"
              >
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {product.category}
                </p>
                <h3 className="mt-1 line-clamp-2 text-sm font-semibold">
                  {product.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {product.description}
                </p>
                <p className="mt-3 text-sm font-bold">
                  {currency.format(product.price)} / {product.unit}
                </p>
                <Link
                  href={`/store/${product.vendorId}`}
                  className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
                >
                  Visit vendor
                </Link>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded-md border border-border px-3 py-1.5 text-xs disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
                className="rounded-md border border-border px-3 py-1.5 text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {isProductSearch ? "Matching Vendors" : "Top Vendors"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {filteredVendors.length} vendors
          </p>
        </div>

        {filteredVendors.length === 0 && filteredProducts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No marketplace results found. Try another search term.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVendors.map((vendor) => (
              <Link
                href={`/store/${vendor._id}`}
                key={vendor._id}
                className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold">{vendor.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {vendor.location}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                      vendor.isOpen
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-zinc-200 text-zinc-700"
                    }`}
                  >
                    {vendor.isOpen ? "Open" : "Closed"}
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                  {vendor.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>
                    Rating {vendor.rating.toFixed(1)} ({vendor.reviewCount})
                  </span>
                  <span>Delivery {currency.format(vendor.deliveryFee)}</span>
                  <span>Min {currency.format(vendor.minimumOrder)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
