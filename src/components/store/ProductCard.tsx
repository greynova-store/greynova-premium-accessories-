import React from 'react';
import { Heart, Plus, Check } from 'lucide-react';
import { Product } from '../../types/store';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
}

export function ProductCard({
  product,
  onOpenDetail,
  onQuickAdd,
  isWishlisted,
  onToggleWishlist,
}: ProductCardProps) {
  const primaryImage = product.images.find(img => img.is_primary)?.image_url || product.images[0]?.image_url;
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold;
  const hasDiscount = product.sale_price !== null && product.sale_price !== undefined && product.sale_price < product.price;

  return (
    <div className="group relative flex flex-col bg-white border border-neutral-200/80 rounded-2xl overflow-hidden hover:border-neutral-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
      
      {/* 1. Image Container (takes ~65% of upper card) */}
      <div
        onClick={() => onOpenDetail(product)}
        className="relative w-full aspect-[4/3] bg-neutral-100 overflow-hidden cursor-pointer flex items-center justify-center"
      >
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 text-neutral-400 p-4 text-center">
            <span className="text-xs font-medium">GreyNova Hardware</span>
          </div>
        )}

        {/* Wishlist Button on Top-Right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-colors ${
            isWishlisted
              ? 'bg-neutral-900 text-rose-500'
              : 'bg-white/80 text-neutral-600 hover:text-neutral-900 hover:bg-white'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-rose-500' : ''}`} />
        </button>

        {/* Quick Add Overlay Button on desktop hover */}
        {!isOutOfStock && (
          <div className="absolute inset-x-3 bottom-3 hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(product);
              }}
              className="w-full py-2.5 bg-neutral-900/90 hover:bg-neutral-900 backdrop-blur-md text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Quick Add</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Metadata & Pricing Section */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div onClick={() => onOpenDetail(product)} className="cursor-pointer">
          
          {/* Category & Stock Indicator (Unboxed quiet text) */}
          <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-medium mb-1">
            <span className="uppercase tracking-wider truncate">{product.category_name || 'Hardware'}</span>
            <span aria-hidden="true">·</span>
            {isOutOfStock ? (
              <span className="text-rose-500 font-semibold">Out of Stock</span>
            ) : isLowStock ? (
              <span className="text-amber-600 font-medium">Low Stock: {product.stock_quantity} left</span>
            ) : (
              <span className="text-emerald-600">In Stock</span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="text-sm font-semibold text-neutral-900 leading-snug line-clamp-1 group-hover:text-neutral-700 transition-colors">
            {product.name}
          </h3>

          {/* Tagline / Subtitle */}
          {product.tagline && (
            <p className="text-xs text-neutral-500 mt-1 line-clamp-1 leading-relaxed">
              {product.tagline}
            </p>
          )}
        </div>

        {/* Bottom Row: Price & Mobile Quick Add */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-neutral-900 font-mono tabular-nums">
              Rs. {(product.sale_price ?? product.price).toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-xs text-neutral-400 line-through font-mono tabular-nums">
                Rs. {product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Mobile Quick Add / Detail CTA */}
          <button
            onClick={() => (isOutOfStock ? onOpenDetail(product) : onQuickAdd(product))}
            disabled={isOutOfStock}
            className={`sm:hidden p-2 rounded-xl text-xs font-medium transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 ${
              isOutOfStock
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : 'bg-neutral-900 text-white hover:bg-neutral-800'
            }`}
            aria-label="Add to cart"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
