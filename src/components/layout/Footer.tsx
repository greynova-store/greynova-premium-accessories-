import React from 'react';
import { ShieldCheck, Truck, RefreshCw, Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onOpenPolicy: (policy: string) => void;
  onSelectCategory: (slug: string) => void;
}

export function Footer({ onOpenPolicy, onSelectCategory }: FooterProps) {
  return (
    <footer className="bg-neutral-900 text-neutral-400 border-t border-neutral-800 text-xs">
      
      {/* Top Value Banner */}
      <div className="border-b border-neutral-800 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="p-2.5 rounded-xl bg-neutral-800 text-white shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white">1-Year Direct Warranty</h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">Component failure & thermal safety guarantee</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="p-2.5 rounded-xl bg-neutral-800 text-white shrink-0">
              <Truck className="w-5 h-5 text-neutral-300" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Cash on Delivery Across Pakistan</h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">Free courier delivery on orders above Rs. 3,500</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="p-2.5 rounded-xl bg-neutral-800 text-white shrink-0">
              <RefreshCw className="w-5 h-5 text-neutral-300" />
            </div>
            <div>
              <h4 className="font-semibold text-white">7-Day Inspection Return</h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">Hassle-free exchange for unboxed hardware</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Brand Info */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white text-neutral-900 flex items-center justify-center font-bold text-xs tracking-wider">
              GN
            </div>
            <span className="text-base font-bold text-white tracking-tight">GreyNova</span>
          </div>
          <p className="text-neutral-400 leading-relaxed max-w-sm">
            Premium mobile accessories engineered from Grade 5 titanium, GaN III, and precision acoustics. Smarter everyday gear built for flagship smartphones and tablets.
          </p>
          <div className="pt-2 text-neutral-500 space-y-1 text-[11px]">
            <p className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> support@greynova.store
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" /> +92 300 1234567 (Mon-Sat 10 AM - 8 PM PKT)
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" /> GreyNova Tech Lab, Clifton, Karachi, Pakistan
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">Hardware Categories</h4>
          <ul className="space-y-2">
            <li>
              <button onClick={() => onSelectCategory('phone-cases')} className="hover:text-white transition-colors">
                Titanium Phone Cases
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('chargers')} className="hover:text-white transition-colors">
                100W GaN Fast Chargers
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('earbuds')} className="hover:text-white transition-colors">
                ANC Wireless Earbuds
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('power-banks')} className="hover:text-white transition-colors">
                Magnetic Wireless Battery Banks
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('cables')} className="hover:text-white transition-colors">
                Braided 240W Kevlar Cables
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('screen-protectors')} className="hover:text-white transition-colors">
                9H Sapphire Glass Protectors
              </button>
            </li>
          </ul>
        </div>

        {/* Customer Care & Policies */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">Customer Care</h4>
          <ul className="space-y-2">
            <li>
              <button onClick={() => onOpenPolicy('about')} className="hover:text-white transition-colors">
                About GreyNova
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPolicy('shipping')} className="hover:text-white transition-colors">
                Shipping & COD Policy
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPolicy('warranty')} className="hover:text-white transition-colors">
                1-Year Replacement Warranty
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPolicy('returns')} className="hover:text-white transition-colors">
                Returns & Refund Policy
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPolicy('privacy')} className="hover:text-white transition-colors">
                Privacy Policy
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPolicy('terms')} className="hover:text-white transition-colors">
                Terms of Service
              </button>
            </li>
          </ul>
        </div>

        {/* Support & System Help */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">Support</h4>
          <ul className="space-y-2">
            <li>
              <button onClick={() => onOpenPolicy('contact')} className="hover:text-white transition-colors">
                Contact Desk
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPolicy('faqs')} className="hover:text-white transition-colors">
                Customer FAQs
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPolicy('shipping')} className="hover:text-white transition-colors">
                Track Shipment
              </button>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800/80 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>© {new Date().getFullYear()} GreyNova Technologies Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Cash on Delivery (PKR)</span>
            <span>·</span>
            <span>Card Payments</span>
            <span>·</span>
            <span>Direct Bank Transfer</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
