"use client";

import { SignUp } from "@clerk/nextjs";
import { ShoppingBag, Store } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignUpContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") ?? "customer";
  const token = searchParams.get("token") ?? null;
  const isVendor = role === "vendor";
  const isTeller = role === "teller";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="h-20 flex items-center px-8 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Store className="text-primary-foreground w-5 h-5" />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">
            IIBSO
          </span>
        </Link>
      </nav>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left — Context Panel */}
        <div
          className={`hidden md:flex flex-col justify-center px-16 py-20 w-[420px] flex-shrink-0 ${isVendor ? "bg-gradient-to-br from-blue-600 to-violet-700" : isTeller ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-orange-500 to-rose-500"}`}
        >
          <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mb-8">
            {isVendor || isTeller ? (
              <Store className="w-8 h-8 text-white" />
            ) : (
              <ShoppingBag className="w-8 h-8 text-white" />
            )}
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4 leading-tight">
            {isVendor
              ? "Launch your provisions storefront."
              : isTeller
                ? "Join your team's storefront."
                : "Discover quality everyday staples."}
          </h2>
          <p className="text-white/70 font-medium text-lg leading-relaxed">
            {isVendor
              ? "A dedicated dashboard for managing stock, staff, and orders."
              : isTeller
                ? "You've been invited to manage orders and inventory as a Teller."
                : "Support local vendors and enjoy quality provisions delivered to your doorstep."}
          </p>

          <div className="mt-12 space-y-4">
            {(isVendor
              ? [
                  "Professional storefront",
                  "Inventory & order tools",
                  "Staff management",
                  "Revenue analytics",
                ]
              : isTeller
                ? [
                    "Process active orders",
                    "Manage stock levels",
                    "Access teller terminal",
                    "Secure role-based access",
                  ]
                : [
                    "Everyday staples from local stores",
                    "Cash or M-Pesa payment",
                    "Real-time order tracking",
                    "Pickup or doorstep delivery",
                  ]
            ).map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-white/80 font-medium"
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                {item}
              </div>
            ))}
          </div>

          {!isTeller && (
            <div className="mt-16 pt-8 border-t border-white/20">
              <p className="text-white/50 text-sm font-medium">
                Not {isVendor ? "a vendor" : "a buyer"}?{" "}
                <Link
                  href={`/sign-up?role=${isVendor ? "customer" : "vendor"}`}
                  className="text-white font-bold hover:underline"
                >
                  Switch role
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Right — Clerk Sign-up Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground mb-2">
                Create your account
              </h1>
              <p className="text-muted-foreground font-medium">
                Joining as a{" "}
                <span className="font-bold text-foreground">
                  {isVendor ? "Vendor" : isTeller ? "Teller" : "Buyer"}
                </span>
                .{" "}
                {!isTeller && (
                  <Link
                    href="/register"
                    className="text-primary hover:underline"
                  >
                    Change
                  </Link>
                )}
              </p>
            </div>

            {/* Pass role and token as unsafeMetadata so webhook can read it */}
            <SignUp
              unsafeMetadata={{ role, token }}
              forceRedirectUrl="/dashboard"
              signInUrl="/sign-in"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpContent />
    </Suspense>
  );
}
