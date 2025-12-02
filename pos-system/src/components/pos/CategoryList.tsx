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
            const activeClass = "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200";
            const inactiveClass = "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50";
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
