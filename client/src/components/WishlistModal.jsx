import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function WishlistModal({ isOpen, onClose, onOpenProduct }) {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative border border-slate-100 animate-slide-up">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Your Wishlist</h3>
              <p className="text-xs text-slate-500">{wishlist.length} saved favorites</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {wishlist.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-300 flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-slate-700 text-sm">Wishlist is empty</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Click the heart icon on any product to save it for later.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {wishlist.map(product => {
                const price = product.discountPrice || product.price;
                return (
                  <div key={product.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div 
                      className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
                      onClick={() => {
                        onClose();
                        onOpenProduct(product);
                      }}
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-14 h-14 object-contain rounded-xl bg-slate-50 p-1 border border-slate-100"
                      />
                      <div className="truncate">
                        <h4 className="font-bold text-xs text-slate-900 truncate">{product.name}</h4>
                        <p className="text-[11px] text-slate-400">{product.unit}</p>
                        <p className="text-xs font-black text-emerald-700 mt-0.5">₹{Number(price).toFixed(0)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          addToCart(product, 1);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center space-x-1 shadow-sm"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                      <button
                        onClick={() => toggleWishlist(product)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

