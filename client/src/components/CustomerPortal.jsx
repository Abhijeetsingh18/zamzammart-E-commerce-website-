import React, { useState, useEffect } from 'react';
import { 
  X, Package, Clock, CheckCircle2, Truck, AlertCircle, ShoppingBag, 
  Search, RefreshCw, Printer, MapPin, Phone, User, ExternalLink, 
  ShieldCheck, ChevronRight, Calendar, CreditCard, ArrowRight, Sparkles,
  Check, Box, Navigation
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function CustomerPortal({ isOpen, onClose, initialOrderNumber = null }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'track', 'profile'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'ACTIVE', 'DELIVERED'
  const [searchQuery, setSearchQuery] = useState('');

  // Single Order Lookup State
  const [lookupOrderNumber, setLookupOrderNumber] = useState(initialOrderNumber || '');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  // Invoice view modal state
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  const { user, logout } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();

  useEffect(() => {
    if (isOpen) {
      loadOrders();
      if (initialOrderNumber) {
        setLookupOrderNumber(initialOrderNumber);
        handleTrackOrder(initialOrderNumber);
        setActiveTab('track');
      }
    }

    const handleOrderEvent = () => {
      if (isOpen) {
        loadOrders();
      }
    };
    window.addEventListener('zzm_orders_updated', handleOrderEvent);
    return () => window.removeEventListener('zzm_orders_updated', handleOrderEvent);
  }, [isOpen, initialOrderNumber]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getMyOrders();
      // Also combine with any local guest orders stored in localStorage
      const local = JSON.parse(localStorage.getItem('zzm_recent_orders') || '[]');
      const combined = [...(data || [])];
      
      local.forEach(localOrd => {
        if (!combined.some(o => o.orderNumber === localOrd.orderNumber)) {
          combined.push(localOrd);
        }
      });
      setOrders(combined);
    } catch (err) {
      console.error('Failed to load orders', err);
      const local = JSON.parse(localStorage.getItem('zzm_recent_orders') || '[]');
      setOrders(local);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
    if (trackedOrder) {
      handleTrackOrder(trackedOrder.orderNumber);
    }
  };

  const handleTrackOrder = async (orderNumToTrack) => {
    const num = (orderNumToTrack || lookupOrderNumber).trim();
    if (!num) {
      setTrackingError('Please enter an Order ID to track.');
      return;
    }
    setTrackingLoading(true);
    setTrackingError('');
    try {
      const order = await api.trackOrder(num);
      setTrackedOrder(order);
    } catch (err) {
      setTrackingError(err.message || 'Order not found. Please check the Order Number.');
      setTrackedOrder(null);
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleReorder = (order) => {
    if (!order?.items || order.items.length === 0) return;
    order.items.forEach(item => {
      if (item.product) {
        addToCart(item.product, item.quantity || 1);
      }
    });
    onClose();
    setIsCartOpen(true);
  };

  const handlePrintInvoice = (order) => {
    setSelectedInvoiceOrder(order);
  };

  if (!isOpen) return null;

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const status = (order.status || 'PENDING').toUpperCase();
    if (filterStatus === 'ACTIVE') {
      if (status === 'DELIVERED' || status === 'CANCELLED') return false;
    }
    if (filterStatus === 'DELIVERED') {
      if (status !== 'DELIVERED') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = order.orderNumber?.toLowerCase().includes(q);
      const matchItem = order.items?.some(it => it.product?.name?.toLowerCase().includes(q));
      if (!matchNum && !matchItem) return false;
    }
    return true;
  });

  // Calculate order progress stage (1 to 5)
  const getOrderStage = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 5;
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return 4;
      case 'PACKED':
      case 'PREPARING':
        return 3;
      case 'CONFIRMED':
        return 2;
      case 'PENDING':
      default:
        return 1;
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'PENDING').toUpperCase();
    switch (s) {
      case 'DELIVERED':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'Delivered',
          desc: 'Package handed over safely',
          icon: CheckCircle2
        };
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200 animate-pulse',
          label: 'Out for Delivery',
          desc: 'Express Rider is on the way',
          icon: Truck
        };
      case 'PACKED':
      case 'PREPARING':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          label: 'Packed & Ready',
          desc: '100% ZamZam fresh seal applied',
          icon: Box
        };
      case 'CONFIRMED':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          label: 'Order Confirmed',
          desc: 'Store gathering items',
          icon: Clock
        };
      case 'CANCELLED':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          label: 'Cancelled',
          desc: 'Order has been cancelled',
          icon: AlertCircle
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          label: 'Order Placed',
          desc: 'Awaiting store confirmation',
          icon: Package
        };
    }
  };

  const renderTimeline = (status) => {
    const currentStage = getOrderStage(status);
    const stages = [
      { num: 1, title: 'Placed', icon: Package },
      { num: 2, title: 'Confirmed', icon: Clock },
      { num: 3, title: 'Packed', icon: Box },
      { num: 4, title: 'On The Way', icon: Truck },
      { num: 5, title: 'Delivered', icon: CheckCircle2 }
    ];

    return (
      <div className="py-3 px-1">
        <div className="relative flex items-center justify-between">
          {/* Background Track Line */}
          <div className="absolute left-4 right-4 top-4 h-1 bg-slate-200 -translate-y-1/2 z-0" />
          {/* Active Track Line */}
          <div 
            className="absolute left-4 top-4 h-1 bg-emerald-600 -translate-y-1/2 z-0 transition-all duration-700" 
            style={{ width: `${Math.min(100, Math.max(0, ((currentStage - 1) / 4) * 100))}%` }}
          />

          {stages.map((stage) => {
            const isCompleted = currentStage >= stage.num;
            const isCurrent = currentStage === stage.num;
            const Icon = stage.icon;

            return (
              <div key={stage.num} className="relative z-10 flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 text-xs font-bold shadow-sm ${
                    isCurrent 
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-110' 
                      : isCompleted 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-white text-slate-400 border border-slate-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <span className={`text-[10px] font-bold mt-1.5 transition-colors ${
                  isCurrent ? 'text-emerald-700' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                }`}>
                  {stage.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative border border-slate-100 animate-slide-up">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-inner">
                <Package className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-white text-lg">Customer Portal</h3>
                  <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/20">
                    Live Order Status
                  </span>
                </div>
                <p className="text-xs text-emerald-100/80">
                  {user ? `Logged in as ${user.name} (${user.email})` : 'Track your grocery orders and express delivery status'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                title="Refresh latest status"
                className={`p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all ${refreshing ? 'animate-spin' : ''}`}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-4 flex bg-black/20 p-1 rounded-2xl max-w-md">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'orders' ? 'bg-white text-emerald-900 shadow-sm' : 'text-emerald-100 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>My Orders ({orders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'track' ? 'bg-white text-emerald-900 shadow-sm' : 'text-emerald-100 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track Order ID</span>
            </button>
            {user && (
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                  activeTab === 'profile' ? 'bg-white text-emerald-900 shadow-sm' : 'text-emerald-100 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>My Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Orders List */}
        {activeTab === 'orders' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search & Filter bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Order ID or item name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex items-center space-x-1.5 bg-white border border-slate-200 p-1 rounded-xl">
                {['ALL', 'ACTIVE', 'DELIVERED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      filterStatus === status 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {status === 'ALL' ? 'All Orders' : status === 'ACTIVE' ? 'Active / In-Transit' : 'Delivered'}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {loading ? (
                <div className="text-center py-16 space-y-2">
                  <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-slate-500 text-xs font-medium">Fetching live order status...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-16 space-y-3 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-base">No orders found</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {searchQuery || filterStatus !== 'ALL' 
                      ? 'No orders match your filter criteria.' 
                      : 'You have not placed any orders yet. Once placed, live 2-hour delivery tracking will appear here.'}
                  </p>
                  <div className="pt-2 flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setLookupOrderNumber('ZZM-DEMO99');
                        handleTrackOrder('ZZM-DEMO99');
                        setActiveTab('track');
                      }}
                      className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold px-4 py-2 rounded-xl transition-colors"
                    >
                      Track Demo Order (ZZM-DEMO99)
                    </button>
                    <button
                      onClick={onClose}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                </div>
              ) : (
                filteredOrders.map(order => {
                  const badge = getStatusBadge(order.status);
                  const BadgeIcon = badge.icon;
                  const isDelivered = (order.status || '').toUpperCase() === 'DELIVERED';
                  const isShipped = ['SHIPPED', 'OUT_FOR_DELIVERY'].includes((order.status || '').toUpperCase());

                  return (
                    <div
                      key={order.id || order.orderNumber}
                      className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-4"
                    >
                      {/* Order Card Top Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-black text-slate-900 text-sm font-mono tracking-tight">
                                {order.orderNumber}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                • {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Today'}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 flex items-center mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 mr-1" />
                              {order.shippingAddress || 'Default Address'} ({order.city || 'Mumbai'})
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-extrabold border ${badge.bg}`}>
                            <BadgeIcon className="w-3.5 h-3.5" />
                            <span>{badge.label}</span>
                          </span>
                        </div>
                      </div>

                      {/* Visual Interactive Status Timeline */}
                      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                        <div className="flex justify-between items-center px-1 mb-1">
                          <span className="text-[11px] font-extrabold text-slate-700 flex items-center">
                            <Navigation className="w-3 h-3 mr-1 text-emerald-600" />
                            Real-Time Delivery Tracker
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                            {badge.desc}
                          </span>
                        </div>
                        {renderTimeline(order.status)}
                      </div>

                      {/* Delivery Driver Info Box (When out for delivery) */}
                      {isShipped && (
                        <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-3 flex items-center justify-between text-xs animate-fade-in">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-sky-200 text-sky-800 flex items-center justify-center font-bold">
                              🛵
                            </div>
                            <div>
                              <p className="font-extrabold text-sky-900 text-xs">Mohammad Tariq (ZamZam Express Rider)</p>
                              <p className="text-[10px] text-sky-700">Out for Delivery in Electric Courier • ZamZam Sealed Box</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="bg-sky-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                              ETA: ~25 mins
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Items Summary & Financials */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1.5 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Items in this Order ({order.items?.length || 0})
                          </span>
                          <div className="max-h-24 overflow-y-auto space-y-1 pr-1 text-xs text-slate-600">
                            {order.items && order.items.map((item, i) => (
                              <div key={i} className="flex justify-between items-center">
                                <span className="truncate pr-2">
                                  {item.quantity}x {item.product?.name || 'Item'}
                                </span>
                                <span className="font-bold text-slate-800 flex-shrink-0">
                                  ₹{Number(item.subtotal || 0).toFixed(0)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2 bg-slate-50/70 p-3 rounded-2xl border border-slate-100 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Delivery Slot:</span>
                            <span className="font-bold text-slate-800">{order.deliverySlot || 'Express 2-Hour'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Payment Mode:</span>
                            <span className="font-bold text-slate-800">
                              {order.paymentMethod || 'UPI'} 
                              <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded font-extrabold ${order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                {order.paymentStatus || 'PAID'}
                              </span>
                            </span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-slate-200">
                            <span className="font-extrabold text-slate-800">Total Paid:</span>
                            <span className="font-black text-emerald-700 text-base">
                              ₹{Number(order.totalAmount || 0).toFixed(0)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleReorder(order)}
                          className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors border border-emerald-200/70"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Reorder All</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrintInvoice(order)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-500" />
                          <span>Invoice</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLookupOrderNumber(order.orderNumber);
                            handleTrackOrder(order.orderNumber);
                            setActiveTab('track');
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5 text-slate-500" />
                          <span>Inspect Live Tracking</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Track Any Order ID */}
        {activeTab === 'track' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200/80 space-y-3">
              <h4 className="font-black text-slate-800 text-sm flex items-center">
                <Search className="w-4 h-4 mr-1.5 text-emerald-600" />
                Track Any Order Instantly
              </h4>
              <p className="text-xs text-slate-500">
                Enter any ZamZam Mart Order ID (from your confirmation email or SMS) to check its live status.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. ZZM-DEMO99"
                  value={lookupOrderNumber}
                  onChange={(e) => setLookupOrderNumber(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTrackOrder()}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:border-emerald-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleTrackOrder()}
                  disabled={trackingLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-700/20 disabled:opacity-50"
                >
                  {trackingLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      <span>Track Status</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sample chip */}
              <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                <span>Quick Test:</span>
                <button
                  type="button"
                  onClick={() => {
                    setLookupOrderNumber('ZZM-DEMO99');
                    handleTrackOrder('ZZM-DEMO99');
                  }}
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded-md transition-colors"
                >
                  ZZM-DEMO99
                </button>
              </div>

              {trackingError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{trackingError}</span>
                </div>
              )}
            </div>

            {/* Tracked Order Result View */}
            {trackedOrder && (
              <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-md space-y-5 animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Live Order Tracking</span>
                    <h3 className="font-black text-slate-900 text-lg font-mono">{trackedOrder.orderNumber}</h3>
                    <p className="text-xs text-slate-500">Placed for: {trackedOrder.customerName || 'Customer'}</p>
                  </div>

                  <div>
                    {(() => {
                      const badge = getStatusBadge(trackedOrder.status);
                      const BadgeIcon = badge.icon;
                      return (
                        <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold border ${badge.bg}`}>
                          <BadgeIcon className="w-4 h-4" />
                          <span>{badge.label}</span>
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Stepper Timeline */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  {renderTimeline(trackedOrder.status)}
                </div>

                {/* Rider simulation card */}
                {['SHIPPED', 'OUT_FOR_DELIVERY'].includes((trackedOrder.status || '').toUpperCase()) && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-lg">
                        🛵
                      </div>
                      <div>
                        <p className="font-extrabold text-emerald-950 text-xs">Mohammad Tariq (Express Rider)</p>
                        <p className="text-[10px] text-emerald-700">Assigned Driver • Direct Delivery from Central Hub</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="bg-emerald-700 text-white text-[10px] font-extrabold px-3 py-1 rounded-full">
                        Arriving in ~20-30 Mins
                      </span>
                    </div>
                  </div>
                )}

                {/* Delivery and item details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Delivery Destination</span>
                    <p className="font-bold text-slate-800">{trackedOrder.shippingAddress || 'Delivery Address'}</p>
                    <p className="text-slate-500">{trackedOrder.city || 'Mumbai'}, {trackedOrder.postalCode || '400050'}</p>
                    <p className="text-slate-500">Slot: <strong className="text-slate-800">{trackedOrder.deliverySlot || 'Express (2h)'}</strong></p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Payment Summary</span>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Method:</span>
                      <span className="font-bold text-slate-800">{trackedOrder.paymentMethod || 'UPI'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment Status:</span>
                      <span className="font-bold text-emerald-700">{trackedOrder.paymentStatus || 'PAID'}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200">
                      <span className="font-extrabold text-slate-800">Total Amount:</span>
                      <span className="font-black text-emerald-700 text-sm">₹{Number(trackedOrder.totalAmount || 0).toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                {/* Items in Tracked Order */}
                {trackedOrder.items && trackedOrder.items.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h5 className="font-extrabold text-slate-800 text-xs">Items in this Delivery:</h5>
                    <div className="divide-y divide-slate-100 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      {trackedOrder.items.map((item, idx) => (
                        <div key={idx} className="py-2 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                          <span className="font-medium text-slate-700">
                            {item.quantity}x {item.product?.name || 'Product'}
                          </span>
                          <span className="font-bold text-slate-900">
                            ₹{Number(item.subtotal || 0).toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleReorder(trackedOrder)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Reorder Items</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePrintInvoice(trackedOrder)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Invoice</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Customer Profile */}
        {activeTab === 'profile' && user && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-gradient-to-tr from-emerald-50 to-teal-50 rounded-3xl p-6 border border-emerald-200 flex items-center space-x-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-700 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-700/25">
                {user.name?.charAt(0).toUpperCase() || 'C'}
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-lg">{user.name}</h4>
                <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ZamZam Verified Customer
                  </span>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                    <ShieldCheck className="w-3 h-3 mr-0.5 text-amber-600" />
                    100% ZamZam Certified
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase">Phone Number</span>
                <p className="font-bold text-slate-800">{user.phone || '+91 9876543211'}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase">Delivery Address</span>
                <p className="font-bold text-slate-800">{user.address || 'Flat 402, Green Valley Apartments, Mumbai'}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase">Total Orders Placed</span>
                <p className="font-bold text-slate-800">{orders.length} Orders</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase">Express Delivery Member</span>
                <p className="font-bold text-emerald-700">Active (Free 2h Delivery Enabled)</p>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-100">
              <p className="text-xs text-slate-400">Need to switch accounts?</p>
              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Printable Invoice Modal / Window */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setSelectedInvoiceOrder(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center border-b border-slate-200 pb-3">
              <h3 className="text-lg font-black text-slate-900">ZamZam Mart Tax Invoice</h3>
              <p className="text-[11px] text-slate-500">Pure • Fresh • 100% Certified ZamZam</p>
              <p className="text-xs font-mono font-bold text-emerald-800 mt-1">Invoice #{selectedInvoiceOrder.orderNumber}</p>
            </div>

            <div className="text-xs space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Customer:</span>
                <strong className="text-slate-800">{selectedInvoiceOrder.customerName || user?.name || 'Customer'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{selectedInvoiceOrder.orderDate ? new Date(selectedInvoiceOrder.orderDate).toLocaleDateString() : 'Today'}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Slot:</span>
                <span>{selectedInvoiceOrder.deliverySlot || 'Express 2-Hour'}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment:</span>
                <strong className="text-emerald-700">{selectedInvoiceOrder.paymentMethod || 'UPI'} (PAID)</strong>
              </div>
            </div>

            <div className="border-t border-b border-slate-200 py-2 space-y-1.5 max-h-40 overflow-y-auto text-xs">
              {selectedInvoiceOrder.items?.map((it, idx) => (
                <div key={idx} className="flex justify-between text-slate-700">
                  <span>{it.quantity}x {it.product?.name}</span>
                  <span className="font-bold">₹{Number(it.subtotal || 0).toFixed(0)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-sm font-black text-slate-900">
              <span>Total Paid:</span>
              <span className="text-emerald-700">₹{Number(selectedInvoiceOrder.totalAmount || 0).toFixed(0)}</span>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedInvoiceOrder(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

