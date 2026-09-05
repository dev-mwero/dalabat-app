"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Globe,
  Heart,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Store,
  TrendingUp,
  Truck,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const stapleCategories = [
  "Rice & Grains",
  "Flour & Baking",
  "Cooking Oils",
  "Sugar & Sweeteners",
  "Salt & Spices",
  "General Groceries",
];

export default function LandingPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const features = [
    {
      title: "For Buyers",
      description:
        "Fill your kitchen with quality everyday staples — rice, flour, oil, sugar and more — delivered by trusted local vendors.",
      icon: ShoppingBag,
      color: "bg-orange-50 text-orange-600",
      cta: "Explore Market",
      link: "/market",
    },
    {
      title: "For Vendors",
      description:
        "Run your staple-food business with professional tools. Manage inventory, staff, and analytics in one dashboard.",
      icon: Store,
      color: "bg-blue-50 text-blue-600",
      cta: "Start Selling",
      link: "/register?role=vendor",
    },
  ];

  const steps = [
    {
      title: "Pick a store",
      description:
        "Browse the directory and choose a trusted local vendor near you.",
      icon: Store,
    },
    {
      title: "Order your staples",
      description:
        "Fill a cart with rice, flour, oil, sugar and more — pay by cash or M-Pesa.",
      icon: ShoppingBag,
    },
    {
      title: "Get it delivered",
      description:
        "Track your order from the vendor's counter to your doorstep.",
      icon: PackageCheck,
    },
  ];

  return (
    <div className="bg-white text-slate-900 font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Zap className="text-white w-5 h-5 fill-white" />
            </div>
            <span className="text-xl font-black tracking-tight">IIBSO</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
            <Link
              href="/market"
              className="hover:text-slate-900 transition-colors"
            >
              Marketplace
            </Link>
            <Link
              href="#features"
              className="hover:text-slate-900 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="hover:text-slate-900 transition-colors"
            >
              How it Works
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm font-bold text-slate-600 hover:text-slate-900"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:shadow-xl hover:shadow-slate-200 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeIn}>
              <h1 className="font-display text-5xl lg:text-7xl font-semibold leading-[1.05] tracking-tight text-slate-900 mb-8">
                Everyday provisions, from vendors you{" "}
                <span className="relative whitespace-nowrap text-orange-600">
                  trust
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 120 12"
                    className="absolute -bottom-2 left-0 w-full h-3 text-orange-300"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 9C30 3 70 3 118 8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                .
              </h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed mb-10 max-w-lg">
                IIBSO connects families with dependable local vendors for
                quality rice, flour, sugar, oil and more — delivered to your
                door or ready for pickup.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/market"
                  className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-slate-300 transition-all group"
                >
                  Start Shopping
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/register?role=vendor"
                  className="bg-white text-slate-900 border-2 border-slate-100 px-10 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:border-slate-200 transition-all"
                >
                  Open Your Store
                </Link>
              </div>
              <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-bold text-slate-400">
                <Link
                  href="/vendors"
                  className="inline-flex items-center gap-2 hover:text-slate-900 transition-colors"
                >
                  <Store className="w-4 h-4" /> Browse the vendor directory
                </Link>
                <Link
                  href="/track-order"
                  className="inline-flex items-center gap-2 hover:text-slate-900 transition-colors"
                >
                  <PackageCheck className="w-4 h-4" /> Track an order
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative aspect-square lg:aspect-auto lg:h-[600px] rounded-[40px] overflow-hidden shadow-2xl border-8 border-white"
            >
              <Image
                src="/hero-banner.png"
                alt="Everyday staples marketplace"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>

              {/* Floating UI Elements */}
              <div className="absolute bottom-8 left-8 right-8 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                      <Check className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Order Status
                      </p>
                      <p className="text-sm font-black text-slate-900">
                        Out for Delivery
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900">
                      KES 4,500
                    </p>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">
                      Paid via M-Pesa
                    </p>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    transition={{ duration: 1.5, delay: 1 }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -z-10 w-[800px] h-[800px] bg-orange-100/30 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-blue-100/20 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
      </section>

      {/* Staple Categories Strip */}
      <section className="py-10 border-y border-slate-100 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-4">
            {stapleCategories.map((category) => (
              <Link
                key={category}
                href={`/market?category=${encodeURIComponent(category)}`}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-orange-600 hover:border-orange-200 transition-colors"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Split */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 mb-4">
              Built for the pantry, and the people who stock it
            </h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto text-lg">
              One marketplace for dependable everyday staples — whether you are
              stocking your kitchen or running a provisions store.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                whileHover={{ y: -10 }}
                className="bg-white p-12 rounded-[40px] border border-slate-200 shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <div
                    className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 ${feature.color}`}
                  >
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-display text-3xl font-semibold text-slate-900 mb-6">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-slate-500 leading-relaxed mb-10">
                    {feature.description}
                  </p>
                </div>
                <Link
                  href={feature.link}
                  className="inline-flex items-center gap-2 text-slate-900 font-black group-hover:text-orange-500 transition-colors"
                >
                  {feature.cta}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
              From counter to kitchen
            </h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto text-lg mt-4">
              Ordering daily staples should feel as simple as a trip to the
              neighborhood store.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="text-5xl font-display font-semibold text-slate-200 mb-6">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <step.icon className="w-8 h-8 text-orange-600 mb-4" />
                <h3 className="font-display text-2xl font-semibold text-slate-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 border-y border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-12 text-slate-400">
            <div className="flex items-center gap-2 font-black text-xl tracking-tight">
              <Store className="w-6 h-6 text-orange-600" /> Vetted Local Vendors
            </div>
            <div className="flex items-center gap-2 font-black text-xl tracking-tight">
              <ShieldCheck className="w-6 h-6 text-orange-600" /> Quality
              Guarantee
            </div>
            <div className="flex items-center gap-2 font-black text-xl tracking-tight">
              <PackageCheck className="w-6 h-6 text-orange-600" /> Live Order
              Tracking
            </div>
            <div className="flex items-center gap-2 font-black text-xl tracking-tight">
              <Heart className="w-6 h-6 text-orange-600" /> Cash & M-Pesa
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="bg-slate-900 rounded-[50px] p-16 md:p-24 relative overflow-hidden">
            <div className="relative z-10 space-y-8">
              <h2 className="font-display text-4xl md:text-6xl font-semibold text-white leading-tight">
                Stock your pantry with staples worth cooking with.
              </h2>
              <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                Join vendors and households across Nairobi keeping quality
                everyday provisions close to home.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link
                  href="/market"
                  className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-lg hover:bg-orange-50 hover:text-orange-700 transition-all"
                >
                  Shop the Market
                </Link>
                <Link
                  href="/register?role=vendor"
                  className="bg-slate-800 text-white border border-slate-700 px-10 py-5 rounded-2xl font-black text-lg hover:bg-slate-700 transition-all"
                >
                  Become a Vendor
                </Link>
              </div>
            </div>
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 pt-20 pb-10 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Zap className="text-white w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-black tracking-tight">IIBSO</span>
            </div>
            <p className="text-slate-500 font-medium max-w-sm">
              Empowering local vendors and connecting them with the people who
              value quality everyday provisions.
            </p>
          </div>
          <div>
            <h4 className="font-black text-slate-900 mb-6">Platform</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li>
                <Link href="/market" className="hover:text-slate-900">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/vendors" className="hover:text-slate-900">
                  Vendor Directory
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-slate-900">
                  Registration
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-slate-900 mb-6">Company</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li>
                <Link href="/support" className="hover:text-slate-900">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-slate-900">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-slate-900">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm font-bold text-slate-400">
            © 2026 IIBSO Marketplace. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-slate-400">
            <TrendingUp className="w-5 h-5 hover:text-slate-900 cursor-pointer" />
            <Globe className="w-5 h-5 hover:text-slate-900 cursor-pointer" />
            <Truck className="w-5 h-5 hover:text-slate-900 cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
}
