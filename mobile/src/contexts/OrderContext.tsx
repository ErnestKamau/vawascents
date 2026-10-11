/**
 * OrderContext — backend-backed order history.
 *
 * The backend is the source of truth (`services/orderApi.ts`); AsyncStorage is
 * only an offline *cache* so the Orders tab can paint instantly and survive a
 * dropped connection, not where orders actually live.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartLine } from './CartContext';
import { orderApi, OrderApi, PaymentMethod } from '@/services/orderApi';

type OrderContextType = {
  orders: OrderApi[];
  loading: boolean;
  refresh: () => Promise<void>;
  getOrder: (id: number) => OrderApi | undefined;
  createOrder: (lines: CartLine[]) => Promise<OrderApi>;
  confirmPayment: (orderId: number, method: PaymentMethod) => Promise<OrderApi>;
  /** Re-fetches a single order from the backend (e.g. after booking its delivery) and updates the cache. */
  refreshOrder: (id: number) => Promise<OrderApi | undefined>;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const ORDERS_CACHE_KEY = '@vawascents_orders_cache';

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<OrderApi[]>([]);
  const [loading, setLoading] = useState(true);

  // Mirrors `orders` so async mutators (createOrder -> confirmPayment, fired
  // back-to-back from the same event handler) always read the latest list
  // instead of the one captured in their closure at last render.
  const ordersRef = useRef<OrderApi[]>([]);
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  const persist = useCallback((next: OrderApi[]) => {
    ordersRef.current = next;
    setOrders(next);
    AsyncStorage.setItem(ORDERS_CACHE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const refresh = useCallback(async () => {
    try {
      const fresh = await orderApi.listOrders();
      persist(fresh);
    } catch {
      // Offline or signed out — keep whatever's cached rather than clearing it.
    } finally {
      setLoading(false);
    }
  }, [persist]);

  useEffect(() => {
    (async () => {
      try {
        const cached = await AsyncStorage.getItem(ORDERS_CACHE_KEY);
        if (cached) setOrders(JSON.parse(cached));
      } catch {
        // Ignore a corrupt cache — refresh() below still runs.
      }
      await refresh();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getOrder = useCallback((id: number) => orders.find((o) => o.id === id), [orders]);

  const createOrder = useCallback(
    async (lines: CartLine[]) => {
      const order = await orderApi.createOrder(lines.map((l) => ({ sku: l.product.id, quantity: l.quantity })));
      persist([order, ...ordersRef.current]);
      return order;
    },
    [persist],
  );

  const confirmPayment = useCallback(
    async (orderId: number, method: PaymentMethod) => {
      const order = await orderApi.confirmPayment(orderId, method);
      persist(ordersRef.current.map((o) => (o.id === orderId ? order : o)));
      return order;
    },
    [persist],
  );

  const refreshOrder = useCallback(
    async (id: number) => {
      try {
        const order = await orderApi.getOrder(id);
        persist(ordersRef.current.map((o) => (o.id === id ? order : o)));
        return order;
      } catch {
        return getOrder(id);
      }
    },
    [persist, getOrder],
  );

  const value = useMemo(
    () => ({ orders, loading, refresh, getOrder, createOrder, confirmPayment, refreshOrder }),
    [orders, loading, refresh, getOrder, createOrder, confirmPayment, refreshOrder],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders(): OrderContextType {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within an OrderProvider');
  return ctx;
}
