"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useVendors } from "@/hooks/useVendors";
import { formatPrice } from "@/lib/utils";

export const CartDrawer = () => {
  const {
    items,
    vendorId,
    totalPrice,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const { data: vendors } = useVendors();
  const vendor = vendorId ? vendors?.find((v) => v._id === vendorId) : null;

  const categoryEmoji: Record<string, string> = {
    rice: "🍚",
    flour: "🌾",
    sugar: "🍬",
    salt: "🧂",
    oil: "🫒",
    "cooking oil": "🫒",
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-md p-6">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Your Cart
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <div className="text-6xl">🛒</div>
            <p className="text-muted-foreground text-lg">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">
              Browse vendors and add items to get started
            </p>
          </div>
        ) : (
          <>
            {vendor && (
              <div className="bg-accent/50 rounded-lg px-3 py-2 mb-2">
                <p className="text-sm font-medium text-accent-foreground">
                  From: {vendor.name}
                </p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-4 scrollbar-hide">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.product._id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3"
                  >
                    <div className="text-2xl">
                      {categoryEmoji[item.product.category.toLowerCase()] ||
                        "📦"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-primary font-semibold">
                        {formatPrice(item.product.price)}/{item.product.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() =>
                          updateQuantity(item.product._id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-bold w-5 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() =>
                          updateQuantity(item.product._id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeItem(item.product._id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex justify-between text-lg font-bold text-foreground">
                <span>Total</span>
                <span className="text-primary">{formatPrice(totalPrice)}</span>
              </div>
              <Link href="/checkout" onClick={() => setIsOpen(false)}>
                <Button className="w-full h-12 text-base font-semibold rounded-xl">
                  Proceed to Checkout
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={clearCart}
              >
                Clear cart
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
