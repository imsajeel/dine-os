"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

export default function Home() {
  const POS = dynamic(() => import('@/components/POS'), { ssr: false });
  const WaiterPOS = dynamic(() => import('@/components/WaiterPOS'), { ssr: false });
  const KDS = dynamic(() => import('@/components/KDS'), { ssr: false });
  const Login = dynamic(() => import('@/components/Login'), { ssr: false });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [terminalType, setTerminalType] = useState<'pos' | 'waiter' | 'kds'>('pos');
  const [isKDS, setIsKDS] = useState(false);

  useEffect(() => {
    // Check if this is a KDS terminal on mount
    const type = localStorage.getItem('dineos_terminal_type') as 'pos' | 'waiter' | 'kds';
    if (type === 'kds') {
      setIsKDS(true);
      setTerminalType('kds');
      // KDS doesn't require login, just needs org setup
      const orgId = localStorage.getItem('dineos_org_id');
      if (orgId) {
        setIsLoggedIn(true);
      }
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    const type = localStorage.getItem('dineos_terminal_type') as 'pos' | 'waiter' | 'kds';
    setTerminalType(type || 'pos');
  };

  // KDS doesn't need PIN login, just terminal setup
  if (isKDS && !isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  if (terminalType === 'waiter') {
    return <WaiterPOS />;
  }

  if (terminalType === 'kds') {
    return <KDS />;
  }

  return <POS />;
}
