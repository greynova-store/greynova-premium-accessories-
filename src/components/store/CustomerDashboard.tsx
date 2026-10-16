import React, { useState, useEffect } from 'react';
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  X,
  Plus,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  Phone,
  Mail,
} from 'lucide-react';
import { UserProfile, UserRole, Order, Address, Product } from '../../types/store';
import { api } from '../../services/api';
import { useToast } from '../ui/Toast';
import { useLoading } from '../../context/LoadingContext';

interface CustomerDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  user: (UserProfile & { role: UserRole; username?: string }) | null;
  onLogout: () => void;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

type TabType = 'orders' | 'addresses' | 'wishlist' | 'support';

export function CustomerDashboard({
  isOpen,
  onClose,
  user,
  onLogout,
  onOpenProduct,
  onAddToCart,
}: CustomerDashboardProps) {
  if (!isOpen || !user) return null;

  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Add address state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newRecipient, setNewRecipient] = useState(user.full_name || '');
  const [newPhone, setNewPhone] = useState(user.phone_number || '');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('Karachi');
  const [newPostal, setNewPostal] = useState('75500');

  const { success, error: toastError } = useToast();
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    loadCustomerData();
  }, [user.id]);

  const loadCustomerData = async () => {
    setLoading(true);
    startLoading('Retrieving your orders & saved addresses...');
    try {
      const [ordersRes, addrRes, wishRes] = await Promise.all([
        api.getMyOrders(),
        api.getAddresses(),
        api.getWishlist(),
      ]);
      setOrders(ordersRes.orders || []);
      setAddresses(addrRes.addresses || []);
      setWishlist(wishRes.wishlist || []);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      stopLoading();
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await api.cancelOrder(orderId, 'Customer requested cancellation via Dashboard.');
      success('Order Cancelled', res.message);
      loadCustomerData();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(res.order);
      }
    } catch (err: any) {
      toastError('Cancellation Failed', err.message);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addAddress({
        recipient_name: newRecipient,
        phone_number: newPhone,
        street_address: newStreet,
        city: newCity,
        postal_code: newPostal,
        country: 'Pakistan',
        is_default: addresses.length === 0,
      });
      setAddresses(prev => [...prev, res.address]);
      setShowAddAddress(false);
      setNewStreet('');
      success('Address Saved', 'New delivery address added successfully.');
    } catch (err: any) {
      toastError('Failed to save address', err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-auto max-h-[94vh] flex flex-col md:flex-row">
        
        {/* Left Sidebar on Desktop (>= md) / Compact Header on Mobile (< md) */}
        <div className="w-full md:w-64 bg-neutral-900 text-white p-4 sm:p-6 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-neutral-400 uppercase">
                Customer Account
              </span>
              <button
                onClick={onClose}
                className="md:hidden text-neutral-400 hover:text-white p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile */}
            <div className="flex items-center md:flex-col md:items-start gap-3 pb-4 md:pb-6 border-b border-neutral-800">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-base sm:text-lg font-bold text-white shadow-xs shrink-0">
                {user.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-xs sm:text-sm text-white truncate">{user.full_name}</h3>
                <p className="text-[11px] sm:text-xs text-neutral-400 truncate">{user.email}</p>
                {user.phone_number && (
                  <p className="text-[10px] sm:text-[11px] text-neutral-500 font-mono mt-0.5 truncate">{user.phone_number}</p>
                )}
              </div>
            </div>

            {/* Nav Tabs (Horizontal scroll on mobile, stacked on desktop) */}
            <nav className="mt-4 md:mt-6 flex md:flex-col gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0 text-xs font-medium">
              <button
                onClick={() => {
                  setActiveTab('orders');
                  setSelectedOrder(null);
                }}
                className={`flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
                  activeTab === 'orders' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4 shrink-0" />
                <span>Orders</span>
                <span className="ml-auto text-[10px] sm:text-[11px] font-mono opacity-80">{orders.length}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('addresses');
                  setSelectedOrder(null);
                }}
                className={`flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
                  activeTab === 'addresses' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Addresses</span>
                <span className="ml-auto text-[10px] sm:text-[11px] font-mono opacity-80">{addresses.length}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('wishlist');
                  setSelectedOrder(null);
                }}
                className={`flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
                  activeTab === 'wishlist' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <Heart className="w-4 h-4 shrink-0" />
                <span>Wishlist</span>
                <span className="ml-auto text-[10px] sm:text-[11px] font-mono opacity-80">{wishlist.length}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('support');
                  setSelectedOrder(null);
                }}
                className={`flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
                  activeTab === 'support' ? 'bg-white text-neutral-900 font-semibold shadow-xs' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>Support</span>
              </button>
            </nav>
          </div>

          {/* Logout (Desktop visible) */}
          <div className="hidden md:block pt-6 border-t border-neutral-800 mt-6">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center gap-2 text-xs text-neutral-400 hover:text-rose-400 transition-colors py-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-neutral-50/50">
          
          {/* Header */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-200/80 bg-white flex items-center justify-between shrink-0">
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 capitalize">
              {selectedOrder ? `Order #${selectedOrder.order_number}` : activeTab === 'orders' ? 'My Order History' : activeTab === 'addresses' ? 'Delivery Locations' : activeTab === 'wishlist' ? 'Hardware Wishlist' : 'Warranty & Support'}
            </h2>
            <button
              onClick={onClose}
              className="hidden md:flex p-1.5 text-neutral-400 hover:text-neutral-900 rounded-xl hover:bg-neutral-100 transition-colors min-h-[40px] min-w-[40px] items-center justify-center"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            
            {/* 1. ORDERS TAB */}
            {activeTab === 'orders' && (
              <div>
                {selectedOrder ? (
                  <div className="space-y-4 text-xs">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-xs text-neutral-600 hover:text-neutral-900 font-medium flex items-center gap-1 mb-2"
                    >
                      ← Back to order list
                    </button>

                    <div className="p-4 bg-white rounded-2xl border border-neutral-200 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div>
                          <span className="text-neutral-400 block text-[11px]">Placed on</span>
                          <span className="font-medium text-neutral-800">
                            {new Date(selectedOrder.created_at).toLocaleDateString('en-PK', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="sm:text-right">
                          <span className="text-neutral-400 block text-[11px]">Total Amount</span>
                          <span className="text-base font-bold font-mono tabular-nums text-neutral-900">
                            Rs. {selectedOrder.total_amount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100">
                        <div>
                          <span className="text-neutral-400 block text-[11px]">Order Status</span>
                          <span className="font-semibold text-neutral-900 capitalize flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>{selectedOrder.order_status.replace('_', ' ')}</span>
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[11px]">Payment</span>
                          <span className="font-semibold text-neutral-900 capitalize flex items-center gap-1.5 mt-0.5">
                            <Truck className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
                            <span>
                              {selectedOrder.payment_method === 'cash_on_delivery'
                                ? 'Cash on Delivery (Unpaid)'
                                : selectedOrder.payment_status}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Cancellation button if allowed */}
                      {selectedOrder.order_status === 'pending_confirmation' && (
                        <div className="pt-2">
                          <button
                            onClick={() => handleCancelOrder(selectedOrder.id)}
                            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors"
                          >
                            Cancel Order Request
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Shipping Address Summary */}
                    <div className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-1.5">
                      <h4 className="font-semibold text-neutral-900">Shipping Details</h4>
                      <p className="text-neutral-600 leading-relaxed">
                        {selectedOrder.shipping_address.street_address}
                        {selectedOrder.shipping_address.apartment ? `, ${selectedOrder.shipping_address.apartment}` : ''}
                        <br />
                        {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.postal_code}, Pakistan
                      </p>
                      <p className="text-neutral-500 font-mono text-[11px]">
                        Recipient Phone: {selectedOrder.customer_phone}
                      </p>
                    </div>

                    {/* Items List */}
                    <div className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-3">
                      <h4 className="font-semibold text-neutral-900">Ordered Gear</h4>
                      <div className="divide-y divide-neutral-100">
                        {selectedOrder.items.map(item => (
                          <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-medium text-neutral-900 truncate">{item.product_name}</p>
                              <p className="text-[11px] text-neutral-500 font-mono truncate">
                                Qty: {item.quantity} · SKU: {item.product_sku}
                              </p>
                            </div>
                            <span className="font-mono tabular-nums font-semibold text-neutral-900 shrink-0">
                              Rs. {item.total_price.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 text-neutral-400 space-y-2">
                    <Package className="w-10 h-10 mx-auto opacity-50" />
                    <p className="text-sm font-semibold text-neutral-700">No orders placed yet</p>
                    <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                      When you purchase accessories on GreyNova, your receipts and tracking timeline will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map(order => (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="p-4 bg-white rounded-2xl border border-neutral-200/80 hover:border-neutral-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-neutral-900">
                              {order.order_number}
                            </span>
                            <span className="text-[11px] text-neutral-400">·</span>
                            <span className="text-[11px] text-neutral-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 mt-1 truncate">
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'} ·{' '}
                            <span className="font-semibold capitalize text-neutral-800">
                              {order.order_status.replace('_', ' ')}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-bold text-xs sm:text-sm text-neutral-900 tabular-nums">
                            Rs. {order.total_amount.toLocaleString()}
                          </span>
                          <ChevronRight className="w-4 h-4 text-neutral-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs text-neutral-500">
                    Saved shipping locations for express checkout.
                  </span>
                  <button
                    onClick={() => setShowAddAddress(!showAddAddress)}
                    className="px-3.5 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto min-h-[40px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                </div>

                {showAddAddress && (
                  <form onSubmit={handleSaveAddress} className="p-4 bg-white rounded-2xl border border-neutral-200 space-y-3 text-xs animate-in fade-in">
                    <h4 className="font-bold text-neutral-900">New Delivery Address</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-600 mb-1">Recipient Name *</label>
                        <input
                          type="text"
                          required
                          value={newRecipient}
                          onChange={e => setNewRecipient(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-600 mb-1">Mobile Phone *</label>
                        <input
                          type="tel"
                          required
                          value={newPhone}
                          onChange={e => setNewPhone(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-neutral-600 mb-1">Street Address, House No. *</label>
                      <input
                        type="text"
                        required
                        value={newStreet}
                        onChange={e => setNewStreet(e.target.value)}
                        placeholder="House, Street, Sector"
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-600 mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={newCity}
                          onChange={e => setNewCity(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-600 mb-1">Postal Code *</label>
                        <input
                          type="text"
                          required
                          value={newPostal}
                          onChange={e => setNewPostal(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddAddress(false)}
                        className="px-4 py-2 bg-neutral-100 rounded-xl font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-neutral-900 text-white rounded-xl font-semibold"
                      >
                        Save Location
                      </button>
                    </div>
                  </form>
                )}

                {addresses.length === 0 ? (
                  <div className="py-12 text-center text-neutral-400 text-xs">
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-neutral-700">No saved delivery addresses</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Add a shipping location above or during your next checkout.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map(addr => (
                      <div
                        key={addr.id}
                        className="p-4 bg-white rounded-2xl border border-neutral-200/80 flex justify-between items-start"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-xs text-neutral-900">{addr.recipient_name}</h4>
                            {addr.is_default && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-800">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-600 mt-1">
                            {addr.street_address}, {addr.city}, {addr.postal_code}
                          </p>
                          <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                            Phone: {addr.phone_number}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <div>
                {wishlist.length === 0 ? (
                  <div className="text-center py-12 text-neutral-400 space-y-2">
                    <Heart className="w-10 h-10 mx-auto opacity-50" />
                    <p className="text-sm font-semibold text-neutral-700">Wishlist is empty</p>
                    <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                      Explore precision phone cases, GaN fast chargers, and accessories to save for later.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {wishlist.map(p => (
                      <div
                        key={p.id}
                        className="p-3 bg-white rounded-2xl border border-neutral-200/80 flex items-center gap-3"
                      >
                        <img
                          src={p.images[0]?.image_url}
                          alt={p.name}
                          className="w-14 h-14 object-cover rounded-xl bg-neutral-100 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-neutral-900 truncate">{p.name}</h4>
                          <span className="font-mono text-xs font-bold text-neutral-900 tabular-nums">
                            Rs. {(p.sale_price ?? p.price).toLocaleString()}
                          </span>
                          <div className="mt-1 flex gap-2">
                            <button
                              onClick={() => {
                                onAddToCart(p);
                                success('Added to Bag', `${p.name} is now in your cart.`);
                              }}
                              className="text-[11px] font-semibold text-neutral-900 hover:underline"
                            >
                              Add to Bag
                            </button>
                            <button
                              onClick={() => onOpenProduct(p)}
                              className="text-[11px] text-neutral-500 hover:underline"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. SUPPORT & WARRANTY TAB */}
            {activeTab === 'support' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-white rounded-2xl border border-neutral-200 space-y-2">
                  <div className="flex items-center gap-2 text-neutral-900 font-bold">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>GreyNova 1-Year Replacement Warranty</span>
                  </div>
                  <p className="text-neutral-600 leading-relaxed">
                    All GreyNova products carry an official 1-Year comprehensive warranty against component failure or thermal defects. When filing a claim, quote your Order Number to our support team.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-neutral-200 space-y-2">
                  <h4 className="font-bold text-neutral-900">Official Customer Care</h4>
                  <div className="space-y-1.5 text-neutral-600">
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" /> <b>support@greynova.store</b>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" /> <b>+92 300 1234567</b> (Mon-Sat: 10:00 AM – 8:00 PM PKT)
                    </p>
                    <p className="text-[11px] text-neutral-500 pt-1">
                      GreyNova Flagship Tech Hub, Clifton, Karachi, Pakistan
                    </p>
                  </div>
                </div>

                <div className="pt-2 md:hidden">
                  <button
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-rose-700 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
