import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    nav_home: 'Home',
    nav_categories: 'Categories',
    nav_halal: '100% Halal',
    nav_deals: 'Offers & Deals',
    nav_track: 'Track Order',
    nav_admin: 'Admin Portal',
    nav_signin: 'Sign In',
    nav_cart: 'Cart',
    nav_ai: 'AI Grocery Assistant',
    search_placeholder: 'Search fresh vegetables, Halal chicken, basmati rice, dates...',
    hero_badge: '100% Certified Halal & Organic Freshness',
    hero_title: 'Freshness Delivered With Faith & Purity',
    hero_subtitle: 'From farm-fresh produce and certified Halal cuts to pure cold-pressed oils, experience seamless grocery delivery in under 2 hours.',
    shop_now: 'Shop Fresh Now',
    explore_halal: 'Halal Assurance',
    flash_ends_in: 'Sale ends in',
    hours: 'h',
    minutes: 'm',
    seconds: 's',
    add_to_cart: 'Add to Cart',
    out_of_stock: 'Out of Stock',
    free_delivery: 'FREE Delivery on orders over ₹499',
    cart_title: 'Your Fresh Basket',
    empty_cart: 'Your basket is currently empty',
    subtotal: 'Subtotal',
    discount: 'Discount',
    delivery_fee: 'Delivery Fee',
    free: 'FREE',
    total: 'Total Amount',
    apply_coupon: 'Apply Coupon',
    checkout: 'Proceed to Checkout',
    track_order_btn: 'Track Delivery',
    my_orders: 'My Orders',
    manage_addresses: 'Saved Addresses',
    logout: 'Log Out'
  },
  hi: {
    nav_home: 'होम',
    nav_categories: 'श्रेणियाँ',
    nav_halal: '100% हलाल',
    nav_deals: 'ऑफ़र्स व छूट',
    nav_track: 'ऑर्डर ट्रैक करें',
    nav_admin: 'एडमिन पोर्टल',
    nav_signin: 'साइन इन',
    nav_cart: 'कार्ट',
    nav_ai: 'AI किराना सहायक',
    search_placeholder: 'ताज़ी सब्जियां, हलाल चिकन, बासमती चावल, खजूर खोजें...',
    hero_badge: '100% प्रमाणित हलाल और ताज़ा शुद्धता',
    hero_title: 'शुद्धता और विश्वास के साथ ताज़ा डिलीवरी',
    hero_subtitle: 'खेत से सीधे ताज़ी सब्जियाँ, प्रमाणित हलाल मांस और शुद्ध सामग्री, 2 घंटे में आपके घर तक।',
    shop_now: 'अभी खरीदारी करें',
    explore_halal: 'हलाल प्रमाणन',
    flash_ends_in: 'सेल समाप्त होगी:',
    hours: 'घंटे',
    minutes: 'मिनट',
    seconds: 'सेकंड',
    add_to_cart: 'कार्ट में जोड़ें',
    out_of_stock: 'स्टॉक समाप्त',
    free_delivery: '₹499 से अधिक के ऑर्डर पर मुफ्त डिलीवरी',
    cart_title: 'आपकी ताज़ा टोकरी',
    empty_cart: 'आपकी टोकरी अभी खाली है',
    subtotal: 'उप-योग (सबटोटल)',
    discount: 'छूट (डिस्काउंट)',
    delivery_fee: 'डिलीवरी शुल्क',
    free: 'मुफ़्त',
    total: 'कुल राशि',
    apply_coupon: 'कूपन लागू करें',
    checkout: 'चेकआउट के लिए आगे बढ़ें',
    track_order_btn: 'डिलीवरी ट्रैक करें',
    my_orders: 'मेरे ऑर्डर',
    manage_addresses: 'सहेजे गए पते',
    logout: 'लॉग आउट'
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('zzm_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('zzm_language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
