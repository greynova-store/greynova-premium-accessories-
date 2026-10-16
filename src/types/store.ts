export type UserRole = 'customer' | 'staff' | 'admin' | 'super_admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  user: UserProfile & { role: UserRole; username?: string };
  token: string;
}

export interface Address {
  id: string;
  user_id?: string;
  recipient_name: string;
  phone_number: string;
  street_address: string;
  apartment?: string;
  city: string;
  state_province?: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  delivery_instructions?: string;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_name: string;
  display_order: number;
  is_active: boolean;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductVariant {
  sku: string;
  title: string;
  price?: number;
  stock: number;
  color?: string;
  size?: string;
  material?: string;
  device_compatibility?: string;
}

export interface ProductImage {
  id: string;
  image_url: string;
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  category_name?: string;
  brand?: string;
  name: string;
  slug: string;
  tagline?: string;
  description: string;
  specifications: ProductSpecification[];
  price: number;
  sale_price?: number | null;
  currency: string;
  sku: string;
  stock_quantity: number;
  low_stock_threshold: number;
  shipping_fee?: number;
  is_published: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  rating: number;
  reviews_count: number;
  images: ProductImage[];
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  cta_text?: string;
  badge_text?: string;
  banner_type: 'hero' | 'promo' | 'announcement';
  is_active: boolean;
  display_order: number;
}

export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  variant_sku?: string;
  variant?: ProductVariant;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CartCalculation {
  items: CartItem[];
  subtotal: number;
  delivery_charge: number;
  free_shipping_threshold: number;
  amount_for_free_shipping: number;
  discount_amount: number;
  total: number;
  currency: string;
  items_count: number;
  out_of_stock_warnings: string[];
}

export type OrderStatus =
  | 'pending_confirmation'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'unpaid'
  | 'pending_verification'
  | 'paid'
  | 'failed'
  | 'refunded';

export type PaymentMethod =
  | 'cash_on_delivery'
  | 'stripe'
  | 'jazzcash'
  | 'easypaisa'
  | 'bank_transfer';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  variant_title?: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: Address;
  subtotal: number;
  delivery_charge: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  notes?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface StoreSettings {
  shipping: {
    standard_charge: number;
    free_shipping_threshold: number;
    estimated_days: string;
    cod_enabled: boolean;
  };
  contact: {
    email: string;
    phone: string;
    hours: string;
    address: string;
  };
  payments: {
    cod_active: boolean;
    online_provider: string;
    online_active: boolean;
    sandbox_mode: boolean;
    provider_configured: boolean;
  };
}

export interface AdminMetrics {
  total_members?: number;
  total_customers?: number;
  total_products?: number;
  active_products?: number;
  published_products?: number;
  unpublished_products?: number;
  low_stock_products?: number;
  total_orders: number;
  total_products_sold?: number;
  total_sales: number;
  paid_sales?: number;
  cod_pending_sales?: number;
  pending_orders: number;
  delivered_orders?: number;
  cancelled_orders?: number;
  recent_orders: Order[];
  recent_members?: Array<{
    id: string;
    email: string;
    full_name: string;
    phone_number?: string;
    created_at: string;
  }>;
}
