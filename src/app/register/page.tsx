"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Store, Zap, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "customer" | "vendor";

const roles = [
  {
    id: "customer" as Role,
    title: "I'm a Buyer",
    subtitle: "Shop the Market",
    description: "Discover and order artisanal provisions from the best local producers, delivered to your door.",
    icon: ShoppingBag,
    color: "from-orange-400 to-rose-500",
    bg: "bg-orange-50",
    border: "border-orange-200",
    selectedBorder: "border-orange-500 ring-4 ring-orange-100",
    perks: [
      "Browse thousands of artisanal products",
      "Order from multiple stores in one cart",
      "Track deliveries in real-time",
      "Save favourites and re-order easily",
    ],
  },
  {
    id: "vendor" as Role,
    title: "I'm a Vendor",
    subtitle: "Open Your Store",
    description: "Launch your artisanal storefront, manage inventory, and reach thousands of discerning buyers.",
    icon: Store,
    color: "from-blue-500 to-violet-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    selectedBorder: "border-blue-500 ring-4 ring-blue-100",
    perks: [
      "Professional storefront in minutes",
      "Full inventory & order management",
      "Add staff (tellers) to help manage",
      "Analytics and revenue tracking",
    ],
  },
];

export default function RegisterPage() {
  const [selected, setSelected] = useState<Role | null>(null);
  const router = useRouter();

  function handleContinue() {
    if (!selected) return;
    // Store role in sessionStorage so sign-up page can pick it up
    sessionStorage.setItem("pending_role", selected);
    router.push(`/sign-up?role=${selected}`);
  }

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

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">
            How will you use IIBSO?
          </h1>
          <p className="text-slate-500 text-lg font-medium max-w-md mx-auto">
            Choose your path. You can always switch later.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
          {roles.map((role, i) => {
            const isSelected = selected === role.id;
            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelected(role.id)}
                className={`relative text-left p-8 rounded-3xl border-2 transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? role.selectedBorder + " shadow-xl"
                    : `${role.border} hover:shadow-lg hover:-translate-y-1`
                } bg-white`}
              >
                {/* Selected checkmark */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-5 right-5"
                  >
                    <CheckCircle className="w-6 h-6 text-emerald-500 fill-emerald-100" />
                  </motion.div>
                )}

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <role.icon className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-2xl font-black text-slate-900 mb-1">{role.title}</h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{role.subtitle}</p>
                <p className="text-slate-500 font-medium mb-6 leading-relaxed">{role.description}</p>

                <ul className="space-y-2">
                  {role.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </div>
                      {perk}
                    </li>
                  ))}
                </ul>
              </motion.button>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: selected ? 1 : 0.4 }}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <button
            onClick={handleContinue}
            disabled={!selected}
            className="bg-slate-900 text-white px-14 py-5 rounded-2xl font-black text-lg flex items-center gap-3 hover:shadow-2xl hover:shadow-slate-200 transition-all disabled:cursor-not-allowed disabled:opacity-40 group"
          >
            Continue
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-sm text-slate-400 font-medium">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-slate-900 font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>

        {/* Invite Note */}
        <p className="mt-8 text-center text-xs text-slate-300 font-medium max-w-sm">
          Are you a store teller or admin? Access is by invitation only. Check your email for an invite link.
        </p>
      </div>
    </div>
  );
}
