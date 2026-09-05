"use client";

import { UserButton } from "@clerk/nextjs";
import {
  BarChart3,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/dashboard", label: "Global Stats", icon: LayoutDashboard },
  { href: "/admin/vendors", label: "Vendors", icon: Store },
  { href: "/admin/users", label: "Clients", icon: Users },
  { href: "/admin/analytics", label: "Market Growth", icon: BarChart3 },
  { href: "/admin/settings", label: "Platform Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-72 fixed left-0 top-0 border-r border-slate-200 bg-white flex flex-col gap-2 p-6 z-50">
      <div className="mb-10 px-2 flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
          <ShieldCheck className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight">IIBSO</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Super Admin
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {links.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`}
              />
              <span className="font-bold text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-100">
        <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
          <UserButton afterSignOutUrl="/" />
          <div className="text-right">
            <p className="font-bold text-xs">Admin Panel</p>
            <Link
              href="/"
              className="text-[10px] text-slate-400 hover:text-slate-900 flex items-center gap-1 justify-end"
            >
              <ShieldCheck className="w-3 h-3" /> Live Site
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
