'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Trash, Pencil, List, TextT, Scales } from '@phosphor-icons/react';
import toast from 'react-hot-toast';

export default function Modifiers() {
  const [modifierGroups, setModifierGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'selection', // selection, text, grams
    min_selection: 0,
    max_selection: 1,
    options: [] as any[]
  });

  const [optionForm, setOptionForm] = useState({ name: '', price: '' });

  useEffect(() => {
    fetchModifierGroups();
  }, []);

  const fetchModifierGroups = async () => {
    try {
      const storage = JSON.parse(localStorage.getItem('admin_user') || '{}');
      const user = storage.user || storage;
      const branchId = localStorage.getItem('selected_branch_id');
      
      if (user?.organization_id) {
        const res = await api.get(`/modifiers/${user.organization_id}${branchId ? `?branchId=${branchId}` : ''}`);
        setModifierGroups(res.data);
      }
    } catch (error) {
      console.error('Error fetching modifiers:', error);
      toast.error('Failed to load modifiers');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const storage = JSON.parse(localStorage.getItem('admin_user') || '{}');
      const user = storage.user || storage;
      const branchId = localStorage.getItem('selected_branch_id');

      const payload = {
        ...formData,
        organization_id: user.organization_id,
        branch_id: branchId
      };

      if (editingGroup) {
        await api.put(`/modifiers/${editingGroup.id}`, payload);
        toast.success('Modifier group updated');
      } else {
        await api.post('/modifiers', payload);
        toast.success('Modifier group created');
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchModifierGroups();
    } catch (error) {
      console.error('Error saving modifier group:', error);
      toast.error('Failed to save modifier group');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this modifier group?')) return;
    try {
      await api.delete(`/modifiers/${id}`);
      toast.success('Modifier group deleted');
      fetchModifierGroups();
    } catch (error) {
      console.error('Error deleting modifier group:', error);
      toast.error('Failed to delete modifier group');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'selection',
      min_selection: 0,
      max_selection: 1,
      options: []
    });
    setEditingGroup(null);
  };

  const openModal = (group?: any) => {
    if (group) {
      setEditingGroup(group);
      setFormData({
        name: group.name,
        type: group.type || 'selection',
        min_selection: group.min_selection,
        max_selection: group.max_selection,
        options: group.modifiers || []
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const addOption = () => {
    if (!optionForm.name) return;
    setFormData({
      ...formData,
      options: [...formData.options, { ...optionForm, price: parseFloat(optionForm.price) || 0 }]
    });
    setOptionForm({ name: '', price: '' });
  };

  const removeOption = (index: number) => {
    const newOptions = [...formData.options];
    newOptions.splice(index, 1);
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Modifier Management</h1>
            <p className="text-slate-500">Create and manage modifier groups for your menu items.</p>
        </div>
        <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-blue-700 transition-colors">
            <Plus weight="bold" /> Add Modifier Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modifierGroups.map((group: any) => (
            <div key={group.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">{group.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                            group.type === 'grams' ? 'bg-purple-100 text-purple-700' : 
                            group.type === 'text' ? 'bg-orange-100 text-orange-700' : 
                            'bg-blue-100 text-blue-700'
                        }`}>
                            {group.type === 'grams' && <Scales className="inline mr-1" />}
                            {group.type === 'text' && <TextT className="inline mr-1" />}
                            {group.type === 'selection' && <List className="inline mr-1" />}
                            {group.type?.toUpperCase() || 'SELECTION'}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => openModal(group)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg"><Pencil weight="bold" /></button>
                        <button onClick={() => handleDelete(group.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg"><Trash weight="bold" /></button>
                    </div>
                </div>
                
                {group.type === 'selection' && (
                    <div className="text-sm text-slate-500 mb-4">
                        <p>Min: {group.min_selection} | Max: {group.max_selection}</p>
                        <p className="mt-2 font-semibold text-slate-700">{group.modifiers?.length || 0} Options</p>
                    </div>
                )}
                
                {group.type === 'grams' && (
                    <p className="text-sm text-slate-500 mb-4">Price calculated per weight input.</p>
                )}
            </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">{editingGroup ? 'Edit Modifier Group' : 'New Modifier Group'}</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Group Name</label>
                        <input 
                            type="text" 
                            required
                            className="w-full p-3 border rounded-lg outline-none focus:border-blue-500"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            placeholder="e.g. Steak Cooking, Sides, Weight"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Type</label>
                        <select 
                            className="w-full p-3 border rounded-lg outline-none focus:border-blue-500 bg-white"
                            value={formData.type}
                            onChange={e => setFormData({...formData, type: e.target.value})}
                        >
                            <option value="selection">Selection (Checkbox/Radio)</option>
                            <option value="grams">Grams (Weight-based Price)</option>
                            <option value="text">Text Input (Notes)</option>
                        </select>
                    </div>

                    {formData.type === 'selection' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Min Selection</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        className="w-full p-3 border rounded-lg outline-none focus:border-blue-500"
                                        value={formData.min_selection}
                                        onChange={e => setFormData({...formData, min_selection: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Max Selection</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        className="w-full p-3 border rounded-lg outline-none focus:border-blue-500"
                                        value={formData.max_selection}
                                        onChange={e => setFormData({...formData, max_selection: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-4 mt-4">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Options</label>
                                <div className="flex gap-2 mb-2">
                                    <input 
                                        type="text" 
                                        placeholder="Option Name"
                                        className="flex-1 p-2 border rounded-lg text-sm"
                                        value={optionForm.name}
                                        onChange={e => setOptionForm({...optionForm, name: e.target.value})}
                                    />
                                    <input 
                                        type="number" 
                                        placeholder="Price (+)"
                                        className="w-24 p-2 border rounded-lg text-sm"
                                        value={optionForm.price}
                                        onChange={e => setOptionForm({...optionForm, price: e.target.value})}
                                    />
                                    <button type="button" onClick={addOption} className="bg-slate-800 text-white p-2 rounded-lg hover:bg-slate-700">
                                        <Plus weight="bold" />
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {formData.options.map((opt, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg text-sm">
                                            <span>{opt.name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-slate-600">+{opt.price}</span>
                                                <button type="button" onClick={() => removeOption(idx)} className="text-red-500 hover:text-red-700">
                                                    <Trash weight="fill" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Save Group</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
