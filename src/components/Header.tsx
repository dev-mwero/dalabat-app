"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Package, Search, ShoppingCart, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showSearch?: boolean;
}

export const Header = ({
  searchQuery = "",
  onSearchChange,
  showSearch = true,
}: HeaderProps) => {
  const { totalItems } = useCart();
  const { isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-50 glass border-b border-border">
      <div className="container mx-auto max-w-7xl flex items-center justify-between h-16 gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <Zap className="text-white w-5 h-5 fill-white" />
          </div>
          <span className="text-2xl font-extrabold text-primary tracking-tighter">
            IIBSO
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 ml-4">
          <Link
            href="/market"
            className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
          >
            Marketplace
          </Link>
        </nav>

        {showSearch && (
          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors or products..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10 bg-secondary border-none"
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground hidden lg:flex mr-2">
            <MapPin className="h-4 w-4" />
            <span>Nairobi</span>
          </div>

          <Link href="/track-order">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground hidden sm:flex"
            >
              <Package className="h-4 w-4" />
              <span>Track Order</span>
            </Button>
          </Link>

          <Link href="/cart">
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <AnimatePresence mode="wait">
                {totalItems > 0 && (
                  <motion.span
                    key="cart-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </Link>

          <div className="border-l border-border h-6 mx-1 hidden sm:block"></div>

          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="hidden sm:block">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  My Profile
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <SignInButton mode="modal">
              <Button size="sm">Sign In</Button>
            </SignInButton>
          )}
        </div>
      </div>

      {showSearch && (
        <div className="container mx-auto px-4 pb-3 sm:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors or products..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10 bg-secondary border-none"
            />
          </div>
        </div>
      )}
    </header>
  );
};

// (End of file, removed default export)
