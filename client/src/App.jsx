import React, { useState, useEffect } from 'react';
import { 
  Filter, SlidersHorizontal, ShieldCheck, Sparkles, AlertCircle, ShoppingBag 
} from 'lucide-react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import CategoryPills from './components/CategoryPills';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderSuccessModal from './components/OrderSuccessModal';
import AuthModal from './components/AuthModal';
import OrdersModal from './components/OrdersModal';
import AdminPortal from './components/AdminPortal';
import WishlistModal from './components/WishlistModal';
import Footer from './components/Footer';
import MobileNavDock from './components/MobileNavDock';
import DeviceCustomizer from './components/DeviceCustomizer';
import { useDevice } from './context/DeviceContext';
import { useCart } from './context/CartContext';
import { api } from './services/api';

export default function App() {
  const { isMobile, isTablet, isDesktop, activeDevice, showDeviceFrame } = useDevice();
  const { addToCart } = useCart();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'popularity', 'price-low', 'price-high', 'rating', 'discount', 'newest'
  const [zamzamOnly, setZamzamOnly] = useState(false);
  const [ratingFilter, setRatingFilter] = useState(null); // null or 4
  const [discountFilter, setDiscountFilter] = useState(null); // null or 20

  // Modals state
  const [activeProductModal, setActiveProductModal] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  // Instant Flipkart "Buy Now" handler
  const handleBuyNow = (product, quantity = 1) => {
    addToCart(product, quantity);
    setActiveProductModal(null);
    setIsCheckoutOpen(true);
  };

  // Reset password URL query params
  const [initialResetToken, setInitialResetToken] = useState(null);
  const [initialResetEmail, setInitialResetEmail] = useState('');

  useEffect(() => {
    loadStoreData();

    // Detect resetToken in query params (?resetToken=...&email=...)
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('resetToken') || params.get('token');
      const email = params.get('email');
      if (token) {
        setInitialResetToken(token);
        setInitialResetEmail(email || '');
        setIsAuthOpen(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Keyboard navigation shortcuts for Desktop & Laptop
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if typing in form inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }

      // '/' to focus search bar
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"], input[type="search"]');
        if (searchInput) {
          searchInput.focus();
          searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      // 'Escape' closes all open modals
      if (e.key === 'Escape') {
        setActiveProductModal(null);
        setIsCheckoutOpen(false);
        setIsAuthOpen(false);
        setIsOrdersOpen(false);
        setIsAdminOpen(false);
        setIsWishlistOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadStoreData = async () => {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        api.getCategories(),
        api.getProducts()
      ]);
      setCategories(cats || []);
      setProducts(prods || []);
    } catch (err) {
      console.error('Failed to load store data', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredProducts = products.filter(p => {
    // Category filter
    if (selectedCategory && p.category?.id !== selectedCategory.id) {
      return false;
    }
    // ZamZam filter
    if (zamzamOnly && !p.isHalal) {
      return false;
    }
    // Rating filter (4★ & above)
    if (ratingFilter && (p.rating || 0) < ratingFilter) {
      return false;
    }
    // Discount filter (20%+ off)
    if (discountFilter) {
      const disc = p.discountPrice ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0;
      if (disc < discountFilter) return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchCat = p.category?.name?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }
    return true;
  }).sort((a, b) => {
    const priceA = a.discountPrice || a.price;
    const priceB = b.discountPrice || b.price;

    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'popularity') return (b.ratingCount || 0) - (a.ratingCount || 0);
    if (sortBy === 'discount') {
      const discA = a.discountPrice ? ((a.price - a.discountPrice) / a.price) : 0;
      const discB = b.discountPrice ? ((b.price - b.discountPrice) / b.price) : 0;
      return discB - discA;
    }
    if (sortBy === 'newest') return (b.id || 0) - (a.id || 0);
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 selection:bg-emerald-500 selection:text-white transition-all ${isMobile ? 'pb-24' : ''}`}>
      {/* Top Navbar */}
      <Navbar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
      />

      {/* Main Storefront Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Hero banner (shown when no specific category or search active) */}
        {!selectedCategory && !searchQuery && (
          <HeroBanner onShopNow={() => {
            const section = document.getElementById('products-section');
            section?.scrollIntoView({ behavior: 'smooth' });
          }} />
        )}

        {/* Categories Pills */}
        <CategoryPills
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Products Section Anchor */}
        <div id="products-section" className="scroll-mt-24">
          
          {/* Section Toolbar: Header, result count, filters, and sort */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center">
                {selectedCategory ? selectedCategory.name : searchQuery ? `Search Results for "${searchQuery}"` : 'All Fresh Products'}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Showing {filteredProducts.length} items available for 2-hour dispatch
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              
              {/* ZamZam only filter */}
              <button
                onClick={() => setZamzamOnly(!zamzamOnly)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  zamzamOnly
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% ZamZam</span>
              </button>

              {/* 4★ & above filter */}
              <button
                onClick={() => setRatingFilter(ratingFilter ? null : 4)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  ratingFilter
                    ? 'bg-[#388e3c] text-white border-[#388e3c] shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>4★ & Above</span>
              </button>

              {/* 20%+ OFF filter */}
              <button
                onClick={() => setDiscountFilter(discountFilter ? null : 20)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  discountFilter
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm font-black'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>20%+ OFF</span>
              </button>

              {/* Sort By dropdown */}
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 focus:bg-white focus:border-emerald-500 outline-none text-xs font-bold cursor-pointer"
                >
                  <option value="featured">Featured / Best Match</option>
                  <option value="popularity">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating (4★+)</option>
                  <option value="discount">Biggest Discount (% OFF)</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 py-8">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl h-72 border border-slate-200 animate-pulse p-4 flex flex-col justify-between">
                  <div className="bg-slate-100 rounded-2xl h-36 w-full" />
                  <div className="space-y-2">
                    <div className="bg-slate-100 h-4 rounded w-3/4" />
                    <div className="bg-slate-100 h-3 rounded w-1/2" />
                    <div className="bg-slate-100 h-6 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-md mx-auto my-12 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-base">No items matched your search</h3>
              <p className="text-xs text-slate-500">
                Try searching for apples, chicken, mutton, basmati rice, dates, or clear active filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery('');
                  setZamzamOnly(false);
                  setRatingFilter(null);
                  setDiscountFilter(null);
                }}
                className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetail={setActiveProductModal}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <Footer
        categories={categories}
        onSelectCategory={setSelectedCategory}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Product Quick View / Detail Modal */}
      <ProductModal
        product={activeProductModal}
        onClose={() => setActiveProductModal(null)}
        onBuyNow={handleBuyNow}
        onOpenProduct={setActiveProductModal}
        allProducts={products}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(placedOrder) => setSuccessOrder(placedOrder)}
      />

      {/* Order Success Confetti Modal */}
      <OrderSuccessModal
        order={successOrder}
        onClose={() => setSuccessOrder(null)}
        onOpenOrders={() => setIsOrdersOpen(true)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setInitialResetToken(null);
          setInitialResetEmail('');
          if (window.location.search.includes('resetToken') || window.location.search.includes('token')) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }}
        initialResetToken={initialResetToken}
        initialResetEmail={initialResetEmail}
      />

      {/* Orders Tracking Modal */}
      <OrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
      />

      {/* Admin Portal Modal */}
      <AdminPortal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        categories={categories}
        onDataChanged={loadStoreData}
      />

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        onOpenProduct={setActiveProductModal}
      />

      {/* Mobile Navigation Dock (Active on Android & iPhone) */}
      <MobileNavDock
        onSelectCategory={(catId) => setSelectedCategory(catId)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
      />

      {/* Interactive Multi-Device Customizer Center & Trigger */}
      <DeviceCustomizer />
    </div>
  );
}

