import React from 'react';
import { Home, LayoutGrid, Search, ShoppingBag, User, Package } from 'lucide-react';
import { useDevice } from '../context/DeviceContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function MobileNavDock({ 
  onSelectCategory, 
  onOpenAuth, 
  onOpenOrders 
}) {
  const { isMobile, isIPhone, isAndroid, triggerHaptic } = useDevice();
  const { totalItemCount, total, setIsCartOpen } = useCart();
  const { user } = useAuth();

  if (!isMobile) return null;

  const handleHomeClick = () => {
    triggerHaptic(10);
    if (onSelectCategory) onSelectCategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoriesClick = () => {
    triggerHaptic(10);
    const categoryEl = document.getElementById('category-section');
    if (categoryEl) {
      categoryEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  };

  const handleSearchClick = () => {
    triggerHaptic(10);
    const searchInputs = document.querySelectorAll('input[type="text"], input[type="search"]');
    if (searchInputs.length > 0) {
      searchInputs[0].focus();
      searchInputs[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleCartClick = () => {
    triggerHaptic(15);
    setIsCartOpen(true);
  };

  const handleAccountClick = () => {
    triggerHaptic(10);
    if (user) {
      onOpenOrders();
    } else {
      onOpenAuth();
    }
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 transition-all ${
        isIPhone
          ? 'bg-white/90 backdrop-blur-2xl border-t border-slate-200/70 shadow-lg pb-[max(0.6rem,env(safe-area-inset-bottom))]'
          : 'bg-white border-t border-slate-200 shadow-xl pb-1.5'
      }`}
      aria-label="Mobile Navigation"
    >
      <div className="max-w-md mx-auto px-4 pt-2">
        <div className="flex items-center justify-around">
          
          {/* 1. Home */}
          <button
            type="button"
            onClick={handleHomeClick}
            className="flex-1 flex flex-col items-center justify-center py-1 text-slate-600 active:text-emerald-600 active:scale-95 transition-all"
          >
            <Home className="w-5 h-5 mb-0.5 text-emerald-700" />
            <span className="text-[10px] font-bold tracking-tight">Home</span>
          </button>

          {/* 2. Categories */}
          <button
            type="button"
            onClick={handleCategoriesClick}
            className="flex-1 flex flex-col items-center justify-center py-1 text-slate-600 active:text-emerald-600 active:scale-95 transition-all"
          >
            <LayoutGrid className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium tracking-tight">Browse</span>
          </button>

          {/* 3. Search */}
          <button
            type="button"
            onClick={handleSearchClick}
            className="flex-1 flex flex-col items-center justify-center py-1 text-slate-600 active:text-emerald-600 active:scale-95 transition-all"
          >
            <Search className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium tracking-tight">Search</span>
          </button>

          {/* 4. Cart (with Live Animated Badge) */}
          <button
            type="button"
            onClick={handleCartClick}
            className="flex-1 flex flex-col items-center justify-center py-1 relative text-slate-700 active:scale-95 transition-all group"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 mb-0.5 text-slate-800 group-hover:text-emerald-600" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-sm animate-pulse">
                  {totalItemCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-emerald-800">
              {total > 0 ? `₹${total.toFixed(0)}` : 'Cart'}
            </span>
          </button>

          {/* 5. Account / Orders */}
          <button
            type="button"
            onClick={handleAccountClick}
            className="flex-1 flex flex-col items-center justify-center py-1 text-slate-600 active:text-emerald-600 active:scale-95 transition-all"
          >
            {user ? (
              <Package className="w-5 h-5 mb-0.5 text-emerald-700" />
            ) : (
              <User className="w-5 h-5 mb-0.5" />
            )}
            <span className="text-[10px] font-medium tracking-tight truncate max-w-[64px]">
              {user ? 'Orders' : 'Sign In'}
            </span>
          </button>

        </div>
      </div>
    </nav>
  );
}
