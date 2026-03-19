"use client";

import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";

export interface CartProduct {
  _id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  image: string;
  inStock: boolean;
  stockQuantity: number;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  vendorId: string | null;
  addItem: (product: CartProduct) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback(
    (product: CartProduct) => {
      setItems((prev) => {
        // If cart has items from different vendor, clear first
        if (vendorId && vendorId !== product.vendorId) {
          setVendorId(product.vendorId);
          return [{ product, quantity: 1 }];
        }

        if (!vendorId) setVendorId(product.vendorId);

        const existing = prev.find((i) => i.product._id === product._id);
        if (existing) {
          return prev.map((i) =>
            i.product._id === product._id
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          );
        }
        return [...prev, { product, quantity: 1 }];
      });
    },
    [vendorId],
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.product._id !== productId);
      if (next.length === 0) setVendorId(null);
      return next;
    });
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }
      setItems((prev) =>
        prev.map((i) => (i.product._id === productId ? { ...i, quantity } : i)),
      );
    },
    [removeItem],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setVendorId(null);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        vendorId,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
