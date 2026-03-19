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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/contexts/CartContext";

interface Vendor {
  _id: string;
  name: string;
  deliveryAvailable: boolean;
  deliveryFee: number;
}

const CheckoutPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const { items, vendorId, totalPrice, clearCart } = useCart();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [_loadingVendor, setLoadingVendor] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">(
    "pickup",
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "mpesa-auto" | "mpesa-manual"
  >("cash");
  const [completedVendorName, setCompletedVendorName] = useState("");
  const [mpesaCode, setMpesaCode] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Fetch vendor details
  useEffect(() => {
    if (!vendorId) return;

    const controller = new AbortController();

    async function fetchVendor() {
      try {
        setLoadingVendor(true);
        const response = await fetch(`/api/vendors?limit=100`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Failed to fetch vendors");

        const data = await response.json();
        const foundVendor = data.data.find((v: Vendor) => v._id === vendorId);

        if (foundVendor) {
          setVendor(foundVendor);
        } else {
          toast.error("Vendor not found");
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error fetching vendor:", error);
          toast.error("Failed to load vendor details");
        }
      } finally {
        setLoadingVendor(false);
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

  function formatPrice(price: number): string {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(price);
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex flex-col items-center justify-center py-20 text-center container">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Your cart is empty
          </h2>
          <Link href="/" className="text-primary font-medium hover:underline">
            Browse vendors
          </Link>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center container"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-7xl mb-6"
          >
            🎉
          </motion.div>
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-extrabold text-foreground mb-2">
            Order Placed!
          </h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Your order has been sent to {completedVendorName}. You'll be
            notified when it's ready.
          </p>
          <Button onClick={() => router.push("/")} className="rounded-xl">
            Back to Marketplace
          </Button>
        </motion.div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
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
      const orderPayload = {
        vendorId,
        customerClerkId: user?.id,
        items: items.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
        paymentMethod,
        mpesaCode: mpesaCode || undefined,
        deliveryMethod,
        deliveryAddress: address || undefined,
        contactPhone: phone || undefined,
      };

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
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
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 max-w-2xl">
        <Link
          href={vendor ? `/store/${vendor._id}` : "/"}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <h1 className="text-2xl font-extrabold text-foreground mb-6">
          Checkout
        </h1>

        {/* Order Summary */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6">
          <h3 className="font-bold text-foreground mb-3">Order Summary</h3>
          {vendor && (
            <p className="text-sm text-muted-foreground mb-3">
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
                  {item.product.name} × {item.quantity}
                </span>
                <span className="font-medium text-foreground">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-3 pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery fee</span>
              <span className="text-foreground">
                {deliveryFee > 0 ? formatPrice(deliveryFee) : "Free"}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2">
              <span className="text-foreground">Total</span>
              <span className="text-primary">{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Method */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6">
          <h3 className="font-bold text-foreground mb-3">Delivery Method</h3>
          <RadioGroup
            value={deliveryMethod}
            onValueChange={(v) => setDeliveryMethod(v as "pickup" | "delivery")}
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/50">
              <RadioGroupItem value="pickup" id="pickup" />
              <Label
                htmlFor="pickup"
                className="flex items-center gap-2 cursor-pointer flex-1"
              >
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Pickup</p>
                  <p className="text-xs text-muted-foreground">
                    Collect from vendor location
                  </p>
                </div>
              </Label>
            </div>
            {vendor?.deliveryAvailable && (
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/50 mt-2">
                <RadioGroupItem value="delivery" id="delivery" />
                <Label
                  htmlFor="delivery"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <Truck className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Delivery</p>
                    <p className="text-xs text-muted-foreground">
                      Fee: {formatPrice(vendor.deliveryFee)}
                    </p>
                  </div>
                </Label>
              </div>
            )}
          </RadioGroup>

          <AnimatePresence>
            {deliveryMethod === "delivery" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3">
                  <Label className="text-sm text-foreground">
                    Delivery Address
                  </Label>
                  <Input
                    placeholder="Enter your delivery address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Payment Method */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6">
          <h3 className="font-bold text-foreground mb-3">Payment Method</h3>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(v) =>
              setPaymentMethod(v as "cash" | "mpesa-auto" | "mpesa-manual")
            }
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/50">
              <RadioGroupItem value="cash" id="cash" />
              <Label
                htmlFor="cash"
                className="flex items-center gap-2 cursor-pointer flex-1"
              >
                <Banknote className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    Cash on Delivery/Pickup
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pay when you receive your order
                  </p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/50 mt-2">
              <RadioGroupItem value="mpesa-auto" id="mpesa-auto" />
              <Label
                htmlFor="mpesa-auto"
                className="flex items-center gap-2 cursor-pointer flex-1"
              >
                <Phone className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    M-Pesa (Automatic)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    STK push to your phone
                  </p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/50 mt-2">
              <RadioGroupItem value="mpesa-manual" id="mpesa-manual" />
              <Label
                htmlFor="mpesa-manual"
                className="flex items-center gap-2 cursor-pointer flex-1"
              >
                <Phone className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    M-Pesa (Manual Code)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enter transaction code after payment
                  </p>
                </div>
              </Label>
            </div>
          </RadioGroup>

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
                    <Label className="text-sm text-foreground">
                      Phone Number
                    </Label>
                    <Input
                      placeholder="e.g. 0712345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  {paymentMethod === "mpesa-manual" && (
                    <div>
                      <Label className="text-sm text-foreground">
                        M-Pesa Transaction Code
                      </Label>
                      <Input
                        placeholder="e.g. QJK8L9M2PX"
                        value={mpesaCode}
                        onChange={(e) => setMpesaCode(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Place Order */}
        <Button
          onClick={handlePlaceOrder}
          disabled={isSubmitting}
          className="w-full h-14 rounded-2xl text-base font-bold"
        >
          {isSubmitting
            ? "Placing order..."
            : `Place Order — ${formatPrice(grandTotal)}`}
        </Button>
      </div>
    </div>
  );
};

export default CheckoutPage;
