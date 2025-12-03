import React, { useState, useEffect } from 'react';
import { FloppyDisk, User, Printer, Bell } from '@phosphor-icons/react';

export default function Settings() {
    const [user, setUser] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [settings, setSettings] = useState({
        printerSize: '80mm',
        soundEnabled: true,
        theme: 'light',
        branchId: ''
    });

    useEffect(() => {
        // Load settings from localStorage
        const savedSettings = localStorage.getItem('dineos_settings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }

        // Load user details
        const savedUser = localStorage.getItem('dineos_user_details');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        } else {
             const email = localStorage.getItem('dineos_user_email') || '';
             setUser(prev => ({ ...prev, email }));
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('dineos_settings', JSON.stringify(settings));
        localStorage.setItem('dineos_user_details', JSON.stringify(user));
        alert('Settings saved successfully!');
    };

    return (
        <div className="flex-1 bg-slate-50 h-full flex flex-col overflow-hidden">
            <header className="bg-white border-b border-slate-200 p-6 shrink-0">
                <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
            </header>
            
            <div className="p-8 overflow-y-auto max-w-3xl">
                {/* User Profile */}
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                        <User weight="duotone" className="text-blue-600 text-2xl" />
                        User Profile
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                            <input 
                                type="text" 
                                className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                                value={user.name}
                                onChange={e => setUser({...user, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                            <input 
                                type="email" 
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                                value={user.email}
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Phone</label>
                            <input 
                                type="tel" 
                                className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                                value={user.phone}
                                onChange={e => setUser({...user, phone: e.target.value})}
                            />
                        </div>
                    </div>
                </section>

                {/* App Settings */}
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                        <Printer weight="duotone" className="text-orange-600 text-2xl" />
                        App Settings
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Printer Paper Size</label>
                            <div className="grid grid-cols-2 gap-4">
                                {['80mm', '58mm'].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSettings({...settings, printerSize: size})}
                                        className={`p-4 rounded-xl border-2 font-bold transition-all ${settings.printerSize === size ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>

                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Branch ID</label>
                            <input 
                                type="text" 
                                className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                                value={settings.branchId || ''}
                                onChange={e => setSettings({...settings, branchId: e.target.value})}
                                placeholder="Enter Branch UUID"
                            />
                            <p className="text-xs text-slate-400 mt-1">Leave empty for all branches (Org Admin only)</p>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-3">
                                <Bell weight="duotone" className="text-slate-400 text-2xl" />
                                <div>
                                    <p className="font-bold text-slate-700">Sound Effects</p>
                                    <p className="text-sm text-slate-500">Play sounds on new orders</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={settings.soundEnabled}
                                    onChange={e => setSettings({...settings, soundEnabled: e.target.checked})}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </section>

                <button 
                    onClick={handleSave}
                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <FloppyDisk weight="bold" className="text-xl" />
                    Save Changes
                </button>
            </div>
        </div>
    );
}
