-- ==============================================================================
-- GreyNova: Premium Mobile Accessories E-Commerce Schema
-- Migration: 20261016000000_greynova_schema.sql
-- Description: Complete 16-table PostgreSQL schema with strict Row Level Security (RLS)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN
  CREATE TYPE user_role_type AS ENUM ('customer', 'staff', 'admin', 'super_admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE order_status_type AS ENUM (
    'pending_confirmation',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status_type AS ENUM (
    'unpaid',
    'pending_verification',
    'paid',
    'failed',
    'refunded'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method_type AS ENUM (
    'cash_on_delivery',
    'stripe',
    'jazzcash',
    'easypaisa',
    'bank_transfer'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. PROFILES TABLE (Customer & Admin User Profiles)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. USER ROLES TABLE (Separated from user-editable profiles for strict security)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role_type NOT NULL DEFAULT 'customer',
  username TEXT UNIQUE,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT user_roles_user_unique UNIQUE (user_id)
);

-- 5. ADDRESSES TABLE (Customer Saved Delivery Addresses)
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  street_address TEXT NOT NULL,
  apartment TEXT,
  city TEXT NOT NULL,
  state_province TEXT,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Pakistan',
  is_default BOOLEAN NOT NULL DEFAULT false,
  delivery_instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT,
  description TEXT NOT NULL,
  specifications JSONB DEFAULT '[]'::jsonb,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  sale_price NUMERIC(12, 2) CHECK (sale_price IS NULL OR sale_price >= 0),
  currency TEXT NOT NULL DEFAULT 'PKR',
  sku TEXT NOT NULL UNIQUE,
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INT NOT NULL DEFAULT 5,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_new_arrival BOOLEAN NOT NULL DEFAULT false,
  is_best_seller BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(3, 2) DEFAULT 4.90,
  reviews_count INT DEFAULT 0,
  variants JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. BANNERS TABLE (Promotions, Hero, Announcements)
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  cta_text TEXT,
  badge_text TEXT,
  banner_type TEXT NOT NULL DEFAULT 'hero', -- 'hero', 'promo', 'announcement'
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. CARTS TABLE
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE, -- for guest carts before signup
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT carts_user_or_session CHECK (user_id IS NOT NULL OR session_token IS NOT NULL)
);

-- 11. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_sku TEXT,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT cart_items_unique_item UNIQUE (cart_id, product_id, variant_sku)
);

-- 12. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
  delivery_charge NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (delivery_charge >= 0),
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  currency TEXT NOT NULL DEFAULT 'PKR',
  order_status order_status_type NOT NULL DEFAULT 'pending_confirmation',
  payment_status payment_status_type NOT NULL DEFAULT 'unpaid',
  payment_method payment_method_type NOT NULL DEFAULT 'cash_on_delivery',
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  variant_title TEXT,
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_provider TEXT NOT NULL, -- 'manual_cod', 'stripe', 'jazzcash', 'easypaisa'
  transaction_reference TEXT,
  provider_session_id TEXT,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'PKR',
  payment_status payment_status_type NOT NULL DEFAULT 'unpaid',
  raw_provider_payload JSONB,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. PAYMENT WEBHOOK EVENTS TABLE (Idempotency and Audit Trail)
CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  is_processed BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT payment_webhook_unique_event UNIQUE (provider, event_id)
);

-- 16. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 17. WISHLISTS TABLE
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT wishlists_user_unique UNIQUE (user_id)
);

-- 18. WISHLIST ITEMS TABLE
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT wishlist_items_unique UNIQUE (wishlist_id, product_id)
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_published ON products(is_published);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_webhook_provider_event ON payment_webhook_events(provider, event_id);

-- ==============================================================================
-- SECURITY HELPER FUNCTIONS
-- ==============================================================================

-- Function to check if current authenticated user is an administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
  );
$$;

-- Trigger to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger across tables
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN (
    'profiles', 'addresses', 'categories', 'products', 'banners', 'carts', 'cart_items', 'orders', 'payments', 'store_settings'
  ) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS tr_set_updated_at ON %I;', t);
    EXECUTE format('CREATE TRIGGER tr_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();', t);
  END LOOP;
END;
$$;

-- Function to auto-create profile and role on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  initial_role user_role_type := 'customer';
  user_name_val TEXT;
