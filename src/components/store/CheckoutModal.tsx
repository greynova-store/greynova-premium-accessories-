import React, { useState } from 'react';
import { X, ShieldCheck, Truck, CreditCard, Banknote, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { CartCalculation, UserProfile, UserRole, Address, Order } from '../../types/store';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartCalculation: CartCalculation | null;
  user: (UserProfile & { role: UserRole; username?: string }) | null;
  savedAddresses: Address[];
  onOrderSuccess: (order: Order) => void;
  onSubmitOrder: (payload: any) => Promise<Order>;
}

export function CheckoutModal({
  isOpen,
  onClose,
  cartCalculation,
  user,
  savedAddresses,
  onOrderSuccess,
  onSubmitOrder,
}: CheckoutModalProps) {
  if (!isOpen || !cartCalculation) return null;

  const [recipientName, setRecipientName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [streetAddress, setStreetAddress] = useState(savedAddresses[0]?.street_address || '');
  const [apartment, setApartment] = useState(savedAddresses[0]?.apartment || '');
  const [city, setCity] = useState(savedAddresses[0]?.city || 'Karachi');
  const [postalCode, setPostalCode] = useState(savedAddresses[0]?.postal_code || '75500');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'stripe' | 'jazzcash'>('cash_on_delivery');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subtotal = cartCalculation.subtotal;
  const deliveryCharge = cartCalculation.delivery_charge;
  const total = cartCalculation.total;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!recipientName.trim() || !email.trim() || !phoneNumber.trim() || !streetAddress.trim() || !city.trim()) {
      setErrorMessage('Please fill in all required delivery information.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer_name: recipientName.trim(),
        customer_email: email.trim(),
        customer_phone: phoneNumber.trim(),
        shipping_address: {
          recipient_name: recipientName.trim(),
          phone_number: phoneNumber.trim(),
          street_address: streetAddress.trim(),
          apartment: apartment.trim(),
          city: city.trim(),
          postal_code: postalCode.trim(),
          country: 'Pakistan',
          delivery_instructions: instructions.trim(),
        },
        items: cartCalculation.items.map(item => ({
          product_id: item.product_id,
          variant_title: item.variant_sku || 'Standard',
          quantity: item.quantity,
        })),
        payment_method: paymentMethod,
        notes: instructions.trim(),
      };

      const createdOrder = await onSubmitOrder(orderPayload);
      onOrderSuccess(createdOrder);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-200/80 bg-neutral-50/80 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900">Checkout & Delivery</h2>
            <p className="text-xs text-neutral-500">Cash on Delivery & Secure Express Courier</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-xl hover:bg-neutral-200/60 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Contact Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              1. Customer Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  placeholder="Enter recipient full name"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-neutral-50/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Mobile Number (For Courier) *
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="0300 1234567"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-neutral-50/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Email Address (For Order Tracking Receipt) *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-neutral-50/40"
              />
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-3 pt-4 border-t border-neutral-200">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              2. Delivery Address
            </h3>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Street Address, House / Building No. *
              </label>
              <input
                type="text"
                required
                value={streetAddress}
                onChange={e => setStreetAddress(e.target.value)}
                placeholder="House 12, Street 4, Phase 5 DHA"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-neutral-50/40"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Karachi / Lahore / Islamabad"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-neutral-50/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                  placeholder="75500"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-neutral-50/40"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  disabled
                  value="Pakistan"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Special Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder="Call before arrival / Leave with security guard"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-neutral-50/40"
              />
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3 pt-4 border-t border-neutral-200">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              3. Payment Selection
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cash on Delivery */}
              <label
                className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-neutral-900 bg-neutral-50/90 shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cash_on_delivery'}
                  onChange={() => setPaymentMethod('cash_on_delivery')}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-neutral-900">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Cash on Delivery (COD)</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Pay in cash directly to courier at your doorstep upon parcel inspection.
                  </p>
                </div>
              </label>

              {/* Online Gateway Option */}
              <label
                className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'stripe'
                    ? 'border-neutral-900 bg-neutral-50/90 shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'stripe'}
                  onChange={() => setPaymentMethod('stripe')}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-neutral-900">
                    <CreditCard className="w-4 h-4 text-neutral-800" />
                    <span>Online Card / Gateway</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Sandbox test gateway. If credentials are unset, will fallback safely to COD.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Order Summary Strip */}
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Items Subtotal ({cartCalculation.items_count} units)</span>
              <span className="font-mono tabular-nums font-medium text-neutral-900">
                Rs. {subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Express Courier Delivery</span>
              <span className="font-mono tabular-nums font-medium text-neutral-900">
                {deliveryCharge === 0 ? <span className="text-emerald-700">FREE</span> : `Rs. ${deliveryCharge}`}
              </span>
            </div>
            <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-sm text-neutral-900">
              <span>Payable Total</span>
              <span className="font-mono tabular-nums text-base">Rs. {total.toLocaleString()}</span>
            </div>
          </div>

          {/* Place Order CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing & Reserving Inventory...</span>
                </>
              ) : (
                <>
                  <span>Place Order (Rs. {total.toLocaleString()})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-neutral-400 mt-2">
              By confirming your order, you agree to GreyNova's Terms and 1-Year Warranty policies.
            </p>
          </div>

        </form>

      </div>
    </div>
  );
}
