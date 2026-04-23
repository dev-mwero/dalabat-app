"use client";

import { motion } from "framer-motion";
import { Heart, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import type { Product } from "@/hooks/useProducts";
import { formatPrice } from "@/lib/utils";
import { ProductDetailModal } from "./ProductDetailModal";

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const [modalOpen, setModalOpen] = useState(false);

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

  // Generate a predictable background color based on product ID or name
  const bgColors = ["bg-[#E5EEFF]", "bg-[#FFDBC9]", "bg-[#DAE2FD]", "bg-[#F8F9FF]"];
  const bgColor = bgColors[(product.name.length || 0) % bgColors.length];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className="bg-surface-container-lowest rounded-2xl p-4 flex flex-col gap-4 group transition-all hover:scale-[1.02] shadow-sm border border-outline-variant/10 cursor-pointer h-full"
        onClick={() => setModalOpen(true)}
      >
        <div className={`relative w-full aspect-[4/3] overflow-hidden rounded-xl ${bgColor} flex items-center justify-center p-6`}>
          {product.image ? (
            <Image src={product.image} alt={product.name} fill className="object-cover transition-transform group-hover:scale-110 duration-500" />
          ) : (
            <div className="text-6xl transition-transform group-hover:scale-110 duration-500 drop-shadow-md">
              {categoryEmoji[product.category.toLowerCase()] || "📦"}
            </div>
          )}
          
          <div className="absolute top-3 right-3 bg-white/80 backdrop-blur rounded-full p-2 shadow-sm cursor-pointer hover:text-error transition-colors z-10" onClick={(e) => { e.stopPropagation(); /* Add to wishlist logic */ }}>
            <Heart className="w-4 h-4 text-on-surface-variant" />
          </div>

          {!product.inStock && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] flex items-center justify-center z-10">
              <span className="bg-error text-white px-3 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-on-surface leading-tight">{product.name}</h3>
            <p className="text-sm text-on-surface-variant line-clamp-2 mt-1.5 font-medium leading-relaxed">
              {product.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between pt-2 mt-auto">
            <span className="text-primary-container font-extrabold text-xl">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-on-surface-variant font-semibold">
              /{product.unit}
            </span>
          </div>

          {product.inStock && (
            <div className="mt-2" onClick={(e) => e.stopPropagation()}>
              {quantity > 0 ? (
                <div className="flex items-center justify-between bg-primary-container text-white rounded-full p-1 shadow-lg shadow-primary-container/20 w-full">
                  <button
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 active:scale-95 transition-all"
                    onClick={() => quantity === 1 ? removeItem(product._id) : updateQuantity(product._id, quantity - 1)}
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="text-base font-extrabold w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 active:scale-95 transition-all"
                    onClick={() => addItem(product)}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <button
                  className="w-full py-3.5 bg-secondary-container text-on-secondary-container rounded-full font-bold flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-secondary-container/80"
                  onClick={() => addItem(product)}
                >
                  <Plus className="w-5 h-5" />
                  Add to Cart
                </button>
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
