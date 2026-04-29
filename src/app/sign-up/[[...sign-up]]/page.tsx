"use client";

import { SignUp } from "@clerk/nextjs";
import { ShoppingBag, Store, Zap } from "lucide-react";
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
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Nav */}
      <nav className="h-20 flex items-center px-8 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <Zap className="text-white w-5 h-5 fill-white" />
          </div>
          <span className="text-xl font-black tracking-tighter">IIBSO</span>
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
          <h2 className="text-3xl font-black text-white mb-4 leading-tight">
            {isVendor
              ? "Launch your artisanal storefront."
              : isTeller
                ? "Join your team's storefront."
                : "Discover the finest artisanal provisions."}
          </h2>
          <p className="text-white/70 font-medium text-lg leading-relaxed">
            {isVendor
              ? "Join hundreds of producers connecting with thousands of buyers across Kenya."
              : isTeller
                ? "You've been invited to manage orders and inventory as a Teller."
                : "Support local producers and enjoy premium artisanal goods delivered to your doorstep."}
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
                    "Browse 1,000+ products",
                    "Multi-store cart",
                    "Real-time order tracking",
                    "Saved favourites",
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
              <h1 className="text-3xl font-black text-slate-900 mb-2">
                Create your account
              </h1>
              <p className="text-slate-500 font-medium">
                Joining as a{" "}
                <span className="font-bold text-slate-900">
                  {isVendor ? "Vendor" : isTeller ? "Teller" : "Buyer"}
                </span>
                .{" "}
                {!isTeller && (
                  <Link
                    href="/register"
                    className="text-blue-600 hover:underline"
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
