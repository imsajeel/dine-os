'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Trash, Pencil, UserCircle } from '@phosphor-icons/react';
import toast from 'react-hot-toast';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const handleEdit = (user: any) => {
    setEditingUserId(user.id);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      password: '',
      role: user.role,
      branch_id: user.branches?.id || '',
      pin_code: user.pin_code || ''
    });
    setIsModalOpen(true);
  };
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
    try {
      const storage = JSON.parse(localStorage.getItem('admin_user') || '{}');
      const user = storage.user || storage;
      const selectedBranchId = localStorage.getItem('selected_branch_id');
      
      // For branch managers, use their assigned branch_id
      // For org admins, use the selected branch
      const branchId = user.role === 'branch_manager' ? user.branch_id : selectedBranchId;

      console.log('Fetching users for:', { orgId: user.organization_id, branchId, role: user.role, userBranchId: user.branch_id });

      if (user.organization_id) {
          if (user.role === 'org_admin' && !branchId) {
              setUsers([]);
              return;
          }

          const query = branchId ? `&branchId=${branchId}` : '';
          const roleQuery = user.role ? `&userRole=${user.role}` : '';
          const [usersRes, branchesRes] = await Promise.all([
              api.get(`/users?orgId=${user.organization_id}${query}${roleQuery}`),
              api.get(`/branches?orgId=${user.organization_id}`)
          ]);
          
          console.log('Fetched users:', usersRes.data);
          setUsers(usersRes.data);
          setBranches(branchesRes.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleDelete = (id: string) => {
    setDeleteUserId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteUserId) return;
    try {
      await api.delete(`/users/${deleteUserId}`);
      toast.success('User deleted successfully');
      fetchData();
    } catch (error: any) {
      console.error('Failed to delete user', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setShowDeleteModal(false);
      setDeleteUserId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const storage = JSON.parse(localStorage.getItem('admin_user') || '{}');
    const user = storage.user || storage;
    
    // Determine branchId: branch manager uses own branch, otherwise use selected or form branch
    const branchId = user.role === 'branch_manager' ? user.branch_id : (formData.branch_id || localStorage.getItem('selected_branch_id'));

    const payload = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        pin_code: formData.pin_code || null,
        organization_id: user.organization_id,
        branch_id: branchId
    };
    
    try {
      if (editingUserId) {
        await api.put(`/users/${editingUserId}`, payload);
        toast.success('User updated successfully!');
      } else {
        await api.post('/users', payload);
        toast.success('User created successfully!');
      }
      setIsModalOpen(false);
      setFormData({ full_name: '', email: '', password: '', role: 'staff', branch_id: '', pin_code: '' });
      setEditingUserId(null);
      fetchData();
    } catch (error: any) {
      console.error('Failed to save user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save user. Please try again.';
      toast.error(errorMessage);
    }
  };

  const selectedBranchId = typeof window !== 'undefined' ? localStorage.getItem('selected_branch_id') : null;
  const storage = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('admin_user') || '{}') : {};
  const user = storage.user || storage;
  const isAdmin = user?.role === 'org_admin';
  const isBranchManager = user?.role === 'branch_manager';

  if (isAdmin && !selectedBranchId) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="bg-slate-100 p-6 rounded-full mb-4">
                  <UserCircle weight="duotone" className="text-4xl text-slate-400" />
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
        <button onClick={() => {
            setEditingUserId(null);
            setFormData({ full_name: '', email: '', password: '', role: 'staff', branch_id: '', pin_code: '' });
            setIsModalOpen(true);
        }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-blue-700 transition-colors">
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
                                <UserCircle weight="bold" />
                            </div>
                            {u.full_name}
                        </td>
                        <td className="p-4 text-slate-600">{u.email}</td>
                        <td className="p-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold uppercase">{u.role}</span></td>
                        <td className="p-4 text-slate-600">{u.branches?.name || 'All Branches'}</td>
                        <td className="p-4 text-right">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors" onClick={() => handleEdit(u)}><Pencil weight="bold" /></button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" onClick={() => handleDelete(u.id)}><Trash weight="bold" /></button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 text-slate-800">{editingUserId ? 'Edit User' : 'Add User'}</h2>
                
                <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                <input className="w-full p-3 border rounded-lg mb-3 outline-none focus:border-blue-500" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
                
                <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                <input type="email" className="w-full p-3 border rounded-lg mb-3 outline-none focus:border-blue-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                
                <label className="block text-sm font-bold text-slate-700 mb-1">Password {editingUserId && '(Leave blank to keep current)'}</label>
                <input type="password" className="w-full p-3 border rounded-lg mb-3 outline-none focus:border-blue-500" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editingUserId} />

                <label className="block text-sm font-bold text-slate-700 mb-1">PIN Code (for POS)</label>
                <div className="flex gap-2 mb-3">
                    <input 
                        className="w-full p-3 border rounded-lg outline-none focus:border-blue-500" 
                        value={formData.pin_code} 
                        onChange={e => setFormData({...formData, pin_code: e.target.value})} 
                        maxLength={4} 
                        placeholder="4-digit PIN"
                    />
                    {/* Determine branchId for PIN generation */}
                    {(() => {
                      const storage = JSON.parse(localStorage.getItem('admin_user') || '{}');
                      const currentUser = storage.user || storage;
                      const selectedBranchId = localStorage.getItem('selected_branch_id');
                      const branchId = currentUser.role === 'branch_manager' ? currentUser.branch_id : (formData.branch_id || selectedBranchId);
                      return (
                        <button 
                          type="button"
                          disabled={!branchId}
                          onClick={async () => {
                            if (!branchId) {
                              toast.error('Please select a branch first to generate a unique PIN.');
                              return;
                            }
                            try {
                              const res = await api.get(`/users/generate-pin?branchId=${branchId}`);
                              setFormData(prev => ({ ...prev, pin_code: res.data.pin }));
                              toast.success('PIN generated successfully!');
                            } catch (err) {
                              console.error('Failed to generate PIN', err);
                              toast.error('Failed to generate PIN');
                            }
                          }}
                          className="bg-slate-100 text-slate-600 px-3 py-2 rounded-lg font-bold hover:bg-slate-200 transition-colors whitespace-nowrap"
                        >
                          Generate
                        </button>
                      );
                    })()}
                </div>


                {!isBranchManager && (
                  <>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                    <select className="w-full p-3 border rounded-lg mb-6 outline-none focus:border-blue-500 bg-white" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="staff">Staff</option>
                        <option value="branch_manager">Branch Manager</option>
                    </select>
                  </>
                )}

                <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => { setIsModalOpen(false); setEditingUserId(null); }} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Save</button>
                </div>
            </form>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete this user?</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
