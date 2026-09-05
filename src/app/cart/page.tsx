"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useVendors } from "@/hooks/useVendors";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, vendorId } = useCart();
  const { data: vendors = [] } = useVendors();
  const [promoCode, setPromoCode] = useState("");
  const router = useRouter();

  const vendor = vendors.find((v) => v._id === vendorId);
  const vendorSlug = vendor?.slug || vendorId;

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    router.push("/checkout");
  };

  return (
    <main className="max-w-screen-2xl mx-auto px-6 py-12 mb-24 md:mb-0">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-on-surface mb-2 flex items-center gap-4">
            Your Basket
          </h1>
          <p className="text-on-surface-variant font-medium">
            Review your selection of everyday provisions
          </p>
        </div>
        <Link
          href={vendorSlug ? `/store/${vendorSlug}` : "/"}
          className="hidden md:flex items-center gap-2 text-primary font-bold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-surface-container-low rounded-2xl">
          <div className="mx-auto w-24 h-24 bg-surface-container-highest rounded-full flex items-center justify-center mb-6">
            <ShoppingCart className="w-10 h-10 text-on-surface-variant" />
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">
            Your basket is empty
          </h2>
          <p className="text-on-surface-variant mb-8">
            Looks like you haven't added any provisions yet.
          </p>
          <Link
            href="/"
            className="bg-primary-container text-white px-8 py-3 rounded-full font-bold hover:opacity-90 transition-opacity"
          >
            Start Exploring
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Items List */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.product._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-surface-container-lowest rounded-xl p-4 md:p-6 flex flex-col md:flex-row gap-6 items-center shadow-[0_4px_20px_0_rgba(11,28,48,0.02)] transition-all hover:translate-y-[-2px]"
                >
                  <div className="w-full md:w-32 h-32 flex-shrink-0 relative overflow-hidden rounded-xl">
                    <Image
                      src={
                        item.product.image ||
                        "https://placehold.co/400x400?text=Product"
                      }
                      alt={item.product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 128px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 shadow-[inset_0_0_12px_rgba(0,0,0,0.1)] rounded-xl pointer-events-none"></div>
                  </div>

                  <div className="flex-grow flex flex-col md:flex-row justify-between w-full">
                    <div className="space-y-1 text-center md:text-left">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                        {item.product.category}
                      </span>
                      <h3 className="text-xl font-bold text-on-surface">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-on-surface-variant line-clamp-1">
                        {item.product.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-8 mt-4 md:mt-0">
                      <div className="flex items-center bg-surface-container-low rounded-full px-3 py-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.product._id, item.quantity - 1)
                          }
                          className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 font-bold text-on-surface">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.product._id, item.quantity + 1)
                          }
                          className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="block font-extrabold text-lg text-on-surface">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product._id)}
                          className="text-error text-xs font-semibold hover:underline mt-1 flex items-center justify-end gap-1 ml-auto"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Suggested Addition (Editorial Pattern) */}
            <div className="mt-12 p-8 rounded-xl bg-surface-container-low flex flex-col md:flex-row items-center gap-8 overflow-hidden relative group">
              <div className="relative z-10 space-y-4 md:w-2/3">
                <h4 className="text-2xl font-extrabold text-on-surface tracking-tight">
                  Complete your pantry
                </h4>
                <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
                  Add our{" "}
                  <span className="font-bold text-primary">
                    Smoked Sea Salt
                  </span>
                  —harvested by hand in small batches. It's the perfect pairing
                  for your everyday provisions.
                </p>
                <button
                  type="button"
                  onClick={() => toast.success("Added to cart!")}
                  className="bg-white text-primary px-6 py-2 rounded-full font-bold shadow-sm active:scale-95 transition-all text-sm"
                >
                  Add for $8.50
                </button>
              </div>
              <div className="md:w-1/3 flex justify-center relative">
                <div className="w-40 h-40 relative">
                  <Image
                    src="https://images.unsplash.com/photo-1621245051834-31b3e8c9c7f1?auto=format&fit=crop&q=80&w=500"
                    alt="Sea Salt"
                    fill
                    sizes="160px"
                    className="object-cover rounded-full shadow-2xl group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            </div>
          </div>

          {/* Right: Summary Section */}
          <aside className="lg:col-span-4 sticky top-28">
            <div className="bg-surface-container-highest/30 backdrop-blur-md rounded-xl p-8 space-y-8 border border-outline-variant/10 shadow-lg">
              <h2 className="text-2xl font-bold tracking-tight text-on-surface">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span className="text-sm font-semibold">Subtotal</span>
                  <span className="font-bold text-on-surface">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span className="text-sm font-semibold">
                    Estimated Shipping
                  </span>
                  <span className="font-bold text-on-surface">
                    {totalPrice > 50 ? "Free" : "$5.99"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span className="text-sm font-semibold">Estimated Tax</span>
                  <span className="font-bold text-on-surface">
                    ${(totalPrice * 0.08).toFixed(2)}
                  </span>
                </div>

                <div className="pt-6 border-t border-outline-variant/20 flex justify-between items-center">
                  <span className="text-lg font-bold text-on-surface">
                    Total
                  </span>
                  <span className="text-2xl font-extrabold text-primary">
                    $
                    {(
                      totalPrice +
                      (totalPrice > 50 ? 0 : 5.99) +
                      totalPrice * 0.08
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-surface-container-lowest rounded-xl p-3 flex gap-3 items-center border border-outline-variant/20 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                  <Tag className="w-5 h-5 text-primary" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code"
                    className="bg-transparent border-none focus:ring-0 text-sm flex-grow p-0 outline-none text-on-surface"
                  />
                  <button
                    type="button"
                    onClick={() => toast.success("Promo code applied!")}
                    disabled={!promoCode}
                    className="text-primary font-bold text-sm px-2 disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full bg-primary-container text-white py-4 rounded-full font-bold text-lg shadow-lg shadow-primary-container/20 hover:opacity-90 active:scale-95 transition-all"
                >
                  Proceed to Checkout
                </button>
              </div>

              <div className="pt-4 flex flex-col items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-primary/50" />
                <p className="text-[10px] text-on-surface-variant text-center leading-tight">
                  Your order is protected by our Quality Guarantee. <br />
                  Secure transaction processed via IIBSO Pay.
                </p>
              </div>
            </div>

            {/* Help Link */}
            <div className="mt-6 flex items-center justify-center gap-2 text-on-surface-variant">
              <Link
                href="/support"
                className="text-sm font-semibold hover:text-primary underline"
              >
                Need help with your order?
              </Link>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
