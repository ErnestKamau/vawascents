import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';
import { MockProduct } from '@/data/mockProducts';

export type CartLine = {
  product: MockProduct;
  quantity: number;
};

type CartContextType = {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  add: (product: MockProduct, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const add = useCallback((product: MockProduct, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) => (l.product.id === product.id ? { ...l, quantity: l.quantity + quantity } : l));
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0 ? prev.filter((l) => l.product.id !== productId) : prev.map((l) => (l.product.id === productId ? { ...l, quantity } : l)),
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.product.id !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.quantity * l.product.price, 0), [lines]);

  const value = useMemo(
    () => ({ lines, itemCount, subtotal, add, updateQuantity, remove, clear }),
    [lines, itemCount, subtotal, add, updateQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
