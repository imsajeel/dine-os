import React from 'react';
import { SquaresFour, Receipt, Bag, Clock, Gear, SignOut } from "@phosphor-icons/react";

type SidebarProps = {
  currentView: 'pos' | 'tables' | 'takeaway';
  setCurrentView: (view: 'pos' | 'tables' | 'takeaway') => void;
  handleLogout: () => void;
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, handleLogout }) => {
  return (
    <aside className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-6 z-20 flex-shrink-0">
      {/* Logo */}
      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 mb-4 cursor-default">
         <svg width="24" height="24" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
          <path d="M 154 51 Q 191 2 256 0 Q 321 2 358 51 Q 383 33 416 32 Q 427 32 438 35 Q 471 43 491 69 Q 512 94 512 128 Q 512 139 510 150 Q 502 188 488 227 Q 473 266 461 292 Q 449 319 448 320 L 374 320 L 374 320 L 400 163 L 400 163 Q 401 148 387 144 Q 372 143 368 157 L 341 320 L 341 320 L 272 320 L 272 320 L 272 160 L 272 160 Q 271 145 256 144 Q 241 145 240 160 L 240 320 L 240 320 L 171 320 L 171 320 L 144 157 L 144 157 Q 140 143 125 144 Q 111 148 112 163 L 138 320 L 138 320 L 64 320 L 64 320 Q 63 319 51 292 Q 39 266 24 227 Q 10 188 3 150 Q 0 139 0 128 Q 0 94 21 69 Q 41 43 74 35 Q 85 32 96 32 Q 129 33 154 51 L 154 51 Z M 448 448 Q 447 475 429 493 L 429 493 L 429 493 Q 411 511 384 512 L 128 512 L 128 512 Q 101 511 83 493 Q 65 475 64 448 L 64 352 L 64 352 L 448 352 L 448 352 L 448 448 L 448 448 Z" fill="currentColor"/>
        </svg>
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
        <button className="p-3 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-200 flex items-center justify-center">
          <Clock weight="bold" className="text-xl" />
        </button>
        <button className="p-3 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-200 flex items-center justify-center">
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
