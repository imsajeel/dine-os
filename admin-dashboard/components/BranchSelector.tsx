'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { CaretDown } from '@phosphor-icons/react';

export default function BranchSelector({ onSelect }: { onSelect?: (branchId: string) => void }) {
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      const storage = JSON.parse(localStorage.getItem('admin_user') || '{}');
      const user = storage.user || storage;
      if (user.organization_id) {
        try {
          const res = await api.get(`/branches?orgId=${user.organization_id}`);
          setBranches(res.data);
          
          // Load saved selection or default to first
          const saved = localStorage.getItem('selected_branch_id');
          if (saved && res.data.find((b: any) => b.id === saved)) {
            setSelectedBranch(saved);
            if (onSelect) onSelect(saved);
          } else if (res.data.length > 0) {
            // Do not auto select for now, force user to select if requirement says "have to select"
            // But usually auto-select first is better UX. 
            // The requirement says "admin have to select branch before editing menu and users"
            // So maybe we start with null/empty.
          }
        } catch (err) {
          console.error('Failed to fetch branches', err);
        }
      }
    };
    fetchBranches();
  }, []);

  const handleSelect = (branchId: string) => {
    setSelectedBranch(branchId);
    localStorage.setItem('selected_branch_id', branchId);
    setIsOpen(false);
    if (onSelect) onSelect(branchId);
    // Trigger a custom event so other components can listen if needed
    window.dispatchEvent(new Event('branch-changed'));
  };

  const currentBranch = branches.find(b => b.id === selectedBranch);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white p-3 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors border border-slate-200 text-slate-700 shadow-sm"
      >
        <span className="truncate font-bold">{currentBranch ? currentBranch.name : 'Select Branch'}</span>
        <CaretDown weight="bold" className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-50">
          {branches.map(branch => (
            <button
              key={branch.id}
              onClick={() => handleSelect(branch.id)}
              className={`w-full text-left p-3 text-sm hover:bg-slate-50 transition-colors ${selectedBranch === branch.id ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600'}`}
            >
              {branch.name}
            </button>
          ))}
          {branches.length === 0 && (
            <div className="p-3 text-xs text-slate-500 text-center">No branches found</div>
          )}
        </div>
      )}
    </div>
  );
}
