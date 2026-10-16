import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { CartCalculation } from '../../types/store';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartCalculation: CartCalculation | null;
  onUpdateQuantity: (productId: string, variantSku: string | undefined, newQty: number) => void;
  onRemoveItem: (productId: string, variantSku?: string) => void;
  onProceedToCheckout: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  cartCalculation,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const items = cartCalculation?.items || [];
  const subtotal = cartCalculation?.subtotal || 0;
  const deliveryCharge = cartCalculation?.delivery_charge || 0;
  const total = cartCalculation?.total || 0;
  const freeThreshold = cartCalculation?.free_shipping_threshold || 3500;
  const amountForFree = cartCalculation?.amount_for_free_shipping || 0;
  const progressPercent = Math.min(100, (subtotal / freeThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-neutral-200">
          
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neutral-800" />
              <h2 className="text-base font-bold text-neutral-900">Shopping Cart</h2>
              <span className="text-xs text-neutral-500 font-mono">({items.length} items)</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-xl hover:bg-neutral-200/60 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-6 py-3 bg-neutral-100/70 border-b border-neutral-200 text-xs">
            {amountForFree > 0 ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-neutral-600 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-neutral-800" />
                    <span>Add <b>Rs. {amountForFree.toLocaleString()}</b> for Free Express Shipping</span>
                  </span>
                  <span className="font-mono text-[11px]">{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>You unlocked Complimentary Express Courier Delivery!</span>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-neutral-800">Your bag is empty</h3>
                <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                  Explore our precision cases, GaN fast chargers, and accessories to power up your daily setup.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-5 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map(item => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 hover:border-neutral-300 transition-colors"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-200 shrink-0 border border-neutral-200/60">
                    <img
                      src={item.product.images[0]?.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-semibold text-neutral-900 truncate pr-2">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.product_id, item.variant_sku)}
                          className="text-neutral-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {item.variant_sku && (
                        <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                          Variant: {item.variant_sku}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-200/60">
                      <span className="text-xs font-bold text-neutral-900 font-mono tabular-nums">
                        Rs. {item.total_price.toLocaleString()}
                      </span>

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white">
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.product_id, item.variant_sku, item.quantity - 1)
                          }
                          className="p-1 text-neutral-600 hover:bg-neutral-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-neutral-800 font-mono tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.product_id, item.variant_sku, item.quantity + 1)
                          }
                          className="p-1 text-neutral-600 hover:bg-neutral-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Calculations and Checkout Action */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 bg-white border-t border-neutral-200 space-y-4">
              <div className="space-y-2 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900 font-mono tabular-nums">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Doorstep Courier Delivery</span>
                  <span className="font-mono tabular-nums font-semibold text-neutral-900">
                    {deliveryCharge === 0 ? (
                      <span className="text-emerald-700">FREE</span>
                    ) : (
                      `Rs. ${deliveryCharge.toLocaleString()}`
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-neutral-200 flex justify-between text-sm font-bold text-neutral-900">
                  <span>Estimated Total</span>
                  <span className="font-mono tabular-nums text-base">
                    Rs. {total.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center justify-center gap-3 text-[11px] text-neutral-400">
                <span>Cash on Delivery</span>
                <span>·</span>
                <span>1-Year GreyNova Warranty</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
