'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Trash, Pencil } from '@phosphor-icons/react';

export default function BranchesManager() {
  const [branches, setBranches] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', address: '', phone: '' });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    const storage = JSON.parse(localStorage.getItem('admin_user') || '{}');
    const user = storage.user || storage;
    if (user.organization_id) {
        const res = await api.get(`/branches?orgId=${user.organization_id}`);
        setBranches(res.data);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const storage = JSON.parse(localStorage.getItem('admin_user') || '{}');
    const user = storage.user || storage;
    await api.post('/branches', { ...formData, organization_id: user.organization_id });
    setIsModalOpen(false);
    setFormData({ name: '', address: '', phone: '' });
    fetchBranches();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Manage Branches</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-blue-700 transition-colors">
            <Plus weight="bold" /> Add Branch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch: any) => (
            <div key={branch.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group relative">
                <h3 className="font-bold text-lg text-slate-800 mb-2">{branch.name}</h3>
                <div className="text-xs text-slate-400 font-mono mb-2 bg-slate-50 p-1 rounded select-all cursor-pointer" title="Click to copy ID">{branch.id}</div>
                <p className="text-slate-500 text-sm mb-1">{branch.address}</p>
                <p className="text-slate-500 text-sm mb-4">{branch.phone}</p>
                
                <button 
                    onClick={() => {
                        localStorage.setItem('selected_branch_id', branch.id);
                        window.dispatchEvent(new Event('branch-changed'));
                        window.location.href = '/dashboard';
                    }}
                    className="w-full bg-slate-800 text-white py-2 rounded-lg font-bold hover:bg-slate-900 transition-colors mb-4"
                >
                    Manage Branch
                </button>

                <div className="flex gap-2 border-t pt-4">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"><Pencil weight="bold" /></button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"><Trash weight="bold" /></button>
                </div>
            </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                <h2 className="text-xl font-bold mb-4 text-slate-800">Add Branch</h2>
                <input className="w-full p-3 border rounded-lg mb-3 outline-none focus:border-blue-500" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <input className="w-full p-3 border rounded-lg mb-3 outline-none focus:border-blue-500" placeholder="Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                <input className="w-full p-3 border rounded-lg mb-6 outline-none focus:border-blue-500" placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Save</button>
                </div>
            </form>
        </div>
      )}
    </div>
  );
}
