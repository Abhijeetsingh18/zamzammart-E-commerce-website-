import React from 'react';
import { Truck, ShieldCheck, Leaf, Sparkles, ArrowRight, Clock } from 'lucide-react';

export default function HeroBanner({ onShopNow }) {
  return (
    <div className="mb-8">
      {/* Main Promo Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white shadow-2xl shadow-emerald-950/20">
        {/* Background decorative glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-12 md:py-16 grid md:grid-cols-2 gap-8 items-center">
          
          <div className="space-y-5">
            <div className="inline-flex items-center space-x-2 bg-emerald-800/80 border border-emerald-600/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-300 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>RAMADAN & FESTIVE SAVINGS SPECIAL</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Pure, Fresh & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300">
                100% Halal Groceries
              </span>
            </h1>

            <p className="text-emerald-100/90 text-sm sm:text-base max-w-lg leading-relaxed">
              From fresh farm harvest and certified Halal meats to Ajwa dates, Kashmiri saffron, and cold-pressed pantry essentials — delivered directly to your doorstep in 2 hours.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <button
                onClick={onShopNow}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold px-7 py-3.5 rounded-full shadow-lg shadow-amber-500/25 flex items-center space-x-2 text-sm transition-all transform hover:-translate-y-0.5"
              >
                <span>Explore Store</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2 text-xs text-emerald-200 font-medium">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Express 2-Hour Delivery Slots Open</span>
              </div>
            </div>
          </div>

          {/* Banner visual cards */}
          <div className="relative hidden md:block">
            <div className="relative mx-auto w-full max-w-md">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
                alt="Fresh Groceries"
                className="rounded-2xl object-cover h-80 w-full shadow-2xl border-4 border-emerald-800/40"
              />
              {/* Floating feature pills */}
              <div className="absolute -bottom-4 -left-4 bg-white text-slate-900 p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-extrabold">100% Zabiha Halal</div>
                  <div className="text-[10px] text-slate-500 font-medium">Certified Slaughter & Source</div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 bg-emerald-600 text-white p-3 rounded-2xl shadow-xl flex items-center space-x-2">
                <Leaf className="w-5 h-5 text-emerald-200" />
                <span className="text-xs font-bold">100% Fresh Guaranteed</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4 Feature highlight badges */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Certified Halal</h4>
            <p className="text-[11px] text-slate-500">100% genuine & verified</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">2-Hour Delivery</h4>
            <p className="text-[11px] text-slate-500">Free delivery over ₹499</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Farm Fresh Daily</h4>
            <p className="text-[11px] text-slate-500">Picked directly from farms</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Best Price Guarantee</h4>
            <p className="text-[11px] text-slate-500">Wholesale deals & coupons</p>
          </div>
        </div>
      </div>
    </div>
  );
}

