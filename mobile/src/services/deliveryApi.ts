import { getToken } from './api';
import { API_BASE_URL } from '@/config/env';

/** Mirrors backend/app/Enums/DeliveryStatus.php — shared vocabulary with the sacco delivery API. */
export type DeliveryStatus = 'booked' | 'dispatched' | 'at_hub' | 'with_driver' | 'at_pickup_point' | 'collected' | 'failed' | 'returned';

export const DELIVERY_STATUS_ORDER: DeliveryStatus[] = ['booked', 'dispatched', 'at_hub', 'with_driver', 'at_pickup_point', 'collected'];

export const DELIVERY_STATUS_LABEL: Record<DeliveryStatus, string> = {
  booked: 'Booking confirmed',
  dispatched: 'Dispatched',
  at_hub: 'Arrived at hub',
  with_driver: 'Out for delivery',
  at_pickup_point: 'Ready for pickup',
  collected: 'Collected',
  failed: 'Delivery failed',
  returned: 'Returned to sender',
};

export type PickupPoint = {
  id: number;
  name: string;
  address: string;
  town: string;
  lat: number;
  lng: number;
  operating_hours: string | null;
};

export type DeliveryStatusEvent = {
  id: number;
  status: DeliveryStatus;
  occurred_at: string;
  notes: string | null;
};

export type Delivery = {
  id: number;
  order_id: number;
  status: DeliveryStatus;
  estimated_arrival: string | null;
  pickup_point: PickupPoint;
  status_events: DeliveryStatusEvent[];
};

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
    throw new Error(body?.message ?? `Delivery request failed (${response.status})`);
  }

  const { data } = await response.json();
  return data as T;
}

export const deliveryApi = {
  searchPickupPoints: (lat: number, lng: number, radiusKm = 10) =>
    request<PickupPoint[]>(`/delivery/pickup-points?lat=${lat}&lng=${lng}&radius_km=${radiusKm}`),

  createDelivery: (orderId: number, pickupPointId: number) =>
    request<Delivery>(`/orders/${orderId}/delivery`, {
      method: 'POST',
      body: JSON.stringify({ pickup_point_id: pickupPointId }),
    }),

  getDelivery: (orderId: number) => request<Delivery>(`/orders/${orderId}/delivery`),
};
