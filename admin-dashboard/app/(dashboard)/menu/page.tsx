'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Trash, Pencil, ForkKnife, Image } from '@phosphor-icons/react';

export default function Menu() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  
  const [categoryForm, setCategoryForm] = useState({ name: '', branch_id: '' });
  const [itemForm, setItemForm] = useState({ 
    name: '', 
    price: '', 
    description: '', 
    category_id: '', 
    branch_id: '',
    image_url: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
    if (user.organization_id) {
        const [menuRes, branchesRes] = await Promise.all([
            api.get(`/menu/admin/${user.organization_id}`),
            api.get(`/branches?orgId=${user.organization_id}`)
        ]);
        setCategories(menuRes.data.categories);
        setItems(menuRes.data.items);
        setBranches(branchesRes.data);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
    await api.post('/menu/category', {
        ...categoryForm,
        organization_id: user.organization_id,
        branch_id: categoryForm.branch_id || null
    });
    setIsCategoryModalOpen(false);
    setCategoryForm({ name: '', branch_id: '' });
    fetchData();
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
    await api.post('/menu/item', {
        ...itemForm,
        organization_id: user.organization_id,
        price: parseFloat(itemForm.price),
        branch_id: itemForm.branch_id || null
    });
    setIsItemModalOpen(false);
    setItemForm({ name: '', price: '', description: '', category_id: '', branch_id: '', image_url: '' });
    fetchData();
  };

  const filteredItems = activeCategory === 'all' 
    ? items 
    : items.filter((i: any) => i.category_id === activeCategory);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Menu Management</h1>
        <div className="flex gap-3">
            <button onClick={() => setIsCategoryModalOpen(true)} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-slate-50 transition-colors">
                <Plus weight="bold" /> Add Category
            </button>
            <button onClick={() => setIsItemModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-blue-700 transition-colors">
                <Plus weight="bold" /> Add Item
            </button>
        </div>
      </div>

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
                            <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Pencil weight="bold" /></button>
                            <button className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash weight="bold" /></button>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleCreateCategory} className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                <h2 className="text-xl font-bold mb-4 text-slate-800">Add Category</h2>
                <input className="w-full p-3 border rounded-lg mb-3 outline-none focus:border-blue-500" placeholder="Category Name" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} required />
                
                <label className="block text-sm font-bold text-slate-700 mb-1">Branch (Optional)</label>
                <select className="w-full p-3 border rounded-lg mb-6 outline-none focus:border-blue-500 bg-white" value={categoryForm.branch_id} onChange={e => setCategoryForm({...categoryForm, branch_id: e.target.value})}>
                    <option value="">All Branches</option>
                    {branches.map((b: any) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>

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
            <form onSubmit={handleCreateItem} className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 text-slate-800">Add Menu Item</h2>
                
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
                
                <input className="w-full p-3 border rounded-lg mb-3 outline-none focus:border-blue-500" placeholder="Image URL" value={itemForm.image_url} onChange={e => setItemForm({...itemForm, image_url: e.target.value})} />

                <label className="block text-sm font-bold text-slate-700 mb-1">Branch (Optional)</label>
                <select className="w-full p-3 border rounded-lg mb-6 outline-none focus:border-blue-500 bg-white" value={itemForm.branch_id} onChange={e => setItemForm({...itemForm, branch_id: e.target.value})}>
                    <option value="">All Branches</option>
                    {branches.map((b: any) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>

                <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setIsItemModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Save</button>
                </div>
            </form>
        </div>
      )}
    </div>
  );
}
