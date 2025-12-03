'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    activeTables: 0,
    currency: 'USD'
  });
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchId] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const bid = localStorage.getItem('selected_branch_id');
      setBranchId(bid);
      
      const query = bid ? `?branchId=${bid}` : '';
      const res = await api.get(`/stats/dashboard${query}`);
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    window.addEventListener('branch-changed', fetchStats);
    return () => window.removeEventListener('branch-changed', fetchStats);
  }, []);

  if (loading) return <div className="p-6">Loading stats...</div>;

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">
        {branchId ? 'Branch Dashboard' : 'Organization Dashboard'}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 font-bold mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 font-bold mb-2">Revenue</h3>
            <p className="text-3xl font-bold text-green-600">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: stats.currency || 'USD' }).format(Number(stats.revenue))}
            </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 font-bold mb-2">Active Tables</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.activeTables}</p>
        </div>
      </div>
    </div>
  );
}
