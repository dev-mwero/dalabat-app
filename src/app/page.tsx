"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Globe,
  Heart,
  ShieldCheck,
  ShoppingBag,
  Store,
  TrendingUp,
  Truck,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
        "Access a curated world of artisanal provisions. From small-batch sourdough to cold-pressed oils, delivered to your doorstep.",
      icon: ShoppingBag,
      color: "bg-orange-50 text-orange-600",
      cta: "Explore Market",
      link: "/market",
    },
    {
      title: "For Vendors",
      description:
        "Scale your artisanal business with professional tools. Manage inventory, staff, and analytics in one powerful dashboard.",
      icon: Store,
      color: "bg-blue-50 text-blue-600",
      cta: "Start Selling",
      link: "/register?role=vendor",
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-600 text-xs font-black uppercase tracking-widest mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                Now Live in Nairobi
              </div>
              <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight text-slate-900 mb-8">
                The Future of{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
                  Artisanal
                </span>{" "}
                Commerce.
              </h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed mb-10 max-w-lg">
                Connecting discerning buyers with master producers. A complete
                ecosystem for artisanal provisions, built for speed and scale.
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
              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 overflow-hidden relative"
                    >
                      <Image
                        src={`https://i.pravatar.cc/100?img=${i + 10}`}
                        alt="User"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-bold text-slate-400 italic">
                  Trusted by 1,200+ food enthusiasts
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative aspect-square lg:aspect-auto lg:h-[600px] rounded-[40px] overflow-hidden shadow-2xl border-8 border-white"
            >
              <Image
                src="/hero-banner.png"
                alt="Artisanal Marketplace"
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
                      <CheckCircle className="w-6 h-6" />
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

      {/* Feature Split */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-4">
              Dual-Powered Experience
            </h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto text-lg">
              Whether you are curating your kitchen or building your brand, we
              provide the ultimate platform for artisanal success.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, i) => (
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
                  <h3 className="text-3xl font-black text-slate-900 mb-6">
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

      {/* Trust Bar */}
      <section className="py-12 border-y border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">
              <Globe className="w-6 h-6" /> LocalFirst
            </div>
            <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">
              <ShieldCheck className="w-6 h-6" /> SecureTrade
            </div>
            <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">
              <Truck className="w-6 h-6" /> FastDeli
            </div>
            <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">
              <Heart className="w-6 h-6" /> PureQuality
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="bg-slate-900 rounded-[50px] p-16 md:p-24 relative overflow-hidden">
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                Ready to taste the <br />
                <span className="text-orange-400">Extraordinary?</span>
              </h2>
              <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                Join the thousands of shoppers and hundreds of vendors building
                the future of the Kenyan artisanal food scene.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link
                  href="/market"
                  className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-lg hover:bg-orange-50 transition-all"
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
              Empowering artisanal producers and connecting them with the people
              who value quality above all else.
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
                <Link href="#" className="hover:text-slate-900">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-slate-900">
                  Privacy Policy
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

// Mock icon missing in lucide
function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
