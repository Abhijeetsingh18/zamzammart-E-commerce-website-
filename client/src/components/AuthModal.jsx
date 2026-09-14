import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, ShieldCheck, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [isGooglePromptOpen, setIsGooglePromptOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, loginWithGoogle } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLoginTab) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (emailToUse, nameToUse) => {
    setError('');
    setLoading(true);
    try {
      const email = emailToUse || googleEmail || 'user@gmail.com';
      const name = nameToUse || googleName || email.split('@')[0];
      await loginWithGoogle(email, name);
      setIsGooglePromptOpen(false);
      onClose();
    } catch (err) {
      setError(err.message || 'Google / Gmail sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillAndLogin = async (email, password) => {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative border border-slate-100 animate-slide-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tab Header */}
        <div className="p-6 pb-2 text-center">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900">
            {isLoginTab ? 'Welcome Back!' : 'Join ZamZam Mart'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {isLoginTab ? 'Log in to track orders and manage your grocery deliveries' : 'Create an account to start shopping'}
          </p>

          <div className="mt-4 flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => { setIsLoginTab(true); setError(''); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                isLoginTab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLoginTab(false); setError(''); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                !isLoginTab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Direct Gmail Login Section */}
        <div className="px-6 pt-2">
          {!isGooglePromptOpen ? (
            <button
              type="button"
              onClick={() => setIsGooglePromptOpen(true)}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2.5 shadow-sm transition-all group"
            >
              {/* Google SVG G Icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google / Gmail</span>
            </button>
          ) : (
            <div className="bg-slate-50 border border-emerald-200 p-3 rounded-2xl space-y-2 animate-fade-in">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span className="flex items-center">
                  <Mail className="w-3.5 h-3.5 mr-1 text-red-500" />
                  Sign in with your Gmail
                </span>
                <button
                  type="button"
                  onClick={() => setIsGooglePromptOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-[10px]"
                >
                  Cancel
                </button>
              </div>

              <input
                type="email"
                placeholder="Enter your email (e.g. yourname@gmail.com)"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleGoogleLogin(googleEmail, googleName)}
                  disabled={loading || !googleEmail}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-xl transition-colors shadow-sm"
                >
                  {loading ? 'Signing in...' : 'Sign in with Gmail'}
                </button>
                <button
                  type="button"
                  onClick={() => handleGoogleLogin('customer.google@gmail.com', 'Google Customer')}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-semibold px-3 py-2 rounded-xl transition-colors"
                  title="One-click demo Gmail account"
                >
                  1-Click Gmail
                </button>
              </div>
            </div>
          )}

          <div className="relative flex py-3 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-semibold uppercase">Or with email</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-0 space-y-3">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {!isLoginTab && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amina Rahman"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-emerald-700/25 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLoginTab ? 'Sign In to Account' : 'Register Account'}
          </button>

          {/* Customer Login & Admin Login Quick Buttons */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-wider mb-2">
              Instant 1-Click Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillAndLogin('customer@zamzammart.com', 'customer123')}
                className="text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 py-2.5 px-2 rounded-xl text-center transition-colors flex items-center justify-center space-x-1 shadow-sm"
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Customer Login</span>
              </button>
              <button
                type="button"
                onClick={() => fillAndLogin('zamzammart08@gmail.com', 'abhijeet@7890')}
                className="text-[11px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 py-2.5 px-2 rounded-xl text-center transition-colors flex items-center justify-center space-x-1 shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin Login</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
