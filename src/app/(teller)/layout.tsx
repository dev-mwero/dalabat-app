"use client";

import { UserButton } from "@clerk/nextjs";
import { LogOut, Package, ShoppingBag, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/teller/orders", label: "Orders", icon: ShoppingBag },
    { href: "/teller/inventory", label: "Stock", icon: Package },
  ];

  return (
    <div className="bg-surface text-on-surface font-sans">
      {/* SideNavBar */}
      <aside className="h-screen w-64 fixed left-0 top-0 border-r border-outline-variant/10 bg-surface-container-lowest flex flex-col gap-2 p-4 z-50">
        <div className="mb-8 px-2">
          <h1 className="text-lg font-extrabold text-primary">IIBSO</h1>
          <p className="text-xs text-on-surface-variant opacity-70 tracking-widest uppercase font-bold">
            Teller Terminal
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
          <div className="flex items-center justify-between">
            <UserButton afterSignOutUrl="/" />
            <div className="text-right">
              <p className="font-bold text-[10px] text-on-surface">Teller</p>
              <Link
                href="/"
                className="text-[10px] text-primary hover:underline font-bold"
              >
                Exit to Shop
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="pl-64 min-h-screen">
        <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center w-full px-8 py-4 shadow-sm border-b border-outline-variant/10">
          <div className="flex items-center gap-4">
            <Store className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold tracking-tight text-on-surface">
              Store Terminal
            </span>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
