"use client";

import { useUser } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Banknote,
  CheckCircle,
  MapPin,
  Phone,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

interface Vendor {
  _id: string;
  slug: string;
  name: string;
  deliveryAvailable: boolean;
  deliveryFee: number;
}

type DeliveryMethod = "pickup" | "delivery";
type PaymentMethod = "cash" | "mpesa-auto" | "mpesa-manual";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useUser();
  const { items, vendorId, totalPrice, clearCart } = useCart();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("pickup");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [completedVendorName, setCompletedVendorName] = useState("");
  const [mpesaCode, setMpesaCode] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    if (!vendorId) return;

    const controller = new AbortController();

    async function fetchVendor() {
      try {
        const response = await fetch("/api/vendors?limit=100", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch vendors");
        }

        const data = await response.json();
        const foundVendor = data.data.find((v: Vendor) => v._id === vendorId);

        if (foundVendor) {
          setVendor(foundVendor);
        } else {
          toast.error("Vendor not found");
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast.error("Failed to load vendor details");
        }
      }
    }

    fetchVendor();
    return () => controller.abort();
  }, [vendorId]);

  const deliveryFee =
    deliveryMethod === "delivery" && vendor?.deliveryAvailable
      ? vendor.deliveryFee
      : 0;

  const grandTotal = totalPrice + deliveryFee;

  const currency = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  });

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-surface text-on-surface">
        <div className="container flex flex-col items-center justify-center px-4 py-20 text-center">
          <div className="mb-4 text-6xl">🛒</div>
          <h2 className="mb-2 text-xl font-bold">Your cart is empty</h2>
          <Link href="/" className="font-medium text-primary hover:underline">
            Browse vendors
          </Link>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-surface text-on-surface px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="container flex flex-col items-center justify-center py-20 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mb-6 text-7xl"
          >
            🎉
          </motion.div>
          <CheckCircle className="mb-4 h-16 w-16 text-primary" />
          <h2 className="mb-2 text-2xl font-extrabold">Order Placed!</h2>
          <p className="mb-6 max-w-sm text-on-surface-variant">
            Your order has been sent to {completedVendorName}. You&apos;ll be
            notified when it&apos;s ready.
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-full bg-primary-container text-white px-6 py-3 text-sm font-bold shadow-lg shadow-primary-container/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Back to Marketplace
          </button>
        </motion.div>
      </div>
    );
  }

  async function handlePlaceOrder() {
    if (!vendorId) {
      toast.error("Missing vendor for this checkout");
      return;
    }

    if (deliveryMethod === "delivery" && !address.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }

    if (
      (paymentMethod === "mpesa-auto" || paymentMethod === "mpesa-manual") &&
      !phone.trim()
    ) {
      toast.error("Please enter your M-Pesa phone number");
      return;
    }

    if (paymentMethod === "mpesa-manual" && !mpesaCode.trim()) {
      toast.error("Please enter the M-Pesa transaction code");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          customerClerkId: user?.id,
          items: items.map((item) => ({
            productId: item.product._id,
            quantity: item.quantity,
          })),
          paymentMethod,
          mpesaCode: mpesaCode || undefined,
          deliveryMethod,
          deliveryAddress: deliveryMethod === "delivery" ? address : undefined,
          contactPhone: phone || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Failed to place order");
        return;
      }

      setCompletedVendorName(vendor?.name || "the vendor");
      clearCart();
      setOrderPlaced(true);
      toast.success("Order placed successfully!");
    } catch {
      toast.error("Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen">
      <header className="bg-[#F8F9FF]/90 backdrop-blur-lg sticky top-0 z-50 py-4 px-6 border-b border-outline-variant/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-extrabold tracking-tighter text-[#9D4300]">
            Zest Marketplace
          </div>
          <Link
            href={vendor ? `/store/${vendor.slug || vendor._id}` : "/"}
            className="flex items-center gap-2 text-on-surface-variant font-medium text-sm hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 lg:pb-24">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 space-y-12">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-on-surface leading-tight">
                Complete your order
              </h1>
              <p className="text-on-surface-variant body-md">
                Review your details and confirm your artisanal selection.
              </p>
            </div>

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <h2 className="text-xl font-bold tracking-tight">
                  Delivery Method
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label
                  className={`relative flex cursor-pointer rounded-xl p-6 focus:outline-none transition-colors ${deliveryMethod === "pickup" ? "bg-surface-container-lowest border-2 border-primary" : "bg-surface-container-low hover:bg-surface-container-high border-2 border-transparent"}`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="pickup"
                    checked={deliveryMethod === "pickup"}
                    onChange={() => setDeliveryMethod("pickup")}
                    className="sr-only"
                  />
                  <div className="flex flex-col">
                    <span className="block text-sm font-bold text-on-surface flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Pickup
                    </span>
                    <span className="mt-1 flex items-center text-xs text-on-surface-variant">
                      Collect from vendor location
                    </span>
                    <span className="mt-6 text-sm font-bold text-primary">
                      Free
                    </span>
                  </div>
                  {deliveryMethod === "pickup" && (
                    <span className="absolute top-4 right-4 flex items-center justify-center h-5 w-5 rounded-full bg-primary text-white">
                      <CheckCircle className="w-3 h-3" />
                    </span>
                  )}
                </label>

                {vendor?.deliveryAvailable && (
                  <label
                    className={`relative flex cursor-pointer rounded-xl p-6 focus:outline-none transition-colors ${deliveryMethod === "delivery" ? "bg-surface-container-lowest border-2 border-primary" : "bg-surface-container-low hover:bg-surface-container-high border-2 border-transparent"}`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value="delivery"
                      checked={deliveryMethod === "delivery"}
                      onChange={() => setDeliveryMethod("delivery")}
                      className="sr-only"
                    />
                    <div className="flex flex-col">
                      <span className="block text-sm font-bold text-on-surface flex items-center gap-2">
                        <Truck className="w-4 h-4" /> Delivery
                      </span>
                      <span className="mt-1 flex items-center text-xs text-on-surface-variant">
                        Delivered to your address
                      </span>
                      <span className="mt-6 text-sm font-bold text-primary">
                        {currency.format(vendor.deliveryFee)}
                      </span>
                    </div>
                    {deliveryMethod === "delivery" && (
                      <span className="absolute top-4 right-4 flex items-center justify-center h-5 w-5 rounded-full bg-primary text-white">
                        <CheckCircle className="w-3 h-3" />
                      </span>
                    )}
                  </label>
                )}
              </div>
            </section>

            <AnimatePresence>
              {deliveryMethod === "delivery" && (
                <motion.section
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-6 overflow-hidden"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">
                      Shipping Address
                    </h2>
                  </div>
                  <div className="bg-surface-container-low p-8 rounded-xl">
                    <div className="space-y-2">
                      <label
                        htmlFor="checkout-address"
                        className="text-sm font-semibold text-on-surface-variant block px-1"
                      >
                        Full Address
                      </label>
                      <input
                        id="checkout-address"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. 1242 Orchard Lane, City"
                        className="w-full bg-surface-container-lowest border-0 rounded-lg p-4 focus:ring-2 focus:ring-primary transition-all placeholder:text-on-surface-variant/40"
                      />
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold">
                  2
                </div>
                <h2 className="text-xl font-bold tracking-tight">
                  Payment Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label
                  className={`relative flex cursor-pointer rounded-xl p-4 focus:outline-none transition-colors ${paymentMethod === "cash" ? "bg-surface-container-lowest border-2 border-primary" : "bg-surface-container-low hover:bg-surface-container-high border-2 border-transparent"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={() => setPaymentMethod("cash")}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center justify-center w-full gap-2 text-center">
                    <Banknote
                      className={`w-6 h-6 ${paymentMethod === "cash" ? "text-primary" : "text-on-surface-variant"}`}
                    />
                    <span className="block text-sm font-bold text-on-surface">
                      Cash
                    </span>
                  </div>
                </label>
                <label
                  className={`relative flex cursor-pointer rounded-xl p-4 focus:outline-none transition-colors ${paymentMethod === "mpesa-auto" ? "bg-surface-container-lowest border-2 border-primary" : "bg-surface-container-low hover:bg-surface-container-high border-2 border-transparent"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="mpesa-auto"
                    checked={paymentMethod === "mpesa-auto"}
                    onChange={() => setPaymentMethod("mpesa-auto")}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center justify-center w-full gap-2 text-center">
                    <Phone
                      className={`w-6 h-6 ${paymentMethod === "mpesa-auto" ? "text-primary" : "text-on-surface-variant"}`}
                    />
                    <span className="block text-sm font-bold text-on-surface">
                      M-Pesa (Auto)
                    </span>
                  </div>
                </label>
                <label
                  className={`relative flex cursor-pointer rounded-xl p-4 focus:outline-none transition-colors ${paymentMethod === "mpesa-manual" ? "bg-surface-container-lowest border-2 border-primary" : "bg-surface-container-low hover:bg-surface-container-high border-2 border-transparent"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="mpesa-manual"
                    checked={paymentMethod === "mpesa-manual"}
                    onChange={() => setPaymentMethod("mpesa-manual")}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center justify-center w-full gap-2 text-center">
                    <Phone
                      className={`w-6 h-6 ${paymentMethod === "mpesa-manual" ? "text-primary" : "text-on-surface-variant"}`}
                    />
                    <span className="block text-sm font-bold text-on-surface">
                      M-Pesa (Manual)
                    </span>
                  </div>
                </label>
              </div>

              <AnimatePresence>
                {(paymentMethod === "mpesa-auto" ||
                  paymentMethod === "mpesa-manual") && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-surface-container-low p-8 rounded-xl space-y-6 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <label
                        htmlFor="checkout-phone"
                        className="text-sm font-semibold text-on-surface-variant block px-1"
                      >
                        Phone Number
                      </label>
                      <input
                        id="checkout-phone"
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 0712345678"
                        className="w-full bg-surface-container-lowest border-0 rounded-lg p-4 focus:ring-2 focus:ring-primary transition-all placeholder:text-on-surface-variant/40"
                      />
                    </div>
                    {paymentMethod === "mpesa-manual" && (
                      <div className="space-y-2">
                        <label
                          htmlFor="checkout-mpesa-code"
                          className="text-sm font-semibold text-on-surface-variant block px-1"
                        >
                          M-Pesa Transaction Code
                        </label>
                        <input
                          id="checkout-mpesa-code"
                          type="text"
                          value={mpesaCode}
                          onChange={(e) => setMpesaCode(e.target.value)}
                          placeholder="e.g. QJK8L9M2PX"
                          className="w-full bg-surface-container-lowest border-0 rounded-lg p-4 focus:ring-2 focus:ring-primary transition-all placeholder:text-on-surface-variant/40"
                        />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>

          <aside className="w-full lg:w-[400px]">
            <div className="lg:sticky lg:top-28 space-y-6">
              <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm ring-1 ring-outline-variant/10">
                <h3 className="text-xl font-bold tracking-tight mb-8">
                  Order Summary
                </h3>

                <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto no-scrollbar">
                  {items.map((item) => (
                    <div key={item.product._id} className="flex gap-4">
                      <div className="w-20 h-20 bg-surface-container-low rounded-xl overflow-hidden flex-shrink-0 relative">
                        {/* Assuming item.product might have an image, but fallback to a placeholder if not */}
                        <Image
                          src={
                            item.product.image ||
                            "https://lh3.googleusercontent.com/aida-public/AB6AXuCvAckgekodswuNr8EJo4Xh6ySHQY84DJaZPFI8mNQ7_LrNgJZ3wVY03TjSQ-CEIYhGbgKJf5ahzwsfcfbeHJ9Qq0e70s3vXi_cF8enVYt15vdrhtRoHa1oYbWdeTDtp8kD-w9tUbeWmIN-hLAe6tBM-J1jgwGRdPnxThGoTXa9riFpbVAwNreKgwkBlwvGF-IAy4kjkipLAh19kKCSXZM9xiXScrY7iccddjYo_pYq0ZPPSKpSQTZLkqFtuo3rPHdSH8nRCS3VgFE"
                          }
                          alt={item.product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className="font-bold text-sm leading-tight">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-1">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-bold text-primary mt-2">
                          {currency.format(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-6 border-t border-outline-variant/10">
                  <div className="flex justify-between text-sm text-on-surface-variant">
                    <span>Subtotal</span>
                    <span>{currency.format(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-on-surface-variant">
                    <span>Delivery</span>
                    <span>
                      {deliveryFee > 0 ? currency.format(deliveryFee) : "Free"}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-extrabold text-on-surface pt-2">
                    <span>Total</span>
                    <span>{currency.format(grandTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full mt-10 flex justify-center items-center bg-primary-container text-white py-4 rounded-full font-bold text-lg shadow-lg shadow-primary-container/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  type="button"
                >
                  {isSubmitting ? "Processing..." : "Complete Purchase"}
                </button>
                <p className="text-[10px] text-center text-on-surface-variant mt-6 uppercase tracking-widest font-bold">
                  Guaranteed Secure Checkout
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface-container-low p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <CheckCircle className="text-primary w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold uppercase leading-none mt-1">
                    Verified Vendors
                  </span>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <Truck className="text-primary w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold uppercase leading-none mt-1">
                    Fast Delivery
                  </span>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <Banknote className="text-primary w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold uppercase leading-none mt-1">
                    Secure Payment
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="py-12 px-6 border-t border-outline-variant/10 text-center">
        <p className="text-sm text-on-surface-variant">
          © {new Date().getFullYear()} Zest Marketplace. All transactions are
          encrypted.
        </p>
      </footer>
    </div>
  );
}
