import React from 'react';
import { ShoppingBag, ShieldCheck, Phone, Mail, MapPin, Heart } from 'lucide-react';

export default function Footer({ onSelectCategory, categories, onOpenOrders, onOpenAuth }) {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                ZamZam <span className="text-emerald-400">Mart</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Your trusted fullstack online supermarket for 100% certified Halal meats, fresh farm vegetables & fruits, authentic Kashmiri saffron, premium dates, and pure cold-pressed pantry essentials.
            </p>

            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-bold bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 max-w-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>100% Certified Zabiha Halal Guarantee</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-wider mb-3">
              Fresh Categories
            </h4>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 5).map(c => (
                <li key={c.id}>
                  <button
                    onClick={() => onSelectCategory(c)}
                    className="hover:text-emerald-400 transition-colors text-slate-400"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-wider mb-3">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {onOpenOrders && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenOrders}
                    className="hover:text-emerald-400 text-emerald-300 font-bold transition-colors flex items-center space-x-1"
                  >
                    <span>Track Order & Customer Portal</span>
                    <span className="bg-emerald-800 text-emerald-200 text-[9px] px-1.5 py-0.2 rounded font-mono">Live</span>
                  </button>
                </li>
              )}
              <li><span className="hover:text-emerald-400 cursor-pointer">Express 2-Hour Delivery Areas</span></li>
              <li><span className="hover:text-emerald-400 cursor-pointer">Halal Certification & Standards</span></li>
              <li><span className="hover:text-emerald-400 cursor-pointer">Return & Refund Policy</span></li>
              <li><span className="hover:text-emerald-400 cursor-pointer">Terms & Privacy</span></li>
              <li><span className="hover:text-emerald-400 cursor-pointer">Wholesale & Bulk Orders</span></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 text-xs text-slate-400">
            <h4 className="text-white font-black uppercase tracking-wider mb-3">
              Contact & Support
            </h4>
            <p className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>+91 98765 43210 (Toll Free)</span>
            </p>
            <p className="flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>support@zamzammart.com</span>
            </p>
            <p className="flex items-start space-x-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 mt-0.5" />
              <span>Central Avenue, Bandra West, Mumbai 400050</span>
            </p>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ZamZam Mart Ltd. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span>Powered by Spring Boot 3 & React</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">Ready for Production</span>
            {onOpenAuth && (
              <>
                <span>•</span>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="hover:text-slate-300 text-slate-500 transition-colors text-[11px]"
                  title="Store Administrator Portal"
                >
                  Admin Access
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

