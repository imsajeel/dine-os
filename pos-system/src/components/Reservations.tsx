"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Check, X, Phone, Envelope, Money, CaretLeft, CaretRight, Plus } from "@phosphor-icons/react";

type Reservation = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  party_size: number;
  reservation_time: string;
  status: string;
  deposit_amount: number;
  is_deposit_paid: boolean;
  notes: string;
  floor_tables?: {
      table_number: string;
      id: string;
  };
};

type ReservationsProps = {
    onTakeOrder: (reservation: Reservation) => void;
};

export default function Reservations({ onTakeOrder }: ReservationsProps) {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [filter, setFilter] = useState<'today' | 'week' | 'month'>('today');
    const [view, setView] = useState<'list' | 'calendar'>('list');
    const [isNewReservationModalOpen, setIsNewReservationModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        party_size: 2,
        reservation_time: '',
        notes: '',
        deposit_amount: 0,
        is_deposit_paid: false
    });

    const handleCreateReservation = async (e: React.FormEvent) => {
        e.preventDefault();
        const orgId = localStorage.getItem('dineos_org_id');
        if (!orgId) return;

        try {
            const res = await fetch('http://localhost:3001/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    organization_id: orgId,
                    branch_id: JSON.parse(localStorage.getItem('dineos_settings') || '{}').branchId || null,
                    reservation_time: new Date(formData.reservation_time).toISOString()
                })
            });
            if (res.ok) {
                setIsNewReservationModalOpen(false);
                fetchReservations();
                setFormData({
                    customer_name: '',
                    customer_phone: '',
                    customer_email: '',
                    party_size: 2,
                    reservation_time: '',
                    notes: '',
                    deposit_amount: 0,
                    is_deposit_paid: false
                });
            } else {
                alert('Failed to create reservation');
            }
        } catch (err) {
            console.error(err);
            alert('Error creating reservation');
        }
    };
    
    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        const orgId = localStorage.getItem('dineos_org_id');
        if (!orgId) return;
        const settings = JSON.parse(localStorage.getItem('dineos_settings') || '{}');
        const branchId = settings.branchId;
        const queryParams = branchId ? `&branchId=${branchId}` : '';
        try {
            const res = await fetch(`http://localhost:3001/reservations?organization_id=${orgId}${queryParams}`);
            const data = await res.json();
            setReservations(data);
        } catch (e) {
            console.error(e);
        }
    };

    const getFilteredReservations = () => {
        const today = new Date();
        return reservations.filter(r => {
            const rDate = new Date(r.reservation_time);
            if (filter === 'today') {
                return rDate.toDateString() === today.toDateString();
            } else if (filter === 'week') {
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                const endOfWeek = new Date(today);
                endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
                return rDate >= startOfWeek && rDate <= endOfWeek;
            } else {
                return rDate.getMonth() === today.getMonth() && rDate.getFullYear() === today.getFullYear();
            }
        });
    };

    const filteredReservations = getFilteredReservations();

    const renderCalendar = () => {
        // Simple Calendar Grid
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
        
        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-32 bg-slate-50 border border-slate-100"></div>);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(today.getFullYear(), today.getMonth(), i);
            const dayReservations = reservations.filter(r => new Date(r.reservation_time).toDateString() === date.toDateString());
            
            days.push(
                <div key={i} className="h-32 bg-white border border-slate-200 p-2 overflow-y-auto">
                    <div className="font-bold text-slate-700 mb-1">{i}</div>
                    {dayReservations.map(r => (
                        <div key={r.id} className="text-xs bg-blue-50 text-blue-700 p-1 rounded mb-1 truncate">
                            {new Date(r.reservation_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} {r.customer_name}
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-slate-100 p-2 text-center font-bold text-slate-600 text-sm">{day}</div>
                ))}
                {days}
            </div>
        );
    };

    return (
        <div className="flex-1 bg-slate-50 h-full flex flex-col overflow-hidden">
            <header className="bg-white border-b border-slate-200 p-6 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-800">Reservations</h1>
                    <button 
                        onClick={() => setIsNewReservationModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                    >
                        <Plus weight="bold" /> New
                    </button>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setView('list')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>List</button>
                    <button onClick={() => setView('calendar')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${view === 'calendar' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Calendar</button>
                </div>
            </header>
            
            {/* Filters */}
            <div className="p-6 pb-0 flex gap-4 shrink-0">
                <button onClick={() => setFilter('today')} className={`px-4 py-2 rounded-full font-bold transition-colors ${filter === 'today' ? 'bg-blue-100 text-blue-600' : 'bg-white text-slate-500 border hover:bg-slate-50'}`}>Today</button>
                <button onClick={() => setFilter('week')} className={`px-4 py-2 rounded-full font-bold transition-colors ${filter === 'week' ? 'bg-blue-100 text-blue-600' : 'bg-white text-slate-500 border hover:bg-slate-50'}`}>This Week</button>
                <button onClick={() => setFilter('month')} className={`px-4 py-2 rounded-full font-bold transition-colors ${filter === 'month' ? 'bg-blue-100 text-blue-600' : 'bg-white text-slate-500 border hover:bg-slate-50'}`}>This Month</button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                {view === 'list' ? (
                    <div className="space-y-4">
                        {filteredReservations.length === 0 ? (
                            <div className="text-center text-slate-400 py-12">No reservations found for this period.</div>
                        ) : (
                            filteredReservations.map(res => (
                                <div key={res.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center hover:shadow-md transition-shadow">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-slate-800">{res.customer_name}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${res.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>{res.status}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-6 text-slate-500 text-sm">
                                            <div className="flex items-center gap-2"><Clock weight="bold" /> {new Date(res.reservation_time).toLocaleDateString()} at {new Date(res.reservation_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                            <div className="flex items-center gap-2"><Users weight="bold" /> {res.party_size} Guests</div>
                                            <div className="flex items-center gap-2"><Phone weight="bold" /> {res.customer_phone || 'N/A'}</div>
                                            {res.floor_tables && <div className="flex items-center gap-2 font-bold text-slate-700">Table {res.floor_tables.table_number}</div>}
                                        </div>
                                        {res.is_deposit_paid && (
                                            <div className="mt-2 flex items-center gap-2 text-green-600 font-bold text-sm">
                                                <Check weight="bold" /> Deposit Paid: £{Number(res.deposit_amount).toFixed(2)}
                                            </div>
                                        )}
                                        {res.notes && <div className="mt-2 text-slate-500 italic text-sm">"{res.notes}"</div>}
                                    </div>
                                    <button 
                                        onClick={() => onTakeOrder(res)}
                                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                                    >
                                        Take Order
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    renderCalendar()
                )}
            </div>

            {/* New Reservation Modal */}
            {isNewReservationModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-zoom-in flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-800">New Reservation</h2>
                            <button onClick={() => setIsNewReservationModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <X weight="bold" className="text-slate-500" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateReservation} className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Customer Name</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                                    value={formData.customer_name}
                                    onChange={e => setFormData({...formData, customer_name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Phone</label>
                                    <input 
                                        type="tel" 
                                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                                        value={formData.customer_phone}
                                        onChange={e => setFormData({...formData, customer_phone: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Party Size</label>
                                    <input 
                                        type="number" 
                                        required
                                        min="1"
                                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                                        value={formData.party_size}
                                        onChange={e => setFormData({...formData, party_size: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Date & Time</label>
                                <input 
                                    type="datetime-local" 
                                    required
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                                    value={formData.reservation_time}
                                    onChange={e => setFormData({...formData, reservation_time: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Deposit Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-slate-400">£</span>
                                        <input 
                                            type="number" 
                                            min="0"
                                            step="0.01"
                                            className="w-full p-3 pl-8 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                                            value={formData.deposit_amount}
                                            onChange={e => setFormData({...formData, deposit_amount: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                                            checked={formData.is_deposit_paid}
                                            onChange={e => setFormData({...formData, is_deposit_paid: e.target.checked})}
                                        />
                                        <span className="font-bold text-slate-700">Deposit Paid?</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Notes</label>
                                <textarea 
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                                    rows={3}
                                    value={formData.notes}
                                    onChange={e => setFormData({...formData, notes: e.target.value})}
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsNewReservationModalOpen(false)}
                                    className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
                                >
                                    Create Reservation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
