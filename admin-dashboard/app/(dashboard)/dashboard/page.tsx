'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    activeTables: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-6">Loading stats...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 font-bold mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 font-bold mb-2">Revenue</h3>
            <p className="text-3xl font-bold text-green-600">${Number(stats.revenue).toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 font-bold mb-2">Active Tables</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.activeTables}</p>
        </div>
      </div>
    </div>
  );
}
