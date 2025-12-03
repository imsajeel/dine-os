"use client";

import React, { useState, useEffect } from 'react';
import { ClockCounterClockwise, User, Check, X } from "@phosphor-icons/react";

type OrderItem = {
  id: string;
  menu_item_id: string;
  quantity: number;
  price_at_time: number;
  modifiers: string;
  notes: string | null;
  status: string;
  done?: boolean;
  menu_items: {
    id: string;
    name: string;
    description: string;
  };
};

type Order = {
  id: string;
  table_id: string | null;
  server_id: string | null;
  status: string;
  total_amount: number;
  created_at: string;
  startTime: number;
  order_items: OrderItem[];
  floor_tables?: {
    table_number: string;
  } | null;
  users?: {
    full_name: string;
    email: string;
  } | null;
};

export default function KDS() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'new' | 'prep' | 'ready'>('all');
  const [history, setHistory] = useState<Order[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    const orgId = localStorage.getItem('dineos_org_id');
    if (!orgId) {
      console.warn('No organization ID found');
      return;
    }
    
    try {
      const url = `http://localhost:3001/orders?organization_id=${orgId}&status=active`;
      console.log('Fetching orders from:', url);
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Fetched orders:', data.length);
      
      // Filter out completed/cancelled and transform data
      const activeOrders = data
        .filter((o: any) => o.status !== 'completed' && o.status !== 'cancelled')
        .map((o: any) => ({
          ...o,
          startTime: new Date(o.created_at).getTime(),
          order_items: o.order_items.map((item: any) => ({
            ...item,
            done: item.status === 'served' || item.status === 'ready'
          }))
        }));
      
      setOrders(activeOrders);
    } catch (e) {
      console.error('Failed to fetch orders:', e);
      // Don't show error to user, just log it
    }
  };

  const toggleItem = async (orderId: string, itemIndex: number) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const item = order.order_items[itemIndex];
    if (!item) return;
    
    // Determine new status based on current state
    let newStatus = 'prep';
    if (item.status === 'new') {
      newStatus = 'prep';
    } else if (item.status === 'prep') {
      newStatus = 'ready';
    } else if (item.status === 'ready') {
      newStatus = 'prep'; // Toggle back
    }
    
    try {
      // Update backend
      await fetch(`http://localhost:3001/orders/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      // Update local state
      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          const newItems = [...o.order_items];
          newItems[itemIndex] = { 
            ...newItems[itemIndex], 
            status: newStatus,
            done: newStatus === 'ready' || newStatus === 'served'
          };
          return { ...o, order_items: newItems };
        }
        return o;
      }));
    } catch (error) {
      console.error('Failed to update item status:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`http://localhost:3001/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
    } catch (e) {
      console.error('Failed to update order status', e);
    }
  };

  const completeOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      updateOrderStatus(orderId, 'completed');
      setHistory(prev => [{ ...order, endTime: Date.now() } as any, ...prev.slice(0, 19)]);
    }
  };

  const formatTime = (startTime: number) => {
    const diff = Date.now() - startTime;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isOverdue = (startTime: number) => (Date.now() - startTime) > (15 * 60 * 1000);

  // Sort orders by status priority and time
  const getStatusPriority = (status: string) => {
    const priorities: { [key: string]: number } = {
      'new': 1,      // New orders first
      'prep': 2,     // Then in-progress
      'ready': 3     // Ready orders last
    };
    return priorities[status] || 999;
  };

  const filteredOrders = orders
    .filter(o => filter === 'all' || o.status === filter)
    .sort((a, b) => {
      // First sort by status priority
      const priorityDiff = getStatusPriority(a.status) - getStatusPriority(b.status);
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by time (oldest first)
      return a.startTime - b.startTime;
    });

  return (
    <div className="bg-slate-900 text-white h-screen overflow-hidden flex flex-col">
      {/* Header */}
      <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="/dark-os-icon-white.png" alt="DineOS" className="w-8 h-8" />
            <h1 className="font-bold text-xl tracking-tight">KITCHEN<span className="text-blue-500">VIEW</span></h1>
          </div>
          
          {/* Filters */}
          <div className="hidden md:flex bg-slate-900 p-1 rounded-lg border border-slate-700">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                filter === 'all' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Active
            </button>
            <button 
              onClick={() => setFilter('new')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                filter === 'new' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              New
            </button>
            <button 
              onClick={() => setFilter('prep')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                filter === 'prep' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Prep
            </button>
            <button 
              onClick={() => setFilter('ready')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                filter === 'ready' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ready
            </button>
          </div>
        </div>

        {/* Live Stats */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex flex-col items-end">
            <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Orders Pending</span>
            <span className="font-mono font-bold text-blue-400 text-lg leading-none">{orders.length}</span>
          </div>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-600 hover:text-white cursor-pointer transition-colors"
          >
            <ClockCounterClockwise weight="bold" className="text-xl" />
          </button>
        </div>
      </header>

      {/* Main Ticket Grid */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <div className="flex gap-4 h-full">
          {filteredOrders.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <p className="text-2xl font-bold mb-2">No active orders</p>
                <p className="text-sm">Orders will appear here automatically</p>
              </div>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const overdue = isOverdue(order.startTime);
              const allDone = order.order_items.every(item => item.done);
              const isTakeaway = !order.floor_tables;
              
              let borderColor = overdue ? 'border-red-500 border-2' : 'border-slate-700';
              let headerColor = overdue ? 'bg-red-500/10 text-red-200' : 'bg-slate-800';
              
              if (order.status === 'prep') {
                borderColor = 'border-yellow-500 border-2';
                headerColor = 'bg-yellow-500/10 text-yellow-200';
              } else if (order.status === 'ready') {
                borderColor = 'border-green-500 border-2';
                headerColor = 'bg-green-500/10 text-green-200';
              } else if (isTakeaway && !overdue) {
                borderColor = 'border-purple-500 border-2';
                headerColor = 'bg-purple-500/10 text-purple-200';
              }

              return (
                <div 
                  key={order.id} 
                  className={`min-w-[320px] w-[320px] bg-slate-800 rounded-xl flex flex-col shadow-xl overflow-hidden border ${borderColor} h-full max-h-[calc(100vh-140px)] relative animate-fade-in`}
                >
                  {/* Header */}
                  <div className={`p-4 border-b border-slate-700 ${headerColor} flex justify-between items-start shrink-0`}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold ${isTakeaway ? 'text-3xl text-purple-300' : 'text-2xl'}`}>
                          {isTakeaway ? 'TAKEAWAY' : `#${order.floor_tables?.table_number}`}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                          ID:{order.id.slice(-4)}
                        </span>
                      </div>
                      <div className="text-sm opacity-80 flex items-center gap-1">
                        <User weight="bold" className="text-xs" />
                        {order.users?.full_name || order.users?.email || 'Staff'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-mono font-bold">
                        {formatTime(order.startTime)}
                      </div>
                      <div className="text-xs font-bold uppercase tracking-wide opacity-75">
                        {order.status}
                      </div>
                    </div>
                  </div>

                  {/* Body (Scrollable) */}
                  <div className="p-2 flex-1 overflow-y-auto space-y-1">
                    {order.order_items.map((item, idx) => {
                      const mods = item.modifiers && item.modifiers !== '[]' 
                        ? JSON.parse(item.modifiers) 
                        : [];
                      
                      return (
                        <div 
                          key={idx}
                          onClick={() => toggleItem(order.id, idx)}
                          className={`p-3 rounded-lg hover:bg-slate-700/50 cursor-pointer select-none transition-colors ${
                            item.done ? 'opacity-50' : ''
                          }`}
                        >
                          <div className={`flex items-start gap-3 ${item.done ? 'line-through' : ''}`}>
                            <div className={`w-6 h-6 rounded border ${
                              item.done ? 'bg-green-500 border-green-500' : 'border-slate-500'
                            } flex items-center justify-center shrink-0 mt-0.5 transition-colors`}>
                              <Check weight="bold" className={`text-white text-sm ${item.done ? 'opacity-100' : 'opacity-0'}`} />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-lg leading-tight">
                                {item.quantity > 1 && `${item.quantity}x `}{item.menu_items.name}
                              </div>
                              {mods.length > 0 && (
                                <div className="text-red-300 text-sm mt-1 font-medium italic space-y-0.5">
                                  {mods.map((mod: any, i: number) => (
                                    <div key={i}>• {mod.name}</div>
                                  ))}
                                </div>
                              )}
                              {item.notes && (
                                <div className="text-orange-300 text-sm mt-1 font-medium italic">
                                  📝 {item.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer Actions */}
                  <div className="p-4 border-t border-slate-700 bg-slate-800/50 shrink-0 grid grid-cols-2 gap-3">
                    {order.status === 'ready' ? (
                      <>
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'prep')}
                          className="col-span-1 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 font-bold text-slate-300 transition-colors"
                        >
                          Undo
                        </button>
                        <button 
                          onClick={() => completeOrder(order.id)}
                          className="col-span-1 py-3 rounded-lg bg-slate-600 hover:bg-slate-500 font-bold text-white transition-colors"
                        >
                          Bump
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'prep')}
                          className="col-span-1 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors"
                        >
                          Done
                        </button>
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          disabled={!allDone}
                          className={`col-span-1 py-3 rounded-lg font-bold transition-all ${
                            allDone 
                              ? 'bg-green-600 hover:bg-green-500 text-white animate-pulse cursor-pointer' 
                              : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {allDone ? 'Ready!' : 'Ready'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Recently Completed</h2>
              <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white">
                <X weight="bold" className="text-2xl" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
              {history.length === 0 ? (
                <div className="col-span-2 text-center text-slate-500 py-12">
                  <p>No completed orders yet</p>
                </div>
              ) : (
                history.map((order) => (
                  <div key={order.id} className="bg-slate-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold">#{order.floor_tables?.table_number || 'T/A'}</span>
                      <span className="text-xs text-slate-400">ID:{order.id.slice(-4)}</span>
                    </div>
                    <div className="text-sm text-slate-300 space-y-1">
                      {order.order_items.map((item, idx) => (
                        <div key={idx}>
                          {item.quantity > 1 && `${item.quantity}x `}{item.menu_items.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
