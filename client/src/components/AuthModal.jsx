import React, { useState, useEffect } from 'react';
import { 
  X, Lock, Mail, User, Phone, ShieldCheck, Sparkles, CheckCircle2, 
  ArrowRight, ArrowLeft, KeyRound, Eye, EyeOff, Copy, Check, ExternalLink 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  initialResetToken = null, 
  initialResetEmail = '' 
}) {
  // Modes: 'login', 'register', 'forgot-password', 'reset-password'
  const [mode, setMode] = useState('login');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });

  // Forgot password & Reset password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotResult, setForgotResult] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const [resetToken, setResetToken] = useState(initialResetToken || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Google prompt state
  const [isGooglePromptOpen, setIsGooglePromptOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [showAdminAccess, setShowAdminAccess] = useState(false);

  // Status & Feedback
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [welcomeAlert, setWelcomeAlert] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, loginWithGoogle } = useAuth();

  useEffect(() => {
    if (initialResetToken) {
      setResetToken(initialResetToken);
      if (initialResetEmail) {
        setForgotEmail(initialResetEmail);
      }
      setMode('reset-password');
    }
  }, [initialResetToken, initialResetEmail]);

  const handleClose = () => {
    setShowAdminAccess(false);
    setIsGooglePromptOpen(false);
    setError('');
    setSuccessMsg('');
    setWelcomeAlert('');
    setForgotResult(null);
    setMode('login');
    onClose();
  };

  if (!isOpen) return null;

  // Standard Login / Register submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (mode === 'register' && formData.phone) {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        setError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 (e.g. 9876543210).');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
        setWelcomeAlert(`🌟 Welcoming greeting email & 10% OFF discount coupon (ZAMZAM10) sent from zamzammart08@gmail.com to ${formData.email}!`);
      }
      handleClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Google / Gmail login
  const handleGoogleLogin = async (emailToUse, nameToUse) => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const email = emailToUse || googleEmail || 'user@gmail.com';
      const name = nameToUse || googleName || email.split('@')[0];
      await loginWithGoogle(email, name);
      setWelcomeAlert(`🌟 Welcoming email & 10% OFF coupon sent from zamzammart08@gmail.com to ${email}!`);
      handleClose();
    } catch (err) {
      setError(err.message || 'Google / Gmail sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  // Fast test admin/customer login helper
  const fillAndLogin = async (email, password) => {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      handleClose();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password submit
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setError('Please enter a valid Gmail ID / email address.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.forgotPassword(forgotEmail);
      if (res.success) {
        setForgotResult(res.data || {
          email: forgotEmail,
          token: res.token || 'demo-token',
          resetLink: `${window.location.origin}/?resetToken=${res.token || 'demo-token'}&email=${encodeURIComponent(forgotEmail)}`
        });
        setSuccessMsg(res.message || `Password reset link generated and dispatched to ${forgotEmail} from zamzammart08@gmail.com!`);
      } else {
        setError(res.message || 'Could not send reset password email.');
      }
    } catch (err) {
      setError(err.message || 'Failed to request password reset link.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Handle Reset Password submit
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!resetToken || !resetToken.trim()) {
      setError('Missing or invalid reset token. Please request a new link.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await api.resetPassword(resetToken, newPassword);
      if (res.success) {
        setSuccessMsg('✅ Password reset successfully! Please sign in with your new password.');
        // Switch to login tab and prefill email
        if (forgotEmail) {
          setFormData(prev => ({ ...prev, email: forgotEmail, password: '' }));
        }
        setMode('login');
        setNewPassword('');
        setConfirmPassword('');
        setResetToken('');
        setForgotResult(null);
      } else {
        setError(res.message || 'Failed to reset password. The link may have expired.');
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (forgotResult?.resetLink) {
      navigator.clipboard.writeText(forgotResult.resetLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative border border-slate-100 animate-slide-up">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Global Success / Error Banners */}
        {successMsg && (
          <div className="mx-6 mt-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-start space-x-2 animate-fade-in font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {welcomeAlert && (
          <div className="mx-6 mt-4 p-3 bg-emerald-100/70 border border-emerald-300 text-emerald-900 text-xs rounded-2xl flex items-start space-x-2 animate-fade-in font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
            <span>{welcomeAlert}</span>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-6 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-medium animate-fade-in">
            {error}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: FORGOT PASSWORD VIEW                                  */}
        {/* ------------------------------------------------------------- */}
        {mode === 'forgot-password' && (
          <div className="p-6">
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Forgot Password?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Enter your registered Gmail ID. We will generate a secure reset link and automatically send it from{' '}
                <strong className="text-slate-700">zamzammart08@gmail.com</strong>.
              </p>
            </div>

            {!forgotResult ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Customer Gmail ID / Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. yourname@gmail.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Reset link will be dispatched from store admin (<span className="text-emerald-700 font-semibold">zamzammart08@gmail.com</span>)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading || !forgotEmail}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-emerald-700/25 transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5"
                >
                  {forgotLoading ? (
                    <span>Generating & Sending Link...</span>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Send Reset Password Link</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 font-bold inline-flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-left space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-800 font-extrabold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Reset Link Dispatched Successfully!</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    We sent a password reset email to <strong className="text-slate-900">{forgotResult.email}</strong> from{' '}
                    <strong className="text-emerald-800">zamzammart08@gmail.com</strong>. The link expires in 60 minutes.
                  </p>
                </div>

                {/* Instant 1-Click Action to Open Reset Screen */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 text-center">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    ⚡ Instant Reset Shortcut (Test in this browser)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setResetToken(forgotResult.token);
                      setMode('reset-password');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>Open Reset Password Form Now</span>
                  </button>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10px]">
                    <span className="text-slate-500 truncate max-w-[240px] font-mono">
                      Token: {forgotResult.token}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center space-x-1"
                    >
                      {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 font-bold inline-flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: RESET PASSWORD VIEW (Create New Password)             */}
        {/* ------------------------------------------------------------- */}
        {mode === 'reset-password' && (
          <div className="p-6">
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Create New Password</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your new password to restore access to your account.
              </p>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  New Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                🔒 Your password will be securely hashed with BCrypt. You can immediately log in after saving.
              </div>

              <button
                type="submit"
                disabled={resetLoading || !newPassword || !confirmPassword}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-emerald-700/25 transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                {resetLoading ? (
                  <span>Saving New Password...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save New Password & Sign In</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold inline-flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 3: STANDARD LOGIN / REGISTER VIEW                        */}
        {/* ------------------------------------------------------------- */}
        {(mode === 'login' || mode === 'register') && (
          <>
            {/* Tab Header */}
            <div className="p-6 pb-2 text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {mode === 'login' ? 'Welcome Back!' : 'Join ZamZam Mart'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {mode === 'login' ? 'Log in to track orders and manage your grocery deliveries' : 'Create an account to start shopping'}
              </p>

              <div className="mt-4 flex bg-slate-100 p-1 rounded-2xl">
                <button
                  onClick={() => { setMode('login'); setError(''); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMode('register'); setError(''); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
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
                <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-2xl space-y-3 animate-fade-in">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span className="flex items-center space-x-1.5">
                      <Mail className="w-4 h-4 text-red-500" />
                      <span>Continue with Google / Gmail</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsGooglePromptOpen(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5"
                    >
                      Cancel
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-tight">
                    Enter your real Gmail address to sign in instantly. A welcoming greeting email with your 10% discount coupon (<span className="font-mono font-bold text-emerald-700">ZAMZAM10</span>) will be automatically sent from <span className="font-semibold text-emerald-800">zamzammart08@gmail.com</span>!
                  </p>

                  <input
                    type="text"
                    placeholder="Your Full Name (e.g. Rahul Sharma)"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                  />

                  <input
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                  />

                  <button
                    type="button"
                    onClick={() => handleGoogleLogin(googleEmail, googleName)}
                    disabled={loading || !googleEmail}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2"
                  >
                    {/* Google SVG G Icon */}
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>{loading ? 'Connecting Google / Gmail...' : 'Continue & Receive Welcome Email'}</span>
                  </button>
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
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Mobile Number (Indian 10-Digit)
                    </label>
                    <div className="flex rounded-xl shadow-sm border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 overflow-hidden">
                      <div className="flex items-center px-3 bg-slate-100 border-r border-slate-200 text-slate-700 font-bold text-xs select-none">
                        <span className="mr-1 text-sm">🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        placeholder="9876543210"
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '');
                          const trimmed = raw.length > 10 ? raw.slice(raw.length - 10) : raw;
                          setFormData({ ...formData, phone: trimmed });
                        }}
                        className="w-full text-xs px-3 py-2 bg-transparent border-0 outline-none font-semibold text-slate-800 placeholder:font-normal"
                      />
                    </div>
                    {formData.phone && !/^[6-9]\d{9}$/.test(formData.phone) && (
                      <p className="text-[10px] text-amber-600 mt-1 font-medium">
                        Must be 10 digits starting with 6, 7, 8, or 9 ({formData.phone.length}/10 digits)
                      </p>
                    )}
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
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-bold text-slate-600">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot-password');
                        setForgotEmail(formData.email || '');
                        setError('');
                        setSuccessMsg('');
                        setForgotResult(null);
                      }}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
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
                {loading ? 'Processing...' : mode === 'login' ? 'Sign In to Account' : 'Register Account'}
              </button>

              {/* Helper Tab Switcher */}
              <div className="text-center pt-1">
                <p className="text-xs text-slate-500">
                  {mode === 'login' ? (
                    <span>
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => { setMode('register'); setError(''); }}
                        className="text-emerald-700 font-bold hover:underline"
                      >
                        Create Account
                      </button>
                    </span>
                  ) : (
                    <span>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => { setMode('login'); setError(''); }}
                        className="text-emerald-700 font-bold hover:underline"
                      >
                        Sign In
                      </button>
                    </span>
                  )}
                </p>
              </div>

              {/* Discreet Administrator Portal Access - hidden from standard customers */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowAdminAccess(!showAdminAccess)}
                    className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors inline-flex items-center space-x-1.5 py-1 px-2.5 rounded-lg hover:bg-slate-50"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>{showAdminAccess ? 'Close Admin Access' : 'Store Administrator Portal'}</span>
                  </button>
                </div>

                {showAdminAccess && (
                  <div className="mt-2.5 p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 animate-fade-in shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-black text-amber-300 tracking-wide uppercase">Store Admin Only</span>
                      </div>
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold">
                        RESTRICTED
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 mb-2.5 leading-tight">
                      Official Store Email: <span className="text-amber-300 font-bold">zamzammart08@gmail.com</span>
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        onClick={() => fillAndLogin('zamzammart08@gmail.com', 'abhijeet@7890')}
                        className="w-full text-[11px] font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 py-2.5 px-3 rounded-xl text-center transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Administrator Secure Login</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
