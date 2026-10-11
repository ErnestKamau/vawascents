import { getToken } from './api';
import { API_BASE_URL } from '@/config/env';
import { Delivery } from './deliveryApi';

/** Mirrors backend orders.status enum (backend/database/migrations/*_create_orders_table.php). */
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

/** Mirrors backend payments.method enum. */
export type PaymentMethod = 'mpesa' | 'card' | 'pesalink' | 'wallet';

export type OrderItemApi = {
  id: number;
  product_variant_id: number;
  product_name: string;
  sku: string;
  unit_price_cents: number;
  quantity: number;
  subtotal_cents: number;
};

export type PaymentApi = {
  id: number;
  method: PaymentMethod;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  amount_cents: number;
  transaction_reference: string | null;
  paid_at: string | null;
};

export type OrderApi = {
  id: number;
  order_number: string;
  status: OrderStatus;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  placed_at: string | null;
  items: OrderItemApi[];
  payment: PaymentApi | null;
  delivery: Delivery | null;
};

export type CreateOrderItem = { sku: string; quantity: number };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `Order request failed (${response.status})`);
  }

  const { data } = await response.json();
  return data as T;
}

export const orderApi = {
  listOrders: () => request<OrderApi[]>('/orders'),

  createOrder: (items: CreateOrderItem[]) =>
    request<OrderApi>('/orders', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),

  getOrder: (id: number) => request<OrderApi>(`/orders/${id}`),

  confirmPayment: (orderId: number, method: PaymentMethod) =>
    request<OrderApi>(`/orders/${orderId}/payment`, {
      method: 'POST',
      body: JSON.stringify({ method }),
    }),
};
