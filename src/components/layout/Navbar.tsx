import React, { useState } from 'react';
import { ShoppingBag, Search, Heart, User, ShieldCheck, Menu, X, ArrowRight, LogIn, UserPlus, LogOut } from 'lucide-react';
import { UserProfile, UserRole } from '../../types/store';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  user: (UserProfile & { role: UserRole; username?: string }) | null;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onNavigate: (path: string) => void;
  onOpenDashboard: () => void;
  onSelectCategory: (categorySlug: string | null) => void;
  selectedCategory: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenPolicy: (policy: string) => void;
  onLogout: () => void;
}

export function Navbar({
  cartCount,
  wishlistCount,
  user,
  onOpenCart,
  onOpenWishlist,
  onNavigate,
  onOpenDashboard,
  onSelectCategory,
  selectedCategory,
  searchQuery,
  onSearchChange,
  onOpenPolicy,
  onLogout,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      {/* 1. Slim Announcement Bar (Responsive down to 320px) */}
      <div className="bg-neutral-900 text-neutral-300 text-[11px] sm:text-xs py-2 px-3 sm:px-4 border-b border-neutral-800 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
            <span className="font-semibold text-white shrink-0">Express Courier</span>
            <span className="text-neutral-500">·</span>
            <span className="truncate">Free delivery over Rs. 3,500</span>
            <span className="hidden md:inline text-neutral-500">·</span>
            <span className="hidden md:inline text-neutral-300">Cash on Delivery across Pakistan</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 shrink-0 text-neutral-400 text-[11px]">
            <button
              onClick={() => onOpenPolicy('shipping')}
              className="hover:text-white transition-colors"
            >
              Shipping & COD
            </button>
            <span className="text-neutral-700">·</span>
            <button
              onClick={() => onOpenPolicy('warranty')}
              className="hover:text-white transition-colors"
            >
              1-Year Warranty
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Bar Contract: Zone 1 (Brand) — Zone 2 (4-5 Nav Links) — Zone 3 (Primary Actions) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-8">
          
          {/* Zone 1: Brand Wordmark (Responsive) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => {
                onSelectCategory(null);
                onNavigate('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 text-left group min-h-[44px] min-w-[44px]"
              aria-label="GreyNova Home"
            >
              <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm group-hover:bg-neutral-800 transition-colors">
                GN
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 leading-none">
                  GreyNova
                </span>
                <span className="hidden min-[380px]:inline text-[10px] tracking-widest text-neutral-400 uppercase mt-0.5">
                  Tech Essentials
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4–5 Clean Navigation Links (Hidden on mobile, desktop visible) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-sm font-medium text-neutral-600">
            <button
              onClick={() => {
                onSelectCategory(null);
                onNavigate('/');
              }}
              className={`hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                selectedCategory === null ? 'text-neutral-950 font-semibold' : ''
              }`}
            >
              All Gear
            </button>
            <button
              onClick={() => {
                onSelectCategory('phone-cases');
                onNavigate('/');
              }}
              className={`hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                selectedCategory === 'phone-cases' ? 'text-neutral-950 font-semibold' : ''
              }`}
            >
              Phone Cases
            </button>
            <button
              onClick={() => {
                onSelectCategory('chargers');
                onNavigate('/');
              }}
              className={`hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                selectedCategory === 'chargers' ? 'text-neutral-950 font-semibold' : ''
              }`}
            >
              GaN Chargers
            </button>
            <button
              onClick={() => {
                onSelectCategory('earbuds');
                onNavigate('/');
              }}
              className={`hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                selectedCategory === 'earbuds' ? 'text-neutral-950 font-semibold' : ''
              }`}
            >
              ANC Earbuds
            </button>
            <button
              onClick={() => {
                onSelectCategory('power-banks');
                onNavigate('/');
              }}
              className={`hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                selectedCategory === 'power-banks' ? 'text-neutral-950 font-semibold' : ''
              }`}
            >
              Power Banks
            </button>
          </nav>

          {/* Zone 3: Interactive Affordances & Primary Action */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* Search Bar / Search Toggle */}
            <div className="relative">
              {searchOpen ? (
                <div className="flex items-center bg-neutral-100 rounded-xl px-2.5 py-1.5 border border-neutral-300 w-40 min-[380px]:w-52 sm:w-64 animate-in fade-in">
                  <Search className="w-4 h-4 text-neutral-400 mr-1.5 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => onSearchChange(e.target.value)}
                    placeholder="Search gear..."
                    className="w-full bg-transparent text-xs text-neutral-900 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      onSearchChange('');
                    }}
                    className="text-neutral-400 hover:text-neutral-700 ml-1 p-1"
                    aria-label="Close search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 sm:p-2 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Search store"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Wishlist Button (Hidden on tiny screens < 640px to preserve space) */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 rounded-xl transition-colors hidden sm:flex items-center justify-center min-h-[44px] min-w-[44px]"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-neutral-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* User Account Action */}
            {user ? (
              <button
                onClick={onOpenDashboard}
                className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors border border-neutral-200/70 min-h-[44px]"
                title="My Account"
              >
                <div className="w-7 h-7 rounded-lg bg-neutral-200 text-neutral-800 flex items-center justify-center font-bold text-xs shrink-0">
                  {user.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden md:inline max-w-[90px] truncate">{user.full_name}</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('/login')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 rounded-xl transition-colors min-h-[44px]"
              >
                <User className="w-4 h-4 text-neutral-500" />
                <span>Sign In</span>
              </button>
            )}

            {/* Primary Action: Shopping Bag */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-sm whitespace-nowrap shrink-0 group min-h-[44px]"
              aria-label="View shopping bag"
            >
              <ShoppingBag className="w-4 h-4 text-neutral-300 group-hover:text-white transition-colors" />
              <span className="hidden md:inline">Cart</span>
              <span className="bg-neutral-700 text-white text-[11px] px-1.5 py-0.5 rounded-md font-mono tabular-nums">
                {cartCount}
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-xl lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white px-4 py-4 space-y-4 shadow-xl animate-in slide-in-from-top-2 max-h-[85vh] overflow-y-auto">
            
            {/* Account Status on Mobile */}
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-900 truncate">{user.full_name}</p>
                    <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onOpenDashboard();
                        setMobileMenuOpen(false);
                      }}
                      className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl"
                    >
                      Account
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onNavigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 py-2.5 px-3 bg-neutral-900 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('/signup');
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 py-2.5 px-3 bg-white text-neutral-800 border border-neutral-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account</span>
                  </button>
                </div>
              )}
            </div>

            {/* Categories Grid */}
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                Browse Hardware
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium text-neutral-700">
                <button
                  onClick={() => {
                    onSelectCategory(null);
                    onNavigate('/');
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl text-left border min-h-[44px] flex items-center ${
                    selectedCategory === null ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  All Accessories
                </button>
                <button
                  onClick={() => {
                    onSelectCategory('phone-cases');
                    onNavigate('/');
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl text-left border min-h-[44px] flex items-center ${
                    selectedCategory === 'phone-cases' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  Phone Cases
                </button>
                <button
                  onClick={() => {
                    onSelectCategory('chargers');
                    onNavigate('/');
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl text-left border min-h-[44px] flex items-center ${
                    selectedCategory === 'chargers' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  GaN Chargers
                </button>
                <button
                  onClick={() => {
                    onSelectCategory('earbuds');
                    onNavigate('/');
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl text-left border min-h-[44px] flex items-center ${
                    selectedCategory === 'earbuds' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  ANC Earbuds
                </button>
                <button
                  onClick={() => {
                    onSelectCategory('power-banks');
                    onNavigate('/');
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl text-left border min-h-[44px] flex items-center ${
                    selectedCategory === 'power-banks' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  Power Banks
                </button>
                <button
                  onClick={() => {
                    onSelectCategory('cables');
                    onNavigate('/');
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl text-left border min-h-[44px] flex items-center ${
                    selectedCategory === 'cables' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  Braided Cables
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
              <button
                onClick={() => {
                  onOpenWishlist();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 py-2 min-h-[44px]"
              >
                <Heart className="w-4 h-4 text-rose-500" /> Wishlist ({wishlistCount})
              </button>
              <button
                onClick={() => {
                  onOpenPolicy('shipping');
                  setMobileMenuOpen(false);
                }}
                className="py-2 hover:underline min-h-[44px] flex items-center"
              >
                Shipping & COD
              </button>
              <button
                onClick={() => {
                  onOpenPolicy('warranty');
                  setMobileMenuOpen(false);
                }}
                className="py-2 hover:underline min-h-[44px] flex items-center"
              >
                1-Yr Warranty
              </button>
            </div>

          </div>
        )}
      </header>
    </>
  );
}
