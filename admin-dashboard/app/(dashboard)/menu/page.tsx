'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Trash, Pencil, ForkKnife, Image } from '@phosphor-icons/react';
import BranchSelector from '@/components/BranchSelector';
import BranchesManager from '@/components/BranchesManager';

export default function Menu() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [categoryForm, setCategoryForm] = useState({ name: '', branch_id: '' });
  const [itemForm, setItemForm] = useState({ 
    name: '', 
    price: '', 
    description: '', 
    category_id: '', 
    branch_id: '',
    image_url: ''
  });

  const [importForm, setImportForm] = useState({
    sourceBranchId: '',
    mode: 'all' as 'all' | 'category',
    categoryId: ''
  });
  const [sourceCategories, setSourceCategories] = useState<any[]>([]);

  const fetchSourceCategories = async (branchId: string) => {
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
    if (user.organization_id && branchId) {
        const res = await api.get(`/menu/admin/${user.organization_id}?branchId=${branchId}`);
        setSourceCategories(res.data.categories);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const branchId = localStorage.getItem('selected_branch_id');
    if (!branchId) return;

    await api.post('/menu/copy', {
        sourceBranchId: importForm.sourceBranchId,
        targetBranchId: branchId,
        mode: importForm.mode,
        categoryId: importForm.categoryId
    });
    setIsImportModalOpen(false);
    setImportForm({ sourceBranchId: '', mode: 'all', categoryId: '' });
    fetchData();
  };

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
            setCategories([]);
            setItems([]);
            return;
        }
        
        const query = branchId ? `?branchId=${branchId}` : '';
        
        const [menuRes, branchesRes] = await Promise.all([
            api.get(`/menu/admin/${user.organization_id}${query}`),
            api.get(`/branches?orgId=${user.organization_id}`)
        ]);
        setCategories(menuRes.data.categories);
        setItems(menuRes.data.items);
        setBranches(branchesRes.data);
    }
  };

  const openCategoryModal = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ 
        name: category.name, 
        branch_id: category.branch_id || '' 
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', branch_id: '' });
    }
    setIsCategoryModalOpen(true);
  };

  const openItemModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        price: item.price.toString(),
        description: item.description || '',
        category_id: item.category_id || '',
        branch_id: item.branch_id || '',
        image_url: item.image_url || ''
      });
    } else {
      setEditingItem(null);
      setItemForm({ name: '', price: '', description: '', category_id: '', branch_id: '', image_url: '' });
    }
    setIsItemModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
    const branchId = localStorage.getItem('selected_branch_id');
    
    if (editingCategory) {
      await api.put(`/menu/category/${editingCategory.id}`, {
        ...categoryForm,
        organization_id: user.organization_id,
        branch_id: branchId || user.branch_id || null
      });
    } else {
      await api.post('/menu/category', {
        ...categoryForm,
        organization_id: user.organization_id,
        branch_id: branchId || user.branch_id || null
      });
    }
    
    setIsCategoryModalOpen(false);
    setCategoryForm({ name: '', branch_id: '' });
    setEditingCategory(null);
    fetchData();
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
    const branchId = localStorage.getItem('selected_branch_id');
    
    const payload = {
      ...itemForm,
      organization_id: user.organization_id,
      price: parseFloat(itemForm.price),
      branch_id: branchId || user.branch_id || null
    };

    if (editingItem) {
      await api.put(`/menu/item/${editingItem.id}`, payload);
    } else {
      await api.post('/menu/item', payload);
    }
    
    setIsItemModalOpen(false);
    setItemForm({ name: '', price: '', description: '', category_id: '', branch_id: '', image_url: '' });
    setEditingItem(null);
    fetchData();
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this category? All items in this category will also be deleted.')) {
      await api.delete(`/menu/category/${id}`);
      fetchData();
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await api.delete(`/menu/item/${id}`);
      fetchData();
    }
  };


  const filteredItems = activeCategory === 'all' 
    ? items 
    : items.filter((i: any) => i.category_id === activeCategory);

  const [activeTab, setActiveTab] = useState<'menu' | 'branches'>('menu');

  const selectedBranchId = typeof window !== 'undefined' ? localStorage.getItem('selected_branch_id') : null;
  const storage = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('admin_user') || '{}') : {};
  const user = storage.user || storage;
  const isAdmin = user?.role === 'org_admin';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Menu Management</h1>
            {isAdmin && <div className="mt-2 w-64"><BranchSelector /></div>}
        </div>
        
        <div className="flex gap-3">
            <button onClick={() => openCategoryModal()} disabled={!selectedBranchId && isAdmin} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Plus weight="bold" /> Add Category
            </button>
            <button onClick={() => openItemModal()} disabled={!selectedBranchId && isAdmin} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Plus weight="bold" /> Add Item
            </button>
        </div>
      </div>

      {isAdmin && !selectedBranchId ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="bg-slate-100 p-6 rounded-full mb-4">
                  <ForkKnife weight="duotone" className="text-4xl text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Select a Branch</h2>
              <p className="text-slate-500 max-w-sm">Please select a branch above to manage its menu items and categories.</p>
          </div>
      ) : (
        <>
          {categories.length === 0 && items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="bg-slate-100 p-6 rounded-full mb-4">
                    <ForkKnife weight="duotone" className="text-4xl text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">No Menu Items Found</h2>
                <p className="text-slate-500 max-w-sm mb-6">This branch has no menu items yet. You can add items manually or import from another branch.</p>
                <div className="flex gap-3">
                    <button onClick={() => openCategoryModal()} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold hover:bg-slate-50 transition-colors">
                        Add Manually
                    </button>
                    <button onClick={() => setIsImportModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                        Import from Branch
                    </button>
                </div>
            </div>
          ) : (
            <>
              <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                <button 
                    onClick={() => setActiveCategory('all')}
                    className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${activeCategory === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                >
                    All Items
                </button>
                {categories.map((c: any) => (
                    <button 
                        key={c.id}
                        onClick={() => setActiveCategory(c.id)}
                        className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${activeCategory === c.id ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                    >
                        {c.name}
                    </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item: any) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
                        <div className="h-48 bg-slate-100 relative">
                            {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <Image weight="duotone" className="text-4xl" />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold shadow-sm">
                                ${Number(item.price).toFixed(2)}
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-slate-800 mb-1">{item.name}</h3>
                            <p className="text-slate-500 text-sm mb-3 line-clamp-2">{item.description || 'No description'}</p>
                            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                                <span className="text-xs font-bold text-slate-400 uppercase">{item.categories?.name}</span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openItemModal(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Pencil weight="bold" /></button>
                                    <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash weight="bold" /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleSaveCategory} className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                <h2 className="text-xl font-bold mb-4 text-slate-800">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
                <input className="w-full p-3 border rounded-lg mb-6 outline-none focus:border-blue-500" placeholder="Category Name" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} required />

                <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Save</button>
                </div>
            </form>
        </div>
      )}

      {/* Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleSaveItem} className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 text-slate-800">{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
                
                <input className="w-full p-3 border rounded-lg mb-3 outline-none focus:border-blue-500" placeholder="Item Name" value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} required />
                
                <div className="flex gap-3 mb-3">
                    <input type="number" step="0.01" className="w-1/2 p-3 border rounded-lg outline-none focus:border-blue-500" placeholder="Price" value={itemForm.price} onChange={e => setItemForm({...itemForm, price: e.target.value})} required />
                    <select className="w-1/2 p-3 border rounded-lg outline-none focus:border-blue-500 bg-white" value={itemForm.category_id} onChange={e => setItemForm({...itemForm, category_id: e.target.value})} required>
                        <option value="">Select Category</option>
                        {categories.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <textarea className="w-full p-3 border rounded-lg mb-3 outline-none focus:border-blue-500 h-24 resize-none" placeholder="Description" value={itemForm.description} onChange={e => setItemForm({...itemForm, description: e.target.value})} />
                
                <input className="w-full p-3 border rounded-lg mb-6 outline-none focus:border-blue-500" placeholder="Image URL" value={itemForm.image_url} onChange={e => setItemForm({...itemForm, image_url: e.target.value})} />

                <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setIsItemModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Save</button>
                </div>
            </form>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleImport} className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                <h2 className="text-xl font-bold mb-4 text-slate-800">Import Menu</h2>
                
                <label className="block text-sm font-bold text-slate-700 mb-1">Source Branch</label>
                <select 
                    className="w-full p-3 border rounded-lg mb-3 outline-none focus:border-blue-500 bg-white" 
                    value={importForm.sourceBranchId} 
                    onChange={e => {
                        setImportForm({...importForm, sourceBranchId: e.target.value});
                        fetchSourceCategories(e.target.value);
                    }}
                    required
                >
                    <option value="">Select Branch</option>
                    {branches.filter((b: any) => b.id !== selectedBranchId).map((b: any) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>

                <label className="block text-sm font-bold text-slate-700 mb-1">Import Mode</label>
                <div className="flex gap-4 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="radio" 
                            name="mode" 
                            value="all" 
                            checked={importForm.mode === 'all'} 
                            onChange={() => setImportForm({...importForm, mode: 'all'})} 
                        />
                        <span className="text-slate-700">All Items</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="radio" 
                            name="mode" 
                            value="category" 
                            checked={importForm.mode === 'category'} 
                            onChange={() => setImportForm({...importForm, mode: 'category'})} 
                        />
                        <span className="text-slate-700">Specific Category</span>
                    </label>
                </div>

                {importForm.mode === 'category' && (
                    <>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Select Category</label>
                        <select 
                            className="w-full p-3 border rounded-lg mb-6 outline-none focus:border-blue-500 bg-white" 
                            value={importForm.categoryId} 
                            onChange={e => setImportForm({...importForm, categoryId: e.target.value})}
                            required
                        >
                            <option value="">Select Category</option>
                            {sourceCategories.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </>
                )}

                <div className="flex justify-end gap-2 mt-6">
                    <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Import</button>
                </div>
            </form>
        </div>
      )}
    </div>
  );
}
