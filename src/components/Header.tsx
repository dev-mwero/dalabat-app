"use client";

import { ShoppingCart, MapPin, Search, Package } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showSearch?: boolean;
}

export const Header = ({ searchQuery = "", onSearchChange, showSearch = true }: HeaderProps) => {
  const { totalItems, setIsOpen } = useCart();
  const { isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-50 glass border-b border-border">
      <div className="container mx-auto max-w-7xl flex items-center justify-between h-16 gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl font-extrabold text-primary">Dalabat</span>
        </Link>

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
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground hidden sm:flex">
              <Package className="h-4 w-4" />
              <span>Track Order</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            size="icon"
            className="relative"
            onClick={() => setIsOpen(true)}
          >
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

          <div className="border-l border-border h-6 mx-1 hidden sm:block"></div>

          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
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
