import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('zzm_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('zzm_cart', JSON.stringify(cartItems));
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
    setDiscountPercent(0);
    setPromoMessage('');
  };

  const applyPromo = (code) => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed === 'ZAMZAM10') {
      setDiscountPercent(10);
      setPromoCode(trimmed);
      setPromoMessage('10% discount applied!');
      return { success: true, message: '10% discount applied!' };
    } else if (trimmed === 'WELCOME20') {
      setDiscountPercent(20);
      setPromoCode(trimmed);
      setPromoMessage('20% Welcome discount applied!');
      return { success: true, message: '20% Welcome discount applied!' };
    } else if (trimmed === 'FREESHIP') {
      setDiscountPercent(5);
      setPromoCode(trimmed);
      setPromoMessage('Free delivery & ₹50 off applied!');
      return { success: true, message: 'Free delivery coupon applied!' };
    }
    return { success: false, message: 'Invalid promo code. Try ZAMZAM10 or WELCOME20' };
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product.discountPrice != null ? item.product.discountPrice : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const discountAmount = (subtotal * discountPercent) / 100;
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
      discountPercent,
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
  return useContext(CartContext);
}

