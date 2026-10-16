import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/layout/Navbar';
import { HeroBanner } from './components/store/HeroBanner';
import { CategoryStrip } from './components/store/CategoryStrip';
import { ProductCard } from './components/store/ProductCard';
import { ProductDetailModal } from './components/store/ProductDetailModal';
import { CartDrawer } from './components/store/CartDrawer';
import { CheckoutModal } from './components/store/CheckoutModal';
import { OrderSuccessModal } from './components/store/OrderSuccessModal';
import { CustomerDashboard } from './components/store/CustomerDashboard';
import { AdminPanel } from './components/admin/AdminPanel';
import { PolicyModals } from './components/store/PolicyModals';
import { Footer } from './components/layout/Footer';
import { ToastProvider, useToast } from './components/ui/Toast';
import { ProductGridSkeleton } from './components/ui/Skeleton';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { api, getStoredToken, setStoredToken } from './services/api';
import {
  Category,
  Product,
  Banner,
  CartCalculation,
  UserProfile,
  UserRole,
  Address,
  Order,
} from './types/store';
import { Filter, ArrowUpDown, ShoppingBag, ShieldCheck, Search, Sparkles, Package } from 'lucide-react';

function getCleanRoute(): string {
  if (typeof window === 'undefined') return '/';
  const hash = window.location.hash.replace(/^#/, '');
  if (hash.startsWith('/')) return hash;
  if (['login', 'signup', 'forgot-password', 'admin', 'orders', 'account', 'cart', 'checkout'].includes(hash)) {
    return `/${hash}`;
  }
  const path = window.location.pathname;
  return path || '/';
}

function StoreApp() {
  const [currentRoute, setCurrentRoute] = useState<string>(getCleanRoute);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // User & Auth State
  const [user, setUser] = useState<(UserProfile & { role: UserRole; username?: string }) | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Cart State (stored locally as product_id, variant_sku, quantity, recalculated on server)
  const [cartRawItems, setCartRawItems] = useState<Array<{ product_id: string; variant_sku?: string; quantity: number }>>(() => {
    try {
      const saved = localStorage.getItem('greynova_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cartCalculation, setCartCalculation] = useState<CartCalculation | null>(null);

  // Wishlist State
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('greynova_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');

  // Modals & Panels
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState<string | null>(null);

  const { success, error: toastError, info } = useToast();

  // Navigation handler with history push and scroll reset
  const navigate = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentRoute(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen to browser forward/back buttons & hash changes
  useEffect(() => {
    const handleLocationChange = () => {
      const route = getCleanRoute();
      setCurrentRoute(route);
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Load Initial Store Data & Session
  useEffect(() => {
    checkCurrentUser();
    loadCatalog();
  }, []);

  // Route-Based Security Guard & View Controller
  useEffect(() => {
    if (isAuthLoading) return;

    if (currentRoute === '/admin') {
      if (!user) {
        setIsAdminOpen(false);
        navigate('/login');
        toastError('Access Restricted', 'Please sign in with administrator credentials.');
      } else if (user.role !== 'admin' && user.role !== 'super_admin') {
        setIsAdminOpen(false);
        navigate('/account');
        toastError('Access Denied', 'Administrator privileges are required to access /admin.');
      } else {
        setIsAdminOpen(true);
      }
    } else {
      setIsAdminOpen(false);
    }

    if (currentRoute === '/orders' || currentRoute === '/account') {
      if (!user) {
        setIsDashboardOpen(false);
        navigate('/login');
        info('Sign In Required', 'Please sign in to access your customer orders.');
      } else {
        setIsDashboardOpen(true);
      }
    } else {
      setIsDashboardOpen(false);
    }

    if (currentRoute === '/cart') {
      setIsCartOpen(true);
    }
  }, [currentRoute, user, isAuthLoading, navigate, toastError, info]);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('greynova_cart_items', JSON.stringify(cartRawItems));
    recalculateCart();
  }, [cartRawItems]);

  // Save wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('greynova_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const checkCurrentUser = async () => {
    setIsAuthLoading(true);
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setIsAuthLoading(false);
      return;
    }
    try {
      const res = await api.me();
      setUser(res.user);
    } catch {
      setStoredToken(null);
      setUser(null);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const loadCatalog = async () => {
    setLoadingProducts(true);
    try {
      const [prodRes, catRes, banRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getBanners(),
      ]);
      setProducts(prodRes.products || []);
      setCategories(catRes.categories || []);
      setBanners(banRes.banners || []);
    } catch (err: any) {
      toastError('Catalog Error', 'Failed to load live product inventory.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const recalculateCart = async () => {
    if (cartRawItems.length === 0) {
      setCartCalculation(null);
      return;
    }
    try {
      const calc = await api.calculateCart(cartRawItems);
      setCartCalculation(calc);
    } catch (err) {
      console.error('Failed to calculate cart:', err);
    }
  };

  // Cart Operations
  const handleAddToCart = useCallback((product: Product, variantSku?: string, quantity: number = 1) => {
    setCartRawItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.product_id === product.id && item.variant_sku === variantSku
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product_id: product.id, variant_sku: variantSku, quantity }];
      }
    });

    success('Added to Bag', `${product.name} added to your shopping cart.`);
  }, [success]);

  const handleUpdateCartQuantity = useCallback((productId: string, variantSku: string | undefined, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId, variantSku);
      return;
    }
    setCartRawItems(prev =>
      prev.map(item =>
        item.product_id === productId && item.variant_sku === variantSku
          ? { ...item, quantity: newQty }
          : item
      )
    );
  }, []);

  const handleRemoveCartItem = useCallback((productId: string, variantSku?: string) => {
    setCartRawItems(prev =>
      prev.filter(item => !(item.product_id === productId && item.variant_sku === variantSku))
    );
    info('Item Removed', 'Product removed from your cart.');
  }, [info]);

  const handleBuyNow = useCallback((product: Product, variantSku?: string, quantity: number = 1) => {
    handleAddToCart(product, variantSku, quantity);
    setDetailProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }, [handleAddToCart]);

  // Wishlist Operation
  const handleToggleWishlist = useCallback((productId: string) => {
    setWishlistIds(prev => {
      if (prev.includes(productId)) {
        info('Wishlist Updated', 'Removed item from your wishlist.');
        return prev.filter(id => id !== productId);
      } else {
        success('Saved to Wishlist', 'Item saved to your private wishlist.');
        return [...prev, productId];
      }
    });
  }, [info, success]);

  // Sign out handler
  const handleLogout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
    info('Signed Out', 'You have been signed out.');
  }, [info]);

  // Checkout submission handler
  const handleOrderSubmit = async (payload: any) => {
    const res = await api.createOrder(payload);
    // Clear cart upon successful order
    setCartRawItems([]);
    return res.order;
  };

  // Filtered and Sorted Products
  const displayedProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory) {
      result = result.filter(p => {
        const cat = categories.find(c => c.slug === selectedCategory);
        return p.category_id === cat?.id;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price_asc') {
      result.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price));
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy, categories]);

  const cartCount = useMemo(() => {
    return cartRawItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartRawItems]);

  // DEDICATED AUTH ROUTE: /login
  if (currentRoute === '/login') {
    return (
      <>
        <LoginPage
          onSuccess={loggedUser => {
            setUser(loggedUser);
            if (loggedUser.role === 'admin' || loggedUser.role === 'super_admin') {
              setIsAdminOpen(true);
              navigate('/admin');
            } else {
              setIsDashboardOpen(true);
              navigate('/account');
            }
          }}
          onNavigate={navigate}
        />
        <PolicyModals
          policy={activePolicy}
          onClose={() => setActivePolicy(null)}
        />
      </>
    );
  }

  // DEDICATED AUTH ROUTE: /signup
  if (currentRoute === '/signup') {
    return (
      <>
        <SignupPage
          onSuccess={loggedUser => {
            setUser(loggedUser);
            setIsDashboardOpen(true);
            navigate('/account');
          }}
          onNavigate={navigate}
          onOpenPolicy={policy => setActivePolicy(policy)}
        />
        <PolicyModals
          policy={activePolicy}
          onClose={() => setActivePolicy(null)}
        />
      </>
    );
  }

  // DEDICATED AUTH ROUTE: /forgot-password
  if (currentRoute === '/forgot-password') {
    return (
      <>
        <ForgotPasswordPage onNavigate={navigate} />
        <PolicyModals
          policy={activePolicy}
          onClose={() => setActivePolicy(null)}
        />
      </>
    );
  }

  // Loading state when checking admin authorization directly
  if (currentRoute === '/admin' && isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 text-white">
        <div className="w-10 h-10 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 mb-4 animate-pulse">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold tracking-tight">Verifying Administrator Access...</p>
        <p className="text-xs text-neutral-500 mt-1">Checking server authorization role</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 selection:bg-neutral-200">
      
      {/* 1. Header & Navigation */}
      <Navbar
        cartCount={cartCount}
        wishlistCount={wishlistIds.length}
        user={user}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => {
          if (user) {
            setIsDashboardOpen(true);
          } else {
            navigate('/login');
          }
        }}
        onNavigate={navigate}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onSelectCategory={catSlug => setSelectedCategory(catSlug)}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        onSearchChange={q => setSearchQuery(q)}
        onOpenPolicy={policy => setActivePolicy(policy)}
        onLogout={handleLogout}
      />

      {/* 2. Main Content */}
      <main className="flex-1">
        
        {/* Hero Banner (Only when not in specific search or category filtering) */}
        {!selectedCategory && !searchQuery && (
          <HeroBanner
            onShopNow={() => {
              const el = document.getElementById('catalog-grid');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            onSelectCategory={slug => setSelectedCategory(slug)}
          />
        )}

        {/* Categories Strip */}
        <CategoryStrip
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={slug => setSelectedCategory(slug)}
        />

        {/* 3. Catalog Section */}
        <section id="catalog-grid" className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
          
          {/* Section Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                {selectedCategory
                  ? categories.find(c => c.slug === selectedCategory)?.name || 'Hardware'
                  : 'Precision Mobile Accessories'}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-neutral-500 mt-1">
                <span>{displayedProducts.length} items available</span>
                <span aria-hidden="true">·</span>
                <span>Prices in PKR</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 font-medium">Doorstep Cash on Delivery</span>
              </div>
            </div>

            {/* Sorting Filter Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-neutral-500 flex items-center gap-1 font-medium">
                <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
              </span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="text-xs font-semibold px-3 py-2 bg-white border border-neutral-200 rounded-xl text-neutral-800 focus:outline-none focus:border-neutral-900 shadow-xs cursor-pointer min-h-[40px]"
              >
                <option value="featured">Featured First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Active Search Badge */}
          {searchQuery && (
            <div className="mb-6 flex items-center justify-between p-3 bg-neutral-100 rounded-xl text-xs text-neutral-700">
              <span>Showing search results for <b>"{searchQuery}"</b></span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-neutral-500 hover:text-neutral-900 underline font-medium p-1 min-h-[36px]"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Product Cards Grid - Mobile First Responsive Column Adjustment */}
          {loadingProducts ? (
            <ProductGridSkeleton count={8} />
          ) : products.length === 0 ? (
            <div className="py-16 sm:py-24 text-center bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-12 space-y-4 max-w-2xl mx-auto shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-neutral-100 border border-neutral-200/80 flex items-center justify-center mx-auto text-neutral-400">
                <Package className="w-8 h-8 text-neutral-500" />
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-medium tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Curated Retail Hardware</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                  New products coming soon
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
                  Our flagship Grade 5 titanium cases, GaN III fast chargers, and acoustic gear are currently being curated. Check back shortly for official inventory releases.
                </p>
              </div>

              {(user?.role === 'admin' || user?.role === 'super_admin') ? (
                <div className="pt-2">
                  <button
                    onClick={() => setIsAdminOpen(true)}
                    className="px-6 py-3 bg-neutral-900 text-white text-xs font-semibold rounded-2xl hover:bg-neutral-800 transition-colors shadow-sm inline-flex items-center gap-2 min-h-[44px]"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Publish Products in Admin Panel</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      navigate('/login');
                      info('Admin Access', 'Sign in as administrator to manage and publish store products.');
                    }}
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-medium rounded-xl transition-colors inline-flex items-center gap-1.5 min-h-[40px]"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Administrator Access</span>
                  </button>
                </div>
              )}
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-800">No matching accessories found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                Try clearing your search query or reset the category filter to explore our full titanium and GaN hardware lineup.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery('');
                }}
                className="mt-2 px-5 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors min-h-[44px]"
              >
                Reset Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {displayedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetail={p => setDetailProduct(p)}
                  onQuickAdd={p => handleAddToCart(p)}
                  isWishlisted={wishlistIds.includes(product.id)}
                  onToggleWishlist={id => handleToggleWishlist(id)}
                />
              ))}
            </div>
          )}

        </section>

        {/* Secondary Free Delivery Highlight Strip */}
        <section className="bg-neutral-900 text-white py-10 sm:py-12 px-4 sm:px-6 border-y border-neutral-800">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[11px] font-mono tracking-widest text-neutral-400 uppercase">
                GreyNova Guarantee
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Same-Day Dispatch & Doorstep Inspection
              </h3>
              <p className="text-xs text-neutral-400 max-w-xl leading-relaxed">
                Orders placed before 3:00 PM are dispatched same-day via express air courier. Inspect your parcel before handing cash on delivery to the courier rider.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <button
                onClick={() => setActivePolicy('shipping')}
                className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-2xl border border-neutral-700 transition-colors whitespace-nowrap min-h-[44px]"
              >
                View Shipping Rates
              </button>
              <button
                onClick={() => setActivePolicy('warranty')}
                className="px-5 py-3 bg-white hover:bg-neutral-100 text-neutral-900 text-xs font-semibold rounded-2xl transition-colors whitespace-nowrap min-h-[44px]"
              >
                1-Year Warranty Terms
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* 4. Footer */}
      <Footer
        onOpenPolicy={policy => setActivePolicy(policy)}
        onSelectCategory={slug => {
          setSelectedCategory(slug);
          window.scrollTo({ top: 350, behavior: 'smooth' });
        }}
      />

      {/* 5. Modals & Overlays */}
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onAddToCart={(p, v, q) => handleAddToCart(p, v, q)}
        onBuyNow={(p, v, q) => handleBuyNow(p, v, q)}
        isWishlisted={detailProduct ? wishlistIds.includes(detailProduct.id) : false}
        onToggleWishlist={id => handleToggleWishlist(id)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => {
          setIsCartOpen(false);
          if (currentRoute === '/cart') navigate('/');
        }}
        cartCalculation={cartCalculation}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartCalculation={cartCalculation}
        user={user}
        savedAddresses={[]}
        onSubmitOrder={handleOrderSubmit}
        onOrderSuccess={order => {
          setIsCheckoutOpen(false);
          setOrderSuccess(order);
        }}
      />

      <OrderSuccessModal
        order={orderSuccess}
        onClose={() => setOrderSuccess(null)}
        onViewOrders={() => {
          setOrderSuccess(null);
          setIsDashboardOpen(true);
        }}
      />

      <CustomerDashboard
        isOpen={isDashboardOpen}
        onClose={() => {
          setIsDashboardOpen(false);
          if (currentRoute === '/orders' || currentRoute === '/account') navigate('/');
        }}
        user={user}
        onLogout={handleLogout}
        onOpenProduct={p => setDetailProduct(p)}
        onAddToCart={p => handleAddToCart(p)}
      />

      <AdminPanel
        isOpen={isAdminOpen && (user?.role === 'admin' || user?.role === 'super_admin')}
        onClose={() => {
          setIsAdminOpen(false);
          if (currentRoute === '/admin') navigate('/');
        }}
        onRefreshCatalog={loadCatalog}
        onLogout={() => {
          handleLogout();
          setIsAdminOpen(false);
          navigate('/login');
        }}
      />

      <PolicyModals
        policy={activePolicy}
        onClose={() => setActivePolicy(null)}
      />

    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <StoreApp />
    </ToastProvider>
  );
}
