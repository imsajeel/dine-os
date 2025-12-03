'use client';
import { useRouter } from 'next/navigation';
import { ChartBar } from '@phosphor-icons/react';
import BranchesManager from '@/components/BranchesManager';

export default function Branches() {
  const router = useRouter();
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900">Branches</h1>
        <button 
          onClick={() => router.push('/dashboard')}
          className="bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-slate-900 transition-colors"
        >
          <ChartBar weight="bold" />
          View Analytics
        </button>
      </div>
      <BranchesManager />
    </div>
  );
}
