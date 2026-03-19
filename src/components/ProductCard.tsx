"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Product } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { ProductDetailModal } from "./ProductDetailModal";

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const [modalOpen, setModalOpen] = useState(false);
  
  // Map MongoDB _id to the id used in original logic if necessary
  const cartItem = items.find((i) => i.product._id === product._id);
  const quantity = cartItem?.quantity || 0;

  const categoryEmoji: Record<string, string> = {
    rice: "🍚",
    flour: "🌾",
    sugar: "🍬",
    salt: "🧂",
    oil: "🫒",
    "cooking oil": "🫒",
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className="bg-card rounded-lg border border-border p-4 flex flex-col justify-between hover:shadow-sm transition-shadow cursor-pointer"
        onClick={() => setModalOpen(true)}
      >
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="text-3xl mb-2">{categoryEmoji[product.category.toLowerCase()] || "📦"}</div>
            {!product.inStock && (
              <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-medium">
                Out of stock
              </span>
            )}
          </div>
          <h4 className="font-semibold text-foreground">{product.name}</h4>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
            <span className="text-xs text-muted-foreground ml-1">/{product.unit}</span>
          </div>

          {product.inStock && (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {quantity > 0 ? (
                <div className="flex items-center gap-2 bg-primary/10 rounded-full px-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full hover:bg-primary/20"
                    onClick={() =>
                      quantity === 1
                        ? removeItem(product._id)
                        : updateQuantity(product._id, quantity - 1)
                    }
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-bold w-5 text-center text-foreground">{quantity}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full hover:bg-primary/20"
                    onClick={() => addItem(product)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => addItem(product)}
                  className="rounded-full"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <ProductDetailModal
        product={product}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
};

export default ProductCard;
