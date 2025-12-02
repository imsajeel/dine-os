import React from 'react';
import { MagnifyingGlass, User } from "@phosphor-icons/react";
import { Table, OrderType } from '../../types/pos';

type HeaderProps = {
  currentView: 'pos' | 'tables' | 'takeaway';
  currentDate: string;
  currentTime: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  orderType: OrderType;
  selectedTable: Table | null;
  setIsTableModalOpen: (isOpen: boolean) => void;
  userEmail: string;
};

export const Header: React.FC<HeaderProps> = ({
  currentView,
  currentDate,
  currentTime,
  searchQuery,
  setSearchQuery,
  orderType,
  selectedTable,
  setIsTableModalOpen,
  userEmail
}) => {
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {currentView === 'pos' ? 'New Order' : currentView === 'tables' ? 'Tables Overview' : 'Takeaway Orders'}
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>{currentDate}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="font-medium text-slate-500">{currentTime}</span>
            </div>
        </div>
        
        {currentView === 'pos' && (
          <div className="flex items-center gap-4 bg-slate-100 rounded-xl p-1 pr-4 w-96 transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:bg-white">
              <MagnifyingGlass weight="bold" className="text-slate-400 ml-3 text-lg" />
              <input 
                  type="text"
                  placeholder="Search menu items..."
                  className="bg-transparent border-none outline-none w-full text-sm placeholder-slate-400 py-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
        )}

        <div className="flex items-center gap-3">
             {orderType === 'dine-in' && selectedTable && currentView === 'pos' && (
               <div className="hidden md:block px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-semibold border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => setIsTableModalOpen(true)}>
                 Table {selectedTable.table_number}
               </div>
             )}
             <div className="text-right hidden md:block">
                 <p className="text-sm font-semibold">{userEmail}</p>
                 <p className="text-xs text-slate-400">Cashier #4</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                 <User weight="bold" className="text-xl" />
             </div>
        </div>
    </header>
  );
};
