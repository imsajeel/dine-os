'use client';
import { SignOut } from '@phosphor-icons/react';
import Logo from './Logo';
import { useRouter } from 'next/navigation';

export default function TopNav({ user }: { user: any }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    localStorage.removeItem('selected_branch_id');
    router.push('/');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo className="h-8 w-auto text-slate-900" />
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Organization Admin</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800">{user.full_name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <SignOut weight="bold" className="text-xl" />
          </button>
        </div>
      </div>
    </header>
  );
}
