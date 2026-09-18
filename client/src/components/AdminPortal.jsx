import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Plus, Trash2, Edit2, CheckCircle2, TrendingUp, Package, AlertTriangle, 
  DollarSign, ShoppingBag, ShieldCheck, Layers, Search, RefreshCw, Printer, 
  Phone, Mail, MapPin, Truck, Check, Clock, Copy, ExternalLink, Calendar,
  ArrowRight, User, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminPortal({ isOpen, onClose, categories = [], onDataChanged }) {
  const [activeTab, setActiveTab] = useState('orders'); // default to 'orders' since user requested working orders!
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(null);
  const formRef = useRef(null);

  // Orders Tab filters & search
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Form for new/edit product
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    unit: '1 kg',
    stockQuantity: 50,
    imageUrl: '',
    isHalal: true,
    isFeatured: false,
    categoryId: categories[0]?.id || 1
  });

  useEffect(() => {
    if (isOpen) {
      loadAllAdminData();
    }
  }, [isOpen]);

  // Listen for real-time order & product updates from other components/tabs
  useEffect(() => {
    const handleOrderEvent = () => {
      if (isOpen) {
        loadAllAdminData(true);
      }
    };
    const handleProductEvent = () => {
      if (isOpen) {
        loadAllAdminData(true);
      }
    };
    window.addEventListener('zzm_orders_updated', handleOrderEvent);
    window.addEventListener('zzm_products_updated', handleProductEvent);
    return () => {
      window.removeEventListener('zzm_orders_updated', handleOrderEvent);
      window.removeEventListener('zzm_products_updated', handleProductEvent);
    };
  }, [isOpen]);

  const loadAllAdminData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [prodData, orderData, statData] = await Promise.all([
        api.getProducts(),
        api.getAllOrdersAdmin(),
        api.getAdminStats()
      ]);
      setProducts(prodData || []);
      setOrders(orderData || []);
      setStats(statData);
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAllAdminData();
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  if (!isOpen) return null;

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (!productForm.name || !productForm.name.trim()) {
        alert('Please enter a valid product name');
        return;
      }
      const priceNum = parseFloat(productForm.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        alert('Please enter a valid positive price');
        return;
      }

      setSavingProduct(true);
      const chosenCatId = parseInt(productForm.categoryId, 10) || (categories[0]?.id || 1);
      const payload = {
        ...productForm,
        name: productForm.name.trim(),
        price: priceNum,
        discountPrice: productForm.discountPrice ? parseFloat(productForm.discountPrice) : null,
        stockQuantity: parseInt(productForm.stockQuantity, 10) || 50,
        categoryId: chosenCatId,
      };

      const wasEditing = Boolean(editingId);
      if (editingId) {
        await api.updateProduct(editingId, payload);
      } else {
        await api.createProduct(payload);
      }

      setIsFormOpen(false);
      setEditingId(null);
      await loadAllAdminData();
      if (onDataChanged) await onDataChanged();

      alert(wasEditing 
        ? `Product "${payload.name}" updated successfully and is live on customer storefront!`
        : `New product "${payload.name}" added successfully and is live on customer storefront!`
      );
    } catch (err) {
      console.error('Failed to save product:', err);
      alert('Failed to save product: ' + (err.message || 'Unknown error occurred. Please check backend connection.'));
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (p) => {
    const targetId = typeof p === 'object' ? p.id : p;
    const targetName = typeof p === 'object' ? p.name : ('ID #' + p);

    if (confirm(`Are you sure you want to delete "${targetName}"? It will be removed from both Admin Portal and Customer Storefront.`)) {
      try {
        await api.deleteProduct(targetId);
        await loadAllAdminData();
        if (onDataChanged) await onDataChanged();
        alert(`"${targetName}" was successfully removed from catalog and storefront.`);
      } catch (err) {
        alert('Failed to delete product: ' + err.message);
      }
    }
  };

  const handleEditClick = (p) => {
    setEditingId(p.id);
    setProductForm({
      name: p.name || '',
      description: p.description || '',
      price: p.price || '',
      discountPrice: p.discountPrice || '',
      unit: p.unit || '1 kg',
      stockQuantity: p.stockQuantity || 50,
      imageUrl: p.imageUrl || '',
      isHalal: p.isHalal ?? true,
      isFeatured: p.isFeatured ?? false,
      categoryId: p.category?.id || p.categoryId || categories[0]?.id || 1
    });
    setIsFormOpen(true);
    setActiveTab('inventory');
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleUpdateOrderStatus = async (orderIdentifier, newStatus) => {
    setUpdatingOrderId(orderIdentifier);
    try {
      await api.updateOrderStatus(orderIdentifier, newStatus);
      await loadAllAdminData(true);
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Status counts
  const pendingCount = orders.filter(o => (o.status || '').toUpperCase() === 'PENDING').length;
  const confirmedCount = orders.filter(o => (o.status || '').toUpperCase() === 'CONFIRMED').length;
  const shippedCount = orders.filter(o => ['SHIPPED', 'OUT_FOR_DELIVERY'].includes((o.status || '').toUpperCase())).length;
  const deliveredCount = orders.filter(o => (o.status || '').toUpperCase() === 'DELIVERED').length;
  const cancelledCount = orders.filter(o => (o.status || '').toUpperCase() === 'CANCELLED').length;

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    const status = (order.status || 'PENDING').toUpperCase();
    if (orderStatusFilter !== 'ALL') {
      if (orderStatusFilter === 'SHIPPED') {
        if (!['SHIPPED', 'OUT_FOR_DELIVERY'].includes(status)) return false;
      } else if (status !== orderStatusFilter) {
        return false;
      }
    }
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const matchNum = order.orderNumber?.toLowerCase().includes(q);
      const matchName = order.customerName?.toLowerCase().includes(q);
      const matchEmail = order.customerEmail?.toLowerCase().includes(q);
      const matchPhone = order.phone?.toLowerCase().includes(q);
      const matchCity = order.city?.toLowerCase().includes(q);
      const matchAddress = order.shippingAddress?.toLowerCase().includes(q);
      const matchItems = order.items?.some(it => it.product?.name?.toLowerCase().includes(q));
      if (!matchNum && !matchName && !matchEmail && !matchPhone && !matchCity && !matchAddress && !matchItems) {
        return false;
      }
    }
    return true;
  });

  const getStatusBadge = (status) => {
    const s = (status || 'PENDING').toUpperCase();
    switch (s) {
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'CONFIRMED':
      case 'PACKED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'PENDING':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[94vh] flex flex-col overflow-hidden shadow-2xl relative border border-slate-100 animate-slide-up">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-400/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-white text-base sm:text-lg tracking-tight">ZamZam Mart Admin Portal</h3>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Live Control
                </span>
              </div>
              <p className="text-xs text-amber-300/90 font-medium">Fulfillment Management & Store Operations</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors flex items-center space-x-1.5 text-xs font-bold"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 px-4 sm:px-6 pt-3 border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition-all flex items-center space-x-2 ${
              activeTab === 'orders'
                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Customer Orders ({orders.length})</span>
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {pendingCount} New
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition-all flex items-center space-x-2 ${
              activeTab === 'inventory'
                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Inventory Catalog ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition-all flex items-center space-x-2 ${
              activeTab === 'stats'
                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Store Analytics</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          
          {/* TAB 1: CUSTOMER ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              
              {/* Metric Counters Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                <div 
                  onClick={() => setOrderStatusFilter('ALL')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    orderStatusFilter === 'ALL' ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">All Orders</p>
                  <p className="text-xl font-black mt-0.5">{orders.length}</p>
                </div>

                <div 
                  onClick={() => setOrderStatusFilter('PENDING')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    orderStatusFilter === 'PENDING' ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md' : 'bg-white text-amber-700 border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">Pending</p>
                  <p className="text-xl font-black mt-0.5">{pendingCount}</p>
                </div>

                <div 
                  onClick={() => setOrderStatusFilter('CONFIRMED')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    orderStatusFilter === 'CONFIRMED' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-blue-700 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">Confirmed</p>
                  <p className="text-xl font-black mt-0.5">{confirmedCount}</p>
                </div>

                <div 
                  onClick={() => setOrderStatusFilter('SHIPPED')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    orderStatusFilter === 'SHIPPED' ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-purple-700 border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">In Transit</p>
                  <p className="text-xl font-black mt-0.5">{shippedCount}</p>
                </div>

                <div 
                  onClick={() => setOrderStatusFilter('DELIVERED')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    orderStatusFilter === 'DELIVERED' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-emerald-700 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">Delivered</p>
                  <p className="text-xl font-black mt-0.5">{deliveredCount}</p>
                </div>

                <div 
                  onClick={() => setOrderStatusFilter('CANCELLED')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    orderStatusFilter === 'CANCELLED' ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-white text-rose-700 border-slate-200 hover:border-rose-300'
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">Cancelled</p>
                  <p className="text-xl font-black mt-0.5">{cancelledCount}</p>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                    placeholder="Search by Order ID (ZZM-...), Customer Name, Phone, Email, Address, or Item..."
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-500 outline-none"
                  />
                  {orderSearch && (
                    <button 
                      onClick={() => setOrderSearch('')} 
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
                  <span className="hidden md:inline">Showing:</span>
                  <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-xl text-xs font-black">
                    {filteredOrders.length} of {orders.length} Orders
                  </span>
                </div>
              </div>

              {/* Order List */}
              <div className="space-y-4">
                {loading ? (
                  <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                    <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-500">Loading Customer Orders...</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
                    <Package className="w-10 h-10 text-slate-300 mx-auto" />
                    <h5 className="font-extrabold text-sm text-slate-800">No customer orders found</h5>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      {orderSearch ? 'No orders match your search query.' : 'Customer orders placed on the store will automatically appear here.'}
                    </p>
                    {orderSearch && (
                      <button
                        onClick={() => { setOrderSearch(''); setOrderStatusFilter('ALL'); }}
                        className="text-xs font-bold text-emerald-600 hover:underline pt-2"
                      >
                        Reset Search Filters
                      </button>
                    )}
                  </div>
                ) : (
                  filteredOrders.map(order => {
                    const orderIdToUse = order.id || order.orderNumber;
                    const items = order.items || [];
                    const isUpdating = updatingOrderId === orderIdToUse || updatingOrderId === order.orderNumber;

                    return (
                      <div 
                        key={order.id || order.orderNumber} 
                        className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-500/40 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all space-y-4"
                      >
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-black text-xs text-emerald-900 bg-emerald-100/90 border border-emerald-200 px-2.5 py-1 rounded-xl flex items-center space-x-1">
                              <span>{order.orderNumber}</span>
                              <button 
                                onClick={() => handleCopy(order.orderNumber, order.id || order.orderNumber)}
                                className="ml-1 text-emerald-700 hover:text-emerald-950"
                                title="Copy Order Number"
                              >
                                {copiedOrderId === (order.id || order.orderNumber) ? (
                                  <Check className="w-3 h-3 text-emerald-700" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </span>

                            <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getStatusBadge(order.status)}`}>
                              {order.status || 'PENDING'}
                            </span>

                            {order.paymentStatus === 'PAID' ? (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-full">
                                ✓ PAID ({order.paymentMethod || 'UPI'})
                              </span>
                            ) : (
                              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black px-2 py-0.5 rounded-full">
                                PENDING ({order.paymentMethod || 'COD'})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {order.orderDate 
                                ? new Date(order.orderDate).toLocaleString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : 'Recent Order'}
                            </span>
                          </div>
                        </div>

                        {/* Customer & Delivery Information Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50/70 p-3.5 rounded-2xl text-xs border border-slate-100">
                          <div>
                            <p className="font-bold text-slate-400 uppercase text-[10px] mb-1">Customer Details</p>
                            <p className="font-black text-slate-900 flex items-center">
                              <User className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                              {order.customerName || 'Customer'}
                            </p>
                            {order.customerEmail && (
                              <p className="text-slate-600 mt-0.5 flex items-center">
                                <Mail className="w-3 h-3 mr-1 text-slate-400" />
                                <a href={`mailto:${order.customerEmail}`} className="hover:text-emerald-700 truncate">
                                  {order.customerEmail}
                                </a>
                              </p>
                            )}
                            {order.phone && (
                              <p className="text-slate-600 mt-0.5 flex items-center">
                                <Phone className="w-3 h-3 mr-1 text-slate-400" />
                                <a href={`tel:${order.phone}`} className="hover:text-emerald-700 font-semibold">
                                  {order.phone}
                                </a>
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="font-bold text-slate-400 uppercase text-[10px] mb-1">Shipping Address</p>
                            <p className="text-slate-800 font-semibold flex items-start">
                              <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span>{order.shippingAddress || 'Address on file'}, {order.city || 'Mumbai'} {order.postalCode ? `- ${order.postalCode}` : ''}</span>
                            </p>
                            <p className="text-emerald-700 font-bold mt-1 text-[11px] flex items-center">
                              <Truck className="w-3 h-3 mr-1 text-emerald-600" />
                              Slot: {order.deliverySlot || 'Express 2-Hour'}
                            </p>
                          </div>

                          <div className="flex flex-col justify-between sm:items-end sm:text-right">
                            <div>
                              <p className="font-bold text-slate-400 uppercase text-[10px] mb-1">Order Total</p>
                              <p className="text-xl font-black text-emerald-700">
                                ₹{Number(order.totalAmount || 0).toFixed(0)}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {items.length} {items.length === 1 ? 'item' : 'items'} included
                              </p>
                            </div>

                            <button
                              onClick={() => setSelectedInvoiceOrder(order)}
                              className="mt-2 inline-flex items-center space-x-1 text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-sm transition-all"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>View / Print Invoice</span>
                            </button>
                          </div>
                        </div>

                        {/* Itemized Breakdown */}
                        {items.length > 0 && (
                          <div className="space-y-2 pt-1">
                            <p className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                              Ordered Items ({items.length}):
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {items.map((it, idx) => {
                                const prod = it.product || {};
                                return (
                                  <div key={idx} className="flex items-center space-x-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                    <img
                                      src={prod.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80'}
                                      alt={prod.name || 'Product'}
                                      className="w-11 h-11 rounded-lg object-cover bg-white border border-slate-200"
                                    />
                                    <div className="flex-1 min-w-0 text-xs">
                                      <p className="font-bold text-slate-900 truncate">
                                        {prod.name || 'Grocery Product'}
                                      </p>
                                      <p className="text-[10px] text-slate-500">
                                        Qty: <strong className="text-slate-800 font-bold">{it.quantity || 1}</strong> × ₹{Number(it.unitPrice || prod.discountPrice || prod.price || 0).toFixed(0)}
                                      </p>
                                      <p className="text-[11px] font-black text-emerald-700">
                                        ₹{Number(it.subtotal || ((it.unitPrice || prod.discountPrice || prod.price || 0) * (it.quantity || 1))).toFixed(0)}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Status Management Workflow Bar */}
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-600">Update Status:</span>
                            <select
                              value={order.status || 'PENDING'}
                              disabled={isUpdating}
                              onChange={(e) => handleUpdateOrderStatus(order.id || order.orderNumber, e.target.value)}
                              className="text-xs font-black px-3 py-1.5 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 outline-none shadow-sm cursor-pointer"
                            >
                              <option value="PENDING">⏳ PENDING</option>
                              <option value="CONFIRMED">✓ CONFIRMED (Preparing)</option>
                              <option value="SHIPPED">🚚 SHIPPED (In Transit)</option>
                              <option value="OUT_FOR_DELIVERY">🛵 OUT FOR DELIVERY</option>
                              <option value="DELIVERED">📦 DELIVERED</option>
                              <option value="CANCELLED">✖ CANCELLED</option>
                            </select>
                            {isUpdating && <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />}
                          </div>

                          {/* Quick Action One-Click Buttons */}
                          <div className="flex items-center space-x-2">
                            {(order.status === 'PENDING' || !order.status) && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id || order.orderNumber, 'CONFIRMED')}
                                disabled={isUpdating}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm transition-all flex items-center space-x-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Confirm Order</span>
                              </button>
                            )}

                            {order.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id || order.orderNumber, 'SHIPPED')}
                                disabled={isUpdating}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm transition-all flex items-center space-x-1"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Dispatch / Ship</span>
                              </button>
                            )}

                            {(order.status === 'SHIPPED' || order.status === 'OUT_FOR_DELIVERY') && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id || order.orderNumber, 'DELIVERED')}
                                disabled={isUpdating}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm transition-all flex items-center space-x-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Mark Delivered</span>
                              </button>
                            )}

                            {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to cancel order ${order.orderNumber}?`)) {
                                    handleUpdateOrderStatus(order.id || order.orderNumber, 'CANCELLED');
                                  }
                                }}
                                disabled={isUpdating}
                                className="bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs px-2.5 py-1.5 rounded-xl transition-all"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-slate-800 text-sm">Products in Catalog ({products.length})</h4>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setProductForm({
                      name: '',
                      description: '',
                      price: '',
                      discountPrice: '',
                      unit: '1 kg',
                      stockQuantity: 50,
                      imageUrl: '',
                      isHalal: true,
                      isFeatured: false,
                      categoryId: categories[0]?.id || 1
                    });
                    setIsFormOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Add/Edit Product Modal Form */}
              {isFormOpen && (
                <div ref={formRef} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  {editingId && (
                    <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-center justify-between animate-fade-in">
                      <div className="flex items-center space-x-2">
                        <Edit2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span className="text-xs font-black text-amber-900">
                          Currently Editing: <span className="underline">{productForm.name || 'Product'}</span> (ID #{editingId})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setIsFormOpen(false);
                        }}
                        className="text-xs font-bold text-amber-800 hover:text-amber-950 underline ml-2"
                      >
                        Cancel Edit
                      </button>
                    </div>
                  )}

                  <h5 className="font-bold text-xs text-slate-800 flex items-center justify-between">
                    <span>{editingId ? 'Edit Product Details' : 'Add New Grocery Product'}</span>
                    <span className="text-[10px] text-slate-400 font-normal">Changes reflect live on customer portal</span>
                  </h5>

                  <form onSubmit={handleSaveProduct} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Product Name *</label>
                        <input
                          type="text"
                          required
                          value={productForm.name}
                          onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Category *</label>
                        <select
                          value={productForm.categoryId}
                          onChange={e => setProductForm({ ...productForm, categoryId: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none cursor-pointer"
                        >
                          {(categories && categories.length > 0 ? categories : [
                            { id: 1, name: 'Fresh Fruits & Vegetables' },
                            { id: 2, name: 'ZamZam Meats & Poultry' },
                            { id: 3, name: 'Dairy & Farm Eggs' },
                            { id: 4, name: 'Bakery & Delights' },
                            { id: 5, name: 'Rice, Spices & Pantry' },
                            { id: 6, name: 'Dates, Nuts & Dry Fruits' },
                            { id: 7, name: 'Beverages & Refreshments' }
                          ]).map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Price (₹) *</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={productForm.price}
                          onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Discount Price (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={productForm.discountPrice}
                          onChange={e => setProductForm({ ...productForm, discountPrice: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Unit / Weight</label>
                        <input
                          type="text"
                          value={productForm.unit}
                          onChange={e => setProductForm({ ...productForm, unit: e.target.value })}
                          placeholder="1 kg, 500 g, 1 dozen"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Stock Quantity</label>
                        <input
                          type="number"
                          value={productForm.stockQuantity}
                          onChange={e => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="font-bold text-slate-600 block mb-1">Image URL (Unsplash or direct)</label>
                        <input
                          type="url"
                          value={productForm.imageUrl}
                          onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })}
                          placeholder="https://..."
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
                        />
                      </div>
                      <div className="flex items-center space-x-4 pt-4">
                        <label className="flex items-center space-x-1.5 cursor-pointer font-bold text-slate-700">
                          <input
                            type="checkbox"
                            checked={productForm.isHalal}
                            onChange={e => setProductForm({ ...productForm, isHalal: e.target.checked })}
                            className="rounded text-emerald-600 cursor-pointer"
                          />
                          <span>ZamZam Certified</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer font-bold text-slate-700">
                          <input
                            type="checkbox"
                            checked={productForm.isFeatured}
                            onChange={e => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                            className="rounded text-emerald-600 cursor-pointer"
                          />
                          <span>Featured on Home</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsFormOpen(false);
                          setEditingId(null);
                        }}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingProduct}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-md transition-all flex items-center space-x-1.5"
                      >
                        {savingProduct ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving Product...</span>
                          </>
                        ) : (
                          <span>{editingId ? 'Update Product in Store & Catalog' : 'Add Product to Storefront'}</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Product list table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <th className="p-3">Product</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 flex items-center space-x-3">
                          <img
                            src={p.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=100&q=80'}
                            alt={p.name}
                            className="w-9 h-9 rounded-lg object-cover bg-slate-100"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block truncate max-w-[180px]">{p.name}</span>
                            <span className="text-[10px] text-slate-400">{p.unit}</span>
                          </div>
                        </td>
                        <td className="p-3 font-medium text-slate-600">
                          {p.category?.name || 'General'}
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-slate-900">₹{Number(p.discountPrice || p.price).toFixed(0)}</span>
                          {p.discountPrice && (
                            <span className="text-[10px] text-slate-400 line-through ml-1">₹{Number(p.price).toFixed(0)}</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            p.stockQuantity <= 10 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {p.stockQuantity} in stock
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <button
                            onClick={() => handleEditClick(p)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800">Total Revenue</span>
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-black text-emerald-950 mt-2">
                    ₹{Number(stats?.totalRevenue || orders.reduce((sum, o) => o.status !== 'CANCELLED' ? sum + Number(o.totalAmount || 0) : sum, 0)).toFixed(0)}
                  </h3>
                </div>

                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-800">Total Orders</span>
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-black text-blue-950 mt-2">
                    {orders.length}
                  </h3>
                </div>

                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800">Pending Orders</span>
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-black text-amber-950 mt-2">
                    {pendingCount}
                  </h3>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Catalog Items</span>
                    <Layers className="w-5 h-5 text-slate-600" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mt-2">
                    {products.length}
                  </h3>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Admin Printable Invoice Modal */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 animate-slide-up max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedInvoiceOrder(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Invoice Header */}
            <div className="border-b border-slate-200 pb-5 mb-5 flex justify-between items-start">
              <div>
                <span className="text-xl font-black text-slate-900 flex items-center">
                  ZamZam <span className="text-emerald-600 ml-1">Mart</span>
                </span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Official Customer Tax Invoice
                </p>
                <p className="text-xs text-slate-500 mt-1">Order #{selectedInvoiceOrder.orderNumber}</p>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase border ${getStatusBadge(selectedInvoiceOrder.status)}`}>
                  {selectedInvoiceOrder.status}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">
                  {selectedInvoiceOrder.orderDate ? new Date(selectedInvoiceOrder.orderDate).toLocaleDateString('en-IN') : 'Recent'}
                </p>
              </div>
            </div>

            {/* Customer info */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl mb-5">
              <div>
                <p className="text-slate-400 uppercase text-[10px] font-bold">Billed To</p>
                <p className="font-extrabold text-slate-900 mt-0.5">{selectedInvoiceOrder.customerName}</p>
                <p className="text-slate-600">{selectedInvoiceOrder.phone}</p>
                <p className="text-slate-600 truncate">{selectedInvoiceOrder.customerEmail}</p>
              </div>
              <div>
                <p className="text-slate-400 uppercase text-[10px] font-bold">Delivery Address</p>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedInvoiceOrder.shippingAddress}</p>
                <p className="text-slate-600">{selectedInvoiceOrder.city} {selectedInvoiceOrder.postalCode ? `- ${selectedInvoiceOrder.postalCode}` : ''}</p>
                <p className="text-emerald-700 font-bold mt-1">Slot: {selectedInvoiceOrder.deliverySlot}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden mb-5 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Item Description</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedInvoiceOrder.items || []).map((it, i) => {
                    const p = it.product || {};
                    const price = it.unitPrice || p.discountPrice || p.price || 0;
                    const subtotal = it.subtotal || (price * (it.quantity || 1));
                    return (
                      <tr key={i}>
                        <td className="p-3 font-semibold text-slate-800">{p.name || 'Product'}</td>
                        <td className="p-3 text-center font-bold">{it.quantity || 1}</td>
                        <td className="p-3 text-right">₹{Number(price).toFixed(0)}</td>
                        <td className="p-3 text-right font-black text-slate-900">₹{Number(subtotal).toFixed(0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-2xl border border-emerald-100 mb-5">
              <div>
                <p className="text-xs font-bold text-emerald-800">Payment: {selectedInvoiceOrder.paymentMethod || 'COD'}</p>
                <p className="text-[10px] text-emerald-600 font-semibold">Status: {selectedInvoiceOrder.paymentStatus || 'PENDING'}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-emerald-800">Grand Total</p>
                <p className="text-2xl font-black text-emerald-950">₹{Number(selectedInvoiceOrder.totalAmount || 0).toFixed(0)}</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice Receipt</span>
              </button>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
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
