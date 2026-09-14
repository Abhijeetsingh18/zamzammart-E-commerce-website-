import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingBag, Search, Heart, User, MapPin, 
  Menu, X, ShieldCheck, ChevronDown, LogOut, Package, Settings, Flame 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Navbar({ 
  categories, 
  selectedCategory, 
  onSelectCategory, 
  searchQuery, 
  onSearchChange,
  onOpenAuth,
  onOpenOrders,
  onOpenAdmin,
  onOpenWishlist
}) {
  const { user, logout, isAdmin } = useAuth();
  const { totalItemCount, total, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      {/* Top micro bar */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="flex items-center font-medium">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              100% Certified Halal & Fresh Guaranteed
            </span>
            <span className="hidden sm:inline-block text-emerald-300">|</span>
            <span className="hidden sm:flex items-center text-emerald-200">
              <Flame className="w-3.5 h-3.5 mr-1 text-amber-400" />
              Use code <strong className="text-amber-300 ml-1">ZAMZAM10</strong> for 10% Off
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={onOpenOrders}
              className="flex items-center text-emerald-200 hover:text-white transition-colors bg-emerald-800/80 hover:bg-emerald-700 px-2.5 py-0.5 rounded-full font-bold text-[11px] border border-emerald-600/40"
              title="Open Customer Portal & Track Order"
            >
              <Package className="w-3.5 h-3.5 mr-1 text-emerald-300" />
              <span>Customer Portal & Track Order</span>
            </button>
            <span className="hidden sm:inline-block text-emerald-300">|</span>
            <span className="hidden md:flex items-center text-emerald-200">
              <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              Delivering to: <strong className="ml-1 text-white">Central Hub (2h Express)</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectCategory(null)}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-700/20 ring-2 ring-emerald-500/20">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center">
                ZamZam <span className="text-emerald-600 ml-1">Mart</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-emerald-700 block">
                Pure • Fresh • Halal
              </span>
            </div>
          </div>

          {/* Search bar with category dropdown */}
          <div className="flex-1 max-w-2xl mx-2 hidden md:block">
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search farm fresh vegetables, halal meats, dry fruits, spices..."
                className="w-full pl-11 pr-24 py-3 bg-slate-100/90 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15 rounded-full text-sm font-medium transition-all outline-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 text-xs bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full px-2 py-0.5"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Wishlist Button */}
            <button 
              onClick={onOpenWishlist}
              className="relative p-2.5 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors"
              title="Wishlist"
            >
              <Heart className="w-6 h-6" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* User Account Menu */}
            <div className="relative" ref={userMenuRef}>
              {user ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-2 rounded-full border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 hidden lg:inline-block max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:inline-block" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-slide-up">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            Admin Account
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => { setIsUserMenuOpen(false); onOpenOrders(); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center space-x-2 font-medium"
                      >
                        <Package className="w-4 h-4 text-emerald-600" />
                        <span>Customer Portal (Orders)</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => { setIsUserMenuOpen(false); onOpenAdmin(); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 font-medium flex items-center space-x-2"
                        >
                          <Settings className="w-4 h-4 text-amber-600" />
                          <span>Admin Portal</span>
                        </button>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={() => { setIsUserMenuOpen(false); logout(); }}
                        className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center space-x-2 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onOpenOrders}
                    className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-all"
                    title="Track Order Status in Customer Portal"
                  >
                    <Package className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Track Order</span>
                  </button>
                  <button
                    onClick={onOpenAuth}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition-all"
                  >
                    <User className="w-4 h-4 text-slate-600" />
                    <span>Login</span>
                  </button>
                </div>
              )}
            </div>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center space-x-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-2.5 rounded-full font-bold shadow-md shadow-emerald-700/20 transition-all"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {totalItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-emerald-600">
                    {totalItemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline-block text-sm">
                ₹{total.toFixed(0)}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search farm fresh items..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-full text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-100 space-y-1.5 animate-fade-in">
            <button
              onClick={() => { setIsMobileMenuOpen(false); onOpenOrders(); }}
              className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl flex items-center space-x-2"
            >
              <Package className="w-4 h-4 text-emerald-600" />
              <span>Customer Portal (Track Orders)</span>
            </button>
            <button
              onClick={() => { setIsMobileMenuOpen(false); onOpenWishlist(); }}
              className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl flex items-center space-x-2"
            >
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Wishlist ({wishlist.length})</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => { setIsMobileMenuOpen(false); onOpenAdmin(); }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-amber-800 hover:bg-amber-50 rounded-xl flex items-center space-x-2"
              >
                <Settings className="w-4 h-4 text-amber-600" />
                <span>Admin Portal</span>
              </button>
            )}
            {!user ? (
              <button
                onClick={() => { setIsMobileMenuOpen(false); onOpenAuth(); }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl flex items-center space-x-2 mt-2"
              >
                <User className="w-4 h-4" />
                <span>Login / Register</span>
              </button>
            ) : (
              <button
                onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center space-x-2 mt-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out ({user.name})</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

