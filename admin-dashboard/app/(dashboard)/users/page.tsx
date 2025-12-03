'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Trash, Pencil, User } from '@phosphor-icons/react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    full_name: '', 
    email: '', 
    password: '', 
    role: 'staff', 
    branch_id: '',
    pin_code: ''
  });

  useEffect(() => {
    fetchData();
    window.addEventListener('branch-changed', fetchData);
    return () => window.removeEventListener('branch-changed', fetchData);
  }, []);

  const fetchData = async () => {
    const storage = JSON.parse(localStorage.getItem('admin_user') || '{}');
    const user = storage.user || storage;
    const branchId = localStorage.getItem('selected_branch_id');

    if (user.organization_id) {
        if (user.role === 'org_admin' && !branchId) {
            setUsers([]);
            return;
        }

        const query = branchId ? `&branchId=${branchId}` : '';
        const [usersRes, branchesRes] = await Promise.all([
            api.get(`/users?orgId=${user.organization_id}${query}`),
            api.get(`/branches?orgId=${user.organization_id}`)
        ]);
        setUsers(usersRes.data);
        setBranches(branchesRes.data);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
    // Hash password in real app
    const payload = {
        ...formData,
        organization_id: user.organization_id,
        password_hash: formData.password, // Mock hash
        branch_id: formData.branch_id || null
    };
    
    await api.post('/users', payload);
    setIsModalOpen(false);
    setFormData({ full_name: '', email: '', password: '', role: 'staff', branch_id: '', pin_code: '' });
    fetchData();
  };

  const selectedBranchId = typeof window !== 'undefined' ? localStorage.getItem('selected_branch_id') : null;
  const storage = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('admin_user') || '{}') : {};
  const user = storage.user || storage;
  const isAdmin = user?.role === 'org_admin';

  if (isAdmin && !selectedBranchId) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="bg-slate-100 p-6 rounded-full mb-4">
                  <User weight="duotone" className="text-4xl text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Select a Branch</h2>
              <p className="text-slate-500 max-w-sm">Please select a branch from the sidebar to manage users.</p>
          </div>
      );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Users</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-blue-700 transition-colors">
            <Plus weight="bold" /> Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="p-4 font-bold text-slate-600">Name</th>
                    <th className="p-4 font-bold text-slate-600">Email</th>
                    <th className="p-4 font-bold text-slate-600">Role</th>
                    <th className="p-4 font-bold text-slate-600">Branch</th>
                    <th className="p-4 font-bold text-slate-600 text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map((u: any) => (
                    <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-4 flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                <User weight="bold" />
                            </div>
                            {u.full_name}
                        </td>
                        <td className="p-4 text-slate-600">{u.email}</td>
                        <td className="p-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold uppercase">{u.role}</span></td>
                        <td className="p-4 text-slate-600">{u.branches?.name || 'All Branches'}</td>
                        <td className="p-4 text-right">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"><Pencil weight="bold" /></button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"><Trash weight="bold" /></button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 text-slate-800">Add User</h2>
                
                <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                <input className="w-full p-3 border rounded-lg mb-3 outline-none focus:border-blue-500" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
                
                <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                <input type="email" className="w-full p-3 border rounded-lg mb-3 outline-none focus:border-blue-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                
                <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                <input type="password" className="w-full p-3 border rounded-lg mb-3 outline-none focus:border-blue-500" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />

                <label className="block text-sm font-bold text-slate-700 mb-1">PIN Code (for POS)</label>
                <div className="flex gap-2 mb-3">
                    <input 
                        className="w-full p-3 border rounded-lg outline-none focus:border-blue-500" 
                        value={formData.pin_code} 
                        onChange={e => setFormData({...formData, pin_code: e.target.value})} 
                        maxLength={4} 
                        placeholder="4-digit PIN"
                    />
                    <button 
                        type="button"
                        onClick={async () => {
                            const branchId = formData.branch_id || localStorage.getItem('selected_branch_id');
                            if (!branchId) {
                                alert('Please select a branch first to generate a unique PIN.');
                                return;
                            }
                            try {
                                const res = await api.get(`/users/generate-pin?branchId=${branchId}`);
                                setFormData(prev => ({ ...prev, pin_code: res.data.pin }));
                            } catch (err) {
                                console.error('Failed to generate PIN', err);
                            }
                        }}
                        className="bg-slate-100 text-slate-600 px-3 py-2 rounded-lg font-bold hover:bg-slate-200 transition-colors whitespace-nowrap"
                    >
                        Generate
                    </button>
                </div>

                <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                <select className="w-full p-3 border rounded-lg mb-3 outline-none focus:border-blue-500 bg-white" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="staff">Staff</option>
                    <option value="branch_manager">Branch Manager</option>
                    <option value="org_admin">Org Admin</option>
                </select>

                <label className="block text-sm font-bold text-slate-700 mb-1">Branch</label>
                <select className="w-full p-3 border rounded-lg mb-6 outline-none focus:border-blue-500 bg-white" value={formData.branch_id} onChange={e => setFormData({...formData, branch_id: e.target.value})}>
                    <option value="">All Branches (Org Level)</option>
                    {branches.map((b: any) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>

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
