import React from 'react';
import { Plus, Minus, Star, Heart, ShieldCheck, Zap, Sparkles, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useDevice } from '../context/DeviceContext';

export default function ProductCard({ product, onOpenDetail, onBuyNow }) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { isMobile, triggerHaptic } = useDevice();

  const cartItem = cartItems.find(item => item.product.id === product.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const wishlisted = isWishlisted(product.id);

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const currentPrice = product.discountPrice || product.price;
  const ratingValue = Number(product.rating || 4.8).toFixed(1);
  const isLowStock = product.stockQuantity && product.stockQuantity <= 10;

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/80 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      
      {/* Top Badges & Wishlist */}
      <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-1.5 items-start">
          {/* Flipkart / ZamZam Assured Badge */}
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shadow-sm pointer-events-auto border border-blue-400/30 tracking-tight">
            <ShieldCheck className="w-3 h-3 mr-1 text-amber-300 fill-amber-300" />
            <span className="text-white font-extrabold italic">ZamZam</span>
            <span className="text-amber-300 font-black italic ml-1">Assured</span>
          </span>

          {discountPercent > 0 && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-600 text-white shadow-sm pointer-events-auto">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`p-2 rounded-full pointer-events-auto shadow-sm transition-all ${
            wishlisted 
              ? 'bg-rose-50 text-rose-600' 
              : 'bg-white/90 backdrop-blur-sm text-slate-400 hover:text-rose-500'
          }`}
          title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Image container */}
      <div 
        onClick={() => onOpenDetail(product)} 
        className="relative bg-slate-50 overflow-hidden cursor-pointer aspect-square flex items-center justify-center p-4"
      >
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
        {isLowStock && (
          <span className="absolute bottom-2 left-2 bg-rose-600/90 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow">
            Only {product.stockQuantity} left!
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div onClick={() => onOpenDetail(product)} className="cursor-pointer">
          {/* Category & Flipkart Solid Green Rating Pill */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-semibold text-slate-500 truncate max-w-[110px]">
              {product.category?.name || 'Fresh Grocery'}
            </span>
            
            {/* Flipkart-style solid rating badge */}
            <div className="flex items-center space-x-1">
              <span className="inline-flex items-center bg-[#388e3c] text-white text-[11px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                <span>{ratingValue}</span>
                <Star className="w-2.5 h-2.5 fill-white text-white ml-0.5" />
              </span>
              <span className="text-[10px] text-slate-400 font-medium">({product.ratingCount || 48})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-sm text-slate-900 line-clamp-2 mb-1 group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>

          {/* Unit / Weight */}
          <p className="text-xs font-semibold text-slate-500 mb-2">
            {product.unit || '1 Unit'}
          </p>
        </div>

        {/* Pricing & Flipkart Quick Actions */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-base font-black text-slate-900">
                ₹{Number(currentPrice).toFixed(0)}
              </span>
              {product.discountPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{Number(product.price).toFixed(0)}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Express 2h
            </span>
          </div>

          {/* Buttons: Add to Cart + Buy Now */}
          <div className="grid grid-cols-2 gap-1.5">
            {qtyInCart === 0 ? (
              <button
                onClick={() => {
                  triggerHaptic(15);
                  addToCart(product, 1);
                }}
                className={`bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 transition-all active:scale-95 border border-slate-200 ${
                  isMobile ? 'py-2.5 min-h-[38px]' : 'py-2'
                }`}
                title="Add to Cart"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            ) : (
              <div className="flex items-center justify-between bg-emerald-700 text-white rounded-xl overflow-hidden shadow-xs">
                <button
                  onClick={() => {
                    triggerHaptic(10);
                    updateQuantity(product.id, qtyInCart - 1);
                  }}
                  className={`hover:bg-emerald-800 transition-colors px-2 ${isMobile ? 'py-2' : 'py-1.5'}`}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-extrabold">{qtyInCart}</span>
                <button
                  onClick={() => {
                    triggerHaptic(10);
                    updateQuantity(product.id, qtyInCart + 1);
                  }}
                  className={`hover:bg-emerald-800 transition-colors px-2 ${isMobile ? 'py-2' : 'py-1.5'}`}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Instant Flipkart "Buy Now" button */}
            <button
              onClick={() => {
                triggerHaptic(20);
                if (onBuyNow) {
                  onBuyNow(product, 1);
                } else {
                  addToCart(product, 1);
                }
              }}
              className={`bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center space-x-1 shadow-sm transition-all active:scale-95 ${
                isMobile ? 'py-2.5 min-h-[38px]' : 'py-2'
              }`}
              title="Instant Checkout"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

