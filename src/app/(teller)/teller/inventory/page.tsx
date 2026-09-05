"use client";

import { RefreshCw } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type StockItem = {
  _id: string;
  name: string;
  image: string;
  price: number;
  unit: string;
  category: string;
  inStock: boolean;
  stockQuantity: number;
};

const currency = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

export default function TellerInventoryPage() {
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/user/me");
        const result = await response.json();
        if (result.data?.vendorId) {
          setVendorId(result.data.vendorId);
        } else {
          toast.error("You are not assigned to a vendor store.");
          setLoading(false);
        }
      } catch {
        toast.error("Failed to load user profile");
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (!vendorId) return;

    async function loadStock() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/products?vendorId=${vendorId}&limit=100`,
        );
        if (!response.ok) throw new Error();
        const result = await response.json();
        setItems(result.data ?? []);
      } catch {
        toast.error("Failed to load stock");
      } finally {
        setLoading(false);
      }
    }

    loadStock();
  }, [vendorId]);

  if (loading && items.length === 0) {
    return (
      <div className="p-8 text-on-surface-variant font-medium flex items-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin" />
        Loading stock...
      </div>
    );
  }

  const outOfStock = items.filter((item) => !item.inStock);

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">
          Store Stock
        </h1>
        <p className="text-on-surface-variant">
          {items.length} products · {outOfStock.length} out of stock
        </p>
      </header>

      <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest overflow-hidden">
        {items.length === 0 ? (
          <div className="py-16 text-center text-on-surface-variant">
            No products published for this store yet.
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-4 p-4 hover:bg-surface-container-low/50 transition-colors"
              >
                <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-surface-container-high">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-on-surface text-sm">
                    {item.name}
                  </p>
                  <p className="text-xs text-on-surface-variant capitalize">
                    {item.category} · {item.unit}
                  </p>
                </div>
                <span className="text-sm font-bold text-on-surface">
                  {currency.format(item.price)}
                </span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    item.inStock
                      ? "bg-primary-container/30 text-primary"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {item.inStock ? `${item.stockQuantity} in stock` : "Out"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
