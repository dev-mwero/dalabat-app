"use client";

import { Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { VendorRouteNav } from "@/app/vendor/_components/VendorRouteNav";

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

const categoryEmoji: Record<string, string> = {
  rice: "🍚",
  flour: "🌾",
  sugar: "🍬",
  salt: "🧂",
  oil: "🫒",
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
  const [searchQuery, setSearchQuery] = useState("");
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

        if (searchQuery.trim()) {
          params.set("q", searchQuery.trim());
        }

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
  }, [vendorId, searchQuery, filterCategory]);

  const currentVendorName = useMemo(
    () => vendors.find((vendor) => vendor._id === vendorId)?.name,
    [vendorId, vendors],
  );

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
      image: product.image,
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

    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }

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
          body: JSON.stringify({
            name: payload.name,
            description: payload.description,
            image: payload.image,
            price: payload.price,
            unit: payload.unit,
            category: payload.category,
            inStock: payload.inStock,
            stockQuantity: payload.stockQuantity,
          }),
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
      <main className="min-h-screen bg-background p-4 sm:p-6">
        <div className="mx-auto max-w-5xl rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
          Loading inventory...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background p-4 sm:p-6">
        <div className="mx-auto max-w-5xl rounded-xl border border-red-200 bg-red-50 p-8 text-sm text-red-700">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <VendorRouteNav />
        <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold text-foreground">
              <Package className="h-6 w-6 text-primary" /> Inventory
            </h1>
            <p className="text-sm text-muted-foreground">
              {products.length} products
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateDialog}
            className="inline-flex items-center rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="mr-1 h-4 w-4" /> Add Product
          </button>
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
          {currentVendorName && (
            <p className="text-xs text-muted-foreground">
              Editing: {currentVendorName}
            </p>
          )}
        </section>

        <section className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(event) => setFilterCategory(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm sm:w-44"
          >
            <option value="all">All Categories</option>
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {categoryEmoji[category]} {category}
              </option>
            ))}
          </select>
        </section>

        <section className="space-y-2">
          {products.map((product) => (
            <article
              key={product._id}
              className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
            >
              <div className="text-2xl">
                {categoryEmoji[product.category] ?? "📦"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate font-semibold text-foreground">
                    {product.name}
                  </h2>
                  {!product.inStock && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                      Out of stock
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {product.description}
                </p>
                <div className="mt-1 flex items-center gap-3">
                  <span className="text-sm font-bold text-primary">
                    {currency.format(product.price)}/{product.unit}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Stock: {product.stockQuantity}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={product.inStock}
                    onChange={() => {
                      void toggleStock(product);
                    }}
                    className="h-4 w-4"
                  />
                  In stock
                </label>

                <button
                  type="button"
                  className="rounded p-2 text-muted-foreground hover:bg-secondary"
                  onClick={() => openEditDialog(product)}
                  aria-label={`Edit ${product.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  className="rounded p-2 text-rose-600 hover:bg-rose-50"
                  onClick={() => {
                    void handleDelete(product._id);
                  }}
                  aria-label={`Delete ${product.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}

          {products.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <Package className="mx-auto mb-3 h-12 w-12 opacity-40" />
              <p>No products found</p>
            </div>
          )}
        </section>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-xl">
            <h2 className="text-lg font-bold text-foreground">
              {isCreating ? "Add Product" : "Edit Product"}
            </h2>

            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="product-name"
                  className="text-sm text-foreground"
                >
                  Product Name
                </label>
                <input
                  id="product-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="product-description"
                  className="text-sm text-foreground"
                >
                  Description
                </label>
                <textarea
                  id="product-description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  rows={3}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="product-image"
                  className="text-sm text-foreground"
                >
                  Image URL
                </label>
                <input
                  id="product-image"
                  value={form.image}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, image: event.target.value }))
                  }
                  className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="product-price"
                    className="text-sm text-foreground"
                  >
                    Price (KSh)
                  </label>
                  <input
                    id="product-price"
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        price: event.target.value,
                      }))
                    }
                    className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="product-unit"
                    className="text-sm text-foreground"
                  >
                    Unit
                  </label>
                  <select
                    id="product-unit"
                    value={form.unit}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, unit: event.target.value }))
                    }
                    className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {UNIT_OPTIONS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="product-category"
                    className="text-sm text-foreground"
                  >
                    Category
                  </label>
                  <select
                    id="product-category"
                    value={form.category}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        category: event.target.value,
                      }))
                    }
                    className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {categoryEmoji[category]} {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="product-stock"
                    className="text-sm text-foreground"
                  >
                    Stock Quantity
                  </label>
                  <input
                    id="product-stock"
                    type="number"
                    min={0}
                    value={form.stockQuantity}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        stockQuantity: event.target.value,
                      }))
                    }
                    className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.inStock}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      inStock: event.target.checked,
                    }))
                  }
                  className="h-4 w-4"
                />
                In stock
              </label>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsDialogOpen(false);
                }}
                className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  void handleSave();
                }}
                className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
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
    </main>
  );
}
