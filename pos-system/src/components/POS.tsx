"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
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
  Money,
  Calendar,
  Users,
  PencilSimple,
  ArrowsIn,
  ArrowsOut
} from '@phosphor-icons/react';
import { Receipt as ReceiptComponent } from './Receipt'; // New import for ReceiptComponent
import { createRoot } from 'react-dom/client'; // New import for createRoot
import { Sidebar } from './pos/Sidebar';
import { Header } from './pos/Header';
import { CategoryList } from './pos/CategoryList';
import { MenuGrid } from './pos/MenuGrid';
import { Cart } from './pos/Cart';
import { CashPaymentModal } from './pos/CashPaymentModal';
import Reservations from './Reservations';
import Settings from './Settings';
import { MenuItem, Table, Modifier, ModifierGroup, CartItem, OrderType, Category } from '../types/pos';

// --- Types ---
// Types are imported from ../types/pos

export default function POS() {
  // --- State ---
  const [currentView, setCurrentView] = useState<'pos' | 'tables' | 'takeaway' | 'reservations' | 'settings'>('tables'); // Changed default to 'tables'
  const [currentTime, setCurrentTime] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('Staff');
  const [takeawayOrders, setTakeawayOrders] = useState<any[]>([]); // New state for takeaway orders
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [isOrderSuccessModalOpen, setIsOrderSuccessModalOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  
  // Manage Tables State
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedTablesForJoin, setSelectedTablesForJoin] = useState<string[]>([]);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [tableToSplit, setTableToSplit] = useState<Table | null>(null);
  const [splitCount, setSplitCount] = useState(2);
  
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
  const [isCashPaymentModalOpen, setIsCashPaymentModalOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
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

  const fetchData = useCallback(async () => {
      const orgId = localStorage.getItem('dineos_org_id');
      if (!orgId) return;

      try {
        const settings = JSON.parse(localStorage.getItem('dineos_settings') || '{}');
        const branchId = settings.branchId;
        const queryParams = branchId ? `?branchId=${branchId}` : '';
        const queryParamsWithOrg = branchId ? `&branchId=${branchId}` : '';

        // Fetch Menu
        const menuRes = await fetch(`http://localhost:3001/menu/${orgId}${queryParams}`);
        const menuData = await menuRes.json();

        // Fetch Tables
        const tablesRes = await fetch(`http://localhost:3001/tables/${orgId}${queryParams}`);
        const tablesData = await tablesRes.json();
        if (Array.isArray(tablesData)) {
            setTables(tablesData);
        } else {
            console.error('Tables data is not an array:', tablesData);
            setTables([]);
        }

        // Fetch Reservations
        const resRes = await fetch(`http://localhost:3001/reservations?organization_id=${orgId}${queryParamsWithOrg}`);
        const resData = await resRes.json();
        setReservations(resData);

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
        
        
        setCategories(mappedCategories);
        setMenuItems(mappedItems);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
  }, []);

  useEffect(() => {
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
  }, [fetchData]);

  // Poll for updates every 10 seconds
  // WebSocket connection
  useEffect(() => {
    const socket = io('http://localhost:3001');

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    socket.on('order_created', (data) => {
      console.log('Order created event:', data);
      fetchTakeawayOrders();
      // Optionally refetch tables if dine-in
      if (data.table_id) fetchData();
    });

    socket.on('order_updated', (data) => {
      console.log('Order updated event:', data);
      fetchTakeawayOrders();
      // Optionally refetch tables if dine-in
      if (data.table_id) fetchData();
    });

    socket.on('menu_updated', () => {
      console.log('Menu updated event');
      fetchData();
    });

    socket.on('tables_updated', () => {
        console.log('Tables updated event');
        fetchData();
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchData]);


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
    // Check if item has a weight modifier
    const weightMod = item.selectedModifiers?.find(m => m.weight);
    
    let itemBasePrice = item.price;
    if (weightMod && weightMod.weight) {
        // If weight exists, item price is calculated based on weight and ITEM price (rate per kg)
        itemBasePrice = (weightMod.weight / 1000) * item.price;
    }

    // Add other modifiers (excluding the weight modifier itself, as its "price" is irrelevant now)
    const otherModifiersPrice = item.selectedModifiers?.reduce((acc, mod) => {
        if (mod.weight) return acc; // Skip weight modifier
        return acc + mod.price;
    }, 0) || 0;

    return sum + ((itemBasePrice + otherModifiersPrice) * item.quantity);
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
    if (isManageMode) {
        if (table.current_status !== 'free') {
            alert('Only free tables can be managed');
            return;
        }
        if (selectedTablesForJoin.includes(table.id)) {
            setSelectedTablesForJoin(prev => prev.filter(id => id !== table.id));
        } else {
            setSelectedTablesForJoin(prev => [...prev, table.id]);
        }
        return;
    }

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
    if (item.modifier_groups && item.modifier_groups.length > 0) {
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
      const settings = JSON.parse(localStorage.getItem('dineos_settings') || '{}');
      const branchId = settings.branchId;
      const res = await fetch(`http://localhost:3001/orders?organization_id=${orgId}&status=active&type=takeaway${branchId ? `&branch_id=${branchId}` : ''}`);
      const data = await res.json();
      setTakeawayOrders(data);
    } catch (e) {
      console.error('Failed to fetch takeaway orders', e);
    }
  };

  useEffect(() => {
    if (currentView === 'takeaway') {
      fetchTakeawayOrders();
      // Polling removed in favor of WebSockets
    }
  }, [currentView]);

  const handleSendOrder = async () => {
    const newItems = cart.filter(item => !item.isExisting);
    if (newItems.length === 0) {
        alert("No new items to send.");
        return;
    }
    
    const settings = JSON.parse(localStorage.getItem('dineos_settings') || '{}');
    
    const orderData = {
      organization_id: localStorage.getItem('dineos_org_id'),
      branch_id: settings.branchId,
      items: newItems.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        modifiers: item.selectedModifiers,
        notes: item.notes
      })),
      type: orderType,
      table_id: orderType === 'takeaway' ? null : selectedTable?.id,
      order_id: selectedTable?.active_order?.id || activeOrderId
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
        setLastOrder(newOrder);
        setIsOrderSuccessModalOpen(true);
        
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

  const handlePayment = async () => {
    const orderId = selectedTable?.active_order?.id || activeOrderId;
    if (!orderId) return;
    
    setPaymentStep('processing');
    
    try {
      // 1. Update order status to completed
      await fetch(`http://localhost:3001/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'completed',
          payment_status: 'paid',
          payment_method: 'cash',
          total_amount: (selectedTable?.active_order as any)?.total_amount || cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.1 // Fallback calculation
        }),
      });

      // 2. If dine-in, free the table
      if (selectedTable) {
        await fetch(`http://localhost:3001/floor_tables/${selectedTable.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ current_status: 'free' }),
        });
      }

      setPaymentStep('success');
      
      // 3. Print Receipt (optional, maybe auto-print)
      // printReceipt(selectedTable.active_order);

      setTimeout(() => {
        setIsPaymentModalOpen(false);
        setIsCashPaymentModalOpen(false);
        setPaymentStep('select');
        setSelectedTable(null);
        setActiveOrderId(null);
        setCart([]);
        fetchData(); // Refresh tables and orders
        
        // If dine-in, go back to tables view
        if (orderType === 'dine-in') {
            setCurrentView('tables');
        } else {
            // If takeaway, go back to takeaway view
            fetchTakeawayOrders();
            setCurrentView('takeaway');
        }
      }, 2000);

    } catch (error) {
      console.error('Payment failed', error);
      setPaymentStep('select');
      alert('Payment failed. Please try again.');
    }
  };

  const handleTakeawayOrderClick = (order: any) => {
    setSelectedTable(null);
    setOrderType('takeaway');
    setActiveOrderId(order.id);
    
    // Load cart
    const loadedCart: CartItem[] = order.order_items.map((oi: any) => ({
      ...oi.menu_items,
      id: oi.menu_items.id,
      quantity: oi.quantity,
      selectedModifiers: oi.modifiers ? (typeof oi.modifiers === 'string' ? JSON.parse(oi.modifiers) : oi.modifiers) : [],
      notes: oi.notes,
      isExisting: true,
      image: oi.menu_items.image,
      price: Number(oi.price_at_time)
    }));
    
    setCart(loadedCart);
    setCurrentView('pos');
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



  const handleJoinTables = async () => {
    if (selectedTablesForJoin.length < 2) return;
    try {
        const res = await fetch('http://localhost:3001/tables/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tableIds: selectedTablesForJoin })
        });
        if (res.ok) {
            setIsManageMode(false);
            setSelectedTablesForJoin([]);
            fetchData();
        } else {
            const text = await res.text();
            alert('Failed to join tables: ' + text);
        }
    } catch (e) {
        console.error(e);
        alert('Failed to join tables');
    }
  };

  const handleSplitTable = async () => {
    if (!tableToSplit) return;
    try {
        const res = await fetch(`http://localhost:3001/tables/split/${tableToSplit.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ splits: splitCount })
        });
        if (res.ok) {
            setIsSplitModalOpen(false);
            setTableToSplit(null);
            setIsManageMode(false);
            fetchData();
        } else {
            const text = await res.text();
            alert('Failed to split table: ' + text);
        }
    } catch (e) {
        console.error(e);
        alert('Failed to split table');
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
                ) : currentView === 'tables' ? (
                  <>
                    {/* Tables View */}
                    <div className="flex gap-6 h-full">
                        <div className="flex-1 overflow-y-auto">
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                              {tables.map((table) => (
                                <button
                                  key={table.id}
                                  onClick={() => handleTableClick(table)}
                                  className={`
                                    relative p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all hover:shadow-lg cursor-pointer
                                    ${isManageMode && selectedTablesForJoin.includes(table.id) ? 'ring-4 ring-blue-500 ring-offset-2' : ''}
                                    ${table.current_status === 'free' 
                                      ? 'bg-green-50 border-green-200 hover:border-green-400' 
                                      : 'bg-orange-50 border-orange-200 hover:border-orange-400'}
                                  `}
                                >
                                  <div className={`
                                    w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold
                                    ${table.current_status === 'free' ? 'bg-green-100 text-green-600' : 'bg-orange-200 text-orange-700'}
                                  `}>
                                    {table.table_number}
                                  </div>
                                  <div className="text-center w-full">
                                    <p className="font-semibold text-slate-700 text-lg">Table {table.table_number}</p>
                                    <p className="text-slate-500 text-sm">{table.capacity} Seats</p>
                                    
                                    {table.active_order ? (
                                      <>
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-3 ${
                                          table.active_order.status === 'new' ? 'bg-blue-100 text-blue-600' :
                                          table.active_order.status === 'prep' ? 'bg-yellow-100 text-yellow-600' :
                                          table.active_order.status === 'ready' ? 'bg-green-100 text-green-600' :
                                          'bg-slate-200 text-slate-500'
                                        }`}>
                                          <div className={`w-2 h-2 rounded-full ${
                                            table.active_order.status === 'new' ? 'bg-blue-500' :
                                            table.active_order.status === 'prep' ? 'bg-yellow-500' :
                                            table.active_order.status === 'ready' ? 'bg-green-500' :
                                            'bg-slate-500'
                                          }`} />
                                          {table.active_order.status}
                                        </div>
                                        
                                        <div className="mt-2 text-base text-slate-600 font-bold font-mono">
                                          {(() => {
                                            const elapsed = Date.now() - new Date(table.active_order.created_at).getTime();
                                            const hours = Math.floor(elapsed / 3600000);
                                            const minutes = Math.floor((elapsed % 3600000) / 60000);
                                            if (hours > 0) {
                                              return `${hours}h ${minutes}m`;
                                            }
                                            return `${minutes}m`;
                                          })()}
                                        </div>
                                      </>
                                    ) : (
                                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-3 ${
                                        table.current_status === 'free' ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'
                                      }`}>
                                        <div className={`w-2 h-2 rounded-full ${table.current_status === 'free' ? 'bg-green-500' : 'bg-slate-500'}`} />
                                        {table.current_status}
                                      </div>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                        </div>
                    
                        {/* Today's Reservations Sidebar */}
                        <div className="w-80 bg-white border-l border-slate-200 p-6 overflow-y-auto hidden xl:block">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Calendar weight="bold" className="text-blue-600" />
                                Today's Reservations
                            </h3>
                            <div className="space-y-3">
                                {reservations.filter(r => new Date(r.reservation_time).toDateString() === new Date().toDateString()).length === 0 ? (
                                    <p className="text-slate-400 text-sm text-center py-4">No reservations for today</p>
                                ) : (
                                    reservations
                                        .filter(r => new Date(r.reservation_time).toDateString() === new Date().toDateString())
                                        .sort((a, b) => new Date(a.reservation_time).getTime() - new Date(b.reservation_time).getTime())
                                        .map(res => (
                                        <div key={res.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-slate-700">{res.customer_name}</span>
                                                <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                                    {new Date(res.reservation_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                <span className="flex items-center gap-1"><Users /> {res.party_size}</span>
                                                {res.floor_tables && <span className="font-semibold">Table {res.floor_tables.table_number}</span>}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Floating New Order Button */}
                    <div>
                        <button
                          onClick={() => setIsNewOrderModalOpen(true)}
                          className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-20"
                          title="New Order"
                        >
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                    </div>

                    {/* Manage Tables Toggle */}
                    <div>
                        <button
                          onClick={() => {
                              setIsManageMode(!isManageMode);
                              setSelectedTablesForJoin([]);
                          }}
                          className={`fixed bottom-8 right-28 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-20 ${isManageMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-600'}`}
                          title="Manage Tables"
                        >
                          {isManageMode ? <Check weight="bold" className="text-2xl" /> : <PencilSimple weight="bold" className="text-2xl" />}
                        </button>
                    </div>

                    {/* Manage Toolbar */}
                    {isManageMode && (
                        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-xl border border-slate-200 flex items-center gap-4 z-30 animate-fade-in-up">
                            <span className="font-bold text-slate-700">{selectedTablesForJoin.length} Selected</span>
                            <div className="h-6 w-px bg-slate-200"></div>
                            <button 
                                onClick={handleJoinTables}
                                disabled={selectedTablesForJoin.length < 2}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                            >
                                <ArrowsIn weight="bold" /> Join
                            </button>
                            <button 
                                onClick={() => {
                                    if (selectedTablesForJoin.length === 1) {
                                        const t = tables.find(t => t.id === selectedTablesForJoin[0]);
                                        if (t) {
                                            setTableToSplit(t);
                                            setIsSplitModalOpen(true);
                                        }
                                    }
                                }}
                                disabled={selectedTablesForJoin.length !== 1}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
                            >
                                <ArrowsOut weight="bold" /> Split
                            </button>
                        </div>
                    )}

                    {/* Split Modal */}
                    {isSplitModalOpen && (
                        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
                                <h3 className="text-xl font-bold text-slate-800 mb-4">Split Table {tableToSplit?.table_number}</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Split into how many?</label>
                                        <div className="flex gap-2">
                                            {[2, 3, 4].map(n => (
                                                <button 
                                                    key={n}
                                                    onClick={() => setSplitCount(n)}
                                                    className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${splitCount === n ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button onClick={() => setIsSplitModalOpen(false)} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                                        <button onClick={handleSplitTable} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">Split</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                  </>
                ) : currentView === 'reservations' ? (
                    <Reservations 
                        onTakeOrder={(res) => {
                            if (res.floor_tables) {
                                const table = tables.find(t => t.id === res.floor_tables?.id);
                                if (table) {
                                    handleTableClick(table);
                                } else {
                                    alert('Table not found');
                                }
                            } else {
                                alert('Please select a table for this reservation');
                                setCurrentView('tables');
                            }
                        }}
                    />
                ) : currentView === 'settings' ? (
                    <Settings />
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
                        <div 
                            key={order.id} 
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
                            onClick={() => handleTakeawayOrderClick(order)}
                        >
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
      {currentView === 'pos' && (
        <Cart 
          cart={cart}
          orderType={orderType}
          setOrderType={(type) => {
            setOrderType(type);
            if (type === 'takeaway') setSelectedTable(null);
          }}
          clearCart={clearCart}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          subtotal={subtotal}
          tax={tax}
          total={total}
          handleSendOrder={handleSendOrder}
          setIsPaymentModalOpen={setIsPaymentModalOpen}
          hasExistingOrder={!!selectedTable?.active_order || !!activeOrderId}
          onPrintReceipt={() => (selectedTable?.active_order || activeOrderId) && printReceipt(selectedTable?.active_order || { id: activeOrderId, order_items: cart, total_amount: total })}
          onEdit={(item) => {
            setSelectedItemForModifiers(item);
            setSelectedModifiers(item.selectedModifiers || []);
            setModifierNote(item.notes || '');
            setIsModifierModalOpen(true);
          }}
        />
      )}

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
                                    {group.type === 'grams' ? 'Enter Weight (g)' : 
                                     group.min_selection === 1 && group.max_selection === 1 ? 'Required • Select 1' : 
                                     `Select ${group.min_selection} - ${group.max_selection}`}
                                </span>
                            </div>
                            
                            {group.type === 'grams' ? (
                                <div className="grid grid-cols-1 gap-3">
                                    {group.modifiers.map(mod => {
                                        const selectedMod = selectedModifiers.find(m => m.id === mod.id);
                                        const weight = selectedMod?.weight || '';
                                        
                                        return (
                                            <div key={mod.id} className="p-4 rounded-xl border-2 border-slate-100 bg-slate-50">
                                                <div className="flex justify-between mb-2">
                                                    <span className="font-medium text-slate-700">{mod.name}</span>
                                                    <span className="text-slate-500 text-sm">£{selectedItemForModifiers.price.toFixed(2)} / kg</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="number" 
                                                        placeholder="Weight in grams"
                                                        className="flex-1 p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                                                        value={weight}
                                                        onChange={(e) => {
                                                            const val = parseFloat(e.target.value);
                                                            if (!isNaN(val)) {
                                                                // Update or add modifier with weight
                                                                setSelectedModifiers(prev => {
                                                                    const others = prev.filter(m => m.id !== mod.id);
                                                                    return [...others, { ...mod, weight: val }];
                                                                });
                                                            } else {
                                                                // Remove if empty/invalid
                                                                setSelectedModifiers(prev => prev.filter(m => m.id !== mod.id));
                                                            }
                                                        }}
                                                    />
                                                    <span className="text-slate-500 font-medium">g</span>
                                                </div>
                                                {weight && (
                                                    <div className="mt-2 text-right text-blue-600 font-bold text-sm">
                                                        £{((Number(weight) / 1000) * selectedItemForModifiers.price).toFixed(2)}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
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
                            )}
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
                                <button 
                                  onClick={() => {
                                    setIsPaymentModalOpen(false);
                                    setIsCashPaymentModalOpen(true);
                                  }} 
                                  className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-slate-100 hover:border-green-500 hover:bg-green-50 transition-all group"
                                >
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

      {/* Cash Payment Modal */}
      {isCashPaymentModalOpen && (
        <CashPaymentModal
          total={total}
          onClose={() => setIsCashPaymentModalOpen(false)}
          onComplete={handlePayment}
        />
      )}

      {/* New Order Type Selection Modal */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-zoom-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">New Order</h2>
              <p className="text-slate-500">Select order type to continue</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setOrderType('dine-in');
                  setIsNewOrderModalOpen(false);
                  setIsTableModalOpen(true);
                }}
                className="flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all group"
              >
                <ForkKnife weight="duotone" className="text-5xl text-blue-600" />
                <span className="font-bold text-blue-700">Dine In</span>
              </button>
              
              <button
                onClick={() => {
                  setOrderType('takeaway');
                  setSelectedTable(null);
                  setCart([]);
                  setIsNewOrderModalOpen(false);
                  setCurrentView('pos');
                }}
                className="flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-400 transition-all group"
              >
                <Bag weight="duotone" className="text-5xl text-green-600" />
                <span className="font-bold text-green-700">Takeaway</span>
              </button>
            </div>
            
            <button
              onClick={() => setIsNewOrderModalOpen(false)}
              className="mt-6 w-full py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Order Success Modal */}
      {isOrderSuccessModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-zoom-in p-8 text-center">
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check weight="bold" className="text-4xl" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Order Sent Successfully!</h2>
                <p className="text-slate-500 mb-8">Would you like to print the receipt?</p>
                
                <div className="flex gap-4">
                    <button 
                        onClick={() => {
                            setIsOrderSuccessModalOpen(false);
                            setLastOrder(null);
                        }}
                        className="flex-1 py-3 px-6 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => {
                            printReceipt(lastOrder);
                            setIsOrderSuccessModalOpen(false);
                            setLastOrder(null);
                        }}
                        className="flex-1 py-3 px-6 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
                    >
                        Print
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
