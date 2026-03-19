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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

interface Vendor {
  _id: string;
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
      <div className="min-h-screen bg-background">
        <div className="container flex flex-col items-center justify-center px-4 py-20 text-center">
          <div className="mb-4 text-6xl">🛒</div>
          <h2 className="mb-2 text-xl font-bold text-foreground">
            Your cart is empty
          </h2>
          <Link href="/" className="font-medium text-primary hover:underline">
            Browse vendors
          </Link>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background px-4">
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
          <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
          <h2 className="mb-2 text-2xl font-extrabold text-foreground">
            Order Placed!
          </h2>
          <p className="mb-6 max-w-sm text-muted-foreground">
            Your order has been sent to {completedVendorName}. You&apos;ll be
            notified when it&apos;s ready.
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
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
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl px-4 py-6">
        <Link
          href={vendor ? `/store/${vendor._id}` : "/"}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <h1 className="mb-6 text-2xl font-extrabold text-foreground">
          Checkout
        </h1>

        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 font-bold text-foreground">Order Summary</h3>
          {vendor && (
            <p className="mb-3 text-sm text-muted-foreground">
              From: {vendor.name}
            </p>
          )}
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.product._id}
                className="flex justify-between text-sm"
              >
                <span className="text-foreground">
                  {item.product.name} x {item.quantity}
                </span>
                <span className="font-medium text-foreground">
                  {currency.format(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-1 border-t border-border pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">
                {currency.format(totalPrice)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery fee</span>
              <span className="text-foreground">
                {deliveryFee > 0 ? currency.format(deliveryFee) : "Free"}
              </span>
            </div>
            <div className="flex justify-between pt-2 text-lg font-bold">
              <span className="text-foreground">Total</span>
              <span className="text-primary">
                {currency.format(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 font-bold text-foreground">Delivery Method</h3>
          <fieldset className="space-y-2">
            <label className="flex cursor-pointer items-center space-x-3 rounded-lg bg-secondary/50 p-3">
              <input
                name="delivery-method"
                type="radio"
                checked={deliveryMethod === "pickup"}
                onChange={() => setDeliveryMethod("pickup")}
                className="h-4 w-4"
              />
              <MapPin className="h-4 w-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">Pickup</p>
                <p className="text-xs text-muted-foreground">
                  Collect from vendor location
                </p>
              </div>
            </label>

            {vendor?.deliveryAvailable && (
              <label className="flex cursor-pointer items-center space-x-3 rounded-lg bg-secondary/50 p-3">
                <input
                  name="delivery-method"
                  type="radio"
                  checked={deliveryMethod === "delivery"}
                  onChange={() => setDeliveryMethod("delivery")}
                  className="h-4 w-4"
                />
                <Truck className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Delivery</p>
                  <p className="text-xs text-muted-foreground">
                    Fee: {currency.format(vendor.deliveryFee)}
                  </p>
                </div>
              </label>
            )}
          </fieldset>

          <AnimatePresence>
            {deliveryMethod === "delivery" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3">
                  <label
                    htmlFor="delivery-address"
                    className="text-sm text-foreground"
                  >
                    Delivery Address
                  </label>
                  <input
                    id="delivery-address"
                    placeholder="Enter your delivery address"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 font-bold text-foreground">Payment Method</h3>
          <fieldset className="space-y-2">
            <label className="flex cursor-pointer items-center space-x-3 rounded-lg bg-secondary/50 p-3">
              <input
                name="payment-method"
                type="radio"
                checked={paymentMethod === "cash"}
                onChange={() => setPaymentMethod("cash")}
                className="h-4 w-4"
              />
              <Banknote className="h-4 w-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">
                  Cash on Delivery/Pickup
                </p>
                <p className="text-xs text-muted-foreground">
                  Pay when you receive your order
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-center space-x-3 rounded-lg bg-secondary/50 p-3">
              <input
                name="payment-method"
                type="radio"
                checked={paymentMethod === "mpesa-auto"}
                onChange={() => setPaymentMethod("mpesa-auto")}
                className="h-4 w-4"
              />
              <Phone className="h-4 w-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">
                  M-Pesa (Automatic)
                </p>
                <p className="text-xs text-muted-foreground">
                  STK push to your phone
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-center space-x-3 rounded-lg bg-secondary/50 p-3">
              <input
                name="payment-method"
                type="radio"
                checked={paymentMethod === "mpesa-manual"}
                onChange={() => setPaymentMethod("mpesa-manual")}
                className="h-4 w-4"
              />
              <Phone className="h-4 w-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">
                  M-Pesa (Manual Code)
                </p>
                <p className="text-xs text-muted-foreground">
                  Enter transaction code after payment
                </p>
              </div>
            </label>
          </fieldset>

          <AnimatePresence>
            {(paymentMethod === "mpesa-auto" ||
              paymentMethod === "mpesa-manual") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-3">
                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="text-sm text-foreground"
                    >
                      Phone Number
                    </label>
                    <input
                      id="contact-phone"
                      placeholder="e.g. 0712345678"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    />
                  </div>
                  {paymentMethod === "mpesa-manual" && (
                    <div>
                      <label
                        htmlFor="mpesa-code"
                        className="text-sm text-foreground"
                      >
                        M-Pesa Transaction Code
                      </label>
                      <input
                        id="mpesa-code"
                        placeholder="e.g. QJK8L9M2PX"
                        value={mpesaCode}
                        onChange={(event) => setMpesaCode(event.target.value)}
                        className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={isSubmitting}
          className="h-14 w-full rounded-2xl bg-primary text-base font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Placing order..."
            : `Place Order - ${currency.format(grandTotal)}`}
        </button>
      </div>
    </div>
  );
}
