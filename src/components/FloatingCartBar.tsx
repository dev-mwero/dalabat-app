"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";

const FloatingCartBar = () => {
  const { totalItems, totalPrice } = useCart();

  if (totalItems === 0) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      className="fixed bottom-0 left-0 right-0 p-4 z-40 bg-gradient-to-t from-background to-transparent pointer-events-none"
    >
      <div className="max-w-lg mx-auto pointer-events-auto">
        <Link href="/cart">
          <Button className="w-full h-14 rounded-2xl text-base font-bold shadow-lg flex items-center justify-between px-6 interactive-hover">
            <span className="flex items-center gap-2">
              <span className="bg-primary-foreground/20 px-2 py-0.5 rounded-md text-sm">
                {totalItems}
              </span>
              View Cart
            </span>
            <span>{formatPrice(totalPrice)}</span>
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default FloatingCartBar;
