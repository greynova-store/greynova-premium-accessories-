import React, { useState } from 'react';
import { X, ShieldCheck, Truck, RefreshCw, Check, AlertTriangle, Plus, Minus, Heart } from 'lucide-react';
import { Product, ProductVariant } from '../../types/store';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, variantSku?: string, quantity?: number) => void;
  onBuyNow: (product: Product, variantSku?: string, quantity?: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
}

export function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  isWishlisted,
  onToggleWishlist,
}: ProductDetailModalProps) {
  if (!product) return null;

  const [selectedImage, setSelectedImage] = useState<string>(
    product.images[0]?.image_url || ''
  );
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants[0]
  );
  const [quantity, setQuantity] = useState(1);

  const isOutOfStock = product.stock_quantity <= 0;
  const currentPrice = product.sale_price ?? product.price;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    onAddToCart(product, selectedVariant?.sku, quantity);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    onBuyNow(product, selectedVariant?.sku, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-200/80 bg-neutral-50/80 shrink-0">
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium truncate pr-2">
            <span>{product.category_name || 'Accessories'}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px] truncate">{product.sku}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-xl hover:bg-neutral-200/60 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-6 flex flex-col space-y-4">
            <div className="relative w-full aspect-square bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-200/80">
              <img
                src={selectedImage || product.images[0]?.image_url}
                alt={product.name}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Thumbnail selector */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {product.images.map(img => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.image_url)}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === img.image_url
                        ? 'border-neutral-900 shadow-xs'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.image_url}
                      alt={img.alt_text || 'Thumbnail'}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Specifications Strip */}
            {product.specifications.length > 0 && (
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-neutral-100">
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">
                  Technical Specifications
                </h4>
                <div className="space-y-2 text-xs">
                  {product.specifications.map((spec, idx) => (
                    <div key={idx} className="flex justify-between py-1.5 border-b border-neutral-100/80 gap-3">
                      <span className="text-neutral-500 shrink-0">{spec.label}</span>
                      <span className="font-medium text-neutral-900 text-right break-words">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4 sm:space-y-5">
              
              {/* Title & Tagline */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight leading-tight">
                  {product.name}
                </h2>
                {product.tagline && (
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    {product.tagline}
                  </p>
                )}
              </div>

              {/* Price display with Tabular numerals */}
              <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 p-3 sm:p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/60">
                <span className="text-xl sm:text-2xl font-bold text-neutral-900 font-mono tabular-nums">
                  Rs. {currentPrice.toLocaleString()}
                </span>
                {product.sale_price && (
                  <span className="text-xs sm:text-sm text-neutral-400 line-through font-mono tabular-nums">
                    Rs. {product.price.toLocaleString()}
                  </span>
                )}
                <span className="text-[11px] text-neutral-500 ml-auto font-medium">
                  Tax Inclusive
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                {product.description}
              </p>

              {/* Variant Selector */}
              {product.variants.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                    Select Finish: <span className="text-neutral-900 font-bold">{selectedVariant?.title}</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.variants.map(v => (
                      <button
                        key={v.sku}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium text-left border transition-all min-h-[44px] ${
                          selectedVariant?.sku === v.sku
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="truncate">{v.title}</div>
                        <div className={`text-[10px] mt-0.5 ${selectedVariant?.sku === v.sku ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {v.stock > 0 ? `${v.stock} in stock` : 'Out of stock'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper & Stock Notice */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-neutral-600">Quantity</span>
                  <div className="flex items-center border border-neutral-300 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="p-2 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 min-h-[40px] min-w-[36px] flex items-center justify-center"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-semibold text-neutral-900 font-mono tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      disabled={quantity >= product.stock_quantity || isOutOfStock}
                      className="p-2 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 min-h-[40px] min-w-[36px] flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs">
                  {isOutOfStock ? (
                    <span className="text-rose-600 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Out of stock
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {product.stock_quantity} available
                    </span>
                  )}
                </div>
              </div>

            </div>

            {/* Contiguous Action Module */}
            <div className="pt-4 sm:pt-6 border-t border-neutral-200 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 py-3.5 px-4 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-semibold rounded-2xl border border-neutral-300 shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="flex-1 py-3.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-2xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                >
                  Instant Checkout
                </button>
                <button
                  onClick={() => onToggleWishlist(product.id)}
                  className={`p-3.5 rounded-2xl border transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    isWishlisted
                      ? 'border-neutral-900 bg-neutral-900 text-rose-500'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-rose-500' : ''}`} />
                </button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[10px] sm:text-[11px] text-neutral-500">
                <div className="p-2 bg-neutral-50 rounded-xl">
                  <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-neutral-700" />
                  <span>1-Yr Warranty</span>
                </div>
                <div className="p-2 bg-neutral-50 rounded-xl">
                  <Truck className="w-4 h-4 mx-auto mb-1 text-neutral-700" />
                  <span>Doorstep COD</span>
                </div>
                <div className="p-2 bg-neutral-50 rounded-xl">
                  <RefreshCw className="w-4 h-4 mx-auto mb-1 text-neutral-700" />
                  <span>7-Day Return</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
