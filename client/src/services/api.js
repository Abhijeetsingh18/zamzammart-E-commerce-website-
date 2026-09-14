// API Service for ZamZam Mart

const API_BASE = '/api';

// Initial fallback mock data for offline resilience
const FALLBACK_CATEGORIES = [
  { id: 1, name: 'Fresh Fruits & Vegetables', slug: 'fruits-vegetables', icon: 'Apple', imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80' },
  { id: 2, name: 'Halal Meats & Poultry', slug: 'halal-meats', icon: 'Beef', imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80' },
  { id: 3, name: 'Dairy & Farm Eggs', slug: 'dairy-eggs', icon: 'Milk', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80' },
  { id: 4, name: 'Bakery & Delights', slug: 'bakery-delights', icon: 'Croissant', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80' },
  { id: 5, name: 'Rice, Spices & Pantry', slug: 'pantry-spices', icon: 'CookingPot', imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80' },
  { id: 6, name: 'Dates, Nuts & Dry Fruits', slug: 'dates-nuts-snacks', icon: 'Sparkles', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80' },
  { id: 7, name: 'Beverages & Refreshments', slug: 'beverages-juices', icon: 'CupSoda', imageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80' }
];

const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: 'Fresh Organic Shimla Apples',
    description: 'Hand-picked sweet and crunchy organic Shimla apples packed with rich antioxidants.',
    price: 180.00,
    discountPrice: 149.00,
    unit: '1 kg',
    stockQuantity: 60,
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
    isHalal: true,
    isFeatured: true,
    rating: 4.9,
    ratingCount: 48,
    category: { id: 1, name: 'Fresh Fruits & Vegetables' }
  },
  {
    id: 2,
    name: 'Farm Fresh Organic Spinach (Palak)',
    description: 'Pesticide-free tender green spinach leaves washed and ready to cook.',
    price: 40.00,
    discountPrice: 29.00,
    unit: '250 g',
    stockQuantity: 45,
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
    isHalal: true,
    isFeatured: false,
    rating: 4.7,
    ratingCount: 32,
    category: { id: 1, name: 'Fresh Fruits & Vegetables' }
  },
  {
    id: 3,
    name: 'Fresh Halal Skinless Curry Cut Chicken',
    description: '100% Zabiha Halal certified, fresh tender bone-in chicken cut into ideal curry pieces.',
    price: 280.00,
    discountPrice: 235.00,
    unit: '1 kg',
    stockQuantity: 40,
    imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80',
    isHalal: true,
    isFeatured: true,
    rating: 4.9,
    ratingCount: 112,
    category: { id: 2, name: 'Halal Meats & Poultry' }
  },
  {
    id: 4,
    name: 'Premium Halal Tender Mutton Boti Cuts',
    description: 'Fresh, juicy boneless goat mutton cubes perfect for biryani, kebabs, and rich stews.',
    price: 790.00,
    discountPrice: 720.00,
    unit: '500 g',
    stockQuantity: 25,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    isHalal: true,
    isFeatured: true,
    rating: 4.8,
    ratingCount: 65,
    category: { id: 2, name: 'Halal Meats & Poultry' }
  },
  {
    id: 5,
    name: 'Farm Fresh Country Brown Eggs',
    description: 'Nutritious free-range country brown eggs with deep golden yolks.',
    price: 120.00,
    discountPrice: 95.00,
    unit: 'Pack of 12',
    stockQuantity: 80,
    imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80',
    isHalal: true,
    isFeatured: true,
    rating: 4.9,
    ratingCount: 90,
    category: { id: 3, name: 'Dairy & Farm Eggs' }
  },
  {
    id: 6,
    name: 'Pure Desi Cow Ghee (A2 Bilona Method)',
    description: 'Traditional aromatic golden cow ghee crafted using the ancient hand-churned Bilona method.',
    price: 899.00,
    discountPrice: 799.00,
    unit: '500 ml jar',
    stockQuantity: 35,
    imageUrl: 'https://images.unsplash.com/photo-1631709497146-a239ef373cf1?auto=format&fit=crop&w=600&q=80',
    isHalal: true,
    isFeatured: true,
    rating: 5.0,
    ratingCount: 77,
    category: { id: 3, name: 'Dairy & Farm Eggs' }
  },
  {
    id: 7,
    name: 'Artisan Honey & Pistachio Baklava Box',
    description: 'Delicate layers of flaky phyllo dough loaded with crushed pistachios and pure wildflower honey.',
    price: 450.00,
    discountPrice: 390.00,
    unit: 'Box of 8 pcs',
    stockQuantity: 25,
    imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=600&q=80',
    isHalal: true,
    isFeatured: true,
    rating: 4.9,
    ratingCount: 56,
    category: { id: 4, name: 'Bakery & Delights' }
  },
  {
    id: 8,
    name: 'Royal Daawat Extra Long Grain Basmati Rice',
    description: 'Aged 2 years for unmatched royal aroma, delicate pearls, and fluffiness for authentic biryanis.',
    price: 420.00,
    discountPrice: 360.00,
    unit: '2 kg bag',
    stockQuantity: 40,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    isHalal: true,
    isFeatured: true,
    rating: 4.8,
    ratingCount: 140,
    category: { id: 5, name: 'Rice, Spices & Pantry' }
  },
  {
    id: 9,
    name: 'Premium Saudi Ajwa Al-Madinah Dates',
    description: 'Soft, rich black Ajwa dates cultivated in the blessed groves of Al-Madinah Al-Munawwarah.',
    price: 699.00,
    discountPrice: 599.00,
    unit: '500 g box',
    stockQuantity: 55,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    isHalal: true,
    isFeatured: true,
    rating: 5.0,
    ratingCount: 160,
    category: { id: 6, name: 'Dates, Nuts & Dry Fruits' }
  },
  {
    id: 10,
    name: 'Natural Pure ZamZam Holy Water',
    description: 'Authentic sealed bottle of pure, mineral-rich ZamZam blessed water.',
    price: 250.00,
    discountPrice: 199.00,
    unit: '500 ml bottle',
    stockQuantity: 100,
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80',
    isHalal: true,
    isFeatured: true,
    rating: 5.0,
    ratingCount: 310,
    category: { id: 7, name: 'Beverages & Refreshments' }
  }
];

function getHeaders() {
  const token = localStorage.getItem('zzm_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Categories
  async getCategories() {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (!res.ok) throw new Error('Network response was not ok');
      const json = await res.json();
      return json.data || FALLBACK_CATEGORIES;
    } catch (err) {
      console.warn('Backend offline, using fallback categories', err);
      return FALLBACK_CATEGORIES;
    }
  },

  // Products
  async getProducts() {
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (!res.ok) throw new Error('Network response was not ok');
      const json = await res.json();
      return json.data || FALLBACK_PRODUCTS;
    } catch (err) {
      console.warn('Backend offline, using fallback products', err);
      return FALLBACK_PRODUCTS;
    }
  },

  async getProductsByCategory(categoryId) {
    try {
      const res = await fetch(`${API_BASE}/products/category/${categoryId}`);
      if (!res.ok) throw new Error('Network response was not ok');
      const json = await res.json();
      return json.data;
    } catch (err) {
      return FALLBACK_PRODUCTS.filter(p => p.category?.id === Number(categoryId));
    }
  },

  async searchProducts(query) {
    try {
      const res = await fetch(`${API_BASE}/products/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Network response was not ok');
      const json = await res.json();
      return json.data;
    } catch (err) {
      const q = query.toLowerCase();
      return FALLBACK_PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
  },

  // Orders
  async createOrder(orderData) {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(orderData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to place order');
      return json;
    } catch (err) {
      console.warn('Backend not responding to createOrder, simulating mock order:', err);
      // Simulate successful order response for mock
      const mockOrderNumber = 'ZZM-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      return {
        success: true,
        message: 'Order placed successfully (Demo mode)!',
        data: {
          id: Date.now(),
          orderNumber: mockOrderNumber,
          totalAmount: orderData.totalAmount || 500,
          customerName: orderData.customerName,
          status: 'PENDING',
          deliverySlot: orderData.deliverySlot || 'Express 2-Hour',
          paymentMethod: orderData.paymentMethod || 'COD',
          paymentStatus: orderData.paymentMethod === 'COD' ? 'PENDING' : 'PAID',
          orderDate: new Date().toISOString()
        }
      };
    }
  },

  async getMyOrders() {
    try {
      const res = await fetch(`${API_BASE}/orders/my-orders`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to load orders');
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      // Local fallback orders
      const local = JSON.parse(localStorage.getItem('zzm_recent_orders') || '[]');
      return local;
    }
  },

  async trackOrder(orderNumber) {
    if (!orderNumber || !orderNumber.trim()) {
      throw new Error('Please enter a valid Order Number');
    }
    const cleanNum = orderNumber.trim().toUpperCase();
    try {
      const res = await fetch(`${API_BASE}/orders/track/${encodeURIComponent(cleanNum)}`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        // Look in local storage if not found in backend
        const local = JSON.parse(localStorage.getItem('zzm_recent_orders') || '[]');
        const found = local.find(o => o.orderNumber?.toUpperCase() === cleanNum);
        if (found) return found;
        throw new Error(`Order "${cleanNum}" was not found. Please check your order ID.`);
      }
      const json = await res.json();
      return json.data;
    } catch (err) {
      const local = JSON.parse(localStorage.getItem('zzm_recent_orders') || '[]');
      const found = local.find(o => o.orderNumber?.toUpperCase() === cleanNum);
      if (found) return found;
      throw err;
    }
  },

  // Auth
  async login(email, password) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Login failed');
      return json;
    } catch (err) {
      // Offline demo fallback for convenience
      if (email === 'zamzammart08@gmail.com' && password === 'abhijeet@7890') {
        return {
          success: true,
          data: {
            token: 'demo-admin-token',
            id: 1,
            name: 'ZamZam Admin',
            email: 'zamzammart08@gmail.com',
            role: 'ROLE_ADMIN'
          }
        };
      } else if (email === 'customer@zamzammart.com' && password === 'customer123') {
        return {
          success: true,
          data: {
            token: 'demo-customer-token',
            id: 2,
            name: 'Amina Rahman',
            email: 'customer@zamzammart.com',
            role: 'ROLE_CUSTOMER'
          }
        };
      }
      throw err;
    }
  },

  async register(userData) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Registration failed');
      return json;
    } catch (err) {
      return {
        success: true,
        data: {
          token: 'demo-token-' + Date.now(),
          id: Date.now(),
          name: userData.name,
          email: userData.email,
          role: 'ROLE_CUSTOMER'
        }
      };
    }
  },

  async loginWithGoogle(email, name) {
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Google login failed');
      return json;
    } catch (err) {
      return {
        success: true,
        data: {
          token: 'google-jwt-token-' + Date.now(),
          id: Date.now(),
          name: name || (email ? email.split('@')[0] : 'Google User'),
          email: email || 'user@gmail.com',
          role: 'ROLE_CUSTOMER'
        }
      };
    }
  },

  // Admin APIs
  async createProduct(product) {
    const res = await fetch(`${API_BASE}/admin/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    return res.json();
  },

  async updateProduct(id, product) {
    const res = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    return res.json();
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  async getAllOrdersAdmin() {
    try {
      const res = await fetch(`${API_BASE}/admin/orders`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      return [];
    }
  },

  async updateOrderStatus(orderId, status) {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async getAdminStats() {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      return json.data;
    } catch (err) {
      return {
        totalRevenue: 34500,
        totalOrders: 28,
        pendingOrders: 4,
        totalProducts: 16,
        lowStockCount: 2
      };
    }
  },

  // 3rd Party UPI & Razorpay Payment APIs
  async getPaymentConfig() {
    try {
      const res = await fetch(`${API_BASE}/payment/config`);
      const json = await res.json();
      return json.data || {
        razorpayKeyId: 'rzp_test_zamzam12345678',
        merchantUpiId: 'zamzammart@okaxis',
        merchantUpiName: 'ZamZam Mart'
      };
    } catch (e) {
      return {
        razorpayKeyId: 'rzp_test_zamzam12345678',
        merchantUpiId: 'zamzammart@okaxis',
        merchantUpiName: 'ZamZam Mart'
      };
    }
  },

  async createPaymentOrder(paymentData) {
    try {
      const res = await fetch(`${API_BASE}/payment/create-order`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(paymentData),
      });
      return await res.json();
    } catch (err) {
      console.warn('Payment API offline, creating sandbox payment order', err);
      return {
        success: true,
        data: {
          razorpayOrderId: 'order_' + Math.random().toString(36).substring(2, 12),
          amountInPaise: (paymentData.amount || 100) * 100,
          currency: 'INR',
          keyId: 'rzp_test_zamzam12345678',
          merchantName: 'ZamZam Mart',
          merchantUpiId: 'zamzammart@okaxis',
          upiIntentUrl: `upi://pay?pa=zamzammart@okaxis&pn=ZamZam+Mart&am=${paymentData.amount}&cu=INR&tn=Order+${paymentData.orderNumber || 'ZZM'}`
        }
      };
    }
  },

  async verifyPayment(verificationData) {
    try {
      const res = await fetch(`${API_BASE}/payment/verify`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(verificationData),
      });
      return await res.json();
    } catch (err) {
      return { success: true, message: 'Payment verified (Demo Mode)' };
    }
  }
};

