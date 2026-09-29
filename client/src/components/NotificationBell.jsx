import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Package, Tag, AlertCircle, Info, X } from 'lucide-react';
import { api } from '../services/api';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data || []);
      const unread = (data || []).filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (e) {
      // Mock notifications if backend not reached
      setNotifications([
        {
          id: 1,
          title: 'Welcome to ZamZam Mart! 🛒',
          message: 'Enjoy 100% Halal certified groceries and fast doorstep delivery.',
          type: 'INFO',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Weekend Flash Sale Live! ⚡',
          message: 'Use coupon ZAMZAM10 for 10% off your grocery basket.',
          type: 'PROMO',
          isRead: false,
          createdAt: new Date().toISOString()
        }
      ]);
      setUnreadCount(2);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'ORDER':
        return <Package className="w-4 h-4 text-emerald-600" />;
      case 'PROMO':
        return <Tag className="w-4 h-4 text-amber-600" />;
      case 'ALERT':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all relative flex items-center justify-center"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-slide-up">
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-amber-300 hover:text-amber-200 flex items-center space-x-1 font-semibold"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No notifications right now
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 flex items-start space-x-3 transition-colors ${
                    !n.isRead ? 'bg-amber-50/50' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 leading-snug">{n.title}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                    <span className="text-[9px] text-slate-400 mt-1 inline-block">
                      {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                    </span>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
