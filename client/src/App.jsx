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
import { api } from './services/api';

export default function App() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-low', 'price-high', 'rating'
  const [zamzamOnly, setZamzamOnly] = useState(false);

  // Modals state
  const [activeProductModal, setActiveProductModal] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  useEffect(() => {
    loadStoreData();
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
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-emerald-500 selection:text-white">
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
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              
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
                <span>100% ZamZam Only</span>
              </button>

              {/* Sort By dropdown */}
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 focus:bg-white focus:border-emerald-500 outline-none text-xs font-bold"
                >
                  <option value="featured">Featured / Best Match</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
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
        onClose={() => setIsAuthOpen(false)}
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
    </div>
  );
}

