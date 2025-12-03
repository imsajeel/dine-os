import React from 'react';
import { Category } from '../../types/pos';

type CategoryListProps = {
  categories: Category[];
  activeCategory: string;
  setActiveCategory: (id: string) => void;
};

export const CategoryList: React.FC<CategoryListProps> = ({ categories, activeCategory, setActiveCategory }) => {
  return (
    <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => {
            const isActive = activeCategory === cat.id;
            const baseClass = "flex items-center gap-2 px-6 py-3 rounded-xl border transition-all duration-200 whitespace-nowrap cursor-pointer select-none";
            // Dark theme active: dark bg, white text
            const activeClass = "bg-slate-800 text-white border-slate-800 shadow-lg shadow-slate-400";
            // Dark theme inactive: white bg, dark text (or maybe light gray bg?)
            // Let's make inactive look standard but active look "dark theme" as requested, or maybe the whole bar?
            // "update categories make dark theme" -> likely means the active state or the buttons themselves.
            // Let's try a sleek dark style for the buttons.
            const inactiveClass = "bg-white text-slate-600 border-slate-200 hover:border-slate-800 hover:bg-slate-50";
            const Icon = cat.icon;

            return (
                <button 
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
                >
                    <Icon weight="bold" className="text-lg" />
                    <span className="font-medium">{cat.name}</span>
                </button>
            );
        })}
    </div>
  );
};
