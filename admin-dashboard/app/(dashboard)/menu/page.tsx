'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
  Plus, Trash, Pencil, ForkKnife, Image, DownloadSimple, ArrowsMerge,
  Coffee, Pizza, Hamburger, Wine, BeerBottle, 
  Cookie, IceCream, Fish, Carrot
} from '@phosphor-icons/react';
import BranchesManager from '@/components/BranchesManager';
import toast from 'react-hot-toast';

const AVAILABLE_ICONS = [
  { name: 'ForkKnife', component: ForkKnife },
  { name: 'Coffee', component: Coffee },
  { name: 'Pizza', component: Pizza },
  { name: 'Hamburger', component: Hamburger },
  { name: 'Wine', component: Wine },
  { name: 'BeerBottle', component: BeerBottle },
  { name: 'Cookie', component: Cookie },
  { name: 'IceCream', component: IceCream },
  { name: 'Fish', component: Fish },
  { name: 'Carrot', component: Carrot },
];

export default function Menu() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [modifierGroups, setModifierGroups] = useState([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [categoryForm, setCategoryForm] = useState({ name: '', branch_id: '', icon: '', is_active: true });
  const [itemForm, setItemForm] = useState({ 
    name: '', 
    price: '', 
    description: '', 
    category_id: '', 
    branch_id: '',
    image_url: '',
    is_available: true,
    modifier_group_ids: [] as string[]
  });

  const [importForm, setImportForm] = useState({
    sourceBranchId: '',
    mode: 'all' as 'all' | 'category' | 'item',
    categoryId: '',
    itemId: ''
  });
  const [sourceCategories, setSourceCategories] = useState<any[]>([]);
  const [sourceItems, setSourceItems] = useState<any[]>([]);

  const fetchSourceData = async (branchId: string) => {
    const storage = JSON.parse(localStorage.getItem('admin_user') || '{}');
    const user = storage.user || storage;
    if (user.organization_id && branchId) {
        const res = await api.get(`/menu/admin/${user.organization_id}?branchId=${branchId}`);
        setSourceCategories(res.data.categories);
        setSourceItems(res.data.items);
    }
  };

  const handleMerge = async () => {
    const branchId = localStorage.getItem('selected_branch_id');
    if (!branchId) return;
    
    if (!confirm('This will merge all duplicate categories (by name) into the one with the most items. This action cannot be undone. Are you sure?')) {
        return;
    }

    try {
        const res = await api.post('/menu/merge', { branchId });
        if (res.data.mergedCount > 0) {
            toast.success(`Merged ${res.data.mergedCount} duplicate categories.`);
            fetchData();
        } else {
            toast('No duplicate categories found.', { icon: 'ℹ️' });
        }
    } catch (error) {
        console.error('Merge failed', error);
        toast.error('Failed to merge categories');
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
        categoryId: importForm.categoryId,
        itemId: importForm.itemId
    });
    setIsImportModalOpen(false);
    setImportForm({ sourceBranchId: '', mode: 'all', categoryId: '', itemId: '' });
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
        
        const [menuRes, branchesRes, modifiersRes] = await Promise.all([
            api.get(`/menu/admin/${user.organization_id}${branchId ? `?branchId=${branchId}` : ''}`),
            api.get(`/branches?orgId=${user.organization_id}`),
            api.get(`/modifiers/${user.organization_id}${branchId ? `?branchId=${branchId}` : ''}`)
        ]);
        
        setCategories(menuRes.data.categories);
        setItems(menuRes.data.items);
        setBranches(branchesRes.data);
        setModifierGroups(modifiersRes.data);
    }
  };

  const openCategoryModal = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ 
        name: category.name, 
        branch_id: category.branch_id || '',
        icon: category.icon || '',
        is_active: category.is_active !== false
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', branch_id: '', icon: '', is_active: true });
    }
    setIsCategoryModalOpen(true);
  };

  const openItemModal = (item?: any) => {
    const selectedBranchId = localStorage.getItem('selected_branch_id');
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        price: item.price,
        description: item.description || '',
        category_id: item.category_id,
        branch_id: item.branch_id,
        image_url: item.image_url || '',
        is_available: item.is_available,
        modifier_group_ids: item.item_modifiers?.map((im: any) => im.modifier_group_id) || []
      });
    } else {
      setEditingItem(null);
      setItemForm({
        name: '',
        price: '',
        description: '',
        category_id: activeCategory !== 'all' ? activeCategory : (categories[0] as any)?.id || '',
        branch_id: selectedBranchId || (branches[0] as any)?.id || '',
        image_url: '',
        is_available: true,
        modifier_group_ids: []
      });
    }
    setIsItemModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const storage = JSON.parse(localStorage.getItem('admin_user') || '{}');
    const user = storage.user || storage;
    const branchId = localStorage.getItem('selected_branch_id');
    
    try {
      if (editingCategory) {
        await api.put(`/menu/category/${editingCategory.id}`, {
          ...categoryForm,
          organization_id: user.organization_id,
          branch_id: branchId || user.branch_id || null
        });
        toast.success('Category updated successfully!');
      } else {
        await api.post('/menu/category', {
          ...categoryForm,
          organization_id: user.organization_id,
          branch_id: branchId || user.branch_id || null
        });
        toast.success('Category created successfully!');
      }
      
      setIsCategoryModalOpen(false);
      setCategoryForm({ name: '', branch_id: '', icon: '', is_active: true });
      setEditingCategory(null);
      fetchData();
    } catch (error: any) {
      console.error('Failed to save category:', error);
      toast.error(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const storage = JSON.parse(localStorage.getItem('admin_user') || '{}');
    const user = storage.user || storage;
    const branchId = localStorage.getItem('selected_branch_id');
    
    const payload = {
      ...itemForm,
      organization_id: user.organization_id,
      price: parseFloat(itemForm.price),
      branch_id: branchId || user.branch_id || null
    };

    try {
      if (editingItem) {
        await api.put(`/menu/item/${editingItem.id}`, payload);
        toast.success('Menu item updated successfully!');
      } else {
        await api.post('/menu/item', payload);
        toast.success('Menu item created successfully!');
      }
      
      setIsItemModalOpen(false);
      setItemForm({ 
        name: '', 
        price: '', 
        description: '', 
        category_id: '', 
        branch_id: '', 
        image_url: '',
        is_available: true 
      });
      setEditingItem(null);
      fetchData();
    } catch (error: any) {
      console.error('Failed to save item:', error);
      toast.error(error.response?.data?.message || 'Failed to save menu item');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this category? All items in this category will also be deleted.')) {
      try {
        await api.delete(`/menu/category/${id}`);
        toast.success('Category deleted successfully!');
        fetchData();
      } catch (error: any) {
        console.error('Failed to delete category:', error);
        toast.error(error.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/menu/item/${id}`);
        toast.success('Menu item deleted successfully!');
        fetchData();
      } catch (error: any) {
        console.error('Failed to delete item:', error);
        toast.error(error.response?.data?.message || 'Failed to delete menu item');
      }
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
        </div>
        
        <div className="flex gap-3">
            <button onClick={handleMerge} disabled={!selectedBranchId && isAdmin} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <ArrowsMerge weight="bold" /> Merge Duplicates
            </button>
            <button onClick={() => setIsImportModalOpen(true)} disabled={!selectedBranchId && isAdmin} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <DownloadSimple weight="bold" /> Import
            </button>
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
                {categories.map((c: any) => {
                    const Icon = AVAILABLE_ICONS.find(i => i.name === c.icon)?.component;
                    return (
                        <button 
                            key={c.id}
                            onClick={() => setActiveCategory(c.id)}
                            className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${activeCategory === c.id ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                        >
                            {Icon && <Icon weight="fill" />}
                            {c.name}
                        </button>
                    );
                })}
              </div>
              
              {activeCategory !== 'all' && (
                  <div className="flex justify-end gap-2 mb-6">
                      <button 
                          onClick={() => {
                              const cat = categories.find((c: any) => c.id === activeCategory);
                              if (cat) openCategoryModal(cat);
                          }}
                          className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1"
                      >
                          <Pencil /> Edit Category
                      </button>
                      <button 
                          onClick={() => handleDeleteCategory(activeCategory)}
                          className="text-sm text-red-600 font-bold hover:underline flex items-center gap-1"
                      >
                          <Trash /> Delete Category
                      </button>
                  </div>
              )}

              <div className="relative">
                {activeCategory !== 'all' && categories.find((c: any) => c.id === activeCategory)?.is_active === false && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl border border-slate-200">
                        <div className="bg-white p-6 rounded-xl shadow-lg text-center border border-slate-100">
                            <div className="bg-red-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                <ForkKnife className="text-red-500 text-xl" weight="duotone" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">Category Disabled</h3>
                            <p className="text-slate-500 text-sm">This category is currently disabled and not visible to customers.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map((item: any) => (
                        <div key={item.id} className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group ${item.is_available === false ? 'opacity-60 grayscale' : ''}`}>
                            <div className="h-48 bg-slate-100 relative">
                                {item.is_available === false && (
                                    <div className="absolute top-2 right-2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
                                        Unavailable
                                    </div>
                                )}
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <Image weight="duotone" className="text-4xl" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openItemModal(item)} className="bg-white p-2 rounded-lg shadow-sm text-blue-600 hover:bg-blue-50">
                                        <Pencil weight="bold" />
                                    </button>
                                    <button onClick={() => handleDeleteItem(item.id)} className="bg-white p-2 rounded-lg shadow-sm text-red-600 hover:bg-red-50">
                                        <Trash weight="bold" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-slate-800">{item.name}</h3>
                                    <span className="font-bold text-blue-600">£{Number(item.price).toFixed(2)}</span>
                                </div>
                                <p className="text-sm text-slate-500 line-clamp-2">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
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
                <input className="w-full p-3 border rounded-lg mb-4 outline-none focus:border-blue-500" placeholder="Category Name" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} required />
                
                <label className="block text-sm font-bold text-slate-700 mb-2">Icon</label>
                <div className="grid grid-cols-5 gap-2 mb-6">
                    {AVAILABLE_ICONS.map((icon) => (
                        <button
                            key={icon.name}
                            type="button"
                            onClick={() => setCategoryForm({...categoryForm, icon: icon.name})}
                            className={`p-2 rounded-lg flex items-center justify-center transition-colors ${categoryForm.icon === icon.name ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            <icon.component weight="fill" className="text-xl" />
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-between mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <label htmlFor="is_active" className="text-sm font-bold text-slate-700 select-none cursor-pointer">Category Status</label>
                    <button 
                        type="button"
                        onClick={() => setCategoryForm({...categoryForm, is_active: !categoryForm.is_active})}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${categoryForm.is_active ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                        <span 
                            className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${categoryForm.is_active ? 'translate-x-6' : 'translate-x-0'}`} 
                        />
                    </button>
                </div>

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
                
                <div className="flex items-center justify-between mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <label htmlFor="is_available" className="text-sm font-bold text-slate-700 select-none cursor-pointer">Item Availability</label>
                    <button 
                        type="button"
                        onClick={() => setItemForm({...itemForm, is_available: !itemForm.is_available})}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${itemForm.is_available ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                        <span 
                            className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${itemForm.is_available ? 'translate-x-6' : 'translate-x-0'}`} 
                        />
                    </button>
                </div>

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
                
                <div className="mb-4">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Modifiers</label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg bg-slate-50">
                        {modifierGroups.map((group: any) => (
                            <label key={group.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-slate-100 rounded">
                                <input 
                                    type="checkbox" 
                                    checked={itemForm.modifier_group_ids.includes(group.id)}
                                    onChange={(e) => {
                                        const newIds = e.target.checked 
                                            ? [...itemForm.modifier_group_ids, group.id]
                                            : itemForm.modifier_group_ids.filter(id => id !== group.id);
                                        setItemForm({...itemForm, modifier_group_ids: newIds});
                                    }}
                                    className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-700">{group.name}</span>
                            </label>
                        ))}
                        {modifierGroups.length === 0 && (
                            <p className="text-xs text-slate-400 col-span-2 text-center py-2">No modifier groups available. Create them in the Modifiers page.</p>
                        )}
                    </div>
                </div>

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
                        fetchSourceData(e.target.value);
                    }}
                    required
                >
                    <option value="">Select Branch</option>
                    {branches.filter((b: any) => b.id !== selectedBranchId).map((b: any) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>

                <label className="block text-sm font-bold text-slate-700 mb-1">Import Mode</label>
                <div className="flex gap-4 mb-3 flex-wrap">
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
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="radio" 
                            name="mode" 
                            value="item" 
                            checked={importForm.mode === 'item'} 
                            onChange={() => setImportForm({...importForm, mode: 'item'})} 
                        />
                        <span className="text-slate-700">Specific Item</span>
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

                {importForm.mode === 'item' && (
                    <>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Select Item</label>
                        <select 
                            className="w-full p-3 border rounded-lg mb-6 outline-none focus:border-blue-500 bg-white" 
                            value={importForm.itemId} 
                            onChange={e => setImportForm({...importForm, itemId: e.target.value})}
                            required
                        >
                            <option value="">Select Item</option>
                            {sourceItems.map((i: any) => (
                                <option key={i.id} value={i.id}>{i.name} (£{Number(i.price).toFixed(2)})</option>
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
