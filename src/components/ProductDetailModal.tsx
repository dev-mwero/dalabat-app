"use client";

import { MapPin, Minus, Plus, Star, Truck } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/hooks/useProducts";
import { useVendors } from "@/hooks/useVendors";
import { formatPrice } from "@/lib/utils";

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryEmoji: Record<string, string> = {
  rice: "🍚",
  flour: "🌾",
  sugar: "🍬",
  salt: "🧂",
  oil: "🫒",
  "cooking oil": "🫒",
};

export const ProductDetailModal = ({
  product,
  open,
  onOpenChange,
}: ProductDetailModalProps) => {
  const { items, addItem, updateQuantity, removeItem } = useCart();

  // Fetch vendors and find the specific one.
  // In a real app we might have a useVendor(id) hook, but useVendors() is fine for now as it caches.
  const { data: vendors } = useVendors();
  const vendor = vendors?.find((v) => v._id === product?.vendorId);

  if (!product) return null;

  const cartItem = items.find((i) => i.product._id === product._id);
  const quantity = cartItem?.quantity || 0;

  const imageUrl = product.image?.includes("/assets/")
    ? `/assets/${product.image.split("/assets/")[1]}`
    : product.image?.startsWith("product-")
      ? `/assets/${product.image}`
      : product.image || "/assets/vendor-placeholder.jpg";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Product image header */}
        <div className="relative h-48 bg-muted flex items-center justify-center">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <Badge className="absolute top-3 left-3 text-sm">
            {categoryEmoji[product.category.toLowerCase()] || "📦"}{" "}
            {product.category.charAt(0).toUpperCase() +
              product.category.slice(1)}
          </Badge>
          {!product.inStock && (
            <Badge variant="destructive" className="absolute top-3 right-3">
              Out of stock
            </Badge>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Product info */}
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-xl">{product.name}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {product.description}
            </p>
          </DialogHeader>

          {/* Price & stock */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm text-muted-foreground ml-1">
                /{product.unit}
              </span>
            </div>
            {product.inStock && (
              <span className="text-xs text-muted-foreground">
                {product.stockQuantity} in stock
              </span>
            )}
          </div>

          {/* Vendor info */}
          {vendor && (
            <div className="rounded-lg border border-border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Link
                  href={`/store/${vendor.slug || vendor._id}`}
                  className="font-semibold text-foreground hover:text-primary transition-colors"
                  onClick={() => onOpenChange(false)}
                >
                  {vendor.name}
                </Link>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                  <span className="font-medium text-foreground">
                    {vendor.rating}
                  </span>
                  <span>({vendor.reviewCount})</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {vendor.location}
                </span>
                {vendor.deliveryFee > 0 && (
                  <span className="flex items-center gap-1">
                    <Truck className="h-3 w-3" /> Delivery{" "}
                    {formatPrice(vendor.deliveryFee)}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Min. order: {formatPrice(vendor.minimumOrder)}
              </p>
            </div>
          )}

          {/* Add to cart */}
          {product.inStock && (
            <div className="pt-1">
              {quantity > 0 ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 bg-primary/10 rounded-full px-2 py-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 rounded-full hover:bg-primary/20"
                      onClick={() =>
                        quantity === 1
                          ? removeItem(product._id)
                          : updateQuantity(product._id, quantity - 1)
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-base font-bold w-6 text-center text-foreground">
                      {quantity}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 rounded-full hover:bg-primary/20"
                      onClick={() => addItem(product)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => addItem(product)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add to Cart —{" "}
                  {formatPrice(product.price)}
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// (End of file, removed default export)
