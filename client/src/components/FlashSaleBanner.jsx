import React, { useState, useEffect } from 'react';
import { Flame, Clock, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function FlashSaleBanner() {
  const [sale, setSale] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const { t } = useLanguage();

  useEffect(() => {
    let isMounted = true;
    const fetchSale = async () => {
      try {
        const data = await api.getCurrentFlashSale();
        if (isMounted && data) {
          setSale(data);
        }
      } catch (e) {
        // Fallback banner
        if (isMounted) {
          const end = new Date(Date.now() + 48 * 3600 * 1000);
          setSale({
            title: 'Weekend Super Saver Grocery Bonanza',
            discountPercentage: 25,
            endTime: end.toISOString()
          });
        }
      }
    };
    fetchSale();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!sale || !sale.endTime) return;

    const timer = setInterval(() => {
      const difference = new Date(sale.endTime) - new Date();
      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      } else {
        const hours = Math.floor((difference / (1000 * 60 * 60)));
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [sale]);

  if (!sale) return null;

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-700 text-white shadow-md relative overflow-hidden py-2 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm font-bold">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
            <Flame className="w-4 h-4 text-amber-200 fill-amber-200" />
          </div>
          <span className="bg-slate-950/40 text-amber-200 border border-amber-300/40 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
            {sale.discountPercentage}% OFF
          </span>
          <span className="tracking-tight text-white font-black truncate max-w-xs sm:max-w-md">
            {sale.title}
          </span>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950/50 backdrop-blur-sm px-3 py-1 rounded-xl border border-white/10">
          <Clock className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-[11px] font-medium text-amber-100">{t('flash_ends_in')}:</span>
          <div className="flex items-center space-x-1 font-mono font-black text-amber-300 text-xs">
            <span className="bg-slate-900 px-1.5 py-0.5 rounded">{pad(timeLeft.hours)}</span>
            <span>:</span>
            <span className="bg-slate-900 px-1.5 py-0.5 rounded">{pad(timeLeft.minutes)}</span>
            <span>:</span>
            <span className="bg-slate-900 px-1.5 py-0.5 rounded text-white">{pad(timeLeft.seconds)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
