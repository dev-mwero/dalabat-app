"use client";

import {
  ArrowLeft,
  BarChart,
  Bell,
  LayoutDashboard,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/vendor/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/vendor/inventory", label: "Inventory", icon: Package },
    { href: "/vendor/orders", label: "Orders", icon: ShoppingBag },
    { href: "/vendor/staff", label: "Staff", icon: Users },
    { href: "/vendor/analytics", label: "Analytics", icon: BarChart },
    { href: "/vendor/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="bg-surface text-on-surface font-sans">
      {/* SideNavBar */}
      <aside className="h-screen w-64 fixed left-0 top-0 border-r border-outline-variant/10 bg-surface-container-lowest flex flex-col gap-2 p-4 z-50">
        <div className="mb-8 px-2">
          <h1 className="text-lg font-extrabold text-[#9D4300] dark:text-[#F97316]">
            Management
          </h1>
          <p className="text-xs text-on-surface-variant opacity-70">
            Vendor Portal
          </p>
        </div>
        <nav className="flex flex-col gap-1">
          {links.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-on-surface-variant hover:text-primary hover:bg-primary-container/10"}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-4 bg-surface-container-low rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-bold shadow-sm">
              VP
            </div>
            <div>
              <p className="font-bold text-xs text-on-surface">Vendor Portal</p>
              <p className="text-[10px] text-on-surface-variant">Management</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="pl-64 min-h-screen">
        {/* TopNavBar */}
        <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center w-full px-8 py-4 shadow-sm border-b border-outline-variant/10">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold italic text-[#9D4300] dark:text-[#F97316]">
              The Digital Pantry
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative flex items-center bg-surface-container-low rounded-full px-4 py-2 w-64 focus-within:ring-2 ring-primary-container transition-all">
              <Search className="w-4 h-4 text-on-surface-variant mr-2" />
              <input
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-on-surface-variant/50 focus:outline-none"
                placeholder="Search data..."
                type="text"
              />
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Market
              </Link>
              <button
                className="p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-full relative"
                type="button"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
