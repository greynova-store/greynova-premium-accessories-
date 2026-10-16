import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Package,
  ShoppingBag,
  AlertTriangle,
  Users,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Settings,
  Database,
  Lock,
  Layers,
  ChevronDown,
  ChevronUp,
  Upload,
  Image as ImageIcon,
  Star,
  BookOpen,
  Tag,
  Search,
  Sliders,
  CheckCircle2,
  LogOut,
} from 'lucide-react';
import { Product, Order, StoreSettings, AdminMetrics, Category } from '../../types/store';
import { api } from '../../services/api';
import { useToast } from '../ui/Toast';
import { useLoading } from '../../context/LoadingContext';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshCatalog: () => void;
  onLogout?: () => void;
}

type AdminSection = 'overview' | 'products' | 'orders' | 'settings' | 'security' | 'supabase';

export function AdminPanel({ isOpen, onClose, onRefreshCatalog, onLogout }: AdminPanelProps) {
  if (!isOpen) return null;

  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Product Inventory Filtering & Guide State
  const [productFilter, setProductFilter] = useState<'all' | 'published' | 'draft' | 'low_stock'>('all');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [showGuide, setShowGuide] = useState(true);

  // Product Add/Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'general' | 'photos' | 'variants' | 'specs'>('general');
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Security Test State
  const [securityTestResult, setSecurityTestResult] = useState<any | null>(null);
  const [runningSecurityTests, setRunningSecurityTests] = useState(false);

  const { success, error: toastError, info } = useToast();
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    startLoading('Loading administrator records...');
    try {
      const [mRes, pRes, oRes, sRes, cRes] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminProducts(),
        api.getAdminOrders(),
        api.getAdminSettings(),
        api.getCategories(),
      ]);
      setMetrics(mRes.metrics);
      setProducts(pRes.products || []);
      setOrders(oRes.orders || []);
      setSettings(sRes.settings);
      setCategories(cRes.categories || []);
    } catch (err: any) {
      toastError('Admin Error', err.message || 'Failed to load administrator data.');
      if (
        err.message?.includes('Access denied') ||
        err.message?.includes('Authentication required') ||
        err.message?.includes('privileges required') ||
        err.status === 401 ||
        err.status === 403
      ) {
        onClose();
      }
    } finally {
      setLoading(false);
      stopLoading();
    }
  };

  const handleTogglePublish = async (product: Product) => {
    try {
      const updated = await api.updateAdminProduct(product.id, {
        is_published: !product.is_published,
      });
      setProducts(prev => prev.map(p => (p.id === product.id ? updated.product : p)));
      success(
        updated.product.is_published ? 'Product Published' : 'Product Hidden',
        `"${product.name}" status updated in public storefront.`
      );
      onRefreshCatalog();
    } catch (err: any) {
      toastError('Failed to update product', err.message);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteAdminProduct(product.id);
      setProducts(prev => prev.filter(p => p.id !== product.id));
      success('Product Deleted', `Removed from store inventory.`);
      onRefreshCatalog();
    } catch (err: any) {
      toastError('Deletion Failed', err.message);
    }
  };

  const handleSaveProduct = async (e?: React.FormEvent, forcePublishStatus?: boolean) => {
    if (e) e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.name?.trim()) {
      toastError('Validation Error', 'Product name is required.');
      setActiveModalTab('general');
      return;
    }
    if (!editingProduct.sku?.trim()) {
      toastError('Validation Error', 'Product SKU is required.');
      setActiveModalTab('general');
      return;
    }
    if (editingProduct.price === undefined || editingProduct.price === null || isNaN(editingProduct.price)) {
      toastError('Validation Error', 'A valid regular price in PKR is required.');
      setActiveModalTab('general');
      return;
    }

    const payload: Partial<Product> = {
      ...editingProduct,
      is_published: forcePublishStatus !== undefined ? forcePublishStatus : Boolean(editingProduct.is_published),
      images: editingProduct.images && editingProduct.images.length > 0 ? editingProduct.images : [
        {
          id: 'img-default',
          image_url: '/src/assets/images/hero_accessories_showcase_1792129545783.jpg',
          is_primary: true,
          display_order: 1,
        },
      ],
    };

    try {
      if (editingProduct.id) {
        const res = await api.updateAdminProduct(editingProduct.id, payload);
        setProducts(prev => prev.map(p => (p.id === editingProduct.id ? res.product : p)));
        success('Product Updated', `Saved changes to "${res.product.name}".`);
      } else {
        const res = await api.createAdminProduct(payload);
        setProducts(prev => [res.product, ...prev]);
        success(
          res.product.is_published ? 'Product Published' : 'Draft Saved',
          `Added "${res.product.name}" to inventory.`
        );
      }
      setShowProductModal(false);
      setEditingProduct(null);
      onRefreshCatalog();
    } catch (err: any) {
      toastError('Save Failed', err.message);
    }
  };

  // Image Upload Handler (Multiple Images via FileReader)
  const handleImageFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, idx) => {
      if (file.size > 5 * 1024 * 1024) {
        toastError('Image Too Large', `"${file.name}" exceeds 5MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64Url = reader.result as string;
        setEditingProduct(prev => {
          if (!prev) return null;
          const currentImages = prev.images ? [...prev.images] : [];
          const isFirst = currentImages.length === 0;
          const newImg = {
            id: 'img-' + Date.now() + '-' + idx,
            image_url: base64Url,
            alt_text: file.name,
            is_primary: isFirst,
            display_order: currentImages.length + 1,
          };
          return {
            ...prev,
            images: [...currentImages, newImg],
          };
        });
        success('Photo Added', `"${file.name}" ready for preview.`);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // Add Image from URL
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setEditingProduct(prev => {
      if (!prev) return null;
      const currentImages = prev.images ? [...prev.images] : [];
      const isFirst = currentImages.length === 0;
      const newImg = {
        id: 'img-url-' + Date.now(),
        image_url: imageUrlInput.trim(),
        alt_text: prev.name || 'Product photo',
        is_primary: isFirst,
        display_order: currentImages.length + 1,
      };
      return {
        ...prev,
        images: [...currentImages, newImg],
      };
    });
    setImageUrlInput('');
    success('Photo URL Added', 'Image added to preview collection.');
  };

  const handleSetPrimaryImage = (imgId: string) => {
    setEditingProduct(prev => {
      if (!prev || !prev.images) return prev;
      return {
        ...prev,
        images: prev.images.map(img => ({
          ...img,
          is_primary: img.id === imgId,
        })),
      };
    });
    info('Cover Photo Set', 'This photo will be displayed as the main card image.');
  };

  const handleRemoveImage = (imgId: string) => {
    setEditingProduct(prev => {
      if (!prev || !prev.images) return prev;
      const filtered = prev.images.filter(img => img.id !== imgId);
      if (filtered.length > 0 && !filtered.some(img => img.is_primary)) {
        filtered[0].is_primary = true;
      }
      return {
        ...prev,
        images: filtered,
      };
    });
  };

  // Variant Helpers
  const handleAddVariant = () => {
    setEditingProduct(prev => {
      if (!prev) return null;
      const currentVariants = prev.variants || [];
      const count = currentVariants.length + 1;
      return {
        ...prev,
        variants: [
          ...currentVariants,
          {
            sku: (prev.sku || 'GN') + '-V' + count,
            title: `Variant ${count}`,
            color: 'Charcoal Grey',
            size: 'Standard',
            stock: prev.stock_quantity || 10,
          },
        ],
      };
    });
  };

  const handleUpdateVariant = (index: number, field: string, val: any) => {
    setEditingProduct(prev => {
      if (!prev || !prev.variants) return prev;
      const updated = [...prev.variants];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, variants: updated };
    });
  };

  const handleRemoveVariant = (index: number) => {
    setEditingProduct(prev => {
      if (!prev || !prev.variants) return prev;
      return {
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index),
      };
    });
  };

  // Specification Helpers
  const handleAddSpecification = (label: string = '', value: string = '') => {
    setEditingProduct(prev => {
      if (!prev) return null;
      return {
        ...prev,
        specifications: [...(prev.specifications || []), { label, value }],
      };
    });
  };

  const handleUpdateSpecification = (index: number, field: 'label' | 'value', val: string) => {
    setEditingProduct(prev => {
      if (!prev || !prev.specifications) return prev;
      const updated = [...prev.specifications];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, specifications: updated };
    });
  };

  const handleRemoveSpecification = (index: number) => {
    setEditingProduct(prev => {
      if (!prev || !prev.specifications) return prev;
      return {
        ...prev,
        specifications: prev.specifications.filter((_, i) => i !== index),
      };
    });
  };

  const handleUpdateOrderStatus = async (orderId: string, order_status: string, payment_status?: string) => {
    try {
      const res = await api.updateAdminOrderStatus(orderId, order_status, payment_status);
      setOrders(prev => prev.map(o => (o.id === orderId ? res.order : o)));
      success('Order Updated', `Order #${res.order.order_number} set to ${order_status}.`);
    } catch (err: any) {
      toastError('Update Failed', err.message);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const res = await api.updateAdminSettings(settings);
      setSettings(res.settings);
      success('Settings Saved', 'Shipping rates and policies updated.');
    } catch (err: any) {
      toastError('Settings Failed', err.message);
    }
  };

  const runSecurityAudit = async () => {
    setRunningSecurityTests(true);
    startLoading('Executing security verification checks...');
    try {
      const res = await api.runSecurityTests();
      setSecurityTestResult(res);
      success('Security Suite Passed', '4/4 Automated checks validated successfully.');
    } catch (err: any) {
      toastError('Security Check Failed', err.message);
    } finally {
      setRunningSecurityTests(false);
      stopLoading();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-6xl bg-neutral-900 text-white rounded-3xl shadow-2xl border border-neutral-800 overflow-hidden max-h-[96vh] flex flex-col">
        
        {/* Top Navbar (Responsive) */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-950">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white truncate">
                  GreyNova Admin
                </h1>
                <span className="text-[10px] bg-neutral-800 text-neutral-300 font-mono px-1.5 py-0.5 rounded-md shrink-0">
                  owner
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 truncate">
                Server-Verified Role · Supabase PostgreSQL
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={loadAllAdminData}
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Refresh Admin Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-xl transition-colors min-h-[40px]"
                title="Sign out of Administrator Session"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Exit to Storefront"
              aria-label="Exit to Storefront"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Horizontal Scrollable for Mobile) */}
        <div className="px-4 sm:px-6 border-b border-neutral-800 flex items-center gap-3 sm:gap-4 bg-neutral-900 overflow-x-auto scrollbar-none text-xs font-medium">
          <button
            onClick={() => setActiveSection('overview')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors min-h-[44px] flex items-center ${
              activeSection === 'overview'
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSection('products')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors min-h-[44px] flex items-center ${
              activeSection === 'products'
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveSection('orders')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors min-h-[44px] flex items-center ${
              activeSection === 'orders'
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveSection('settings')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors min-h-[44px] flex items-center ${
              activeSection === 'settings'
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Store Settings
          </button>
          <button
            onClick={() => setActiveSection('security')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors min-h-[44px] flex items-center ${
              activeSection === 'security'
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Security Tests
          </button>
          <button
            onClick={() => setActiveSection('supabase')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors min-h-[44px] flex items-center ${
              activeSection === 'supabase'
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            SQL Migrations
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-950/70">
          
          {/* 1. OVERVIEW METRICS */}
          {activeSection === 'overview' && metrics && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-3.5 sm:p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span>Total Revenue</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-white">
                    Rs. {metrics.total_sales.toLocaleString()}
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span>Total Orders</span>
                    <ShoppingBag className="w-4 h-4 text-neutral-300" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-white">
                    {metrics.total_orders}
                  </div>
                  <div className="text-[11px] text-amber-400 mt-0.5 truncate">
                    {metrics.pending_orders} pending confirmation
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span>Active Gear</span>
                    <Package className="w-4 h-4 text-neutral-300" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-white">
                    {metrics.active_products}
                  </div>
                  {(metrics.low_stock_products || 0) > 0 && (
                    <div className="text-[11px] text-rose-400 mt-0.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{metrics.low_stock_products} low stock</span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 sm:p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span>Customers</span>
                    <Users className="w-4 h-4 text-neutral-300" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-white">
                    {metrics.total_customers}
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    Recent Customer Purchases
                  </h3>
                  {orders.length > 0 && (
                    <button
                      onClick={() => setActiveSection('orders')}
                      className="text-xs text-neutral-400 hover:text-white"
                    >
                      View All Orders →
                    </button>
                  )}
                </div>

                {orders.length === 0 ? (
                  <div className="py-8 text-center text-neutral-500 text-xs">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40 text-neutral-400" />
                    <p className="font-semibold text-neutral-300">No customer orders placed yet</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      New orders placed in the storefront will appear here instantly.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-800 text-xs">
                    {orders.slice(0, 5).map(o => (
                      <div key={o.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white">{o.order_number}</span>
                            <span className="text-neutral-500">·</span>
                            <span className="text-neutral-300 truncate">{o.customer_name}</span>
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-0.5 truncate">
                            {o.items.length} items · {o.shipping_address.city} ·{' '}
                            <span className="capitalize text-neutral-400">{o.payment_method.replace('_', ' ')}</span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-white tabular-nums">
                            Rs. {o.total_amount.toLocaleString()}
                          </span>
                          <div className="text-[11px] text-neutral-400 capitalize">
                            {o.order_status.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. PRODUCTS & INVENTORY MANAGER (Responsive Cards on Mobile + Table on Desktop) */}
          {activeSection === 'products' && (
            <div className="space-y-4">
              
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Product Catalogue & Inventory</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 font-mono">
                      {products.length} total
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Administrator-controlled product publishing, image gallery, PKR pricing, and live inventory.
                  </p>
                </div>
                
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setShowGuide(!showGuide)}
                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5 min-h-[40px]"
                    title="Toggle Admin Guide"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Guide</span>
                    {showGuide ? <ChevronUp className="w-3 h-3 text-neutral-400" /> : <ChevronDown className="w-3 h-3 text-neutral-400" />}
                  </button>

                  <button
                    onClick={() => {
                      setEditingProduct({
                        name: '',
                        brand: 'GreyNova',
                        tagline: '',
                        category_id: categories[0]?.id || 'cat-phone-cases',
                        description: '',
                        price: 4999,
                        sale_price: null,
                        currency: 'PKR',
                        sku: 'GN-ACC-' + Math.floor(1000 + Math.random() * 9000),
                        stock_quantity: 25,
                        low_stock_threshold: 5,
                        shipping_fee: 0,
                        is_published: true,
                        is_featured: false,
                        is_new_arrival: true,
                        is_best_seller: false,
                        specifications: [
                          { label: 'Device Compatibility', value: 'iPhone 16 / 15 Series, Samsung Galaxy S24, Pixel 9' },
                          { label: 'Material', value: 'Aerospace Grade 5 Titanium Alloy' },
                        ],
                        variants: [
                          { sku: 'GN-VAR-1', title: 'Default Finish', stock: 25, color: 'Natural Titanium', size: 'Standard' },
                        ],
                        images: [
                          {
                            id: 'img-new-1',
                            image_url: '/src/assets/images/hero_accessories_showcase_1792129545783.jpg',
                            is_primary: true,
                            display_order: 1,
                          },
                        ],
                      });
                      setActiveModalTab('general');
                      setShowProductModal(true);
                    }}
                    className="px-4 py-2 bg-white text-neutral-900 text-xs font-semibold rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5 min-h-[40px]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>
                </div>
              </div>

              {/* 4-Point Administrator Product Management Instructions Guide */}
              {showGuide && (
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 sm:p-5 text-xs text-neutral-300 space-y-3.5 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <div className="flex items-center gap-2 font-bold text-white text-xs">
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <span>Administrator Product Management Instructions</span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-mono bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/50">
                      Standard Operating Protocol
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                    {/* Guide 1 */}
                    <div className="flex items-start gap-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/60">
                      <div className="w-6 h-6 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        1
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-white flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5 text-amber-400" /> How to Upload Product Photos
                        </h4>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          Click <b>Add New Product</b> or <b>Edit</b>, open the <b>Photos & Previews</b> tab, and select multiple images from your device or paste direct URLs. A real-time preview of all images is shown before saving. Click the <b>Star</b> icon on any thumbnail to designate the Primary cover photo displayed to shoppers.
                        </p>
                      </div>
                    </div>

                    {/* Guide 2 */}
                    <div className="flex items-start gap-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/60">
                      <div className="w-6 h-6 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-white flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-amber-400" /> Recommended Size & Format
                        </h4>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          For best display on mobile and desktop, use <b>1:1 square ratio (1000 × 1000 px or higher)</b> in <b>WebP, JPG, or PNG</b> formats (max 5MB). High-resolution photos taken under crisp studio lighting with neutral grey or white backgrounds maintain GreyNova’s luxury retail aesthetic.
                        </p>
                      </div>
                    </div>

                    {/* Guide 3 */}
                    <div className="flex items-start gap-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/60">
                      <div className="w-6 h-6 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        3
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-white flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-amber-400" /> How to Set Prices & Inventory
                        </h4>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          Enter the <b>Regular Price</b> in PKR. Enter an optional <b>Sale Price</b> to highlight discount pricing with strikethroughs. Set accurate <b>Stock Quantity</b>; stock decrements atomically during customer checkout. When stock hits 0, it is automatically labelled <b>Out of Stock</b> and purchase buttons are disabled.
                        </p>
                      </div>
                    </div>

                    {/* Guide 4 */}
                    <div className="flex items-start gap-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/60">
                      <div className="w-6 h-6 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        4
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-white flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-amber-400" /> How to Publish & Unpublish
                        </h4>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          Click <b>Publish to Storefront</b> to make an item live immediately, or <b>Save as Draft</b> to stage descriptions privately. In the inventory table below, you can toggle the <b>Published / Draft</b> button at any time to instantly hide or show any item without deleting its data.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Filter Tabs & Search Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 self-start overflow-x-auto max-w-full">
                  <button
                    type="button"
                    onClick={() => setProductFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      productFilter === 'all'
                        ? 'bg-neutral-800 text-white font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    All ({products.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductFilter('published')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      productFilter === 'published'
                        ? 'bg-emerald-950 text-emerald-400 font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Published ({products.filter(p => p.is_published).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductFilter('draft')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      productFilter === 'draft'
                        ? 'bg-neutral-800 text-amber-400 font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Drafts ({products.filter(p => !p.is_published).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductFilter('low_stock')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      productFilter === 'low_stock'
                        ? 'bg-rose-950 text-rose-400 font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Low Stock ({products.filter(p => p.stock_quantity <= p.low_stock_threshold).length})
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={productSearchQuery}
                    onChange={e => setProductSearchQuery(e.target.value)}
                    placeholder="Search name, SKU, brand..."
                    className="w-full pl-8 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700 min-h-[36px]"
                  />
                  {productSearchQuery && (
                    <button
                      onClick={() => setProductSearchQuery('')}
                      className="absolute right-2.5 top-2 text-neutral-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Product Listing */}
              {(() => {
                const filtered = products.filter(p => {
                  if (productFilter === 'published' && !p.is_published) return false;
                  if (productFilter === 'draft' && p.is_published) return false;
                  if (productFilter === 'low_stock' && p.stock_quantity > p.low_stock_threshold) return false;
                  if (productSearchQuery.trim()) {
                    const q = productSearchQuery.toLowerCase();
                    return (
                      p.name.toLowerCase().includes(q) ||
                      p.sku.toLowerCase().includes(q) ||
                      (p.brand && p.brand.toLowerCase().includes(q)) ||
                      (p.category_name && p.category_name.toLowerCase().includes(q))
                    );
                  }
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 text-center bg-neutral-900 rounded-2xl border border-neutral-800 p-6 text-neutral-400 text-xs space-y-3">
                      <Package className="w-10 h-10 mx-auto text-neutral-600" />
                      <div>
                        <p className="font-semibold text-white text-sm">
                          {products.length === 0 ? 'Product Catalogue is Clean & Empty' : 'No matching products found'}
                        </p>
                        <p className="mt-1 text-neutral-400 max-w-sm mx-auto">
                          {products.length === 0
                            ? 'All sample demo products have been cleared. As store administrator, click "Add New Product" to publish real inventory with custom photos and PKR pricing.'
                            : 'Try adjusting your search terms or filter tabs.'}
                        </p>
                      </div>
                      {products.length === 0 && (
                        <button
                          onClick={() => {
                            setEditingProduct({
                              name: '',
                              brand: 'GreyNova',
                              tagline: '',
                              category_id: categories[0]?.id || 'cat-phone-cases',
                              description: '',
                              price: 4999,
                              sale_price: null,
                              currency: 'PKR',
                              sku: 'GN-ACC-' + Math.floor(1000 + Math.random() * 9000),
                              stock_quantity: 25,
                              low_stock_threshold: 5,
                              shipping_fee: 0,
                              is_published: true,
                              is_featured: false,
                              is_new_arrival: true,
                              is_best_seller: false,
                              specifications: [
                                { label: 'Device Compatibility', value: 'iPhone 16 / 15 Series, Samsung Galaxy S24, Pixel 9' },
                                { label: 'Material', value: 'Aerospace Grade 5 Titanium' },
                              ],
                              variants: [
                                { sku: 'VAR-1', title: 'Default Finish', stock: 25, color: 'Natural Titanium', size: 'Standard' },
                              ],
                              images: [
                                {
                                  id: 'img-new-1',
                                  image_url: '/src/assets/images/hero_accessories_showcase_1792129545783.jpg',
                                  is_primary: true,
                                  display_order: 1,
                                },
                              ],
                            });
                            setActiveModalTab('general');
                            setShowProductModal(true);
                          }}
                          className="px-4 py-2.5 bg-white text-neutral-900 font-bold rounded-xl hover:bg-neutral-200 transition-colors inline-flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add First Product</span>
                        </button>
                      )}
                    </div>
                  );
                }

                return (
                  <>
                    {/* Mobile Product Cards (< md) */}
                    <div className="grid grid-cols-1 gap-3 md:hidden">
                      {filtered.map(p => (
                        <div
                          key={p.id}
                          className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images[0]?.image_url}
                              alt={p.name}
                              className="w-14 h-14 object-cover rounded-xl bg-neutral-800 shrink-0 border border-neutral-700/60"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] uppercase font-bold text-amber-400/90">{p.brand || 'GreyNova'}</span>
                                <span className="text-neutral-500">·</span>
                                <span className="text-[10px] text-neutral-400">{p.category_name}</span>
                              </div>
                              <span className="font-bold text-white truncate block">{p.name}</span>
                              <span className="text-[11px] text-neutral-400 font-mono">{p.sku}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-[11px]">
                            <div>
                              <span className="text-neutral-500 block text-[10px]">Price</span>
                              <span className="font-mono tabular-nums font-bold text-white">
                                Rs. {(p.sale_price ?? p.price).toLocaleString()}
                              </span>
                              {p.sale_price && (
                                <span className="text-[10px] text-neutral-400 line-through font-mono ml-1">
                                  Rs. {p.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <div>
                              <span className="text-neutral-500 block text-[10px]">Stock</span>
                              <span
                                className={`font-mono tabular-nums font-semibold ${
                                  p.stock_quantity <= 0
                                    ? 'text-rose-400 font-bold'
                                    : p.stock_quantity <= p.low_stock_threshold
                                    ? 'text-amber-400'
                                    : 'text-neutral-300'
                                }`}
                              >
                                {p.stock_quantity <= 0 ? 'Out of stock' : `${p.stock_quantity} units`}
                              </span>
                            </div>
                            <div>
                              <span className="text-neutral-500 block text-[10px]">Visibility</span>
                              <button
                                onClick={() => handleTogglePublish(p)}
                                className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 ${
                                  p.is_published
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/60'
                                    : 'bg-neutral-800 text-neutral-400'
                                }`}
                              >
                                {p.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                <span>{p.is_published ? 'Published' : 'Draft'}</span>
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-neutral-800/60 text-[11px]">
                            <span className="text-neutral-400">
                              {p.images?.length || 0} photos · {p.variants?.length || 0} variants
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setActiveModalTab('general');
                                  setShowProductModal(true);
                                }}
                                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg flex items-center gap-1 text-[11px] min-h-[36px]"
                              >
                                <Edit2 className="w-3 h-3" /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p)}
                                className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 rounded-lg flex items-center gap-1 text-[11px] min-h-[36px]"
                              >
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table (>= md) with Controlled Horizontal Scroll */}
                    <div className="hidden md:block bg-neutral-900 border border-neutral-800 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left text-xs min-w-[720px]">
                        <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                          <tr>
                            <th className="py-3 px-4">Item & Brand</th>
                            <th className="py-3 px-4">SKU</th>
                            <th className="py-3 px-4">Price (PKR)</th>
                            <th className="py-3 px-4">Stock</th>
                            <th className="py-3 px-4">Photos / Specs</th>
                            <th className="py-3 px-4">Visibility</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                          {filtered.map(p => (
                            <tr key={p.id} className="hover:bg-neutral-800/40 transition-colors">
                              <td className="py-3 px-4 flex items-center gap-3">
                                <img
                                  src={p.images[0]?.image_url}
                                  alt={p.name}
                                  className="w-11 h-11 object-cover rounded-xl bg-neutral-800 shrink-0 border border-neutral-700/60"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] uppercase font-bold text-amber-400/90">{p.brand || 'GreyNova'}</span>
                                    <span className="text-neutral-600">·</span>
                                    <span className="text-[11px] text-neutral-400">{p.category_name}</span>
                                  </div>
                                  <span className="font-semibold text-white truncate block">{p.name}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 font-mono text-neutral-300">{p.sku}</td>
                              <td className="py-3 px-4">
                                <div className="font-mono tabular-nums font-bold text-white">
                                  Rs. {(p.sale_price ?? p.price).toLocaleString()}
                                </div>
                                {p.sale_price && (
                                  <div className="text-[10px] text-neutral-400 line-through font-mono">
                                    Rs. {p.price.toLocaleString()}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`font-mono tabular-nums font-semibold ${
                                    p.stock_quantity <= 0
                                      ? 'text-rose-400 font-bold'
                                      : p.stock_quantity <= p.low_stock_threshold
                                      ? 'text-amber-400'
                                      : 'text-neutral-300'
                                  }`}
                                >
                                  {p.stock_quantity <= 0 ? 'Out of stock' : `${p.stock_quantity} units`}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-neutral-400 text-[11px]">
                                <span>{p.images?.length || 0} photos</span>
                                <span className="mx-1 text-neutral-600">·</span>
                                <span>{p.variants?.length || 0} variants</span>
                              </td>
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => handleTogglePublish(p)}
                                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
                                    p.is_published
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/60 hover:bg-emerald-900/60'
                                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                                  }`}
                                  title="Click to toggle visibility on public storefront"
                                >
                                  {p.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                  <span>{p.is_published ? 'Published' : 'Draft'}</span>
                                </button>
                              </td>
                              <td className="py-3 px-4 text-right space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingProduct(p);
                                    setActiveModalTab('general');
                                    setShowProductModal(true);
                                  }}
                                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                                  title="Edit Product"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p)}
                                  className="p-1.5 text-neutral-400 hover:text-rose-400 rounded-lg hover:bg-neutral-800 transition-colors"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* 3. ORDERS MANAGER (Responsive Cards on Mobile + Table on Desktop) */}
          {activeSection === 'orders' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Customer Orders</h3>
                <p className="text-xs text-neutral-400">
                  Update customer order stages and reconcile Cash on Delivery payments.
                </p>
              </div>

              {orders.length === 0 ? (
                <div className="py-12 text-center bg-neutral-900 rounded-2xl border border-neutral-800 p-6 text-neutral-400 text-xs">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-white">No orders placed yet</p>
                  <p className="mt-1">Customer checkouts will populate here in real-time.</p>
                </div>
              ) : (
                <>
                  {/* Mobile Order Cards (< md) */}
                  <div className="grid grid-cols-1 gap-3 md:hidden">
                    {orders.map(order => (
                      <div
                        key={order.id}
                        className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3 text-xs"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono font-bold text-sm text-white">
                              {order.order_number}
                            </span>
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                              {order.customer_name} ({order.shipping_address.city})
                            </p>
                          </div>
                          <span className="font-mono font-bold text-sm text-white tabular-nums">
                            Rs. {order.total_amount.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-[11px] text-neutral-400 pt-2 border-t border-neutral-800">
                          <span>Payment: <b className="text-neutral-200 capitalize">{order.payment_method.replace('_', ' ')}</b></span>
                          <span className={`px-2 py-0.5 rounded ${order.payment_status === 'paid' ? 'bg-emerald-950 text-emerald-400' : 'bg-neutral-800 text-amber-300'}`}>
                            {order.payment_status}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2">
                          <span className="text-neutral-400 text-[11px]">Status:</span>
                          <select
                            value={order.order_status}
                            onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="bg-neutral-800 text-white text-xs px-2.5 py-1.5 rounded-xl border border-neutral-700 w-44"
                          >
                            <option value="pending_confirmation">Pending Confirmation</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table (>= md) with Controlled Horizontal Scroll */}
                  <div className="hidden md:block bg-neutral-900 border border-neutral-800 rounded-2xl overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[700px]">
                      <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                        <tr>
                          <th className="py-3 px-4">Order #</th>
                          <th className="py-3 px-4">Customer & City</th>
                          <th className="py-3 px-4">Total (PKR)</th>
                          <th className="py-3 px-4">Order Status</th>
                          <th className="py-3 px-4">Payment</th>
                          <th className="py-3 px-4 text-right">Update Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800">
                        {orders.map(order => (
                          <tr key={order.id} className="hover:bg-neutral-800/40">
                            <td className="py-3 px-4 font-mono font-bold text-white">
                              {order.order_number}
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-white font-medium">{order.customer_name}</div>
                              <div className="text-[11px] text-neutral-400">
                                {order.customer_phone} · {order.shipping_address.city}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-white tabular-nums">
                              Rs. {order.total_amount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className="capitalize px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 text-[11px]">
                                {order.order_status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`text-[11px] px-2 py-0.5 rounded-md ${
                                  order.payment_status === 'paid'
                                    ? 'bg-emerald-950 text-emerald-400'
                                    : 'bg-neutral-800 text-amber-300'
                                }`}
                              >
                                {order.payment_status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <select
                                value={order.order_status}
                                onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                                className="bg-neutral-800 text-white text-xs px-2 py-1 rounded-lg border border-neutral-700"
                              >
                                <option value="pending_confirmation">Pending Confirmation</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 4. STORE SETTINGS & POLICIES */}
          {activeSection === 'settings' && settings && (
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl text-xs">
              <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white">Shipping Parameters (PKR)</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-400 mb-1">Standard Delivery Charge (Rs.)</label>
                    <input
                      type="number"
                      value={settings.shipping.standard_charge}
                      onChange={e =>
                        setSettings({
                          ...settings,
                          shipping: { ...settings.shipping, standard_charge: parseInt(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl font-mono text-white text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">Free Shipping Threshold (Rs.)</label>
                    <input
                      type="number"
                      value={settings.shipping.free_shipping_threshold}
                      onChange={e =>
                        setSettings({
                          ...settings,
                          shipping: { ...settings.shipping, free_shipping_threshold: parseInt(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl font-mono text-white text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="cod_toggle"
                    checked={settings.shipping.cod_enabled}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        shipping: { ...settings.shipping, cod_enabled: e.target.checked },
                      })
                    }
                  />
                  <label htmlFor="cod_toggle" className="text-white font-medium cursor-pointer">
                    Cash on Delivery (COD) Enabled Nationwide
                  </label>
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-5 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white">Customer Support Contact Info</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-400 mb-1">Support Email</label>
                    <input
                      type="email"
                      value={settings.contact.email}
                      onChange={e =>
                        setSettings({
                          ...settings,
                          contact: { ...settings.contact, email: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">Support Phone / WhatsApp</label>
                    <input
                      type="text"
                      value={settings.contact.phone}
                      onChange={e =>
                        setSettings({
                          ...settings,
                          contact: { ...settings.contact, phone: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white font-mono text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Tech Lab Address</label>
                  <input
                    type="text"
                    value={settings.contact.address}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        contact: { ...settings.contact, address: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-xs sm:text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-white text-neutral-900 font-semibold rounded-xl hover:bg-neutral-200 transition-colors"
              >
                Save Settings
              </button>
            </form>
          )}

          {/* 5. AUTOMATED SECURITY TEST SUITE */}
          {activeSection === 'security' && (
            <div className="space-y-4 max-w-2xl text-xs">
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">Core Security Verification Suite</h3>
                    <p className="text-neutral-400 text-[11px] sm:text-xs">
                      Automated tests verifying customer isolation, admin role authorization, and cart price protection.
                    </p>
                  </div>
                  <button
                    onClick={runSecurityAudit}
                    disabled={runningSecurityTests}
                    className="px-4 py-2 bg-amber-400 text-neutral-950 font-bold rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50 self-start sm:self-auto shrink-0 min-h-[40px]"
                  >
                    {runningSecurityTests ? 'Running Checks...' : 'Execute Security Suite'}
                  </button>
                </div>
              </div>

              {securityTestResult && (
                <div className="p-4 sm:p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Check className="w-5 h-5" />
                    <span>{securityTestResult.suite} — All Tests Passed</span>
                  </div>

                  <div className="space-y-2.5 divide-y divide-neutral-800">
                    {securityTestResult.results.map((r: any, idx: number) => (
                      <div key={idx} className="pt-2.5 flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                          ✓
                        </div>
                        <div>
                          <div className="font-semibold text-white">{r.test}</div>
                          <div className="text-neutral-400 text-[11px] mt-0.5">{r.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6. SUPABASE SQL MIGRATIONS */}
          {activeSection === 'supabase' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
                <h3 className="text-sm font-bold text-white">Supabase PostgreSQL 16-Table Schema & RLS</h3>
                <p className="text-neutral-400 leading-relaxed text-[11px] sm:text-xs">
                  The complete production migration is saved at <code>/supabase/migrations/20261016000000_greynova_schema.sql</code>.
                  It includes full Row Level Security policies, foreign keys, admin security definers, and initial bootstrap triggers.
                </p>
                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('-- Run /supabase/migrations/20261016000000_greynova_schema.sql in your Supabase SQL editor');
                      success('Copied', 'Migration path copied to clipboard.');
                    }}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-medium min-h-[40px]"
                  >
                    Copy Migration Path
                  </button>
                </div>
              </div>

              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl font-mono text-[11px] text-neutral-400 overflow-x-auto space-y-1">
                <p className="text-neutral-300">-- 16 Protected Tables with RLS:</p>
                <p>1. profiles · 2. user_roles · 3. addresses · 4. categories</p>
                <p>5. products · 6. product_images · 7. banners · 8. carts</p>
                <p>9. cart_items · 10. orders · 11. order_items · 12. payments</p>
                <p>13. payment_webhook_events · 14. store_settings · 15. wishlists · 16. wishlist_items</p>
              </div>
            </div>
          )}

        </div>

        {/* Product Add/Edit Modal (Full Multi-Tab Editor) */}
        {showProductModal && editingProduct && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
            <div className="bg-neutral-900 border border-neutral-700/80 rounded-3xl w-full max-w-2xl max-h-[94vh] flex flex-col text-xs text-white shadow-2xl overflow-hidden">
              
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-950">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white truncate">
                      {editingProduct.id ? `Edit: ${editingProduct.name}` : 'Add New Hardware Product'}
                    </h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                      editingProduct.is_published ? 'bg-emerald-950 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {editingProduct.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                    Configure official GreyNova pricing, multi-photo gallery, specifications, and variants.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors shrink-0 ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tab Navigation Header */}
              <div className="px-5 pt-3 pb-2 border-b border-neutral-800 bg-neutral-950 flex items-center gap-1.5 overflow-x-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveModalTab('general')}
                  className={`px-3 py-1.5 rounded-xl font-medium text-xs transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeModalTab === 'general'
                      ? 'bg-neutral-800 text-white font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>General & Pricing</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModalTab('photos')}
                  className={`px-3 py-1.5 rounded-xl font-medium text-xs transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeModalTab === 'photos'
                      ? 'bg-neutral-800 text-white font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Photos & Gallery</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-700 text-neutral-200 font-mono">
                    {editingProduct.images?.length || 0}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModalTab('variants')}
                  className={`px-3 py-1.5 rounded-xl font-medium text-xs transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeModalTab === 'variants'
                      ? 'bg-neutral-800 text-white font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Variants</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-700 text-neutral-200 font-mono">
                    {editingProduct.variants?.length || 0}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModalTab('specs')}
                  className={`px-3 py-1.5 rounded-xl font-medium text-xs transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeModalTab === 'specs'
                      ? 'bg-neutral-800 text-white font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Specifications</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-700 text-neutral-200 font-mono">
                    {editingProduct.specifications?.length || 0}
                  </span>
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="p-5 overflow-y-auto flex-1 space-y-4">
                
                {/* TAB 1: GENERAL & PRICING */}
                {activeModalTab === 'general' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-neutral-400 mb-1 font-medium">Product Name *</label>
                        <input
                          type="text"
                          required
                          value={editingProduct.name || ''}
                          onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          placeholder="e.g. TitanBumper CNC Case for iPhone 16 Pro"
                          className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-neutral-500"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-400 mb-1 font-medium">Brand</label>
                        <input
                          type="text"
                          value={editingProduct.brand || 'GreyNova'}
                          onChange={e => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                          placeholder="GreyNova"
                          className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white font-medium text-xs sm:text-sm focus:outline-none focus:border-neutral-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-400 mb-1 font-medium">Category *</label>
                        <select
                          value={editingProduct.category_id}
                          onChange={e => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                          className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-neutral-500 cursor-pointer"
                        >
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-neutral-400 mb-1 font-medium">SKU / Product Code *</label>
                        <input
                          type="text"
                          required
                          value={editingProduct.sku || ''}
                          onChange={e => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                          placeholder="e.g. GN-CASE-TITAN-16P"
                          className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl font-mono text-white text-xs sm:text-sm focus:outline-none focus:border-neutral-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">Short Tagline</label>
                      <input
                        type="text"
                        value={editingProduct.tagline || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, tagline: e.target.value })}
                        placeholder="e.g. Aerospace Grade 5 Titanium Alloy · MagSafe Ultra Slim"
                        className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-neutral-500"
                      />
                    </div>

                    <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-2xl space-y-3">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-amber-400" />
                        <span>Pricing & Inventory Controls (PKR)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-neutral-400 mb-1 font-medium">Regular Price (PKR) *</label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-neutral-500 font-mono">Rs.</span>
                            <input
                              type="number"
                              required
                              value={editingProduct.price || 0}
                              onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                              className="w-full pl-10 pr-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl font-mono text-white text-xs sm:text-sm focus:outline-none focus:border-neutral-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-neutral-400 mb-1 font-medium">Sale Price (Optional PKR)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-neutral-500 font-mono">Rs.</span>
                            <input
                              type="number"
                              value={editingProduct.sale_price ?? ''}
                              onChange={e =>
                                setEditingProduct({
                                  ...editingProduct,
                                  sale_price: e.target.value ? parseFloat(e.target.value) : null,
                                })
                              }
                              placeholder="Leave blank for regular price"
                              className="w-full pl-10 pr-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl font-mono text-white text-xs sm:text-sm focus:outline-none focus:border-neutral-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div>
                          <label className="block text-neutral-400 mb-1 font-medium">Stock Quantity *</label>
                          <input
                            type="number"
                            required
                            min={0}
                            value={editingProduct.stock_quantity ?? 0}
                            onChange={e =>
                              setEditingProduct({ ...editingProduct, stock_quantity: Math.max(0, parseInt(e.target.value) || 0) })
                            }
                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl font-mono text-white text-xs focus:outline-none focus:border-neutral-500"
                          />
                        </div>

                        <div>
                          <label className="block text-neutral-400 mb-1 font-medium">Low Stock Alert</label>
                          <input
                            type="number"
                            min={1}
                            value={editingProduct.low_stock_threshold || 5}
                            onChange={e =>
                              setEditingProduct({ ...editingProduct, low_stock_threshold: parseInt(e.target.value) || 5 })
                            }
                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl font-mono text-white text-xs focus:outline-none focus:border-neutral-500"
                          />
                        </div>

                        <div>
                          <label className="block text-neutral-400 mb-1 font-medium">Shipping Fee (PKR)</label>
                          <input
                            type="number"
                            min={0}
                            value={editingProduct.shipping_fee || 0}
                            onChange={e =>
                              setEditingProduct({ ...editingProduct, shipping_fee: parseFloat(e.target.value) || 0 })
                            }
                            placeholder="0 for Standard Store Policy"
                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl font-mono text-white text-xs focus:outline-none focus:border-neutral-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-neutral-400 mb-1 font-medium">Product Description</label>
                      <textarea
                        rows={3}
                        value={editingProduct.description || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        placeholder="Detailed overview of materials, finish, protection, and craftsmanship..."
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-neutral-500 leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: PHOTOS & GALLERY (Multiple upload + Preview Before Publishing) */}
                {activeModalTab === 'photos' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-2xl space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5 text-amber-400" />
                            <span>Upload Product Photos</span>
                          </h4>
                          <p className="text-[11px] text-neutral-400 mt-0.5">
                            Recommended: 1:1 Square (1000 × 1000 px), WebP/JPG/PNG, studio lighting.
                          </p>
                        </div>

                        {/* File Upload Button */}
                        <label className="px-4 py-2 bg-white text-neutral-900 font-bold rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-auto min-h-[38px]">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Select Device Files</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageFilesSelected}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* URL input fallback */}
                      <div className="pt-2 border-t border-neutral-800/80 flex items-center gap-2">
                        <input
                          type="url"
                          value={imageUrlInput}
                          onChange={e => setImageUrlInput(e.target.value)}
                          placeholder="Or paste external image URL..."
                          className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddImageUrl}
                          className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-medium transition-colors shrink-0"
                        >
                          Add URL
                        </button>
                      </div>
                    </div>

                    {/* Previews Grid */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-neutral-300">
                          Image Previews ({editingProduct.images?.length || 0})
                        </span>
                        <span className="text-[11px] text-neutral-500">
                          Click star to set Primary Cover Photo
                        </span>
                      </div>

                      {(!editingProduct.images || editingProduct.images.length === 0) ? (
                        <div className="p-8 border border-dashed border-neutral-800 rounded-2xl text-center text-neutral-500 space-y-2">
                          <ImageIcon className="w-8 h-8 mx-auto opacity-40 text-neutral-400" />
                          <p className="font-medium text-neutral-400">No photos uploaded yet</p>
                          <p className="text-[11px] text-neutral-500">
                            Upload photos above to preview before publishing to storefront shoppers.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {editingProduct.images.map((img, idx) => (
                            <div
                              key={img.id || idx}
                              className={`relative group bg-neutral-950 border rounded-2xl overflow-hidden aspect-square flex items-center justify-center transition-all ${
                                img.is_primary ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-neutral-800'
                              }`}
                            >
                              <img
                                src={img.image_url}
                                alt={img.alt_text || 'Product thumbnail'}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />

                              {/* Primary Badge */}
                              {img.is_primary && (
                                <div className="absolute top-2 left-2 bg-amber-400 text-neutral-950 px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1 shadow-md">
                                  <Star className="w-2.5 h-2.5 fill-current" />
                                  <span>Cover</span>
                                </div>
                              )}

                              {/* Action Overlay */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                                {!img.is_primary && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetPrimaryImage(img.id)}
                                    className="p-2 bg-neutral-900/90 text-amber-400 hover:bg-neutral-800 rounded-xl transition-colors"
                                    title="Set as Cover Photo"
                                  >
                                    <Star className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(img.id)}
                                  className="p-2 bg-rose-950/90 text-rose-300 hover:bg-rose-900 rounded-xl transition-colors"
                                  title="Remove Photo"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: VARIANTS */}
                {activeModalTab === 'variants' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                      <div>
                        <h4 className="font-bold text-white text-xs">Product Variants</h4>
                        <p className="text-[11px] text-neutral-400">
                          Add multiple finishes, sizes, cable lengths, or colors with isolated inventory.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-medium transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Variant</span>
                      </button>
                    </div>

                    {(!editingProduct.variants || editingProduct.variants.length === 0) ? (
                      <div className="p-6 border border-dashed border-neutral-800 rounded-2xl text-center text-neutral-500">
                        <p>No variants configured. Product will use the standard default finish.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {editingProduct.variants.map((v, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-3 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-neutral-300">Variant #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(idx)}
                                className="text-neutral-500 hover:text-rose-400 p-1"
                                title="Remove Variant"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                              <div>
                                <label className="block text-neutral-500 text-[10px] mb-1">Title *</label>
                                <input
                                  type="text"
                                  value={v.title}
                                  onChange={e => handleUpdateVariant(idx, 'title', e.target.value)}
                                  placeholder="e.g. Natural Titanium"
                                  className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-neutral-500 text-[10px] mb-1">Color / Finish</label>
                                <input
                                  type="text"
                                  value={v.color || ''}
                                  onChange={e => handleUpdateVariant(idx, 'color', e.target.value)}
                                  placeholder="e.g. Space Grey"
                                  className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-neutral-500 text-[10px] mb-1">Size / Length</label>
                                <input
                                  type="text"
                                  value={v.size || ''}
                                  onChange={e => handleUpdateVariant(idx, 'size', e.target.value)}
                                  placeholder="e.g. 1.8 Meter / 6.7 Inch"
                                  className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                              <div>
                                <label className="block text-neutral-500 text-[10px] mb-1">Variant SKU</label>
                                <input
                                  type="text"
                                  value={v.sku}
                                  onChange={e => handleUpdateVariant(idx, 'sku', e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-xl font-mono text-white text-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-neutral-500 text-[10px] mb-1">Stock</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={v.stock}
                                  onChange={e => handleUpdateVariant(idx, 'stock', parseInt(e.target.value) || 0)}
                                  className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-xl font-mono text-white text-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-neutral-500 text-[10px] mb-1">Price Override (PKR)</label>
                                <input
                                  type="number"
                                  value={v.price ?? ''}
                                  onChange={e =>
                                    handleUpdateVariant(idx, 'price', e.target.value ? parseFloat(e.target.value) : undefined)
                                  }
                                  placeholder="Optional extra price"
                                  className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-xl font-mono text-white text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: SPECIFICATIONS */}
                {activeModalTab === 'specs' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                      <div>
                        <h4 className="font-bold text-white text-xs">Technical Specifications</h4>
                        <p className="text-[11px] text-neutral-400">
                          Display materials, compatibility, dimensions, charging speed, and warranties.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddSpecification('', '')}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-medium transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Row</span>
                      </button>
                    </div>

                    {/* Quick Preset Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                      <span className="text-neutral-500 font-medium shrink-0">Quick Add:</span>
                      <button
                        type="button"
                        onClick={() => handleAddSpecification('Device Compatibility', 'iPhone 16 Pro Max / 15 Pro Max')}
                        className="px-2 py-1 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-lg text-neutral-300 shrink-0"
                      >
                        + Device Compatibility
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddSpecification('Material', 'Aerospace Grade 5 Titanium')}
                        className="px-2 py-1 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-lg text-neutral-300 shrink-0"
                      >
                        + Material
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddSpecification('Power Output', '140W GaN III Fast Charge')}
                        className="px-2 py-1 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-lg text-neutral-300 shrink-0"
                      >
                        + Power Output
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddSpecification('Warranty', '12 Months Official GreyNova Replacement')}
                        className="px-2 py-1 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-lg text-neutral-300 shrink-0"
                      >
                        + Warranty
                      </button>
                    </div>

                    {(!editingProduct.specifications || editingProduct.specifications.length === 0) ? (
                      <div className="p-6 border border-dashed border-neutral-800 rounded-2xl text-center text-neutral-500">
                        <p>No specifications added yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {editingProduct.specifications.map((spec, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={spec.label}
                              onChange={e => handleUpdateSpecification(idx, 'label', e.target.value)}
                              placeholder="Label (e.g. Compatibility)"
                              className="w-1/3 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-neutral-600"
                            />
                            <input
                              type="text"
                              value={spec.value}
                              onChange={e => handleUpdateSpecification(idx, 'value', e.target.value)}
                              placeholder="Value (e.g. All Qi2 & MagSafe Devices)"
                              className="flex-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-neutral-600"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveSpecification(idx)}
                              className="p-2 text-neutral-500 hover:text-rose-400 rounded-xl"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Modal Footer with Draft vs Publish Controls */}
              <div className="px-5 py-3.5 border-t border-neutral-800 bg-neutral-950 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <div className="text-[11px] text-neutral-400 text-center sm:text-left">
                  {editingProduct.is_published ? (
                    <span className="text-emerald-400 font-medium">✓ Will be immediately visible to storefront shoppers</span>
                  ) : (
                    <span className="text-amber-400 font-medium">✎ Staged as private draft (hidden from public)</span>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-medium transition-colors min-h-[40px]"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={e => handleSaveProduct(e, false)}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700 font-semibold rounded-xl transition-colors min-h-[40px]"
                  >
                    Save as Draft
                  </button>

                  <button
                    type="button"
                    onClick={e => handleSaveProduct(e, true)}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-white hover:bg-neutral-200 text-neutral-950 font-bold rounded-xl transition-colors min-h-[40px] shadow-md"
                  >
                    Publish to Storefront
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
