'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Logo from '@/components/Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('admin_user', JSON.stringify(res.data));
      router.push('/dashboard');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 bg-grid-pattern">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-96">
        <div className="flex justify-center mb-8">
            <Logo className="h-12 w-auto" />
        </div>
        <h1 className="text-xl font-bold mb-6 text-center text-slate-800">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input 
                    type="email" 
                    placeholder="name@company.com" 
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
            </div>
            <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm shadow-sm hover:bg-blue-700 transition-colors">
                Sign In
            </button>
        </form>
      </div>
    </div>
  );
}
