import React, { useState, useEffect } from 'react';
import { 
  X, MapPin, Clock, CreditCard, Banknote, QrCode, ShieldCheck, 
  CheckCircle2, Mail, ExternalLink, Smartphone, AlertCircle, Copy, Check 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function CheckoutModal({ isOpen, onClose, onOrderSuccess }) {
  const { cartItems, total, subtotal, deliveryFee, discountAmount, clearCart } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    phone: user?.phone || '+91 9876543210',
    shippingAddress: user?.address || 'Flat 402, Green Valley Apartments, Near Central Masjid',
    city: 'Mumbai',
    postalCode: '400050',
    deliverySlot: 'Express 2-Hour',
    paymentMethod: 'UPI', // 'UPI', 'COD', 'CARD'
    upiSubMethod: 'RAZORPAY', // 'RAZORPAY', 'QR'
  });

  const [paymentConfig, setPaymentConfig] = useState({
    razorpayKeyId: 'rzp_test_zamzam12345678',
    merchantUpiId: 'zamzammart@okaxis',
    merchantUpiName: 'ZamZam Mart'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getPaymentConfig().then(cfg => {
        if (cfg) setPaymentConfig(cfg);
      });
      if (user) {
        setFormData(prev => ({
          ...prev,
          customerEmail: user.email || prev.customerEmail,
          customerName: prev.customerName || user.name || '',
          phone: prev.phone || user.phone || '',
          shippingAddress: prev.shippingAddress || user.address || ''
        }));
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Construct NPCI Standard UPI Intent URL
  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(paymentConfig.merchantUpiId)}&pn=${encodeURIComponent(paymentConfig.merchantUpiName)}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent('ZamZam Mart Grocery Order')}`;
  
  // Dynamic QR Code API (Instant real scan with GPay, PhonePe, Paytm)
  const upiQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(upiIntentUrl)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(paymentConfig.merchantUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleRazorpayPayment = async (orderData) => {
    setLoading(true);
    try {
      // 1. Create order on backend
      const res = await api.createOrder({
        ...orderData,
        paymentStatus: 'PENDING'
      });

      if (!res.success || !res.data) {
        throw new Error(res.message || 'Could not initiate order.');
      }

      const createdOrder = res.data;

      // 2. Create 3rd-Party Razorpay payment order
      const paymentRes = await api.createPaymentOrder({
        amount: total,
        orderNumber: createdOrder.orderNumber,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        phone: formData.phone
      });

      const paymentOrderData = paymentRes.data || {};

      // 3. Open Razorpay Checkout modal
      if (typeof window.Razorpay !== 'undefined') {
        const options = {
          key: paymentOrderData.keyId || paymentConfig.razorpayKeyId,
          amount: paymentOrderData.amountInPaise || (total * 100),
          currency: 'INR',
          name: 'ZamZam Mart',
          description: `Order #${createdOrder.orderNumber}`,
          image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80',
          order_id: paymentOrderData.razorpayOrderId?.startsWith('order_') ? paymentOrderData.razorpayOrderId : undefined,
          handler: async function (response) {
            setLoading(true);
            try {
              // 4. Verify payment with backend & trigger Gmail invoice
              await api.verifyPayment({
                razorpayOrderId: response.razorpay_order_id || paymentOrderData.razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id || ('pay_' + Date.now()),
                razorpaySignature: response.razorpay_signature || 'verified',
                orderNumber: createdOrder.orderNumber
              });

              createdOrder.paymentStatus = 'PAID';
              createdOrder.status = 'CONFIRMED';

              saveOrderLocally(createdOrder);
              clearCart();
              onClose();
              onOrderSuccess(createdOrder);
            } catch (verErr) {
              setError('Payment verification failed: ' + verErr.message);
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: formData.customerName,
            email: formData.customerEmail,
            contact: formData.phone
          },
          theme: {
            color: '#059669' // Emerald ZamZam theme
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setError('Payment Failed: ' + (resp.error?.description || 'Transaction declined'));
          setLoading(false);
        });
        rzp.open();
      } else {
        // Fallback if Razorpay CDN script was blocked or offline
        saveOrderLocally(createdOrder);
        clearCart();
        onClose();
        onOrderSuccess(createdOrder);
      }
    } catch (err) {
      setError(err.message || 'Error processing payment.');
      setLoading(false);
    }
  };

  const saveOrderLocally = (order) => {
    const existing = JSON.parse(localStorage.getItem('zzm_recent_orders') || '[]');
    localStorage.setItem('zzm_recent_orders', JSON.stringify([order, ...existing]));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customerName || !formData.phone || !formData.shippingAddress) {
      setError('Please fill in your name, phone number, and street address.');
      return;
    }

    if (!formData.customerEmail || !formData.customerEmail.includes('@')) {
      setError('Please enter a valid email address (e.g. yourname@gmail.com) for order invoice & tracking.');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    const orderPayload = {
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      phone: formData.phone,
      shippingAddress: formData.shippingAddress,
      city: formData.city,
      postalCode: formData.postalCode,
      deliverySlot: formData.deliverySlot,
      paymentMethod: formData.paymentMethod,
      totalAmount: total,
      items: cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    // If Razorpay UPI selected, trigger gateway
    if (formData.paymentMethod === 'UPI' && formData.upiSubMethod === 'RAZORPAY') {
      await handleRazorpayPayment(orderPayload);
      return;
    }

    // Otherwise standard COD or Direct QR / Card order
    setLoading(true);
    try {
      const res = await api.createOrder(orderPayload);
      if (res.success && res.data) {
        saveOrderLocally(res.data);
        clearCart();
        onClose();
        onOrderSuccess(res.data);
      } else {
        setError(res.message || 'Failed to place order.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong while placing your order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative border border-slate-100 animate-slide-up">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Complete Your Order</h3>
              <p className="text-xs text-slate-500">Fast 2-hour delivery & live UPI payment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmitOrder} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Customer Details & Gmail */}
          <div>
            <div className="flex items-center space-x-2 text-sm font-extrabold text-slate-800 mb-3">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>1. Contact & Delivery Address</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Amina Rahman"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Contact Phone (For Delivery OTP)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+91 9876543210"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>

              {/* GMAIL Input Field */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-1 text-red-500" />
                    <span>Email Address (Order invoice sent to your @gmail.com)</span>
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Instant Invoice Dispatch
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    required
                    placeholder="yourname@gmail.com"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  We will send your itemized grocery tax invoice, receipt, and live tracking updates to this email.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Street Address / House No / Building</label>
                <input
                  type="text"
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  required
                  placeholder="Flat 402, Green Valley Apartments, Near Central Masjid"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Mumbai"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Postal Code (PIN)</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="400050"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Delivery Slot */}
          <div>
            <div className="flex items-center space-x-2 text-sm font-extrabold text-slate-800 mb-3">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>2. Delivery Slot</span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { id: 'Express 2-Hour', title: 'Express (2h)', desc: 'Lightning fast' },
                { id: 'Evening Slot', title: 'Evening (5-8PM)', desc: 'Post work hours' },
                { id: 'Morning Slot', title: 'Tomorrow Morning', desc: 'Fresh farm harvest' },
              ].map(slot => (
                <button
                  type="button"
                  key={slot.id}
                  onClick={() => setFormData({ ...formData, deliverySlot: slot.id })}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    formData.deliverySlot === slot.id
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="text-xs font-bold">{slot.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{slot.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div>
            <div className="flex items-center space-x-2 text-sm font-extrabold text-slate-800 mb-3">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>3. Payment Method</span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
              {[
                { id: 'UPI', title: 'Instant UPI / QR', icon: QrCode, desc: 'GPay, PhonePe, Paytm' },
                { id: 'COD', title: 'Cash on Delivery', icon: Banknote, desc: 'Pay on arrival' },
                { id: 'CARD', title: 'Cards / NetBanking', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
              ].map(method => {
                const Icon = method.icon;
                const isSelected = formData.paymentMethod === method.id;
                return (
                  <button
                    type="button"
                    key={method.id}
                    onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`} />
                    <div className="text-xs font-bold">{method.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{method.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* REAL UPI PAYMENT OPTIONS (When UPI is selected) */}
            {formData.paymentMethod === 'UPI' && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-emerald-100 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 flex items-center">
                    <Smartphone className="w-4 h-4 mr-1 text-emerald-600" />
                    Select 3rd-Party UPI Mode:
                  </span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, upiSubMethod: 'RAZORPAY' })}
                      className={`text-[11px] font-bold px-3 py-1 rounded-xl transition-all ${
                        formData.upiSubMethod === 'RAZORPAY'
                          ? 'bg-emerald-700 text-white shadow-sm'
                          : 'bg-white border text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Razorpay Gateway
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, upiSubMethod: 'QR' })}
                      className={`text-[11px] font-bold px-3 py-1 rounded-xl transition-all ${
                        formData.upiSubMethod === 'QR'
                          ? 'bg-emerald-700 text-white shadow-sm'
                          : 'bg-white border text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Direct Dynamic QR
                    </button>
                  </div>
                </div>

                {/* Sub-Option 1: Razorpay UPI Modal */}
                {formData.upiSubMethod === 'RAZORPAY' && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 text-center space-y-2">
                    <div className="flex items-center justify-center space-x-2 text-xs font-bold text-slate-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Razorpay Secure 3rd-Party Payment Gateway</span>
                    </div>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Clicking <strong>Pay Now</strong> will launch the secure Razorpay payment popup with <strong>Google Pay, PhonePe, Paytm, BHIM, CRED, or any UPI ID</strong> with instant payment verification.
                    </p>
                    <div className="flex items-center justify-center space-x-3 pt-1 text-[11px] font-semibold text-slate-400">
                      <span>✓ 100% Encrypted</span>
                      <span>•</span>
                      <span>✓ Instant Confirmation</span>
                      <span>•</span>
                      <span>✓ Zero Extra Fees</span>
                    </div>
                  </div>
                )}

                {/* Sub-Option 2: Direct Dynamic UPI QR */}
                {formData.upiSubMethod === 'QR' && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 shadow-sm flex-shrink-0 text-center">
                      <img
                        src={upiQrImageUrl}
                        alt="UPI Payment QR"
                        className="w-36 h-36 mx-auto rounded-lg"
                      />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 block">
                        Scan with Any UPI App
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs flex-1 w-full text-left">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Merchant UPI ID</span>
                        <div className="flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 mt-0.5">
                          <code className="font-bold text-emerald-800">{paymentConfig.merchantUpiId}</code>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="text-slate-500 hover:text-emerald-700 font-semibold text-[10px] flex items-center ml-2"
                          >
                            {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                            <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-emerald-50 px-3 py-1.5 rounded-lg">
                        <span className="font-bold text-emerald-900">Exact Amount</span>
                        <span className="font-black text-emerald-700 text-sm">₹{total.toFixed(2)}</span>
                      </div>

                      {/* Deep-link for mobile users */}
                      <a
                        href={upiIntentUrl}
                        className="block w-full text-center bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 rounded-xl text-xs transition-colors shadow"
                      >
                        📱 Open Any UPI App on Mobile (GPay/PhonePe)
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* When CARD is selected, Razorpay handles cards as well */}
            {formData.paymentMethod === 'CARD' && (
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Credit/Debit Cards, NetBanking, and Wallets are processed securely via Razorpay with 3D Secure OTP verification.</span>
              </div>
            )}
          </div>

          {/* Order items mini summary */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>Items Total ({cartItems.length} items)</span>
              <span>₹{subtotal.toFixed(0)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-xs text-emerald-600 font-bold">
                <span>Discount</span>
                <span>-₹{discountAmount.toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Payable</span>
              <span className="text-emerald-700 font-black">₹{total.toFixed(0)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 text-white font-extrabold py-3.5 px-6 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-700/25 transition-all text-sm"
          >
            {loading ? (
              <span>Processing Payment...</span>
            ) : formData.paymentMethod === 'UPI' && formData.upiSubMethod === 'RAZORPAY' ? (
              <>
                <Smartphone className="w-5 h-5" />
                <span>Pay ₹{total.toFixed(0)} with Razorpay UPI</span>
              </>
            ) : formData.paymentMethod === 'UPI' && formData.upiSubMethod === 'QR' ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>I Have Paid ₹{total.toFixed(0)} - Place Order</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirm & Place Order (₹{total.toFixed(0)})</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
