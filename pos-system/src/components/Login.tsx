"use client";

import React, { useState, useEffect } from 'react';
import { Buildings, Lock, CaretRight, CircleNotch, ArrowCounterClockwise, Envelope, Key, Backspace } from '@phosphor-icons/react';
import api from '@/lib/api';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'setup' | 'login'>('setup');
  const [error, setError] = useState<string | null>(null);
  
  // Setup State
  const [orgId, setOrgId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [terminalType, setTerminalType] = useState<'pos' | 'waiter' | 'kds'>('pos');

  // Login State
  const [pin, setPin] = useState('');
  const [orgName, setOrgName] = useState('');

  useEffect(() => {
    // Check for saved Token and Org ID
    const token = localStorage.getItem('dineos_auth_token');
    const savedOrgId = localStorage.getItem('dineos_org_id');
    const savedBranchId = localStorage.getItem('dineos_branch_id');
    const savedOrgName = localStorage.getItem('dineos_org_name'); 
    
    if (token && savedOrgId && savedBranchId) {
      setStep('login');
      if (savedOrgName) {
        setOrgName(savedOrgName);
      } else if (savedOrgId === "47d16db1-d727-4817-bd42-d646417a5e0b") {
        // Fallback for existing sessions
        setOrgName("Coffee Me");
        localStorage.setItem('dineos_org_name', "Coffee Me");
      }
    }
  }, []);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
        // 1. Authenticate Admin
        const loginRes = await api.post('/auth/login', {
            email: adminEmail,
            password: adminPassword
        });

        const { access_token, user } = loginRes.data;
        
        // Verify Org ID matches
        if (user.organization_id !== orgId) {
            setError("Organization ID does not match the admin account.");
            setIsLoading(false);
            return;
        }

        // 2. Validate Branch
        localStorage.setItem('dineos_auth_token', access_token);
        
        const branchesRes = await api.get(`/branches?orgId=${orgId}`);
        const branches = branchesRes.data;
        
        const branch = branches.find((b: any) => b.id === branchId);

        if (!branch) {
            setError("Invalid Branch ID. This branch does not belong to your organization.");
            localStorage.removeItem('dineos_auth_token'); // Clean up
            setIsLoading(false);
            return;
        }

        // 3. Save Session
        localStorage.setItem('dineos_branch_id', branchId);
        localStorage.setItem('dineos_org_id', orgId);
        localStorage.setItem('dineos_org_name', branch.name);
        localStorage.setItem('dineos_terminal_type', terminalType);
        
        setOrgName(branch.name);
        
        if (terminalType === 'kds') {
            setIsLoading(false);
            onLogin();
        } else {
            setStep('login');
            setIsLoading(false);
        }

    } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || "Authentication failed. Please check your credentials.");
        setIsLoading(false);
    }
  };



  const handleLogin = (currentPin: string) => {
    setIsLoading(true);
    setError(null);
    
    // Simulate API call for PIN login
    setTimeout(() => {
      if (currentPin !== "1234") {
        setError("Invalid PIN. Please try again.");
        setPin('');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  const handlePinInput = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      // Auto-submit on 4th digit
      if (newPin.length === 4) {
        handleLogin(newPin);
      }
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      setPin(prev => prev.slice(0, -1));
      setError(null); // Clear error on edit
    } else {
      resetTerminal();
    }
  };

  const resetTerminal = () => {
    if (confirm('Are you sure you want to reset this terminal? This will clear all configuration.')) {
      localStorage.removeItem('dineos_branch_id');
      localStorage.removeItem('dineos_auth_token');
      localStorage.removeItem('dineos_org_name');
      localStorage.removeItem('dineos_terminal_type');
      setOrgId('');
      setBranchId('');
      setAdminEmail('');
      setAdminPassword('');
      setPin('');
      setOrgName('');
      setStep('setup');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 bg-grid-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-zoom-in relative">
        
        {/* Header */}
        <div className="p-8 pb-0 text-center">
          {step === 'setup' ? (
            <>
              <div className="mx-auto mb-6 flex justify-center">
                <img src="/dine-os-light.png" alt="DineOS" className="h-12" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">Terminal Setup</h1>
              <p className="text-slate-500">Authorize this terminal</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">{orgName}</h1>
              <p className="text-slate-500">Enter PIN to access</p>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-8">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex flex-col gap-2 text-red-600 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
              <p className="text-xs text-red-400 pl-5">
                If you don't have these details, please contact customer support.
              </p>
            </div>
          )}
          
          {step === 'setup' ? (
            <form onSubmit={handleSetup} className="space-y-5 animate-fade-in">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Organization ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Buildings weight="bold" className="text-lg" />
                  </div>
                  <input 
                    type="text" 
                    value={orgId}
                    onChange={(e) => setOrgId(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    placeholder="e.g. org_12345678"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Branch ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Buildings weight="bold" className="text-lg" />
                  </div>
                  <input 
                    type="text" 
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    placeholder="e.g. branch_12345678"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Admin Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Envelope weight="bold" className="text-lg" />
                  </div>
                  <input 
                    type="email" 
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    placeholder="admin@company.com"
                    required
                  />
                </div>
              </div>



              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Key weight="bold" className="text-lg" />
                  </div>
                  <input 
                    type="password" 
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Terminal Type</label>
                <div className="relative">
                  <select 
                    value={terminalType}
                    onChange={(e) => setTerminalType(e.target.value as any)}
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium appearance-none"
                  >
                    <option value="pos">Till (POS)</option>
                    <option value="waiter">Waiter Pad</option>
                    <option value="kds">Kitchen Display System (KDS)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                    <CaretRight weight="bold" className="text-lg rotate-90" />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 mt-4"
              >
                {isLoading ? (
                  <CircleNotch weight="bold" className="animate-spin text-xl" />
                ) : (
                  <>
                    <span>Authorize Terminal</span>
                    <CaretRight weight="bold" className="text-xl group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* PIN Display */}
              <div className="flex justify-center gap-4 mb-8">
                {[0, 1, 2, 3].map((i) => (
                  <div 
                    key={i}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      i < pin.length ? 'bg-blue-600 scale-110' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handlePinInput(num.toString())}
                    disabled={isLoading}
                    className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-200 text-2xl font-bold text-slate-700 hover:bg-white hover:border-blue-200 hover:text-blue-600 hover:shadow-md transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {num}
                  </button>
                ))}
                <div className="h-16 w-16"></div> {/* Empty slot */}
                <button
                  onClick={() => handlePinInput('0')}
                  disabled={isLoading}
                  className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-200 text-2xl font-bold text-slate-700 hover:bg-white hover:border-blue-200 hover:text-blue-600 hover:shadow-md transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  0
                </button>
                <button
                  onClick={handleBackspace}
                  disabled={isLoading}
                  className={`h-16 w-16 rounded-2xl bg-slate-50 border border-slate-200 text-xl hover:shadow-md transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                    pin.length === 0 
                      ? 'text-red-500 hover:bg-red-50 hover:border-red-200' 
                      : 'text-slate-500 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  {pin.length === 0 ? (
                    <ArrowCounterClockwise weight="bold" />
                  ) : (
                    <Backspace weight="bold" />
                  )}
                </button>
              </div>

              {isLoading && (
                <div className="flex justify-center mt-4">
                  <CircleNotch weight="bold" className="animate-spin text-2xl text-blue-600" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium">
            Protected by DineOS Security • v1.0.0
          </p>
        </div>

      </div>
    </div>
  );
}
