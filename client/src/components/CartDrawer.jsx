import React, { useState } from 'react';
import { 
  X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Tag, ShieldCheck, Truck 
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer({ onProceedToCheckout }) {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    discountPercent,
    deliveryFee,
    total,
    totalItemCount,
    promoCode,
    promoMessage,
    applyPromo
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [promoError, setPromoError] = useState('');

  if (!isCartOpen) return null;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    if (!inputCode.trim()) return;

    const res = applyPromo(inputCode);
    if (!res.success) {
      setPromoError(res.message);
    }
  };

  const freeDeliveryThreshold = 499;
  const amountForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const deliveryProgress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Your Cart</h3>
                <p className="text-xs text-slate-500 font-medium">{totalItemCount} items selected</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free delivery progress bar */}
          <div className="bg-emerald-50 px-5 py-2.5 border-b border-emerald-100">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-900 mb-1.5">
              <span className="flex items-center">
                <Truck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                {amountForFreeDelivery === 0 ? (
                  <strong className="text-emerald-700">Congratulations! You unlocked FREE 2-hour delivery!</strong>
                ) : (
                  <span>Add <strong>₹{amountForFreeDelivery.toFixed(0)}</strong> more for <strong>FREE Delivery</strong></span>
                )}
              </span>
              <span>{Math.round(deliveryProgress)}%</span>
            </div>
            <div className="w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${deliveryProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-lg">Your cart is empty</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Explore fresh vegetables, halal meats, dry fruits, and spices to add items!
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-emerald-600 text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-md"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cartItems.map(({ product, quantity }) => {
                const itemPrice = product.discountPrice || product.price;
                return (
                  <div key={product.id} className="py-4 flex items-center space-x-3.5">
                    <img
                      src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80'}
                      alt={product.name}
                      className="w-16 h-16 object-contain rounded-xl bg-slate-50 p-1 flex-shrink-0 border border-slate-100"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-800 truncate">{product.name}</h4>
                      <p className="text-[11px] text-slate-400 font-medium">{product.unit || '1 unit'}</p>
                      
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs font-black text-slate-900">
                          ₹{(itemPrice * quantity).toFixed(0)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          (₹{Number(itemPrice).toFixed(0)} each)
                        </span>
                      </div>
                    </div>

                    {/* Quantity modifier */}
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-1.5 text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center font-extrabold text-xs text-slate-800">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="p-1.5 text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with summary & checkout button */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-slate-200/80 bg-slate-50/50 space-y-3.5">
              
              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="Coupon (e.g. ZAMZAM10)"
                    className="w-full pl-8 pr-3 py-2 text-xs uppercase font-bold tracking-wider bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
                >
                  Apply
                </button>
              </form>

              {promoMessage && (
                <p className="text-[11px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg">
                  {promoMessage}
                </p>
              )}
              {promoError && (
                <p className="text-[11px] font-bold text-rose-600 bg-rose-50 p-2 rounded-lg">
                  {promoError}
                </p>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span className="text-slate-800 font-bold">₹{subtotal.toFixed(0)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount ({discountPercent}%)</span>
                    <span>-₹{discountAmount.toFixed(0)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${deliveryFee}`}</span>
                </div>

                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total</span>
                  <span className="text-emerald-700">₹{total.toFixed(0)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black py-3.5 px-5 rounded-2xl flex items-center justify-between shadow-xl shadow-emerald-700/25 transition-all text-sm"
              >
                <span>Proceed to Checkout</span>
                <div className="flex items-center space-x-1 font-extrabold">
                  <span>₹{total.toFixed(0)}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </button>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Safe & Secure 256-Bit SSL Encrypted Checkout</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

