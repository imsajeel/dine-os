"use client";

import React, { useState, useEffect } from 'react';
import {
  ForkKnife,
  BeerBottle,
  Coffee,
  IceCream,
  SquaresFour,
  Bag, // Added Bag icon for takeaway
  X,
  Check,
  CreditCard,
  Money
} from '@phosphor-icons/react';
import { Receipt as ReceiptComponent } from './Receipt'; // New import for ReceiptComponent
import { createRoot } from 'react-dom/client'; // New import for createRoot
import { Sidebar } from './pos/Sidebar';
import { Header } from './pos/Header';
import { CategoryList } from './pos/CategoryList';
import { MenuGrid } from './pos/MenuGrid';
import { Cart } from './pos/Cart';
import { MenuItem, Table, Modifier, ModifierGroup, CartItem, OrderType, Category } from '../types/pos';

// --- Types ---
// Types are imported from ../types/pos

export default function POS() {
  // --- State ---
  const [currentView, setCurrentView] = useState<'pos' | 'tables' | 'takeaway'>('pos'); // Updated type
  const [currentTime, setCurrentTime] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('Staff');
  const [takeawayOrders, setTakeawayOrders] = useState<any[]>([]); // New state for takeaway orders
  
  // Data State
  const [categories, setCategories] = useState<Category[]>([
    { id: 'all', name: 'All Menu', icon: SquaresFour }
  ]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'success'>('select');
  
  // Modifier State
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
  const [selectedItemForModifiers, setSelectedItemForModifiers] = useState<MenuItem | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<Modifier[]>([]);
  const [modifierNote, setModifierNote] = useState<string>('');

  // --- Effects ---
  useEffect(() => {
    // Clock
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
      setCurrentDate(now.toLocaleDateString('en-GB', options));
      setCurrentTime(now.toLocaleTimeString('en-GB', timeOptions));
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000 * 60); // Update every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const orgId = localStorage.getItem('dineos_org_id');
      if (!orgId) return;

      try {
        // Fetch Menu
        const menuRes = await fetch(`http://localhost:3001/menu/${orgId}`);
        const menuData = await menuRes.json();
        console.log('Menu Data:', menuData); // Debug log

        // Fetch Tables
        const tablesRes = await fetch(`http://localhost:3001/tables/${orgId}`);
        const tablesData = await tablesRes.json();
        if (Array.isArray(tablesData)) {
            setTables(tablesData);
        } else {
            console.error('Tables data is not an array:', tablesData);
            setTables([]);
        }

        // Map Icons
        const iconMap: Record<string, any> = {
          'Burgers': ForkKnife,
          'Drinks': BeerBottle,
          'Coffee': Coffee,
          'Desserts': IceCream,
        };

        const mappedCategories = [
          { id: 'all', name: 'All Menu', icon: SquaresFour },
          ...menuData.categories.map((c: any) => ({
            id: c.id,
            name: c.name,
            icon: iconMap[c.name] || ForkKnife,
          }))
        ];

        // Map Colors based on category
        const colorMap: Record<string, string> = {
          'burgers': 'bg-orange-100 text-orange-600',
          'drinks': 'bg-slate-100 text-slate-600',
          'coffee': 'bg-stone-100 text-stone-600',
          'desserts': 'bg-pink-100 text-pink-600',
        };

        const mappedItems = menuData.items.map((i: any) => ({
          id: i.id,
          name: i.name,
          category: i.category,
          price: i.price,
          image: i.image,
          color: colorMap[i.category] || 'bg-gray-100 text-gray-600',
          modifier_groups: i.modifier_groups || [],
        }));
        
        console.log('Mapped Items:', mappedItems); // Debug log

        setCategories(mappedCategories);
        setMenuItems(mappedItems);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Decode token for user email
    const token = localStorage.getItem('dineos_auth_token');
    if (token && token.includes('.')) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            if (payload.email) setUserEmail(payload.email);
        }
      } catch (e) {
        console.error('Failed to decode token', e);
      }
    }
  }, []);

  // Open table modal if dine-in is selected but no table
  useEffect(() => {
      if (orderType === 'dine-in' && !selectedTable && !isLoading) {
          setIsTableModalOpen(true);
      }
  }, [orderType, selectedTable, isLoading]);

  // --- Computed ---
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const subtotal = cart.reduce((sum, item) => {
    const modifiersPrice = item.selectedModifiers?.reduce((acc, mod) => acc + mod.price, 0) || 0;
    return sum + ((item.price + modifiersPrice) * item.quantity);
  }, 0);
  const tax = subtotal * 0.1; // 10% Tax
  const total = subtotal + tax;

  // --- Handlers ---
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('dineos_auth_token');
      localStorage.removeItem('dineos_org_id');
      window.location.reload();
    }
  };

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    
    if (table.active_order) {
      // Load existing order
      const loadedCart: CartItem[] = table.active_order.order_items.map(oi => ({
        ...oi.menu_items,
        // Map backend fields to frontend MenuItem if needed, assuming they match for now or are spread
        image: (oi.menu_items as any).image_url || oi.menu_items.image,
        quantity: oi.quantity,
        selectedModifiers: typeof oi.modifiers === 'string' ? JSON.parse(oi.modifiers) : oi.modifiers,
        isExisting: true, // Mark as existing
      }));
      setCart(loadedCart);
      setOrderType('dine-in');
    } else {
      // New order
      setCart([]);
      setOrderType('dine-in');
    }
    
    setCurrentView('pos');
  };

  const handleItemClick = (item: MenuItem) => {
    console.log('Item clicked:', item); // Debug log
    if (orderType === 'dine-in' && !selectedTable) {
      setIsTableModalOpen(true);
      return;
    }

    if (item.modifier_groups && item.modifier_groups.length > 0) {
      console.log('Opening modifier modal for:', item.name); // Debug log
      setSelectedItemForModifiers(item);
      setSelectedModifiers([]);
      setModifierNote('');
      setIsModifierModalOpen(true);
    } else {
      console.log('Adding directly to cart:', item.name); // Debug log
      addToCart(item);
    }
  };

  const addToCart = (item: MenuItem, modifiers: Modifier[] = [], notes: string = '') => {
    setCart(prev => {
      // Check for existing item with SAME modifiers AND notes
      const existing = prev.find(i => 
        i.id === item.id && 
        JSON.stringify(i.selectedModifiers?.map(m => m.id).sort()) === JSON.stringify(modifiers.map(m => m.id).sort()) &&
        i.notes === notes
      );

      if (existing) {
        return prev.map(i => i === existing ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, selectedModifiers: modifiers, notes, isExisting: false }];
    });
  };

  const toggleModifier = (modifier: Modifier, group: ModifierGroup) => {
    setSelectedModifiers(prev => {
      const exists = prev.find(m => m.id === modifier.id);
      if (exists) {
        return prev.filter(m => m.id !== modifier.id);
      } else {
        // Check max selection
        const currentInGroup = prev.filter(m => group.modifiers.some(gm => gm.id === m.id));
        if (currentInGroup.length >= group.max_selection) {
           // If max is 1, replace. Else, ignore or alert.
           if (group.max_selection === 1) {
             return [...prev.filter(m => !group.modifiers.some(gm => gm.id === m.id)), modifier];
           }
           return prev;
        }
        return [...prev, modifier];
      }
    });
  };

  const updateQuantity = (id: string, delta: number, modifiers?: Modifier[], notes?: string) => {
    setCart(prev => prev.map(item => {
      const sameModifiers = JSON.stringify(item.selectedModifiers?.map(m => m.id).sort()) === JSON.stringify(modifiers?.map(m => m.id).sort());
      const sameNotes = item.notes === notes;
      if (item.id === id && sameModifiers && sameNotes) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string, modifiers?: Modifier[], notes?: string) => {
    setCart(prev => prev.filter(item => {
      const sameModifiers = JSON.stringify(item.selectedModifiers?.map(m => m.id).sort()) === JSON.stringify(modifiers?.map(m => m.id).sort());
      const sameNotes = item.notes === notes;
      return !(item.id === id && sameModifiers && sameNotes);
    }));
  };

  const clearCart = () => {
    if (confirm('Are you sure you want to clear the cart?')) {
      setCart([]);
    }
  };

  const printReceipt = (order: any) => {
    const printWindow = window.open('', '', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Receipt</title></head><body><div id="root"></div></body></html>');
      printWindow.document.close();
      const root = createRoot(printWindow.document.getElementById('root')!);
      root.render(<ReceiptComponent order={order} />);
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const fetchTakeawayOrders = async () => {
    const orgId = localStorage.getItem('dineos_org_id');
    if (!orgId) return;
    try {
      const res = await fetch(`http://localhost:3001/orders?organization_id=${orgId}&status=active&type=takeaway`);
      const data = await res.json();
      setTakeawayOrders(data);
    } catch (e) {
      console.error('Failed to fetch takeaway orders', e);
    }
  };

  useEffect(() => {
    if (currentView === 'takeaway') {
      fetchTakeawayOrders();
      const interval = setInterval(fetchTakeawayOrders, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [currentView]);

  const handleSendOrder = async () => {
    const newItems = cart.filter(item => !item.isExisting);
    if (newItems.length === 0) {
        alert("No new items to send.");
        return;
    }
    
    const orderData = {
      organization_id: localStorage.getItem('dineos_org_id'),
      items: newItems.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        modifiers: item.selectedModifiers,
        notes: item.notes
      })),
      type: orderType,
      table_id: selectedTable?.id
    };

    try {
      const response = await fetch('http://localhost:3001/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const newOrder = await response.json();
        alert('Order sent successfully!');
        printReceipt(newOrder); // Print Receipt
        setCart([]);
        if (orderType === 'dine-in') setSelectedTable(null);
      } else {
        alert('Failed to send order');
      }
    } catch (error) {
      console.error('Error sending order:', error);
      alert('Error sending order');
    }
  };

  const handlePayment = () => {
    setPaymentStep('processing');
    setTimeout(() => {
      setPaymentStep('success');
      setTimeout(() => {
        setIsPaymentModalOpen(false);
        setCart([]);
        setPaymentStep('select');
        // Reset table if dine-in
        if (orderType === 'dine-in') setSelectedTable(null);
      }, 2000);
    }, 2000);
  };

  const confirmModifiers = () => {
    if (selectedItemForModifiers) {
      // Validate min selection
      for (const group of selectedItemForModifiers.modifier_groups || []) {
         const count = selectedModifiers.filter(m => group.modifiers.some(gm => gm.id === m.id)).length;
         if (count < group.min_selection) {
           alert(`Please select at least ${group.min_selection} option(s) for ${group.name}`);
           return;
         }
      }
       addToCart(selectedItemForModifiers, selectedModifiers, modifierNote);
      setIsModifierModalOpen(false);
      setSelectedItemForModifiers(null);
      setSelectedModifiers([]);
      setModifierNote('');
    }
  };

  return (
    <div className="bg-slate-50 text-slate-800 overflow-hidden h-screen flex">
      
      {/* 1. Left Sidebar (Navigation) */}
      {/* 1. Left Sidebar (Navigation) */}
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        handleLogout={handleLogout} 
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        {/* Header */}
        <Header 
          currentView={currentView}
          currentDate={currentDate}
          currentTime={currentTime}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          orderType={orderType}
          selectedTable={selectedTable}
          setIsTableModalOpen={setIsTableModalOpen}
          userEmail={userEmail}
        />
        
        {/* ... Modals ... */}
        
        {/* Content Body */}
        <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 overflow-y-auto p-8">
                {currentView === 'pos' ? (
                  // ... POS View ...
                  <>
                    {/* Categories */}
                  <>
                    {/* Categories */}
                    <CategoryList 
                      categories={categories} 
                      activeCategory={activeCategory} 
                      setActiveCategory={setActiveCategory} 
                    />
    
                    {/* Menu Grid */}
                    <MenuGrid 
                      isLoading={isLoading} 
                      filteredItems={filteredItems} 
                      handleItemClick={handleItemClick} 
                    />
                  </>
                  </>
                ) : currentView === 'tables' ? (
                  /* Tables View */
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {tables.map((table) => (
                      <button
                        key={table.id}
                        onClick={() => handleTableClick(table)}
                        className={`
                          relative p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all hover:shadow-lg cursor-pointer
                          ${table.current_status === 'free' 
                            ? 'bg-white border-slate-200 hover:border-blue-500' 
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'}
                        `}
                      >
                        <div className={`
                          w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold
                          ${table.current_status === 'free' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}
                        `}>
                          {table.table_number}
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-slate-700 text-lg">Table {table.table_number}</p>
                          <p className="text-slate-500 text-sm">{table.capacity} Seats</p>
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-3 ${
                            table.current_status === 'free' ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${table.current_status === 'free' ? 'bg-green-500' : 'bg-slate-500'}`} />
                            {table.current_status}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Takeaway View */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {takeawayOrders.length === 0 ? (
                      <div className="col-span-full flex flex-col items-center justify-center h-96 text-slate-400">
                        <Bag weight="duotone" className="text-6xl mb-4" />
                        <p className="text-xl font-medium">No active takeaway orders</p>
                      </div>
                    ) : (
                      takeawayOrders.map(order => (
                        <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-slate-800">Order #{order.id.toString().slice(-4)}</h3>
                              <p className="text-sm text-slate-500">{new Date(order.created_at).toLocaleTimeString()}</p>
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold uppercase">
                              {order.status}
                            </span>
                          </div>
                          <div className="space-y-2 mb-6">
                            {order.order_items.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-slate-600">{item.quantity}x {item.menu_items?.name}</span>
                                <span className="font-medium">£{Number(item.price_at_time).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                            <span className="font-bold text-slate-800">Total</span>
                            <span className="text-xl font-bold text-blue-600">£{Number(order.total_amount).toFixed(2)}</span>
                          </div>
                          <div className="mt-6 grid grid-cols-2 gap-3">
                            <button 
                              onClick={() => printReceipt(order)}
                              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                            >
                              Print
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                              Complete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
            </div>
        </div>
      </main>

      {/* 3. Right Sidebar (Cart) */}
      {/* 3. Right Sidebar (Cart) */}
      <Cart 
        cart={cart}
        orderType={orderType}
        setOrderType={setOrderType}
        clearCart={clearCart}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
        subtotal={subtotal}
        tax={tax}
        total={total}
        handleSendOrder={handleSendOrder}
        setIsPaymentModalOpen={setIsPaymentModalOpen}
      />

      {/* Table Selection Modal */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-zoom-in max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Select a Table</h3>
                        <p className="text-slate-500 text-sm">Choose a table for this order</p>
                    </div>
                    <button onClick={() => setIsTableModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X weight="bold" className="text-xl" />
                    </button>
                </div>
                
                <div className="p-8 overflow-y-auto bg-slate-50">
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
                    {tables.map((table) => (
                      <button
                        key={table.id}
                        onClick={() => {
                          handleTableClick(table);
                          setIsTableModalOpen(false);
                        }}
                        className={`
                          relative p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all hover:shadow-lg cursor-pointer
                          ${table.current_status === 'free' 
                            ? 'bg-white border-slate-200 hover:border-blue-500' 
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300 opacity-75'}
                        `}
                      >
                        <div className={`
                          w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold
                          ${table.current_status === 'free' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}
                        `}>
                          {table.table_number}
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-slate-700">Table {table.table_number}</p>
                          <p className="text-slate-500 text-xs">{table.capacity} Seats</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
            </div>
        </div>
      )}

      {/* Modifier Modal */}
      {isModifierModalOpen && selectedItemForModifiers && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-zoom-in max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Customize {selectedItemForModifiers.name}</h3>
                        <p className="text-slate-500 text-sm">Select your preferences</p>
                    </div>
                    <button onClick={() => setIsModifierModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X weight="bold" className="text-xl" />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    {selectedItemForModifiers.modifier_groups?.map(group => (
                        <div key={group.id} className="mb-8 last:mb-0">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-slate-700 text-lg">{group.name}</h4>
                                <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-500 rounded-lg">
                                    {group.min_selection === 1 && group.max_selection === 1 ? 'Required • Select 1' : 
                                     `Select ${group.min_selection} - ${group.max_selection}`}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {group.modifiers.map(mod => {
                                    const isSelected = selectedModifiers.some(m => m.id === mod.id);
                                    return (
                                        <button
                                            key={mod.id}
                                            onClick={() => toggleModifier(mod, group)}
                                            className={`
                                                flex items-center justify-between p-4 rounded-xl border-2 transition-all
                                                ${isSelected 
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                                    : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50 text-slate-600'}
                                            `}
                                        >
                                            <span className="font-medium">{mod.name}</span>
                                            <div className="flex items-center gap-2">
                                                {mod.price > 0 && <span className="text-sm opacity-70">+£{mod.price.toFixed(2)}</span>}
                                                <div className={`
                                                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                                                    ${isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300'}
                                                `}>
                                                    {isSelected && <Check weight="bold" className="text-xs" />}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 shrink-0">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Special Instructions / Exclusions</label>
                    <textarea 
                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none text-sm"
                        rows={3}
                        placeholder="e.g. No onions, extra spicy..."
                        value={modifierNote}
                        onChange={(e) => setModifierNote(e.target.value)}
                    ></textarea>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 shrink-0 flex justify-end gap-3">
                    <button 
                        onClick={() => setIsModifierModalOpen(false)}
                        className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmModifiers}
                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                    >
                        Add to Order
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* 4. Payment Modal Overlay */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-zoom-in">
                
                {/* Step 1: Payment Selection */}
                {paymentStep === 'select' && (
                    <div>
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-800">Payment Method</h3>
                            <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X weight="bold" className="text-xl" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                             <div className="text-center mb-8">
                                <p className="text-slate-500 mb-1">Total Amount</p>
                                <p className="text-4xl font-bold text-blue-600">${total.toFixed(2)}</p>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => handlePayment()} className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group">
                                    <CreditCard weight="duotone" className="text-3xl text-slate-400 group-hover:text-blue-500" />
                                    <span className="font-semibold text-slate-600 group-hover:text-blue-600">Card</span>
                                </button>
                                <button onClick={() => handlePayment()} className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-slate-100 hover:border-green-500 hover:bg-green-50 transition-all group">
                                    <Money weight="duotone" className="text-3xl text-slate-400 group-hover:text-green-500" />
                                    <span className="font-semibold text-slate-600 group-hover:text-green-600">Cash</span>
                                </button>
                             </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Processing */}
                {paymentStep === 'processing' && (
                    <div className="p-12 flex flex-col items-center justify-center min-h-[300px]">
                        <div className="flex items-center gap-2 text-blue-600 font-medium text-lg">
                            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <p className="mt-4 text-slate-500">Processing Payment...</p>
                    </div>
                )}

                {/* Step 3: Success */}
                {paymentStep === 'success' && (
                    <div className="p-12 flex flex-col items-center text-center animate-zoom-in">
                        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                            <Check weight="bold" className="text-4xl" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Order Confirmed!</h3>
                        <p className="text-slate-500">Receipt sent to printer.</p>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
}
