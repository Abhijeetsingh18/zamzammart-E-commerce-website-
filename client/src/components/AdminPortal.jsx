import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Trash2, Edit2, CheckCircle2, TrendingUp, Package, AlertTriangle, 
  DollarSign, ShoppingBag, ShieldCheck, Layers 
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminPortal({ isOpen, onClose, categories, onDataChanged }) {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'orders', 'stats'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form for new/edit product
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
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

  const loadAllAdminData = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        price: parseFloat(productForm.price),
        discountPrice: productForm.discountPrice ? parseFloat(productForm.discountPrice) : null,
        stockQuantity: parseInt(productForm.stockQuantity, 10),
        categoryId: parseInt(productForm.categoryId, 10),
      };

      if (editingId) {
        await api.updateProduct(editingId, payload);
      } else {
        await api.createProduct(payload);
      }

      setIsFormOpen(false);
      setEditingId(null);
      loadAllAdminData();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert('Failed to save product: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.deleteProduct(id);
        loadAllAdminData();
        if (onDataChanged) onDataChanged();
      } catch (err) {
        alert('Failed to delete product: ' + err.message);
      }
    }
  };

  const handleEditClick = (p) => {
    setEditingId(p.id);
    setProductForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      discountPrice: p.discountPrice || '',
      unit: p.unit || '1 kg',
      stockQuantity: p.stockQuantity || 50,
      imageUrl: p.imageUrl || '',
      isHalal: p.isHalal ?? true,
      isFeatured: p.isFeatured ?? false,
      categoryId: p.category?.id || categories[0]?.id || 1
    });
    setIsFormOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      loadAllAdminData();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative border border-slate-100 animate-slide-up">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-lg">ZamZam Mart Admin Portal</h3>
              <p className="text-xs text-amber-300">Catalog & Order Fulfillment Control</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 px-6 pt-4 border-b border-slate-100 bg-slate-50">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all ${
              activeTab === 'inventory'
                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Inventory Management ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all ${
              activeTab === 'orders'
                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Customer Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all ${
              activeTab === 'stats'
                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Store Analytics & Metrics
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB 1: INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-slate-800 text-sm">Products in Catalog</h4>
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
                <form onSubmit={handleSaveProduct} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <h5 className="font-bold text-xs text-slate-800">
                    {editingId ? 'Edit Product' : 'Add New Grocery Product'}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Product Name</label>
                      <input
                        type="text"
                        required
                        value={productForm.name}
                        onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Category</label>
                      <select
                        value={productForm.categoryId}
                        onChange={e => setProductForm({ ...productForm, categoryId: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={productForm.price}
                        onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Discount Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.discountPrice}
                        onChange={e => setProductForm({ ...productForm, discountPrice: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Unit / Weight</label>
                      <input
                        type="text"
                        value={productForm.unit}
                        onChange={e => setProductForm({ ...productForm, unit: e.target.value })}
                        placeholder="1 kg, 500 g, 1 dozen"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Stock Quantity</label>
                      <input
                        type="number"
                        value={productForm.stockQuantity}
                        onChange={e => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-600 block mb-1">Image URL (Unsplash or direct)</label>
                      <input
                        type="url"
                        value={productForm.imageUrl}
                        onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div className="flex items-center space-x-4 pt-4">
                      <label className="flex items-center space-x-1.5 cursor-pointer font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={productForm.isHalal}
                          onChange={e => setProductForm({ ...productForm, isHalal: e.target.checked })}
                          className="rounded text-emerald-600"
                        />
                        <span>Halal Certified</span>
                      </label>
                      <label className="flex items-center space-x-1.5 cursor-pointer font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={productForm.isFeatured}
                          onChange={e => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                          className="rounded text-emerald-600"
                        />
                        <span>Featured</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-md"
                    >
                      Save Product
                    </button>
                  </div>
                </form>
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
                      <tr key={p.id} className="hover:bg-slate-50/80">
                        <td className="p-3 flex items-center space-x-3">
                          <img
                            src={p.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=100&q=80'}
                            alt={p.name}
                            className="w-10 h-10 object-contain rounded-lg bg-slate-100 p-1"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{p.name}</span>
                            <span className="text-[10px] text-slate-400">{p.unit}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600">{p.category?.name || 'General'}</td>
                        <td className="p-3 font-bold text-slate-900">
                          ₹{Number(p.discountPrice || p.price).toFixed(0)}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            (p.stockQuantity || 0) <= 10 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {p.stockQuantity || 0} in stock
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => handleEditClick(p)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
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

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-slate-800 text-sm">Customer Orders Fulfillment</h4>
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">No orders to display.</p>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-extrabold text-xs text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            {order.orderNumber}
                          </span>
                          <span className="text-xs font-bold text-slate-800">{order.customerName}</span>
                          <span className="text-xs text-slate-500 font-medium">({order.phone})</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {order.shippingAddress}, {order.city} | Slot: {order.deliverySlot} | Pay: {order.paymentMethod}
                        </p>
                        <p className="text-xs font-black text-slate-900 mt-1">
                          Total: ₹{Number(order.totalAmount || 0).toFixed(0)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-500">Status:</span>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="text-xs font-extrabold px-3 py-1.5 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 outline-none"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="SHIPPED">SHIPPED (Out For Delivery)</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
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
                    ₹{Number(stats?.totalRevenue || 34500).toFixed(0)}
                  </h3>
                </div>

                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-800">Total Orders</span>
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-black text-blue-950 mt-2">
                    {stats?.totalOrders || orders.length}
                  </h3>
                </div>

                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800">Pending Orders</span>
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-black text-amber-950 mt-2">
                    {stats?.pendingOrders || 2}
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
    </div>
  );
}