BEGIN
  user_name_val := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

  -- Profile creation
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, user_name_val)
  ON CONFLICT (id) DO NOTHING;

  -- Initial owner bootstrap check: if email is owner email, grant super_admin
  IF NEW.email = 'tanoli@gmail.com' OR NEW.email = 'ashabir948@gmail.com' OR NEW.raw_user_meta_data->>'username' = 'tanoli' THEN
    initial_role := 'super_admin';
  END IF;

  INSERT INTO public.user_roles (user_id, role, username)
  VALUES (
    NEW.id,
    initial_role,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

  -- Create empty cart and wishlist
  INSERT INTO public.carts (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.wishlists (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users (Supabase Auth)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all 16 public tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. USER ROLES (Read-only for user, admin-managed only)
CREATE POLICY "Users can read own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Only admins can modify roles" ON user_roles
  FOR ALL USING (public.is_admin());

-- 3. ADDRESSES
CREATE POLICY "Users can manage own addresses" ON addresses
  FOR ALL USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id);

-- 4. CATEGORIES
CREATE POLICY "Public can view active categories" ON categories
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (public.is_admin());

-- 5. PRODUCTS
CREATE POLICY "Public can view published products" ON products
  FOR SELECT USING (is_published = true OR public.is_admin());

CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (public.is_admin());

-- 6. PRODUCT IMAGES
CREATE POLICY "Public can view product images" ON product_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_images.product_id
        AND (products.is_published = true OR public.is_admin())
    )
  );

CREATE POLICY "Admins can manage product images" ON product_images
  FOR ALL USING (public.is_admin());

-- 7. BANNERS
CREATE POLICY "Public can view active banners" ON banners
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage banners" ON banners
  FOR ALL USING (public.is_admin());

-- 8. CARTS & CART ITEMS
CREATE POLICY "Users can manage own cart" ON carts
  FOR ALL USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart items" ON cart_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
        AND (carts.user_id = auth.uid() OR public.is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
        AND carts.user_id = auth.uid()
    )
  );

-- 9. ORDERS & ORDER ITEMS
-- Customers can view their own orders; admins can view & manage all
CREATE POLICY "Customers can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Customers cannot modify order totals or payment status" ON orders
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins have full access to orders" ON orders
  FOR ALL USING (public.is_admin());

CREATE POLICY "Customers can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Admins can manage order items" ON order_items
  FOR ALL USING (public.is_admin());

-- 10. PAYMENTS & WEBHOOKS
CREATE POLICY "Customers can view payments for own orders" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
        AND orders.user_id = auth.uid()
    ) OR public.is_admin()
  );

CREATE POLICY "Only admins can manage payments directly" ON payments
  FOR ALL USING (public.is_admin());

CREATE POLICY "Only admins can access webhook events" ON payment_webhook_events
  FOR ALL USING (public.is_admin());

-- 11. STORE SETTINGS
CREATE POLICY "Public can view public store settings" ON store_settings
  FOR SELECT USING (true);

CREATE POLICY "Only admins can update store settings" ON store_settings
  FOR ALL USING (public.is_admin());

-- 12. WISHLISTS & WISHLIST ITEMS
CREATE POLICY "Users can view and manage own wishlist" ON wishlists
  FOR ALL USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own wishlist items" ON wishlist_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
        AND (wishlists.user_id = auth.uid() OR public.is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
        AND wishlists.user_id = auth.uid()
    )
  );

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- Categories
INSERT INTO categories (id, name, slug, description, icon_name, display_order)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Phone Cases', 'phone-cases', 'Precision CNC and MagSafe titanium & aramid fiber cases.', 'Shield', 1),
  ('c1000000-0000-0000-0000-000000000002', 'Chargers', 'chargers', 'High-speed GaN III chargers with thermal management.', 'Zap', 2),
  ('c1000000-0000-0000-0000-000000000003', 'Earbuds', 'earbuds', 'Lossless audio ANC wireless earbuds in anodized alloy.', 'Headphones', 3),
  ('c1000000-0000-0000-0000-000000000004', 'Power Banks', 'power-banks', 'Ultra-slim magnetic wireless aerospace battery banks.', 'BatteryCharging', 4),
  ('c1000000-0000-0000-0000-000000000005', 'Cables', 'cables', 'Braided Kevlar-reinforced 240W USB-C and Lightning cables.', 'Cable', 5),
  ('c1000000-0000-0000-0000-000000000006', 'Screen Protectors', 'screen-protectors', '9H sapphire-infused tempered glass with installation rigs.', 'Smartphone', 6)
ON CONFLICT (slug) DO NOTHING;

-- Default Store Settings
INSERT INTO store_settings (key, value, description)
VALUES
  ('shipping', '{"standard_charge": 250, "free_shipping_threshold": 3500, "estimated_days": "2-4 Business Days", "cod_enabled": true}'::jsonb, 'Store shipping parameters in PKR'),
  ('contact', '{"email": "support@greynova.store", "phone": "+92 300 1234567", "hours": "Mon-Sat 10:00 AM - 8:00 PM PKT", "address": "GreyNova Flagship Tech Lab, Block 4, Clifton, Karachi"}'::jsonb, 'Official customer support contact details'),
  ('payments', '{"cod_active": true, "online_provider": "manual_cod", "online_active": false, "sandbox_mode": true}'::jsonb, 'Payment gateway configuration')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
