'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Storefront } from '@phosphor-icons/react';
import api from '@/lib/api';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    activeTables: 0,
    currency: 'GBP'
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">
          {branchId ? 'Branch Dashboard' : 'Organization Dashboard'}
        </h1>
        {!branchId && (
          <button 
            onClick={() => router.push('/branches')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-blue-700 transition-colors"
          >
            <Storefront weight="bold" />
            View Branches
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 font-bold mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 font-bold mb-2">Revenue</h3>
            <p className="text-3xl font-bold text-green-600">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: stats.currency || 'GBP' }).format(Number(stats.revenue))}
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
