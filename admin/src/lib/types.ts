export type AdminUser = {
  id: number
  name: string
  email: string
  role: 'customer' | 'admin'
}

export type Paginated<T> = {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export type Category = {
  id: number
  parent_id: number | null
  name: string
  slug: string
  description: string | null
  is_active: boolean
}

export type Brand = {
  id: number
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  is_active: boolean
}

export type ProductVariant = {
  id?: number
  sku: string
  volume_ml: number
  price_cents: number
  stock_quantity: number
  is_active?: boolean
}

export type Product = {
  id: number
  brand_id: number
  category_id: number
  name: string
  slug: string
  description: string | null
  gender: 'men' | 'women' | 'unisex'
  thumbnail_url: string | null
  is_active: boolean
  brand?: Brand
  category?: Category
  variants: ProductVariant[]
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export type OrderItem = {
  id: number
  product_name: string
  sku: string
  unit_price_cents: number
  quantity: number
  subtotal_cents: number
}

export type Payment = {
  id: number
  order_id: number
  method: 'mpesa' | 'card' | 'pesalink' | 'wallet'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  amount_cents: number
  transaction_reference: string | null
  paid_at: string | null
  order?: Order
}

export type DeliveryStatusEvent = {
  id: number
  status: string
  occurred_at: string
  notes: string | null
}

export type PickupPoint = {
  id: number
  provider_point_id: string
  name: string
  address: string
  town: string
  lat: number
  lng: number
  operating_hours: string | null
  is_active: boolean
}

export type Delivery = {
  id: number
  order_id: number
  pickup_point_id: number
  provider_reference: string
  status: string
  estimated_arrival: string | null
  pickup_point?: PickupPoint
  status_events?: DeliveryStatusEvent[]
}

export type Order = {
  id: number
  user_id: number
  order_number: string
  status: OrderStatus
  subtotal_cents: number
  shipping_cents: number
  total_cents: number
  placed_at: string | null
  created_at: string
  user?: { id: number; name: string; email: string }
  items?: OrderItem[]
  payment?: Payment | null
  delivery?: Delivery | null
}

export type DashboardData = {
  revenue_cents: {
    today: number
    last_7_days: number
    last_30_days: number
  }
  orders_by_status: Record<string, number>
  low_stock_variants: (ProductVariant & { id: number; product: { name: string } })[]
  needs_attention: Order[]
}
