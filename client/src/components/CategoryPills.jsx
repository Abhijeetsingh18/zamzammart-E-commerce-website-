import React from 'react';
import { 
  Sparkles, Apple, Beef, Milk, Croissant, CookingPot, CupSoda, Layers 
} from 'lucide-react';

const ICON_MAP = {
  Apple,
  Beef,
  Milk,
  Croissant,
  CookingPot,
  Sparkles,
  CupSoda,
};

export default function CategoryPills({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center">
          <Layers className="w-5 h-5 mr-2 text-emerald-600" />
          Shop By Category
        </h2>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
          >
            Show All
          </button>
        )}
      </div>

      <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none">
        {/* All Products pill */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            selectedCategory === null
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/25 ring-2 ring-emerald-500/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Items</span>
        </button>

        {/* Categories pills */}
        {categories.map(cat => {
          const IconComp = ICON_MAP[cat.icon] || Sparkles;
          const isSelected = selectedCategory?.id === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat)}
              className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/25 ring-2 ring-emerald-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <IconComp className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-emerald-600'}`} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

