'use client';
import { House, Storefront, Users, ForkKnife, SignOut } from '@phosphor-icons/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem('admin_user');
    if (!u) router.push('/');
    else setUser(JSON.parse(u));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    router.push('/');
  };

  if (!user) return null;

  const isAdmin = user.role === 'org_admin';

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col p-4 fixed left-0 top-0">
      <div className="text-2xl font-bold mb-8 px-4 flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
        RestroOS
      </div>
      
      <nav className="flex-1 space-y-2">
        <Link href="/dashboard" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${pathname === '/dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
          <House weight="bold" className="text-xl" /> Dashboard
        </Link>
        
        {isAdmin && (
            <Link href="/branches" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${pathname === '/branches' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Storefront weight="bold" className="text-xl" /> Branches
            </Link>
        )}

        <Link href="/menu" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${pathname === '/menu' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
          <ForkKnife weight="bold" className="text-xl" /> Menu
        </Link>

        <Link href="/users" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${pathname === '/users' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
          <Users weight="bold" className="text-xl" /> Users
        </Link>
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
