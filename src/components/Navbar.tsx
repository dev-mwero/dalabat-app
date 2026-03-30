"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export function Navbar() {
  const { setIsOpen, totalItems } = useCart();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-black uppercase tracking-tighter text-primary">
            Daalabat
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative rounded-full p-2 transition-colors hover:bg-muted"
          >
            <ShoppingBag className="h-5 w-5 text-foreground transition-colors group-hover:text-primary" />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {totalItems}
              </span>
            )}
          </button>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Link
              href="/sign-in"
              className="rounded-full p-2 transition-colors hover:bg-muted"
            >
              <User className="h-5 w-5" />
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}
