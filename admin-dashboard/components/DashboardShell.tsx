'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isBranchMode, setIsBranchMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkState = () => {
      const u = localStorage.getItem('admin_user');
      if (!u) {
        router.push('/');
        return;
      }
      const userData = JSON.parse(u);
      const userObj = userData.user || userData;
      setUser(userObj);

      const branchId = localStorage.getItem('selected_branch_id');
      // Branch Mode if: Branch Manager OR (Admin AND Branch Selected)
      const branchMode = userObj.role === 'branch_manager' || (userObj.role === 'org_admin' && !!branchId);
      setIsBranchMode(branchMode);
      setIsLoading(false);
    };

    checkState();
    window.addEventListener('branch-changed', checkState);
    return () => window.removeEventListener('branch-changed', checkState);
  }, [router]);

  if (isLoading) return null; // Or a loading spinner

  return (
    <div className="min-h-screen bg-slate-50 bg-grid-pattern">
      {isBranchMode ? (
        <>
          <Sidebar />
          <main className="ml-64 p-8 transition-all duration-300">
            {children}
          </main>
        </>
      ) : (
        <>
          <TopNav user={user} />
          <main className="max-w-7xl mx-auto p-8 transition-all duration-300">
            {children}
          </main>
        </>
      )}
    </div>
  );
}
