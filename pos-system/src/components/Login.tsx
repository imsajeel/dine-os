"use client";

import React, { useState, useEffect } from 'react';
import { Buildings, Lock, CaretRight, CircleNotch, ArrowCounterClockwise, Envelope, Key, Backspace } from '@phosphor-icons/react';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'setup' | 'login'>('setup');
  const [error, setError] = useState<string | null>(null);
  
  // Setup State
  const [orgId, setOrgId] = useState('');
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
    const savedOrgName = localStorage.getItem('dineos_org_name'); 
    
    if (token && savedOrgId) {
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

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Simulate API Authentication
    setTimeout(() => {
      // Validation Logic
      if (orgId !== "47d16db1-d727-4817-bd42-d646417a5e0b") {
        setError("Invalid Organization ID");
        setIsLoading(false);
        return;
      }
      if (adminEmail !== "admin@coffee-me.com") {
        setError("Invalid Admin Email");
        setIsLoading(false);
        return;
      }
      if (adminPassword !== "admin_password_123") {
        setError("Invalid Password");
        setIsLoading(false);
        return;
      }

      // In a real app, this would validate against the backend and return a JWT
      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_token";
      const mockOrgName = "Coffee Me"; // This would come from API
      
      localStorage.setItem('dineos_org_id', orgId);
      localStorage.setItem('dineos_auth_token', mockToken);
      localStorage.setItem('dineos_org_name', mockOrgName);
      localStorage.setItem('dineos_terminal_type', terminalType);
      
      setOrgName(mockOrgName);
      setStep('login');
      setIsLoading(false);
    }, 1500);
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
      localStorage.removeItem('dineos_org_id');
      localStorage.removeItem('dineos_auth_token');
      localStorage.removeItem('dineos_org_name');
      localStorage.removeItem('dineos_terminal_type');
      setOrgId('');
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
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 mx-auto mb-6">
                <svg width="32" height="32" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                    <path d="M 154 51 Q 191 2 256 0 Q 321 2 358 51 Q 383 33 416 32 Q 427 32 438 35 Q 471 43 491 69 Q 512 94 512 128 Q 512 139 510 150 Q 502 188 488 227 Q 473 266 461 292 Q 449 319 448 320 Q 448 320 448 320 L 374 320 L 374 320 L 400 163 L 400 163 Q 401 148 387 144 Q 372 143 368 157 L 341 320 L 341 320 L 272 320 L 272 320 L 272 160 L 272 160 Q 271 145 256 144 Q 241 145 240 160 L 240 320 L 240 320 L 171 320 L 171 320 L 144 157 L 144 157 Q 140 143 125 144 Q 111 148 112 163 L 138 320 L 138 320 L 64 320 L 64 320 Q 63 319 51 292 Q 39 266 24 227 Q 10 188 3 150 Q 0 139 0 128 Q 0 94 21 69 Q 41 43 74 35 Q 85 32 96 32 Q 129 33 154 51 L 154 51 Z M 448 448 Q 447 475 429 493 L 429 493 L 429 493 Q 411 511 384 512 L 128 512 L 128 512 Q 101 511 83 493 Q 65 475 64 448 L 64 352 L 64 352 L 448 352 L 448 352 L 448 448 L 448 448 Z" fill="currentColor"/>
                </svg>
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
