import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('zamzam_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState('PERCENTAGE'); // PERCENTAGE or FIXED
  const [promoMessage, setPromoMessage] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('zamzam_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setPromoCode('');
    setDiscountValue(0);
    setPromoMessage('');
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product.discountPrice != null ? item.product.discountPrice : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const applyPromo = async (code) => {
    if (!code || !code.trim()) {
      setPromoCode('');
      setDiscountValue(0);
      setPromoMessage('');
      return { success: false, message: 'Please enter a coupon code' };
    }
    const trimmed = code.trim().toUpperCase();
    try {
      const res = await api.validateCoupon(trimmed, subtotal);
      if (res && res.valid) {
        setPromoCode(trimmed);
        setDiscountType(res.discountType || 'PERCENTAGE');
        setDiscountValue(Number(res.discountAmount || 0));
        setPromoMessage(res.message || 'Coupon applied successfully!');
        return { success: true, message: res.message || 'Coupon applied successfully!' };
      } else {
        return { success: false, message: res?.message || 'Invalid or expired coupon code' };
      }
    } catch (err) {
      if (trimmed === 'ZAMZAM10') {
        const disc = Math.min(subtotal * 0.1, 150);
        setPromoCode(trimmed);
        setDiscountType('FIXED');
        setDiscountValue(disc);
        setPromoMessage('10% discount applied!');
        return { success: true, message: '10% discount applied!' };
      }
      return { success: false, message: 'Failed to validate coupon code' };
    }
  };

  const discountAmount = discountType === 'FIXED'
    ? Math.min(discountValue, subtotal)
    : Math.min((subtotal * discountValue) / 100, subtotal);

  const deliveryFee = subtotal > 499 || subtotal === 0 || promoCode === 'FREESHIP' ? 0 : 40;
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      subtotal,
      discountAmount,
      deliveryFee,
      total,
      totalItemCount,
      promoCode,
      promoMessage,
      applyPromo
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
