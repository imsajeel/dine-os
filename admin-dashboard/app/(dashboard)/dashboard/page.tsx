'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Storefront, TrendUp, ShoppingCart, Table } from '@phosphor-icons/react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>({
    totalOrders: 0,
    revenue: 0,
    activeTables: 0,
    currency: 'GBP',
    branchStats: [],
    topItems: []
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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: stats.currency || 'GBP' }).format(Number(value));

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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold opacity-90">Total Orders</h3>
            <ShoppingCart weight="bold" className="text-2xl opacity-75" />
          </div>
          <p className="text-4xl font-bold">{stats.totalOrders}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold opacity-90">Revenue</h3>
            <TrendUp weight="bold" className="text-2xl opacity-75" />
          </div>
          <p className="text-4xl font-bold">{formatCurrency(stats.revenue)}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold opacity-90">Active Tables</h3>
            <Table weight="bold" className="text-2xl opacity-75" />
          </div>
          <p className="text-4xl font-bold">{stats.activeTables}</p>
        </div>
      </div>

      {/* Branch Analytics (Org Admin Only) */}
      {!branchId && stats.branchStats && stats.branchStats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Branch Revenue Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Revenue by Branch</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.branchStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="branchName" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Branch Orders Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Orders Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.branchStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ branchName, percent }) => `${branchName}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="orders"
                >
                  {stats.branchStats.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Branch Performance Table (Org Admin Only) */}
      {!branchId && stats.branchStats && stats.branchStats.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Branch Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-bold text-slate-700">Branch</th>
                  <th className="text-right py-3 px-4 font-bold text-slate-700">Orders</th>
                  <th className="text-right py-3 px-4 font-bold text-slate-700">Revenue</th>
                  <th className="text-right py-3 px-4 font-bold text-slate-700">Avg Order Value</th>
                </tr>
              </thead>
              <tbody>
                {stats.branchStats.map((branch: any, index: number) => (
                  <tr key={branch.branchId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-800">{branch.branchName}</td>
                    <td className="py-3 px-4 text-right text-slate-600">{branch.orders}</td>
                    <td className="py-3 px-4 text-right text-green-600 font-bold">{formatCurrency(branch.revenue)}</td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {branch.orders > 0 ? formatCurrency(Number(branch.revenue) / branch.orders) : formatCurrency(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Selling Items */}
      {stats.topItems && stats.topItems.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Top Selling Items</h2>
          <div className="space-y-3">
            {stats.topItems.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{item.name}</h3>
                    <p className="text-sm text-slate-500">{item.quantity} sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(item.revenue)}</p>
                  <p className="text-xs text-slate-500">Total Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
