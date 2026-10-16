import {
  Category,
  Product,
  Banner,
  CartCalculation,
  Order,
  UserProfile,
  UserRole,
  Address,
  StoreSettings,
  AdminMetrics,
} from '../types/store';

const API_BASE = '/api';

export function getStoredToken(): string | null {
  return localStorage.getItem('greynova_token');
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem('greynova_token', token);
  } else {
    localStorage.removeItem('greynova_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Config
  getConfig: () => request<{
    brand: string;
    tagline: string;
    currency: string;
    currency_symbol: string;
    supabase_configured: boolean;
    payment_provider: string;
    payment_online_active: boolean;
    payment_cod_active: boolean;
    sandbox_mode: boolean;
  }>('/config'),

  // Auth
  register: (payload: { email: string; password: string; full_name: string; phone_number?: string }) =>
    request<{ message: string; token: string; user: UserProfile & { role: UserRole; username?: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ message: string; token: string; user: UserProfile & { role: UserRole; username?: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  adminLogin: (payload: { username?: string; email?: string; password: string }) =>
    request<{ message: string; token: string; user: UserProfile & { role: UserRole; username?: string } }>('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  me: () =>
    request<{ user: UserProfile & { role: UserRole; username?: string } }>('/auth/me'),

  bootstrapAdmin: (payload: { bootstrap_token: string; email: string; password: string; full_name?: string }) =>
    request<{ message: string; token: string; user: UserProfile & { role: UserRole; username?: string } }>('/auth/bootstrap-admin', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Catalog
  getCategories: () =>
    request<{ categories: Category[] }>('/categories'),

  getBanners: () =>
    request<{ banners: Banner[] }>('/banners'),

  getProducts: (params?: {
    category?: string;
    search?: string;
    sort?: string;
    featured?: boolean;
    new_arrival?: boolean;
    limit?: number;
    offset?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.sort) query.set('sort', params.sort);
    if (params?.featured) query.set('featured', 'true');
    if (params?.new_arrival) query.set('new_arrival', 'true');
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());
    const qStr = query.toString();
    return request<{ products: Product[]; total: number; limit: number; offset: number }>(`/products${qStr ? `?${qStr}` : ''}`);
  },

  getProduct: (slugOrId: string) =>
    request<{ product: Product }>(`/products/${slugOrId}`),

  // Cart
  calculateCart: (items: Array<{ product_id: string; variant_sku?: string; quantity: number }>) =>
    request<CartCalculation>('/cart/calculate', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),

  // Orders
  createOrder: (payload: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: Address;
    items: Array<{ product_id: string; variant_title?: string; quantity: number }>;
    payment_method: string;
    notes?: string;
  }) =>
    request<{ message: string; order: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMyOrders: () =>
    request<{ orders: Order[] }>('/orders/my-orders'),

  getOrder: (idOrNumber: string) =>
    request<{ order: Order }>(`/orders/${idOrNumber}`),

  cancelOrder: (orderId: string, reason?: string) =>
    request<{ message: string; order: Order }>(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // Wishlist & Addresses
  getWishlist: () =>
    request<{ wishlist: Product[] }>('/wishlist'),

  toggleWishlist: (productId: string) =>
    request<{ wishlist: Product[]; in_wishlist: boolean }>('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    }),

  getAddresses: () =>
    request<{ addresses: Address[] }>('/addresses'),

  addAddress: (address: Partial<Address>) =>
    request<{ address: Address }>('/addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    }),

  // Payments
  createPaymentSession: (orderId: string, provider?: string) =>
    request<{
      status: string;
      provider: string;
      session_id?: string;
      checkout_url?: string | null;
      message: string;
      fallback_to_cod?: boolean;
    }>('/payments/create-session', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, provider }),
    }),

  // Admin
  getAdminMetrics: () =>
    request<{ metrics: AdminMetrics }>('/admin/metrics'),

  getAdminProducts: () =>
    request<{ products: Product[] }>('/admin/products'),

  createAdminProduct: (productData: Partial<Product>) =>
    request<{ message: string; product: Product }>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),

  updateAdminProduct: (id: string, productData: Partial<Product>) =>
    request<{ message: string; product: Product }>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    }),

  deleteAdminProduct: (id: string) =>
    request<{ message: string }>(`/admin/products/${id}`, {
      method: 'DELETE',
    }),

  getAdminOrders: () =>
    request<{ orders: Order[] }>('/admin/orders'),

  updateAdminOrderStatus: (orderId: string, order_status?: string, payment_status?: string) =>
    request<{ message: string; order: Order }>(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ order_status, payment_status }),
    }),

  getAdminSettings: () =>
    request<{ settings: StoreSettings }>('/admin/settings'),

  updateAdminSettings: (settings: Partial<StoreSettings>) =>
    request<{ message: string; settings: StoreSettings }>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  uploadAdminImage: (base64Image: string, filename?: string) =>
    request<{ image_url: string; filename: string; message: string }>('/admin/upload', {
      method: 'POST',
      body: JSON.stringify({ image_base64: base64Image, filename }),
    }),

  runSecurityTests: () =>
    request<{
      suite: string;
      timestamp: string;
      results: Array<{ test: string; passed: boolean; detail: string }>;
      all_passed: boolean;
    }>('/admin/test-security'),
};
