import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Building2,
  ShieldCheck,
  ShoppingBag,
  Mail,
  Lock,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User, UserRole } from '../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUser,
    setCurrentUser,
    setPortal,
    setActiveWholesalerId,
    handleGoogleSignIn,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'switch_preset' | 'custom_login'>('switch_preset');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');

  if (!isAuthModalOpen) return null;

  const handleSelectPreset = (role: UserRole, presetName: string, presetEmail: string, wholesalerId?: string) => {
    const user: User = {
      id: 'u_' + role + '_' + Date.now(),
      name: presetName,
      email: presetEmail,
      phone: '+91 98450 12345',
      role,
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(user);
    setPortal(role);
    if (wholesalerId) {
      setActiveWholesalerId(wholesalerId);
    }
    setIsAuthModalOpen(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter your email and password.', 'error');
      return;
    }

    const user: User = {
      id: 'u_' + selectedRole + '_' + Date.now(),
      name: name.trim() || (selectedRole === 'admin' ? 'Marketplace Admin' : 'Customer Account'),
      email: email.trim(),
      phone: phone.trim(),
      role: selectedRole,
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(user);
    setPortal(selectedRole);
    setIsAuthModalOpen(false);
    addToast(`Authenticated as ${user.name} (${selectedRole.toUpperCase()})`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h3 className="font-extrabold text-stone-900 text-lg">
              Role & Portal Authentication
            </h3>
            <p className="text-xs text-stone-500">
              Select or sign in to your dedicated portal
            </p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-bold text-stone-600 my-4">
          <button
            onClick={() => setActiveTab('switch_preset')}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'switch_preset' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
            }`}
          >
            Instant Role Switcher
          </button>
          <button
            onClick={() => setActiveTab('custom_login')}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'custom_login' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
            }`}
          >
            Custom Login / Register
          </button>
        </div>

        {activeTab === 'switch_preset' ? (
          <div className="space-y-3">
            <p className="text-xs text-stone-500">
              Quickly test the marketplace experience across all 3 integrated portals:
            </p>

            {/* Customer Preset */}
            <div
              onClick={() => handleSelectPreset('customer', 'Shiva Chethan', 'shivachethan6055@gmail.com')}
              className="p-3.5 rounded-2xl border border-stone-200 hover:border-rose-400 hover:bg-rose-50/40 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-stone-900 text-xs">Shiva Chethan</span>
                    <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-md">
                      Customer
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    shivachethan6055@gmail.com • Bengaluru Delivery Address
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Switch →
              </span>
            </div>

            {/* Wholesaler Surat Preset */}
            <div
              onClick={() =>
                handleSelectPreset(
                  'wholesaler',
                  'Rajeshbhai Patel',
                  'rajesh@suratheritagesilks.in',
                  'ws_surat_01'
                )
              }
              className="p-3.5 rounded-2xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/40 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-stone-900 text-xs">Rajeshbhai Patel</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-md">
                      Wholesaler
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Surat Heritage Silks & Sarees • Ring Road Hub, Gujarat
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity">
                Switch →
              </span>
            </div>

            {/* Wholesaler Tirupur Preset */}
            <div
              onClick={() =>
                handleSelectPreset(
                  'wholesaler',
                  'K. Senthil Kumar',
                  'orders@tirupurprime.com',
                  'ws_tirupur_02'
                )
              }
              className="p-3.5 rounded-2xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/40 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-stone-900 text-xs">K. Senthil Kumar</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-md">
                      Wholesaler
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Tirupur Prime Knitwear Mills • Cotton City, Tamil Nadu
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity">
                Switch →
              </span>
            </div>

            {/* Admin Preset */}
            <div
              onClick={() => handleSelectPreset('admin', 'Admin Superuser', 'compliance@lootyourlook.in')}
              className="p-3.5 rounded-2xl border border-stone-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-stone-900 text-xs">Admin Superuser</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded-md">
                      Admin
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Full catalog moderation, wholesaler approvals & commission reports
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity">
                Switch →
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Select Role Portal:</label>
              <div className="grid grid-cols-3 gap-2 text-center font-bold">
                <button
                  type="button"
                  onClick={() => setSelectedRole('customer')}
                  className={`p-2 rounded-xl border cursor-pointer ${
                    selectedRole === 'customer'
                      ? 'border-rose-500 bg-rose-50 text-rose-700'
                      : 'border-stone-200 text-stone-600'
                  }`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('wholesaler')}
                  className={`p-2 rounded-xl border cursor-pointer ${
                    selectedRole === 'wholesaler'
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-stone-200 text-stone-600'
                  }`}
                >
                  Wholesaler
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`p-2 rounded-xl border cursor-pointer ${
                    selectedRole === 'admin'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-stone-200 text-stone-600'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Full Name / Business Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full p-2.5 rounded-xl border border-stone-200"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.in"
                className="w-full p-2.5 rounded-xl border border-stone-200"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 rounded-xl border border-stone-200"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl cursor-pointer"
            >
              Sign In to {selectedRole.toUpperCase()} Portal
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
