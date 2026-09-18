import React, { useState, useEffect } from 'react';
import { 
  X, Star, ShieldCheck, Truck, Check, Plus, Minus, Heart, ShoppingBag, 
  Zap, Tag, ChevronDown, ChevronUp, MapPin, ThumbsUp, Sparkles, AlertCircle,
  RotateCcw, Clock, ShieldAlert, Award
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useDevice } from '../context/DeviceContext';
import { api } from '../services/api';

export default function ProductModal({ product, onClose, onBuyNow, onOpenProduct, allProducts = [] }) {
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'reviews', 'offers'
  
  // Pincode estimator
  const [pincode, setPincode] = useState(() => localStorage.getItem('zzm_delivery_pincode') || '400001');
  const [pincodeResult, setPincodeResult] = useState(null);
  const [pincodeError, setPincodeError] = useState('');

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, author: '', title: '', comment: '' });
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Offers accordion
  const [showAllOffers, setShowAllOffers] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { triggerHaptic } = useDevice();

  useEffect(() => {
    if (product) {
      setQty(1);
      setShowReviewForm(false);
      setReviewSuccess('');
      // Check default pincode
      if (pincode) {
        handleCheckPincode(pincode);
      }
      // Load reviews
      loadReviews(product.id);
    }
  }, [product]);

  const loadReviews = (prodId) => {
    try {
      const revs = api.getProductReviews(prodId);
      setReviews(revs || []);
    } catch (e) {
      setReviews([]);
    }
  };

  const handleCheckPincode = (codeToCheck) => {
    const res = api.checkDeliveryPincode(codeToCheck || pincode);
    if (res.valid) {
      setPincodeResult(res);
      setPincodeError('');
    } else {
      setPincodeResult(null);
      setPincodeError(res.message);
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      alert('Please enter your review feedback.');
      return;
    }
    const res = api.submitProductReview(product.id, reviewForm);
    if (res.success) {
      setReviewSuccess('Thank you! Your verified review has been published.');
      setShowReviewForm(false);
      setReviewForm({ rating: 5, author: '', title: '', comment: '' });
      loadReviews(product.id);
      setTimeout(() => setReviewSuccess(''), 4000);
    }
  };

  if (!product) return null;

  const currentPrice = product.discountPrice || product.price;
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  const wishlisted = isWishlisted(product.id);
  const ratingValue = Number(product.rating || 4.8).toFixed(1);
  const totalReviewsCount = reviews.length;

  // Similar products in same category
  const similarProducts = (allProducts || [])
    .filter(p => p.id !== product.id && p.category?.id === product.category?.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    triggerHaptic(15);
    addToCart(product, qty);
    onClose();
  };

  const handleBuyNow = () => {
    triggerHaptic(25);
    if (onBuyNow) {
      onBuyNow(product, qty);
    } else {
      addToCart(product, qty);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden shadow-2xl relative border border-slate-100 animate-slide-up">
        
        {/* Top Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto p-4 sm:p-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Product Image, Badges & Flipkart Assured Pill */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-slate-50 rounded-3xl p-6 flex items-center justify-center relative aspect-square border border-slate-100 overflow-hidden group">
                <img
                  src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
                  alt={product.name}
                  className="max-h-72 w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                  {/* Flipkart / ZamZam Assured Badge */}
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shadow-md border border-blue-400/40">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-300 fill-amber-300" />
                    <span className="text-white font-extrabold italic">ZamZam</span>
                    <span className="text-amber-300 font-black italic ml-1">Assured</span>
                  </span>

                  {discountPercent > 0 && (
                    <span className="bg-emerald-600 text-white text-xs font-black px-2 py-0.5 rounded-md shadow">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`absolute top-4 right-4 p-2.5 rounded-full shadow-md transition-all ${
                    wishlisted ? 'bg-rose-50 text-rose-600' : 'bg-white/90 text-slate-400 hover:text-rose-500'
                  }`}
                  title="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              {/* Assured Assurance Guarantee Bar */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 p-3.5 rounded-2xl border border-blue-100 flex items-center space-x-3 text-xs">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                  <Award className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <p className="font-extrabold text-blue-950">100% Quality & Freshness Guarantee</p>
                  <p className="text-blue-700 text-[11px] mt-0.5">Tested for pure standards & fast 2-hour doorstep delivery</p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Details, Flipkart Pricing, Pincode & Action Buttons */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                    {product.category?.name || 'Fresh Grocery'}
                  </span>
                  
                  {/* Flipkart Green Star Pill */}
                  <div className="inline-flex items-center bg-[#388e3c] text-white text-xs font-black px-2 py-0.5 rounded-md shadow-xs">
                    <span>{ratingValue}</span>
                    <Star className="w-3 h-3 fill-white text-white ml-1" />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    ({product.ratingCount || 128} Ratings & {totalReviewsCount} Reviews)
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  {product.name}
                </h1>

                <p className="text-xs text-slate-500 mt-1 font-semibold">
                  Net Content / Weight: <strong className="text-slate-800 font-bold">{product.unit || '1 Unit'}</strong>
                </p>
              </div>

              {/* Flipkart Style Pricing Section */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-1">
                <div className="flex items-baseline space-x-3">
                  <span className="text-3xl font-black text-slate-900">
                    ₹{Number(currentPrice).toFixed(0)}
                  </span>
                  {product.discountPrice && (
                    <>
                      <span className="text-base text-slate-400 line-through">
                        ₹{Number(product.price).toFixed(0)}
                      </span>
                      <span className="text-sm font-black text-[#388e3c]">
                        {discountPercent}% off
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Inclusive of all taxes • Maximum retail price verified
                </p>
              </div>

              {/* Flipkart Bank Offers Accordion */}
              <div className="bg-amber-50/60 rounded-2xl border border-amber-200/80 p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-amber-950 flex items-center">
                    <Tag className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
                    Available Offers & Coupons
                  </span>
                  <button
                    onClick={() => setShowAllOffers(!showAllOffers)}
                    className="text-xs text-amber-800 hover:text-amber-950 font-bold flex items-center"
                  >
                    <span>{showAllOffers ? 'Hide' : 'View 4 Offers'}</span>
                    {showAllOffers ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
                  </button>
                </div>

                <div className="space-y-1.5 text-slate-700 text-[11px]">
                  <p className="flex items-start">
                    <strong className="text-slate-900 mr-1.5">Bank Offer:</strong>
                    <span>5% Unlimited Cashback on Axis Bank Flipkart & ZamZam Credit Cards.</span>
                  </p>
                  
                  {showAllOffers && (
                    <>
                      <p className="flex items-start">
                        <strong className="text-slate-900 mr-1.5">Bank Offer:</strong>
                        <span>10% Instant Discount on HDFC Bank and ICICI Bank Cards up to ₹300 on orders over ₹500.</span>
                      </p>
                      <p className="flex items-start">
                        <strong className="text-slate-900 mr-1.5">Special Promo:</strong>
                        <span>Use coupon <code className="bg-amber-200 text-amber-900 px-1 py-0.2 rounded font-mono font-bold">ZAMZAM10</code> for flat 10% Off on entire order.</span>
                      </p>
                      <p className="flex items-start">
                        <strong className="text-slate-900 mr-1.5">Combo Deal:</strong>
                        <span>Buy 2 or more fresh items, get extra 5% instant discount at checkout.</span>
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Flipkart Delivery Pincode Checker */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Delivery Options & Availability
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    placeholder="Enter 6-digit Pincode"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:bg-white focus:border-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCheckPincode(pincode)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
                  >
                    Check
                  </button>
                </div>

                {pincodeError && (
                  <p className="text-rose-600 font-semibold text-[11px]">{pincodeError}</p>
                )}

                {pincodeResult && (
                  <div className="space-y-1 pt-1 text-[11px]">
                    <p className="text-emerald-700 font-bold flex items-center">
                      <Truck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                      <span>{pincodeResult.deliveryDate}</span>
                    </p>
                    <p className="text-slate-600 flex items-center">
                      <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                      <span>{pincodeResult.expressTime}</span>
                    </p>
                    <p className="text-slate-600 flex items-center">
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                      <span>{pincodeResult.replacementPolicy}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Quantity Stepper & Flipkart Dual CTA Action Buttons */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-slate-600">Quantity:</span>
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="p-1.5 hover:bg-white text-slate-700 rounded-l-xl transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-black text-xs text-slate-900">{qty}</span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      className="p-1.5 hover:bg-white text-slate-700 rounded-r-xl transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-400">
                    (₹{(currentPrice * qty).toFixed(0)})
                  </span>
                </div>

                {/* Flipkart Signature Dual Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {/* Add to Cart Button (Yellow/Gold) */}
                  <button
                    onClick={handleAddToCart}
                    className="bg-[#ff9f00] hover:bg-[#e89000] text-slate-950 font-black py-3.5 px-4 rounded-2xl flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all active:scale-95 text-xs sm:text-sm tracking-wide uppercase"
                  >
                    <ShoppingBag className="w-4 h-4 fill-slate-950" />
                    <span>Add to Cart</span>
                  </button>

                  {/* Buy Now Button (Orange/Red with Lightning Zap) */}
                  <button
                    onClick={handleBuyNow}
                    className="bg-[#fb641b] hover:bg-[#e05615] text-white font-black py-3.5 px-4 rounded-2xl flex items-center justify-center space-x-2 shadow-md hover:shadow-lg shadow-orange-600/25 transition-all active:scale-95 text-xs sm:text-sm tracking-wide uppercase"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Flipkart Product Details, Highlights & Specifications */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 tracking-tight">Product Specifications & Highlights</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500 font-semibold">Standard Certification:</span>
                <span className="font-bold text-emerald-800">100% Certified ZamZam</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500 font-semibold">Freshness Shelf Life:</span>
                <span className="font-bold text-slate-800">Direct Farm Harvest (7 Days)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500 font-semibold">Packaging Type:</span>
                <span className="font-bold text-slate-800">Sealed Food-Grade Eco Pouch</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500 font-semibold">Delivery Speed:</span>
                <span className="font-bold text-emerald-700">Express 2-Hour Doorstep Dispatch</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {product.description || 'Farm-fresh grocery item curated under strict quality inspection and sealed for maximum freshness and aroma.'}
            </p>
          </div>

          {/* Flipkart Ratings & Customer Reviews Breakdown */}
          <div className="border-t border-slate-200 pt-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">Ratings & Reviews</h3>
                <p className="text-xs text-slate-500">Real customer feedback from certified buyers</p>
              </div>

              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all flex items-center space-x-1.5 self-start"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Rate Product & Write Review</span>
              </button>
            </div>

            {/* Interactive Review Form */}
            {showReviewForm && (
              <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3 animate-fade-in text-xs">
                <h4 className="font-bold text-slate-900">Write your feedback</h4>
                
                {/* Star rating selector */}
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-600">Your Rating:</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${star <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                  <span className="font-extrabold text-amber-700 ml-1">{reviewForm.rating} Stars</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={reviewForm.author}
                      onChange={e => setReviewForm({ ...reviewForm, author: e.target.value })}
                      placeholder="e.g. Tariq Ansari"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Review Title</label>
                    <input
                      type="text"
                      required
                      value={reviewForm.title}
                      onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })}
                      placeholder="e.g. Outstanding freshness!"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Detailed Review</label>
                  <textarea
                    rows={3}
                    required
                    value={reviewForm.comment}
                    onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Share your experience regarding packaging, delivery speed, and taste..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}

            {reviewSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center">
                <Check className="w-4 h-4 mr-1.5 text-emerald-600" />
                {reviewSuccess}
              </div>
            )}

            {/* Ratings Breakdown Grid (Flipkart Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
              
              <div className="sm:col-span-4 text-center sm:text-left sm:border-r border-slate-200 sm:pr-4">
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <span className="text-4xl font-black text-slate-900">{ratingValue}</span>
                  <Star className="w-7 h-7 fill-[#388e3c] text-[#388e3c]" />
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  {product.ratingCount || 128} Verified Ratings & {reviews.length} Customer Reviews
                </p>
              </div>

              {/* Progress Bars for 5★ down to 1★ */}
              <div className="sm:col-span-8 space-y-1.5 text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className="w-6 font-bold text-slate-600">5 ★</span>
                  <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-[#388e3c] h-full w-[78%]" />
                  </div>
                  <span className="w-8 text-right text-slate-400 font-medium">78%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-6 font-bold text-slate-600">4 ★</span>
                  <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-[#388e3c] h-full w-[15%]" />
                  </div>
                  <span className="w-8 text-right text-slate-400 font-medium">15%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-6 font-bold text-slate-600">3 ★</span>
                  <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-400 h-full w-[5%]" />
                  </div>
                  <span className="w-8 text-right text-slate-400 font-medium">5%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-6 font-bold text-slate-600">2 ★</span>
                  <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-orange-400 h-full w-[1%]" />
                  </div>
                  <span className="w-8 text-right text-slate-400 font-medium">1%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-6 font-bold text-slate-600">1 ★</span>
                  <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-rose-500 h-full w-[1%]" />
                  </div>
                  <span className="w-8 text-right text-slate-400 font-medium">1%</span>
                </div>
              </div>

            </div>

            {/* Reviews List */}
            <div className="space-y-3">
              {reviews.map(rev => (
                <div key={rev.id} className="p-4 bg-white rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center bg-[#388e3c] text-white text-[10px] font-black px-1.5 py-0.2 rounded">
                      <span>{rev.rating}</span>
                      <Star className="w-2.5 h-2.5 fill-white text-white ml-0.5" />
                    </span>
                    <h5 className="font-extrabold text-slate-900">{rev.title}</h5>
                  </div>

                  <p className="text-slate-600 leading-relaxed">{rev.comment}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-700">{rev.author}</span>
                      {rev.verifiedBuyer && (
                        <span className="text-emerald-700 font-bold flex items-center">
                          <Check className="w-3 h-3 mr-0.5" />
                          Certified Buyer
                        </span>
                      )}
                      <span>• {rev.date}</span>
                    </div>

                    <button 
                      onClick={() => alert('Thank you for voting this review helpful!')}
                      className="flex items-center space-x-1 text-slate-500 hover:text-emerald-700 font-semibold"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Helpful ({rev.helpfulCount || 12})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Similar / Frequently Bought Together Carousel */}
          {similarProducts.length > 0 && (
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <h3 className="text-base font-black text-slate-900 tracking-tight">Similar Products You Might Like</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {similarProducts.map(sim => (
                  <div 
                    key={sim.id}
                    onClick={() => {
                      if (onOpenProduct) onOpenProduct(sim);
                    }}
                    className="p-3 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <img 
                      src={sim.imageUrl} 
                      alt={sim.name} 
                      className="w-full aspect-square object-contain rounded-xl bg-white p-2 mb-2"
                    />
                    <div>
                      <p className="font-bold text-xs text-slate-900 truncate">{sim.name}</p>
                      <p className="text-[10px] text-slate-500">{sim.unit}</p>
                      <p className="font-black text-xs text-emerald-700 mt-1">
                        ₹{Number(sim.discountPrice || sim.price).toFixed(0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
