import React from 'react';
import { Plus, Minus, Star, Heart, ShieldCheck, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product, onOpenDetail }) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const cartItem = cartItems.find(item => item.product.id === product.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const wishlisted = isWishlisted(product.id);

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const currentPrice = product.discountPrice || product.price;

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/80 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      
      {/* Badges & Wishlist */}
      <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-1.5">
          {product.isHalal && (
            <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black bg-emerald-700 text-white shadow-sm pointer-events-auto">
              <ShieldCheck className="w-3 h-3 mr-0.5 text-emerald-300" />
              ZAMZAM
            </span>
          )}
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-amber-400 text-slate-950 shadow-sm pointer-events-auto">
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
              : 'bg-white/80 backdrop-blur-sm text-slate-400 hover:text-rose-500'
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
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div onClick={() => onOpenDetail(product)} className="cursor-pointer">
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium truncate max-w-[120px]">
              {product.category?.name || 'General'}
            </span>
            <div className="flex items-center text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
              <span>{product.rating || 4.8}</span>
              <span className="text-[10px] text-slate-400 ml-0.5">({product.ratingCount || 12})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-sm text-slate-900 line-clamp-2 mb-1 group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>

          {/* Unit / Weight */}
          <p className="text-xs font-semibold text-slate-500 mb-3">
            {product.unit || '1 Unit'}
          </p>
        </div>

        {/* Pricing & Cart Action */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-base font-extrabold text-slate-900">
                ₹{Number(currentPrice).toFixed(0)}
              </span>
              {product.discountPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{Number(product.price).toFixed(0)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block">
              In Stock ({product.stockQuantity || 50})
            </span>
          </div>

          {/* Add / Stepper button */}
          <div>
            {qtyInCart === 0 ? (
              <button
                onClick={() => addToCart(product, 1)}
                className="bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            ) : (
              <div className="flex items-center bg-emerald-700 text-white rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => updateQuantity(product.id, qtyInCart - 1)}
                  className="p-1.5 hover:bg-emerald-800 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-xs font-extrabold">{qtyInCart}</span>
                <button
                  onClick={() => updateQuantity(product.id, qtyInCart + 1)}
                  className="p-1.5 hover:bg-emerald-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

