import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Product = {
  id: string
  name: string
  description: string | null
  price: number
  old_price: number | null
  image_url: string | null
  category: string
  available: boolean
  popularity_score: number
  order_count: number
  created_at: string
  updated_at: string
  avg_rating?: number
  review_count?: number
}

export type Review = {
  id: string
  product_id: string
  reviewer_name: string
  rating: number
  comment: string | null
  created_at: string
}

export type Order = {
  id: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  customer_address: string
  customer_location: string | null
  customer_lat: number | null
  customer_lng: number | null
  customer_location_address: string | null
  items: OrderItem[]
  total: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  payment_method: string
  payment_proof_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type OrderItem = {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export type Reservation = {
  id: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  party_size: number
  reservation_date: string
  reservation_time: string
  notes: string | null
  status: 'pending' | 'confirmed' | 'rejected' | 'waiting'
  deposit_amount: number | null
  deposit_proof_url: string | null
  created_at: string
  updated_at: string
}

export type Payment = {
  id: string
  method: string
  holder_name: string
  account_number: string
  extra_info: Record<string, string>
  active: boolean
}

export type NavbarItem = {
  id: string
  label: string
  path: string
  sort_order: number
  visible: boolean
}

export type Setting = {
  key: string
  value: Record<string, unknown>
}

export type CartItem = {
  product: Product
  quantity: number
}
