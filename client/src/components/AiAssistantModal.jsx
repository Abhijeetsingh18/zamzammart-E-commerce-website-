import React, { useState } from 'react';
import { 
  Bot, Sparkles, X, ShoppingBag, CheckCircle, ArrowRight, 
  HelpCircle, DollarSign, Users, Utensils, RefreshCw 
} from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

export default function AiAssistantModal({ isOpen, onClose }) {
  const [prompt, setPrompt] = useState('');
  const [budget, setBudget] = useState(1000);
  const [dietary, setDietary] = useState('HALAL');
  const [familySize, setFamilySize] = useState(4);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [addedAll, setAddedAll] = useState(false);

  const { addToCart } = useCart();

  if (!isOpen) return null;

  const handleSolve = async (overridePrompt) => {
    const activePrompt = overridePrompt || prompt;
    if (!activePrompt.trim()) return;

    setLoading(true);
    setResult(null);
    setAddedAll(false);

    try {
      const res = await api.solveAiGroceryBasket({
        prompt: activePrompt,
        budget: Number(budget),
        dietaryPreference: dietary,
        familySize: Number(familySize)
      });
      setResult(res.data || res);
    } catch (err) {
      console.error('AI Solver error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntireBasket = () => {
    if (!result || !result.items) return;
    result.items.forEach(it => {
      const p = it.product;
      const q = it.quantity || 1;
      for (let i = 0; i < q; i++) {
        addToCart(p);
      }
    });
    setAddedAll(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const quickPrompts = [
    { label: '🍗 Royal Dum Biryani Feast (4 persons)', text: 'Groceries for authentic Dum Biryani with fresh chicken, Basmati rice and pure ghee', budget: 1000 },
    { label: '🥗 Farm Fresh Organic Veggies & Breakfast', text: 'Farm fresh brown eggs, spinach, fresh apples and morning breakfast essentials', budget: 600 },
    { label: '🍲 Family Dinner Curry Pack', text: 'Certified mutton boti cuts, basmati rice, spices and pantry essentials for dinner', budget: 1200 }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative border border-slate-100 animate-slide-up">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-950/20 bg-gradient-to-r from-emerald-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-400/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-white text-base sm:text-lg">AI Grocery & Meal Solver</h3>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Database Powered
                </span>
              </div>
              <p className="text-xs text-emerald-200">Solve complete meal kits within your exact budget</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Quick Prompts */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Quick Meal Inspirations:
            </label>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(qp.text);
                    setBudget(qp.budget);
                    handleSolve(qp.text);
                  }}
                  className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-xl border border-emerald-200 transition-all text-left flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span>{qp.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt input */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              What do you want to cook or stock up on?
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Healthy dinner for 4 people with fresh chicken and salads..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onKeyDown={(e) => e.key === 'Enter' && handleSolve()}
              />
              <button
                onClick={() => handleSolve()}
                disabled={loading || !prompt.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-1.5 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Solve</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Controls: Budget, Dietary, Family Size */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>Budget Limit:</span>
                <span className="text-emerald-700 font-black">₹{budget}</span>
              </div>
              <input
                type="range"
                min="200"
                max="3000"
                step="50"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Dietary Preference:</label>
              <select
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
              >
                <option value="HALAL">100% Halal Only</option>
                <option value="VEGETARIAN">Vegetarian (No meat)</option>
                <option value="ALL">All Items</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Portions / Family Size:</label>
              <select
                value={familySize}
                onChange={(e) => setFamilySize(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
              >
                <option value="2">1-2 Persons</option>
                <option value="4">3-4 Persons (Family)</option>
                <option value="6">5-6 Persons (Feast)</option>
                <option value="8">7+ Persons</option>
              </select>
            </div>
          </div>

          {/* AI Result Card */}
          {result && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-emerald-950 text-base">{result.mealTitle}</h4>
                  <p className="text-xs text-emerald-800">{result.summary}</p>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-emerald-700">₹{result.totalCost}</div>
                  <div className="text-[10px] text-emerald-600 font-bold">
                    Saved ₹{result.savingsRemaining} vs Budget
                  </div>
                </div>
              </div>

              {/* Cooking tips */}
              {result.cookingTips && (
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100 text-xs text-slate-700">
                  <span className="font-bold text-emerald-800">Chef & Prep Tip: </span>
                  {result.cookingTips}
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                  Basket Items ({result.items?.length || 0}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.items?.map((it, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-xl border border-emerald-100 flex items-center space-x-2.5">
                      <img
                        src={it.product?.imageUrl}
                        alt={it.product?.name}
                        className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{it.product?.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {it.quantity}x {it.product?.unit} · ₹{it.unitPrice}
                        </p>
                      </div>
                      <div className="text-xs font-black text-slate-900">
                        ₹{it.subtotal}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="pt-2">
                <button
                  onClick={handleAddEntireBasket}
                  disabled={addedAll}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 text-sm"
                >
                  {addedAll ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-amber-300" />
                      <span>Basket Added to Cart! Redirecting...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5 text-amber-300" />
                      <span>Add Entire Basket to Cart (₹{result.totalCost})</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
