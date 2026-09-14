import React, { useEffect } from 'react';
import { CheckCircle, Package, ArrowRight, Truck, MapPin, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OrderSuccessModal({ order, onClose, onOpenOrders }) {
  if (!order) return null;

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center shadow-2xl relative border border-slate-100 animate-slide-up">
        
        {/* Big Check icon */}
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
          <CheckCircle className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-black text-slate-900">Order Placed Successfully!</h2>
        <p className="text-xs text-slate-500 mt-1">
          Thank you for shopping with ZamZam Mart. Your groceries are being hand-picked!
        </p>

        {/* Order Details Card */}
        <div className="my-6 bg-slate-50 rounded-2xl p-4 text-left border border-slate-100 space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Order Number</span>
            <span className="font-extrabold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md font-mono">
              {order.orderNumber}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Estimated Delivery</span>
            <span className="font-bold text-slate-800 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              {order.deliverySlot || 'Express 2-Hour'}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Payment Mode</span>
            <span className="font-bold text-slate-800">
              {order.paymentMethod || 'Cash on Delivery'} ({order.paymentStatus || 'Pending'})
            </span>
          </div>

          <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200">
            <span className="text-slate-700 font-bold">Total Amount Paid</span>
            <span className="font-black text-emerald-700 text-sm">
              ₹{Number(order.totalAmount || 0).toFixed(0)}
            </span>
          </div>
        </div>

        {/* Live Delivery Tracker Mini Timeline */}
        <div className="mb-6">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-left mb-3">
            Live Order Status
          </p>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
            <div className="absolute top-1/2 left-0 w-1/3 h-0.5 bg-emerald-600 -translate-y-1/2 z-0"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">✓</div>
              <span className="text-[10px] font-bold text-emerald-700 mt-1">Placed</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">✓</div>
              <span className="text-[10px] font-bold text-emerald-700 mt-1">Confirmed</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">3</div>
              <span className="text-[10px] text-slate-400 mt-1">Shipped</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">4</div>
              <span className="text-[10px] text-slate-400 mt-1">Delivered</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenOrders();
            }}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <Package className="w-4 h-4" />
            <span>View All Orders</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-md shadow-emerald-700/20 flex items-center justify-center space-x-1.5"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}

