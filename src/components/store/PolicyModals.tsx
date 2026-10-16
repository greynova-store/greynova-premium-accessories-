import React from 'react';
import { X, ShieldCheck, Truck, Mail, Phone, MapPin, HelpCircle, FileText } from 'lucide-react';

interface PolicyModalProps {
  policy: string | null;
  onClose: () => void;
}

export function PolicyModals({ policy, onClose }: PolicyModalProps) {
  if (!policy) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-auto max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-neutral-800" />
            <h2 className="text-base font-bold text-neutral-900 capitalize">
              {policy === 'about' && 'About GreyNova'}
              {policy === 'shipping' && 'Shipping & Cash on Delivery (COD)'}
              {policy === 'warranty' && '1-Year Hardware Replacement Warranty'}
              {policy === 'returns' && 'Returns & Refunds Policy'}
              {policy === 'contact' && 'Contact Customer Support'}
              {policy === 'faqs' && 'Frequently Asked Questions'}
              {policy === 'privacy' && 'Privacy Policy'}
              {policy === 'terms' && 'Terms of Service'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-xl hover:bg-neutral-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-4 text-xs text-neutral-700 leading-relaxed">
          
          {policy === 'about' && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-neutral-900">
                GreyNova — Premium Accessories. Smarter Everyday.
              </p>
              <p>
                GreyNova is a specialized consumer electronics and mobile accessories brand dedicated to designing precision hardware for flagship smartphones, laptops, and everyday mobility.
              </p>
              <p>
                Unlike generic mass-market distributors, every GreyNova item undergoes strict laboratory quality control. From Grade 5 titanium CNC milling to intelligent GaN III Gallium Nitride thermal matrices, we engineer accessories that match the build standards of the world’s most advanced mobile flagships.
              </p>
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                <h4 className="font-bold text-neutral-900 mb-1">Our Engineering Principles</h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-600">
                  <li>Genuine aerospace metals, aramid fibers, and sapphire crystal glass.</li>
                  <li>Real wattages and verified high-speed Power Delivery standards.</li>
                  <li>Doorstep customer inspection before payment across Pakistan.</li>
                </ul>
              </div>
            </div>
          )}

          {policy === 'shipping' && (
            <div className="space-y-3">
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-start gap-3">
                <Truck className="w-5 h-5 text-neutral-900 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-neutral-900">Doorstep Delivery Nationwide</h4>
                  <p className="text-neutral-600 mt-0.5">
                    We deliver to all major cities and towns across Pakistan via trusted express courier partners (TCS, Leopard, PostEx).
                  </p>
                </div>
              </div>
              <h4 className="font-bold text-neutral-900 pt-2">Shipping Charges</h4>
              <p>
                • <b>Complimentary Free Delivery</b> on all orders above <b>Rs. 3,500</b>.
                <br />
                • Standard delivery fee of <b>Rs. 250</b> applies for orders under Rs. 3,500.
              </p>
              <h4 className="font-bold text-neutral-900 pt-2">Cash on Delivery (COD)</h4>
              <p>
                You can pay with exact cash to the courier representative at the moment of delivery. Please inspect the outer protective packaging before handing over the payment.
              </p>
              <h4 className="font-bold text-neutral-900 pt-2">Delivery Timelines</h4>
              <p>
                • Karachi, Lahore, Islamabad, Rawalpindi: <b>24 to 48 Hours</b>
                <br />
                • Other Cities & Regional Hubs: <b>2 to 4 Business Days</b>
              </p>
            </div>
          )}

          {policy === 'warranty' && (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-950">1-Year Direct Replacement Guarantee</h4>
                  <p className="text-emerald-800 mt-0.5">
                    Your GreyNova hardware is backed by our official 12-month comprehensive warranty from the date of confirmed delivery.
                  </p>
                </div>
              </div>
              <h4 className="font-bold text-neutral-900 pt-2">What Is Covered</h4>
              <p>
                • Charger internal component failure or abnormal heating.
                <br />
                • Earbuds driver degradation, battery dysfunction, or charging vault failure.
                <br />
                • MagSafe magnetic core detachment or wireless charging disconnects.
                <br />
                • Cable wiring disconnection under normal usage.
              </p>
              <h4 className="font-bold text-neutral-900 pt-2">How to Claim</h4>
              <p>
                Simply message our WhatsApp support desk at <b>+92 300 1234567</b> with your unique <b>Order Number (GN-XXXXXX)</b> and a short video demonstration of the issue. A replacement unit will be dispatched without hassle.
              </p>
            </div>
          )}

          {policy === 'returns' && (
            <div className="space-y-3">
              <h4 className="font-bold text-neutral-900">7-Day Inspection Policy</h4>
              <p>
                If you receive an incorrect product, variant mismatch, or transit damage, you are eligible for an immediate return or exchange within 7 days of package delivery.
              </p>
              <p>
                Returned items must include the original protective retail box, accessories, and user manual. Once received at our Karachi facility, refunds are processed via Bank Transfer or JazzCash/EasyPaisa within 48 business hours.
              </p>
            </div>
          )}

          {policy === 'contact' && (
            <div className="space-y-4">
              <p>Our technical team and customer advisors are available 6 days a week to assist you with order tracking, device compatibility, and warranty claims.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                  <Mail className="w-4 h-4 text-neutral-800 mb-1" />
                  <span className="font-bold text-neutral-900 block">Email Us</span>
                  <span className="text-neutral-600">support@greynova.store</span>
                </div>
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                  <Phone className="w-4 h-4 text-neutral-800 mb-1" />
                  <span className="font-bold text-neutral-900 block">WhatsApp & Call</span>
                  <span className="text-neutral-600 font-mono">+92 300 1234567</span>
                </div>
              </div>
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-start gap-3">
                <MapPin className="w-4 h-4 text-neutral-800 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-neutral-900 block">Flagship Tech Hub</span>
                  <p className="text-neutral-600">
                    GreyNova Electronics Lab, Block 4, Clifton, Karachi, Pakistan.
                    <br />
                    Hours: Monday - Saturday: 10:00 AM – 8:00 PM PKT
                  </p>
                </div>
              </div>
            </div>
          )}

          {policy === 'faqs' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200">
                <h4 className="font-bold text-neutral-900">Are GreyNova cases MagSafe compatible?</h4>
                <p className="text-neutral-600 mt-1">
                  Yes, all GreyNova phone cases feature embedded N52 neodymium magnetic rings with 1500g magnetic pull force for snap-on chargers and car mounts.
                </p>
              </div>
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200">
                <h4 className="font-bold text-neutral-900">Can the 100W GaN charger charge my laptop and phone at the same time?</h4>
                <p className="text-neutral-600 mt-1">
                  Yes, the intelligent GaN III chip dynamically allocates 65W to your laptop and 30W/18W to your phone and earbuds simultaneously without overheating.
                </p>
              </div>
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200">
                <h4 className="font-bold text-neutral-900">How do I track my order?</h4>
                <p className="text-neutral-600 mt-1">
                  Click on "My Orders" in your customer dashboard or enter your Order Number (GN-XXXXXX) to view live fulfillment updates.
                </p>
              </div>
            </div>
          )}

          {policy === 'privacy' && (
            <div className="space-y-3">
              <p>
                At GreyNova, we value your privacy. We collect only the information necessary to fulfill your orders (such as delivery address, contact phone, and email).
              </p>
              <p>
                We never store raw credit card numbers or sensitive financial credentials on our servers. Customer data is strictly protected via database Row Level Security and encrypted HTTPS connections.
              </p>
            </div>
          )}

          {policy === 'terms' && (
            <div className="space-y-3">
              <p>
                By placing an order on GreyNova, you agree to our purchase and shipping terms. All products are backed by our genuine hardware specifications.
              </p>
              <p>
                For Cash on Delivery orders, order placement constitutes a binding request for parcel dispatch. Please ensure you or an authorized representative is present at the designated delivery address.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50/80 border-t border-neutral-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
