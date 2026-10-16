import React from 'react';
import { ArrowRight, Shield, Zap, Sparkles } from 'lucide-react';
import heroImage from '@/src/assets/images/hero_accessories_showcase_1792129545783.jpg';

interface HeroBannerProps {
  onShopNow: () => void;
  onSelectCategory: (slug: string) => void;
}

export function HeroBanner({ onShopNow, onSelectCategory }: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden pt-6 pb-12 sm:py-12 bg-gradient-to-b from-white via-neutral-50/50 to-neutral-100/60 border-b border-neutral-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Main 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Brand Copy & Direct Route */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 uppercase tracking-widest">
              <span>GreyNova Studio</span>
              <span aria-hidden="true">·</span>
              <span>2026 Collection</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 leading-[1.15] text-balance">
              Premium Accessories. <br />
              <span className="text-neutral-500 font-medium">Smarter Everyday.</span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-lg">
              Precision-machined Grade 5 titanium cases, 100W GaN III fast chargers, lossless audio earbuds, and slim magnetic power banks built for modern flagship devices.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onShopNow}
                className="w-full sm:w-auto px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-2xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 group whitespace-nowrap min-h-[44px]"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onSelectCategory('chargers')}
                className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-semibold rounded-2xl border border-neutral-300/80 transition-colors shadow-xs whitespace-nowrap text-center justify-center min-h-[44px]"
              >
                GaN Fast Chargers
              </button>
            </div>

            {/* Micro Trust Points */}
            <div className="pt-4 border-t border-neutral-200/80 flex items-center gap-4 text-xs text-neutral-500">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-neutral-800">1-Year</span>
                <span>Warranty</span>
              </div>
              <span aria-hidden="true" className="text-neutral-300">/</span>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-neutral-800">Cash on Delivery</span>
                <span>Active</span>
              </div>
              <span aria-hidden="true" className="text-neutral-300">/</span>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-neutral-800">48-Hr</span>
                <span>Dispatch</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden border border-neutral-200/80 shadow-xl bg-neutral-100 aspect-[16/10] sm:aspect-[16/9]">
              <img
                src={heroImage}
                alt="GreyNova Luxury Mobile Accessories Collection"
                className="w-full h-full object-cover transform hover:scale-[1.02] transition-transform duration-700"
                loading="eager"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              
              {/* Subtle floating feature label */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white/95 text-xs">
                <div className="bg-neutral-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 font-medium">
                  Flagship Titanium & GaN Hardware
                </div>
                <div className="hidden sm:block text-[11px] text-white/80 font-mono tabular-nums">
                  CNC Precision Machined
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 pt-8 border-t border-neutral-200/80">
          <div className="p-4 bg-white/70 rounded-2xl border border-neutral-200/60 shadow-xs flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-neutral-100 text-neutral-900 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-900">Titanium & Aramid Fiber</h4>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Precision CNC Grade 5 titanium edges with high-energy N52 MagSafe core alignment.
              </p>
            </div>
          </div>

          <div className="p-4 bg-white/70 rounded-2xl border border-neutral-200/60 shadow-xs flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-neutral-100 text-neutral-900 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-900">Next-Gen GaN III Technology</h4>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Up to 100W fast power with intelligent ThermalGuard 3.0 temperature safety regulation.
              </p>
            </div>
          </div>

          <div className="p-4 bg-white/70 rounded-2xl border border-neutral-200/60 shadow-xs flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-neutral-100 text-neutral-900 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-900">Doorstep Cash on Delivery</h4>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Inspect your parcel before cash payment. Full 1-Year GreyNova direct replacement guarantee.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
