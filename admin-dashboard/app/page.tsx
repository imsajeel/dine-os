'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

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
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-slate-800">Admin Login</h1>
        <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={email}
            onChange={e => setEmail(e.target.value)}
        />
        <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-3 mb-6 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={password}
            onChange={e => setPassword(e.target.value)}
        />
        <button className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">Login</button>
      </form>
    </div>
  );
}
