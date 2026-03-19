"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/vendor/dashboard", label: "Overview" },
  { href: "/vendor/inventory", label: "Inventory" },
  { href: "/vendor/orders", label: "Orders" },
  { href: "/vendor/analytics", label: "Analytics" },
  { href: "/vendor/settings", label: "Settings" },
];

export function VendorRouteNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Vendor navigation"
      className="overflow-x-auto rounded-xl border border-border bg-card p-1"
    >
      <ul className="flex min-w-max items-center gap-1">
        {links.map((item) => {
          const isActive = pathname === item.href;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`inline-flex rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
