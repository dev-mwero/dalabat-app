"use client";

import {
  BarChart,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/vendor/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/vendor/inventory", label: "Inventory", icon: Package },
  { href: "/vendor/orders", label: "Orders", icon: ShoppingBag },
  { href: "/vendor/staff", label: "Staff", icon: Users },
  { href: "/vendor/analytics", label: "Analytics", icon: BarChart },
  { href: "/vendor/settings", label: "Settings", icon: Settings },
];

export function VendorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 border-r border-outline-variant/10 bg-surface-container-lowest flex flex-col gap-2 p-4 z-50">
      <div className="mb-8 px-2">
        <h1 className="text-lg font-extrabold text-primary">Management</h1>
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
  );
}
