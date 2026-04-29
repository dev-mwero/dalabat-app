"use client";

import { motion } from "framer-motion";
import {
  Download,
  Eye,
  ImagePlus,
  MoreVertical,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Vendor = {
  _id: string;
  name: string;
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

type ProductFormState = {
  name: string;
  description: string;
  image: string;
  price: string;
  unit: string;
  category: string;
  inStock: boolean;
  stockQuantity: string;
};

const CATEGORY_OPTIONS = ["rice", "flour", "sugar", "salt", "oil"];
const UNIT_OPTIONS = ["kg", "litre", "sack", "jerrycan", "piece"];

const categoryLabels: Record<string, string> = {
  rice: "Rice & Grains",
  flour: "Flour & Baking",
  sugar: "Sugar & Sweeteners",
  salt: "Salt & Spices",
  oil: "Cooking Oils",
};

const currency = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

const emptyForm: ProductFormState = {
  name: "",
  description: "",
  image:
    "https://images.unsplash.com/photo-1563959834617-5f0f7f4e07a2?q=80&w=1200&auto=format&fit=crop",
  price: "",
  unit: "kg",
  category: "rice",
  inStock: true,
  stockQuantity: "1",
};

export default function VendorInventoryPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [filterCategory, setFilterCategory] = useState("all");

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<ProductFormState>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCreating = editingProductId === null;

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
      setProducts([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set("vendorId", vendorId as string);
        params.set("limit", "200");
        params.set("sort", "name_asc");

        if (filterCategory !== "all") {
          params.set("category", filterCategory);
        }

        const response = await fetch(`/api/products?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        const result = await response.json();
        setProducts((result.data ?? []) as Product[]);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        setError("Unable to load products");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();

    return () => {
      controller.abort();
    };
  }, [vendorId, filterCategory]);

  function openCreateDialog() {
    setEditingProductId(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  }

  function openEditDialog(product: Product) {
    setEditingProductId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      image: product.image || emptyForm.image,
      price: String(product.price),
      unit: product.unit,
      category: product.category,
      inStock: product.inStock,
      stockQuantity: String(product.stockQuantity),
    });
    setIsDialogOpen(true);
  }

  async function refreshProducts() {
    if (!vendorId) {
      return;
    }

    const params = new URLSearchParams();
    params.set("vendorId", vendorId as string);
    params.set("limit", "200");
    params.set("sort", "name_asc");

    if (filterCategory !== "all") {
      params.set("category", filterCategory);
    }

    const response = await fetch(`/api/products?${params.toString()}`);
    if (!response.ok) {
      throw new Error("Failed to load products");
    }

    const result = await response.json();
    setProducts((result.data ?? []) as Product[]);
  }

  async function handleSave() {
    if (!vendorId) {
      toast.error("No vendor selected");
      return;
    }

    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (form.description.trim().length < 4) {
      toast.error("Description must be at least 4 characters");
      return;
    }

    const price = Number(form.price);
    if (Number.isNaN(price) || price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    const stockQuantity = Number(form.stockQuantity);
    if (Number.isNaN(stockQuantity) || stockQuantity < 0) {
      toast.error("Stock quantity must be 0 or more");
      return;
    }

    if (!form.image.trim()) {
      toast.error("Image URL is required");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        vendorId,
        name: form.name.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        price,
        unit: form.unit,
        category: form.category,
        inStock: form.inStock,
        stockQuantity,
      };

      if (isCreating) {
        const response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = await response
            .json()
            .catch(() => ({ error: "Failed to create product" }));
          toast.error(data.error ?? "Failed to create product");
          return;
        }

        toast.success("Product added successfully");
      } else {
        const response = await fetch(`/api/products/${editingProductId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = await response
            .json()
            .catch(() => ({ error: "Failed to update product" }));
          toast.error(data.error ?? "Failed to update product");
          return;
        }

        toast.success("Product updated successfully");
      }

      await refreshProducts();
      setIsDialogOpen(false);
      setEditingProductId(null);
      setForm(emptyForm);
    } catch {
      toast.error("Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(productId: string) {
    const confirmed = globalThis.confirm("Delete this product?");
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => ({ error: "Failed to delete product" }));
        toast.error(data.error ?? "Failed to delete product");
        return;
      }

      setProducts((prev) =>
        prev.filter((product) => product._id !== productId),
      );
      toast.success("Product removed");
    } catch {
      toast.error("Failed to delete product");
    }
  }

  async function toggleStock(product: Product) {
    const nextInStock = !product.inStock;

    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inStock: nextInStock,
          stockQuantity: nextInStock ? Math.max(1, product.stockQuantity) : 0,
        }),
      });

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => ({ error: "Failed to update stock" }));
        toast.error(data.error ?? "Failed to update stock");
        return;
      }

      setProducts((prev) =>
        prev.map((item) =>
          item._id === product._id
            ? {
                ...item,
                inStock: nextInStock,
                stockQuantity: nextInStock
                  ? Math.max(1, item.stockQuantity)
                  : 0,
              }
            : item,
        ),
      );
    } catch {
      toast.error("Failed to update stock");
    }
  }

  if (loading && products.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse text-on-surface-variant">
        Loading inventory...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 text-error bg-error-container rounded-xl">
        {error}
      </div>
    );
  }

  const lowStockItems = products.filter((p) => p.stockQuantity < 10);
  const totalValue = products.reduce(
    (sum, p) => sum + p.price * p.stockQuantity,
    0,
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-surface">
      {/* Editorial Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
            Curated Inventory
          </h1>
          <p className="text-on-surface-variant text-lg max-w-xl">
            Manage your premium offerings and maintain the stock of your
            artisanal pantry staples.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <select
            value={vendorId ?? ""}
            onChange={(event) => setVendorId(event.target.value)}
            className="h-12 rounded-full border border-outline-variant/30 bg-surface-container-low px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary text-on-surface cursor-pointer"
          >
            {vendors.map((vendor) => (
              <option key={vendor._id} value={vendor._id}>
                {vendor.name}
              </option>
            ))}
          </select>
          <button className="bg-surface-container-high text-on-surface px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
            <Download className="w-5 h-5" />
            Export List
          </button>
          <button
            onClick={openCreateDialog}
            className="bg-primary-container text-white px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 shadow-[0_8px_20px_rgba(249,115,22,0.3)] hover:scale-105 transition-transform shrink-0"
          >
            <Plus className="w-5 h-5" />
            New Product
          </button>
        </div>
      </div>

      {/* Filter Chips Section */}
      <section className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterCategory("all")}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${filterCategory === "all" ? "bg-primary-container text-white shadow-lg shadow-primary-container/20" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"}`}
          >
            All Items
          </button>
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${filterCategory === cat ? "bg-primary-container text-white shadow-lg shadow-primary-container/20" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"}`}
            >
              {categoryLabels[cat] || cat}
            </button>
          ))}
        </div>
      </section>

      {/* Inventory Grid: Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map((product) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={product._id}
            className="bg-surface-container-lowest rounded-xl overflow-hidden group hover:-translate-y-1 transition-all duration-300 border border-outline-variant/10 shadow-sm"
          >
            <div className="relative h-64 w-full overflow-hidden bg-surface-container-low">
              <Image
                src={
                  product.image ||
                  "https://images.unsplash.com/photo-1563959834617-5f0f7f4e07a2?q=80&w=1200&auto=format&fit=crop"
                }
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {!product.inStock && (
                <div className="absolute top-4 left-4 bg-error-container text-error px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  Out of stock
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2 gap-4">
                <h3 className="text-xl font-bold text-on-surface line-clamp-1">
                  {product.name}
                </h3>
                <span className="text-primary-container font-extrabold text-lg shrink-0">
                  {currency.format(product.price)}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                {product.inStock ? (
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    In stock
                  </span>
                ) : (
                  <span className="bg-error-container text-error px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    Empty
                  </span>
                )}
                <span className="text-on-surface-variant text-xs font-medium">
                  {product.stockQuantity} units available
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-surface-container pt-4">
                <button
                  onClick={() => openEditDialog(product)}
                  className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleStock(product)}
                    className="p-2 bg-surface-container-low rounded-full hover:bg-surface-container-high transition-colors"
                    title="Toggle Stock"
                  >
                    <Eye
                      className={`w-5 h-5 ${product.inStock ? "text-primary" : "text-on-surface-variant"}`}
                    />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="p-2 bg-surface-container-low rounded-full hover:bg-error-container hover:text-error transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5 text-on-surface-variant hover:text-error" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Large Bento Summary Card (Occupies 2 columns on XL) */}
        {products.length > 0 && (
          <div className="xl:col-span-2 bg-surface-container-low rounded-xl p-8 flex flex-col md:flex-row items-center gap-8 border border-surface-container">
            <div className="flex-1 w-full">
              <h2 className="text-2xl font-extrabold text-on-surface mb-3">
                Inventory Health
              </h2>
              <p className="text-on-surface-variant mb-6">
                Your pantry is currently tracking {products.length} products.{" "}
                {lowStockItems.length} items are nearing low stock thresholds.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/10">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                    Total Value
                  </p>
                  <p className="text-2xl font-extrabold text-primary">
                    {currency.format(totalValue)}
                  </p>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/10">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                    Low Stock
                  </p>
                  <p className="text-2xl font-extrabold text-error">
                    {lowStockItems.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative w-48 h-48 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  className="text-surface-container-high"
                  cx="96"
                  cy="96"
                  fill="transparent"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="12"
                ></circle>
                <circle
                  className="text-primary-container"
                  cx="96"
                  cy="96"
                  fill="transparent"
                  r="80"
                  stroke="currentColor"
                  strokeDasharray="502"
                  strokeDashoffset={
                    products.length > 0
                      ? 502 -
                        502 *
                          ((products.length - lowStockItems.length) /
                            products.length)
                      : 502
                  }
                  strokeWidth="12"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-on-surface">
                  {products.length > 0
                    ? Math.round(
                        ((products.length - lowStockItems.length) /
                          products.length) *
                          100,
                      )
                    : 0}
                  %
                </span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">
                  Healthy
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Empty State / Add Suggestion */}
        <div
          onClick={openCreateDialog}
          className="bg-surface-container-lowest rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center p-8 text-center min-h-[300px] group cursor-pointer hover:bg-surface-container-low transition-colors"
        >
          <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ImagePlus className="text-primary-container w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-on-surface">
            Expand Your Range
          </h3>
          <p className="text-on-surface-variant text-sm mb-6 max-w-xs">
            New seasonal items arriving? Add them to your storefront now.
          </p>
          <button className="text-primary-container font-bold text-sm underline-offset-4 hover:underline">
            Start listing
          </button>
        </div>
      </div>

      {/* Product Edit/Create Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-outline-variant/20 bg-surface p-6 shadow-2xl my-auto">
            <h2 className="text-2xl font-bold text-on-surface mb-6 tracking-tight">
              {isCreating ? "Add New Product" : "Edit Product"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-on-surface">
                  Product Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="mt-1 h-12 w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  placeholder="e.g. Artisan Sourdough Loaf"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-on-surface">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all resize-none"
                  placeholder="Describe your product..."
                />
              </div>

              <div>
                <label className="text-sm font-bold text-on-surface">
                  Image URL
                </label>
                <input
                  value={form.image}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, image: e.target.value }))
                  }
                  className="mt-1 h-12 w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-on-surface">
                    Price (KSh)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, price: e.target.value }))
                    }
                    className="mt-1 h-12 w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-on-surface">
                    Unit
                  </label>
                  <select
                    value={form.unit}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, unit: e.target.value }))
                    }
                    className="mt-1 h-12 w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  >
                    {UNIT_OPTIONS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-on-surface">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="mt-1 h-12 w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {categoryLabels[cat] || cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-on-surface">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.stockQuantity}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        stockQuantity: e.target.value,
                      }))
                    }
                    className="mt-1 h-12 w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 p-4 border border-outline-variant/30 rounded-xl bg-surface-container-lowest mt-4 cursor-pointer hover:bg-surface-container-low transition-colors">
                <input
                  type="checkbox"
                  checked={form.inStock}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, inStock: e.target.checked }))
                  }
                  className="w-5 h-5 rounded text-primary focus:ring-primary"
                />
                <span className="font-bold text-on-surface">
                  Currently in stock
                </span>
              </label>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setIsDialogOpen(false)}
                className="px-6 py-3 rounded-full font-bold text-on-surface hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                onClick={() => void handleSave()}
                className="bg-primary-container text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-primary-container/20 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : isCreating
                    ? "Add Product"
                    : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
