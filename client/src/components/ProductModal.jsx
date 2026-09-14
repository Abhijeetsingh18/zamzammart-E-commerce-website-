import React, { useState } from 'react';
import { X, Star, ShieldCheck, Truck, Check, Plus, Minus, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductModal({ product, onClose }) {
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  if (!product) return null;

  const currentPrice = product.discountPrice || product.price;
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    addToCart(product, qty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative border border-slate-100 animate-slide-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-6 sm:p-8">
          {/* Image */}
          <div className="bg-slate-50 rounded-2xl p-6 flex items-center justify-center relative aspect-square">
            <img
              src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
              alt={product.name}
              className="max-h-64 object-contain"
            />
            {product.isHalal && (
              <span className="absolute bottom-4 left-4 bg-emerald-700 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg flex items-center shadow">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-300" />
                100% Certified Halal
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  {product.category?.name || 'Grocery'}
                </span>
                <div className="flex items-center text-amber-500 text-xs font-bold">
                  <Star className="w-4 h-4 fill-amber-400 mr-1" />
                  <span>{product.rating || 4.8}</span>
                  <span className="text-slate-400 ml-1">({product.ratingCount || 24} reviews)</span>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {product.name}
              </h2>

              <p className="text-xs font-semibold text-slate-500 mt-1">
                Net Weight / Unit: <span className="text-slate-800">{product.unit || '1 Unit'}</span>
              </p>

              {/* Price */}
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-2xl font-black text-emerald-700">
                  ₹{Number(currentPrice).toFixed(0)}
                </span>
                {product.discountPrice && (
                  <>
                    <span className="text-sm text-slate-400 line-through">
                      ₹{Number(product.price).toFixed(0)}
                    </span>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      Save {discountPercent}%
                    </span>
                  </>
                )}
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {product.description || 'Farm-fresh quality grocery product sourced from certified farms.'}
              </p>

              {/* Feature bullet list */}
              <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center text-xs text-slate-600">
                  <Truck className="w-4 h-4 mr-2 text-emerald-600" />
                  <span>Express 2-hour doorstep delivery available</span>
                </div>
                <div className="flex items-center text-xs text-slate-600">
                  <Check className="w-4 h-4 mr-2 text-emerald-600" />
                  <span>Hygienically cleaned and packed with seal guarantee</span>
                </div>
              </div>
            </div>

            {/* Stepper and Add to Cart */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-slate-200 rounded-2xl p-1 bg-slate-50">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-white transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-slate-800">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-3 px-6 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-700/25 transition-all text-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart (₹{(currentPrice * qty).toFixed(0)})</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3 rounded-2xl border transition-colors ${
                    wishlisted
                      ? 'border-rose-300 bg-rose-50 text-rose-600'
                      : 'border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200'
                  }`}
                  title="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-500' : ''}`} />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

