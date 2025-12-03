import React from 'react';
import { SquaresFour, Receipt, Bag, Clock, Gear, SignOut, ChefHat, Calendar } from "@phosphor-icons/react";

type SidebarProps = {
  currentView: 'pos' | 'tables' | 'takeaway' | 'reservations' | 'settings';
  setCurrentView: (view: 'pos' | 'tables' | 'takeaway' | 'reservations' | 'settings') => void;
  handleLogout: () => void;
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, handleLogout }) => {
  return (
    <aside className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-6 z-20 flex-shrink-0">
      {/* Logo */}
      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 mb-4 cursor-default">
         <ChefHat weight="fill" className="text-2xl" />
      </div>
      
      <div className="flex flex-col gap-4 w-full px-2">
        <button 
          onClick={() => setCurrentView('pos')}
          className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center ${
            currentView === 'pos' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
          }`}
        >
          <SquaresFour weight="bold" className="text-xl" />
        </button>
        <button 
          onClick={() => setCurrentView('tables')}
          className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center ${
            currentView === 'tables' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
          }`}
        >
          <Receipt weight="bold" className="text-xl" />
        </button>
        <button 
          onClick={() => setCurrentView('takeaway')}
          className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center ${
            currentView === 'takeaway' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
          }`}
        >
          <Bag weight="bold" className="text-xl" />
        </button>
        <button 
          onClick={() => setCurrentView('reservations')}
          className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center ${
            currentView === 'reservations' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
          }`}
        >
          <Calendar weight="bold" className="text-xl" />
        </button>
        <button 
          onClick={() => setCurrentView('settings')}
          className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center ${
            currentView === 'settings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
          }`}
        >
          <Gear weight="bold" className="text-xl" />
        </button>
      </div>

      <div className="mt-auto px-2 w-full">
         <button 
           onClick={handleLogout}
           className="w-full p-3 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200 flex items-center justify-center"
           title="Logout"
         >
              <SignOut weight="bold" className="text-xl" />
         </button>
      </div>
    </aside>
  );
};
