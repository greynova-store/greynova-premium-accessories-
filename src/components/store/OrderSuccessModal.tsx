import React from 'react';
import { CheckCircle2, Package, Clock, Truck, ArrowRight, Printer, ShieldCheck } from 'lucide-react';
import { Order } from '../../types/store';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onViewOrders: () => void;
}

export function OrderSuccessModal({
  order,
  onClose,
  onViewOrders,
}: OrderSuccessModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Success Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-200/80 text-center shrink-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-200/70 shadow-xs">
            <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900">Order Confirmed</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Thank you, {order.customer_name}. We are preparing your shipment.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-900 font-mono text-xs font-semibold border border-neutral-200">
            <span>Order #:</span>
            <span>{order.order_number}</span>
          </div>
        </div>

        {/* Status Indicators & Details */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          
          {/* Status Breakdown (Order Status vs Payment Status) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80">
              <span className="text-neutral-400 block mb-1">Order Status</span>
              <span className="font-semibold text-neutral-900 capitalize flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                {order.order_status.replace('_', ' ')}
              </span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80">
              <span className="text-neutral-400 block mb-1">Payment Status</span>
              <span className="font-semibold text-neutral-900 capitalize flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-neutral-700" />
                {order.payment_method === 'cash_on_delivery' ? 'Unpaid (COD)' : order.payment_status}
              </span>
            </div>
          </div>

          {/* Delivery Destination */}
          <div className="p-4 bg-neutral-50/70 rounded-2xl border border-neutral-200/80 space-y-1">
            <h4 className="font-semibold text-neutral-900">Destination Address</h4>
            <p className="text-neutral-600 leading-relaxed">
              {order.shipping_address.street_address}
              {order.shipping_address.apartment ? `, ${order.shipping_address.apartment}` : ''}
              <br />
              {order.shipping_address.city}, {order.shipping_address.postal_code}, Pakistan
            </p>
            <p className="text-neutral-500 pt-1">
              Recipient Contact: <b>{order.customer_phone}</b>
            </p>
          </div>

          {/* Purchased Items Summary */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-2">Order Items ({order.items.length})</h4>
            <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-2xl overflow-hidden bg-white">
              {order.items.map(item => (
                <div key={item.id} className="p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900 truncate">{item.product_name}</p>
                    <p className="text-[11px] text-neutral-500 font-mono">
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

          {/* Total Breakdown */}
          <div className="p-3 bg-neutral-100/70 rounded-2xl border border-neutral-200 flex justify-between items-center text-sm font-bold text-neutral-900">
            <span>Total Payable Amount</span>
            <span className="font-mono tabular-nums text-base">
              Rs. {order.total_amount.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2 p-3 bg-neutral-50 rounded-xl text-neutral-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-neutral-700 shrink-0" />
            <span>Eligible for 1-Year GreyNova direct replacement warranty upon delivery.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-neutral-50/80 border-t border-neutral-200/80 flex items-center gap-3 shrink-0">
          <button
            onClick={onViewOrders}
            className="flex-1 py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-2xl shadow-sm transition-colors text-center"
          >
            Track in My Orders
          </button>
          <button
            onClick={onClose}
            className="py-3 px-5 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-semibold rounded-2xl border border-neutral-300 transition-colors"
          >
            Continue Shopping
          </button>
        </div>

      </div>
    </div>
  );
}
