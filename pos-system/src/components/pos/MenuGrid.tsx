import React from 'react';
import { CircleNotch } from "@phosphor-icons/react";
import { MenuItem } from '../../types/pos';

type MenuGridProps = {
  isLoading: boolean;
  filteredItems: MenuItem[];
  handleItemClick: (item: MenuItem) => void;
};

export const MenuGrid: React.FC<MenuGridProps> = ({ isLoading, filteredItems, handleItemClick }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4 text-slate-400">
            <CircleNotch weight="bold" className="animate-spin text-4xl text-blue-500" />
            <p>Loading Menu...</p>
          </div>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-20">
          {filteredItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="group relative flex flex-col items-center p-0 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 overflow-hidden text-left animate-fade-in"
            >
              <div className="h-32 w-full overflow-hidden bg-gray-100 relative">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.add(item.color.split(' ')[0]);
                  }}
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-black transition-opacity"></div>
              </div>
              
              <div className="p-4 w-full">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-800 line-clamp-1" title={item.name}>{item.name}</h3>
                  <span className="font-bold text-blue-600">£{item.price.toFixed(2)}</span>
                </div>
                <p className="text-xs text-slate-400 capitalize">{item.category}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-slate-400">
          <p>No items found</p>
        </div>
      )}
    </div>
  );
};
