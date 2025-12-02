import React, { useState, useEffect } from 'react';
import { Bell, User, ArrowLeft, PaperPlaneRight, Minus, Plus } from "@phosphor-icons/react";
import { MenuItem, Table, Category } from '../types/pos';

export default function WaiterPOS() {
  const [tables, setTables] = useState<Table[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  
  const [currentView, setCurrentView] = useState<'tables' | 'menu'>('tables');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [cart, setCart] = useState<Record<string, any[]>>({}); // tableId -> items
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const orgId = localStorage.getItem('dineos_org_id');
      if (!orgId) return;

      try {
        const [menuRes, tablesRes] = await Promise.all([
          fetch(`http://localhost:3001/menu/${orgId}`),
          fetch(`http://localhost:3001/tables/${orgId}`)
        ]);

        const menuData = await menuRes.json();
        const tablesData = await tablesRes.json();

        setTables(tablesData);
        
        const mappedCategories = menuData.categories.map((c: any) => ({
            id: c.id,
            name: c.name,
        }));
        setCategories(mappedCategories);
        if (mappedCategories.length > 0) setActiveCategory(mappedCategories[0].id);

        const mappedItems = menuData.items.map((i: any) => ({
            id: i.id,
            name: i.name,
            category: i.category,
            price: Number(i.price),
            image: i.image,
        }));
        setMenuItems(mappedItems);

      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    setCurrentView('menu');
  };

  const updateItem = (item: MenuItem, delta: number) => {
    if (!selectedTable) return;
    
    setCart(prev => {
        const tableCart = prev[selectedTable.id] || [];
        const existingIndex = tableCart.findIndex(i => i.id === item.id);
        
        const newTableCart = [...tableCart];

        if (existingIndex > -1) {
            const newQty = newTableCart[existingIndex].quantity + delta;
            if (newQty <= 0) {
                newTableCart.splice(existingIndex, 1);
            } else {
                newTableCart[existingIndex] = { ...newTableCart[existingIndex], quantity: newQty };
            }
        } else if (delta > 0) {
            newTableCart.push({ ...item, quantity: 1 });
        }

        return { ...prev, [selectedTable.id]: newTableCart };
    });
  };

  const currentCart = selectedTable ? (cart[selectedTable.id] || []) : [];
  const cartTotal = currentCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = currentCart.reduce((acc, item) => acc + item.quantity, 0);

  const submitOrder = async () => {
      if (!selectedTable || currentCart.length === 0) return;

      const orderData = {
        organization_id: localStorage.getItem('dineos_org_id'),
        items: currentCart.map(item => ({
            menu_item_id: item.id,
            quantity: item.quantity,
            modifiers: [] // Simplified for waiter view for now
        })),
        type: 'dine-in',
        table_id: selectedTable.id
      };

      try {
          const res = await fetch('http://localhost:3001/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(orderData)
          });
          
          if (res.ok) {
              alert('Order Sent!');
              setCart(prev => ({ ...prev, [selectedTable.id]: [] }));
              setIsCartOpen(false);
              setCurrentView('tables');
              setSelectedTable(null);
          }
      } catch (e) {
          console.error(e);
          alert('Failed to send order');
      }
  };

  return (
    <div className="bg-slate-100 text-slate-800 h-screen overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <header className="bg-white shadow-sm z-20 px-4 py-3 flex justify-between items-center shrink-0 h-16">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
                <h1 className="font-bold text-lg">{currentView === 'tables' ? 'Floor Plan' : 'Ordering'}</h1>
            </div>
            <div className="flex items-center gap-3">
                <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full">
                    <Bell weight="bold" className="text-xl" />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                    <User weight="fill" className="text-xl text-slate-500" />
                </div>
            </div>
        </header>

        <main className="flex-1 relative overflow-hidden">
            {/* Tables View */}
            <div className={`absolute inset-0 overflow-y-auto p-4 pb-20 transition-transform duration-300 ${currentView === 'tables' ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {tables.map(table => (
                        <button 
                            key={table.id}
                            onClick={() => handleTableClick(table)}
                            className={`flex flex-col p-4 rounded-2xl border-2 shadow-sm active:scale-95 transition-all relative overflow-hidden h-32 justify-between ${
                                table.current_status === 'occupied' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-800'
                            }`}
                        >
                            <div className="flex justify-between items-start w-full">
                                <span className="font-bold text-lg">{table.table_number}</span>
                            </div>
                            <div className="flex justify-between items-end w-full">
                                <span className="text-xs font-semibold uppercase tracking-wider opacity-75">{table.current_status}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu View */}
            <div className={`absolute inset-0 bg-slate-100 transition-transform duration-300 flex flex-col ${currentView === 'menu' ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center gap-3 shrink-0">
                    <button onClick={() => setCurrentView('tables')} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full">
                        <ArrowLeft weight="bold" className="text-xl" />
                    </button>
                    <div>
                        <h2 className="font-bold text-lg leading-tight">Table {selectedTable?.table_number}</h2>
                        <p className="text-xs text-slate-400">Taking Order</p>
                    </div>
                </div>

                <div className="bg-white border-b border-slate-200 py-3 shrink-0">
                    <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide">
                        {categories.map(cat => (
                            <button 
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${activeCategory === cat.id ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-4">
                    {menuItems.filter(i => i.category === activeCategory).map(item => {
                        const qty = currentCart.find(i => i.id === item.id)?.quantity || 0;
                        return (
                            <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800">{item.name}</h3>
                                    <p className="font-semibold text-blue-600">£{item.price.toFixed(2)}</p>
                                </div>
                                {qty > 0 ? (
                                    <div className="flex items-center gap-3 bg-slate-100 rounded-xl p-1">
                                        <button onClick={() => updateItem(item, -1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 active:scale-90 transition-transform"><Minus weight="bold" /></button>
                                        <span className="font-bold w-4 text-center text-sm">{qty}</span>
                                        <button onClick={() => updateItem(item, 1)} className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-lg shadow-sm text-white active:scale-90 transition-transform"><Plus weight="bold" /></button>
                                    </div>
                                ) : (
                                    <button onClick={() => updateItem(item, 1)} className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-800 rounded-xl hover:bg-slate-200 active:scale-90 transition-transform">
                                        <Plus weight="bold" className="text-lg" />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Floating Bottom Bar */}
                {cartCount > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-100 via-slate-100 to-transparent pb-8">
                        <button onClick={() => setIsCartOpen(true)} className="w-full bg-slate-800 text-white rounded-2xl shadow-lg shadow-slate-300 p-4 flex items-center justify-between transform transition-transform active:scale-95">
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">{cartCount}</div>
                                <span className="font-medium">View Order</span>
                            </div>
                            <span className="font-bold text-lg">£{cartTotal.toFixed(2)}</span>
                        </button>
                    </div>
                )}
            </div>
        </main>

        {/* Cart Modal */}
        {isCartOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col justify-end animate-fade-in">
                <div className="flex-1" onClick={() => setIsCartOpen(false)}></div>
                <div className="bg-white rounded-t-3xl shadow-2xl h-[80vh] flex flex-col animate-slide-up">
                    <div className="w-full flex justify-center pt-3 pb-1" onClick={() => setIsCartOpen(false)}>
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold">Current Order</h2>
                        <button onClick={() => setCart(prev => ({ ...prev, [selectedTable!.id]: [] }))} className="text-red-500 text-sm font-medium">Clear All</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {currentCart.map(item => (
                            <div key={item.id} className="flex items-center justify-between border-b border-slate-50 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center font-bold text-sm text-slate-600">x{item.quantity}</div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-800">{item.name}</h4>
                                        <p className="text-xs text-slate-400">£{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => updateItem(item, -1)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"><Minus weight="bold" /></button>
                                    <button onClick={() => updateItem(item, 1)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Plus weight="bold" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-6 border-t border-slate-100 bg-slate-50 pb-8">
                        <div className="flex justify-between mb-4 text-slate-600">
                            <span>Total</span>
                            <span className="font-bold text-slate-800 text-xl">£{cartTotal.toFixed(2)}</span>
                        </div>
                        <button onClick={submitOrder} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 active:scale-95 transition-transform flex justify-center items-center gap-2">
                            <span>Send to Kitchen</span>
                            <PaperPlaneRight weight="bold" />
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
