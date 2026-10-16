# GreyNova — Premium Mobile Accessories E-Commerce

> **Tagline:** Premium Accessories. Smarter Everyday.  
> **Brand:** GreyNova  
> **Currency:** Pakistani Rupee (PKR, Rs.)

GreyNova is a full-stack, production-grade e-commerce application engineered for retail mobile accessories (Titanium Phone Cases, 100W GaN Fast Chargers, ANC Wireless Earbuds, Magnetic Power Banks, Braided Cables, and 9H Sapphire Screen Protectors).

---

## 1. Architecture & Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Plus Jakarta Sans & JetBrains Mono typography.
- **Backend Runtime:** Node.js Express server (`server.ts`) with Vite middleware mounting in development mode (`npm run dev`) and static production serving.
- **Database & Storage:** Supabase PostgreSQL with complete 16-table schema, foreign keys, and strict Row Level Security (RLS) policies. Includes a zero-config local persistent engine fallback for instant review.
- **Authentication:** Supabase Auth & JWT with database-backed server-verified user roles (`super_admin`, `admin`, `staff`, `customer`).
- **Payment Abstraction:** Cash on Delivery (COD) as primary checkout method nationwide across Pakistan, plus an extensible server-side payment provider abstraction (Stripe, JazzCash, EasyPaisa) with signed webhooks and idempotency.

---

## 2. PostgreSQL 16-Table Database Schema

The complete migration file is located at:
```bash
/supabase/migrations/20261016000000_greynova_schema.sql
```

Tables included with Row Level Security:
1. `profiles` — Customer and staff public profiles
2. `user_roles` — Isolated database-backed roles (`super_admin`, `admin`, `customer`)
3. `addresses` — Customer saved shipping addresses
4. `categories` — Active hardware categories
5. `products` — Published and draft catalog items with PKR pricing, specifications, and SKU
6. `product_images` — Image gallery records and display orders
7. `banners` — Promotional and hero banners
8. `carts` — User and guest shopping carts
9. `cart_items` — Quantity and variant references
10. `orders` — Atomic order records with status tracking
11. `order_items` — Itemized order lines with snapshot pricing
12. `payments` — Transaction records and provider references
13. `payment_webhook_events` — Idempotency ledger for webhook verification
14. `store_settings` — Shipping thresholds, COD status, and store policies
15. `wishlists` — Customer wishlists
16. `wishlist_items` — Wishlist item mappings

### Row Level Security (RLS) Principles
- **Public:** Can only read active categories, published products, and active banners.
- **Customers:** Isolated to their own profile, addresses, carts, wishlists, and orders. Cannot modify order totals, payment status, or user roles.
- **Admins:** Full CRUD operations across inventory, orders, and store parameters. Verified strictly via `public.is_admin()` security definer function.

---

## 3. Initial Administrator Setup (`tanoli`)

The store owner username is `tanoli` (`ashabir948@gmail.com`).

### Server-Side Bootstrap
The initial administrator is securely bootstrapped on the server via `POST /api/auth/bootstrap-admin`.

```bash
curl -X POST http://localhost:3000/api/auth/bootstrap-admin \
  -H "Content-Type: application/json" \
  -d '{
    "bootstrap_token": "greynova-tanoli-init-2026",
    "email": "ashabir948@gmail.com",
    "password": "YOUR_STRONG_PASSWORD"
  }'
```

In the web interface:
1. Click **Sign In** in the top navigation bar.
2. Under "One-Click Demo Credentials", click **Owner (Tanoli)**.
3. Or click **Initial Admin Bootstrap Tool** to supply a custom password and server bootstrap token.
4. Once authenticated, click the **Admin** shield button in the navbar to open the protected Administrator Suite.

---

## 4. Cash on Delivery (COD) & Payment Provider Abstraction

- **Cash on Delivery (COD):** Starts as `order_status: pending_confirmation` and `payment_status: unpaid`. Payment is only marked `paid` when courier collects cash upon parcel delivery.
- **Online Providers:** Supported via `/api/payments/create-session`. If provider secret keys are not configured in environment variables, the system displays a clear notice:
  > *"Online payment provider credentials are not configured on the server. Cash on Delivery is active and available."*
- **Webhook Security:** Webhooks received at `/api/payments/webhook` are checked against `payment_webhook_events` to prevent duplicate payment processing (idempotency).

---

## 5. Automated Security Test Suite

The administrator panel features a built-in automated test runner:
1. **Customer Isolation:** Validates that Customer A cannot query Customer B's orders.
2. **Role Enforcement:** Verifies that non-admin tokens receive HTTP 403 on admin endpoints.
3. **Price Tampering Protection:** Confirms that client-supplied item totals are ignored in favor of server-side database calculation.
4. **COD Lifecycle:** Assures that new Cash on Delivery orders initialize in `pending_confirmation` and `unpaid` states.

Run it live from **Admin Panel → Security & RLS Tests → Execute Security Suite**.

---

## 6. Environment Variables (`.env.example`)

```env
# Client Variables
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
VITE_STORE_CURRENCY="PKR"
VITE_STORE_CURRENCY_SYMBOL="Rs."

# Server Secrets (Never exposed to browser bundle)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_PUBLISHABLE_KEY="your-anon-public-key"
SUPABASE_SECRET_KEY="your-service-role-secret-key"

# Payment Gateway
PAYMENT_PROVIDER="manual_cod"
PAYMENT_PROVIDER_SECRET_KEY="sk_test_..."
PAYMENT_WEBHOOK_SECRET="whsec_..."

# Initial Admin Bootstrap
ADMIN_BOOTSTRAP_TOKEN="greynova-tanoli-init-2026"
PORT=3000
```
