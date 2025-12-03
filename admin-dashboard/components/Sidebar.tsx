'use client';
import { House, Storefront, Users, ForkKnife, SignOut, List } from '@phosphor-icons/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Logo from './Logo';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [branchName, setBranchName] = useState<string>('');

  useEffect(() => {
    const checkUser = () => {
        const u = localStorage.getItem('admin_user');
        if (!u) {
            router.push('/');
            return;
        }
        const data = JSON.parse(u);
        setUser(data.user || data);

        const bid = localStorage.getItem('selected_branch_id');
        setSelectedBranchId(bid);
        
        // If branch selected, try to find name (optional, or fetch)
        // For now just show ID or "Branch"
    };

    checkUser();
    window.addEventListener('branch-changed', checkUser);
    return () => window.removeEventListener('branch-changed', checkUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    localStorage.removeItem('selected_branch_id');
    router.push('/');
  };

  const clearBranchSelection = () => {
      localStorage.removeItem('selected_branch_id');
      setSelectedBranchId(null);
      window.dispatchEvent(new Event('branch-changed'));
      router.push('/dashboard');
  };

  if (!user) return null;

  const isAdmin = user.role === 'org_admin';
  const isBranchMode = selectedBranchId || user.role === 'branch_manager';

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col p-4 fixed left-0 top-0">
      <div className="mb-6 px-4">
        <Logo className="h-8 w-auto text-white mb-6" />
        {isBranchMode && isAdmin && (
            <button onClick={clearBranchSelection} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mb-2">
                &larr; Back to Organization
            </button>
        )}
        {isBranchMode && (
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isAdmin ? 'Branch View' : 'Branch Manager'}
            </div>
        )}
      </div>
      
      <nav className="flex-1 space-y-2">
        <Link href="/dashboard" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${pathname === '/dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
          <House weight="bold" className="text-xl" /> Dashboard
        </Link>
        
        {/* Org Admin Root Links */}
        {isAdmin && !isBranchMode && (
            <>
                <Link href="/branches" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${pathname === '/branches' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <Storefront weight="bold" className="text-xl" /> Branches
                </Link>
                {/* Add Settings or other Org level links here */}
            </>
        )}

        {/* Branch Context Links */}
        {isBranchMode && (
            <>
                <Link href="/menu" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${pathname === '/menu' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <ForkKnife weight="bold" className="text-xl" /> Menu
                </Link>

                <Link href="/modifiers" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${pathname === '/modifiers' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <List weight="bold" className="text-xl" /> Modifiers
                </Link>

                <Link href="/users" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${pathname === '/users' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <Users weight="bold" className="text-xl" /> Users
                </Link>
                {/* Add Modifiers, Tables etc here */}
            </>
        )}
      </nav>

      <div className="p-4 bg-slate-800 rounded-xl mb-4">
        <p className="font-bold text-sm">{user.full_name || 'User'}</p>
        <p className="text-xs text-slate-400 capitalize">{user.role?.replace('_', ' ')}</p>
        {user.branches && <p className="text-xs text-blue-400 mt-1">{user.branches.name}</p>}
      </div>

      <button onClick={handleLogout} className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-900/20 text-red-400 transition-colors">
        <SignOut weight="bold" className="text-xl" /> Logout
      </button>
    </aside>
  );
}
