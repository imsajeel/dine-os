"use client";

import { useState, useEffect } from "react";
import POS from "@/components/POS";
import WaiterPOS from "@/components/WaiterPOS";
import Login from "@/components/Login";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [terminalType, setTerminalType] = useState<'pos' | 'waiter' | 'kds'>('pos');

  const handleLogin = () => {
    const type = localStorage.getItem('dineos_terminal_type') as 'pos' | 'waiter' | 'kds';
    if (type) setTerminalType(type);
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  if (terminalType === 'waiter') {
    return <WaiterPOS />;
  }

  if (terminalType === 'kds') {
    return <div className="flex items-center justify-center h-screen text-2xl font-bold text-slate-500">KDS View Coming Soon</div>;
  }

  return <POS />;
}
