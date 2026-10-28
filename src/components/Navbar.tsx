import React, { useState } from 'react';
import {
  ShoppingBag,
  Heart,
  Search,
  ShieldCheck,
  Building2,
  User as UserIcon,
  FileSpreadsheet,
  Code2,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClothingDepartment } from '../types';

export const Navbar: React.FC = () => {
  const {
    portal,
    setPortal,
    cart,
    wishlist,
    setIsCartOpen,
    setIsAuthModalOpen,
    currentUser,
    searchQuery,
    setSearchQuery,
    selectedDepartment,
    setSelectedDepartment,
    setIsGoogleSheetsModalOpen,
    setActivePolicyModal,
    googleUser,
    products,
    wholesalers,
    orders,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const pendingProductsCount = products.filter((p) => p.status === 'PENDING_APPROVAL').length;
  const pendingWholesalersCount = wholesalers.filter((w) => w.status === 'PENDING').length;
  const pendingAdminTasks = pendingProductsCount + pendingWholesalersCount;

  const departments: (ClothingDepartment | 'All')[] = ['All', 'Men', 'Women', 'Kids'];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs transition-all">
      {/* Top Banner: Clothing-Only Policy & India Wholesale Direct */}
      <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded-xs text-[10px] tracking-wider uppercase">
              Strict Policy
            </span>
            <span className="hidden sm:inline">
              100% Verified Clothing Marketplace — Zero shoes, bags or accessories. Direct from Surat, Tirupur, Jaipur & Ludhiana textile hubs.
            </span>
            <span className="sm:hidden">Clothing-Only Marketplace — Direct Wholesale</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGoogleSheetsModalOpen(true)}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-[11px]"
              title="Google Sheets Live Sync"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {googleUser ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    Google Sheets Active <CheckCircle2 className="w-2.5 h-2.5 inline" />
                  </span>
                ) : (
                  'Connect Google Sheets'
                )}
              </span>
            </button>
            <span className="text-stone-700">|</span>
            <button
              onClick={() => setActivePolicyModal('backend-docs')}
              className="flex items-center gap-1 text-amber-300 hover:text-amber-200 transition-colors cursor-pointer text-[11px]"
              title="View Spring Boot 3 Java 21 & MySQL Schema Architecture"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Java 21 / Spring Boot 3 Specs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Tagline */}
          <div
            onClick={() => {
              setPortal('customer');
              setSelectedDepartment('All');
            }}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight text-stone-900 group-hover:text-rose-600 transition-colors">
                  Loot Your Look
                </span>
                <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded-full border border-rose-200">
                  INDIA
                </span>
              </div>
              <p className="text-[11px] font-medium text-stone-500 tracking-wide uppercase">
                Your Style. Your Choice. Your Look.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md relative mx-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (portal !== 'customer') setPortal('customer');
              }}
              placeholder="Search shirts, sarees, kurtas, denim, hoodies..."
              className="w-full bg-stone-100/90 text-stone-900 placeholder-stone-500 text-sm pl-10 pr-4 py-2.5 rounded-full border border-stone-200 focus:outline-hidden focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20 transition-all"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Portal Switcher & Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* 3-Way Portal Navigator Pill */}
            <div className="hidden lg:flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                onClick={() => setPortal('customer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  portal === 'customer'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-rose-500" />
                Customer
              </button>

              <button
                onClick={() => setPortal('wholesaler')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer relative ${
                  portal === 'wholesaler'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                Wholesaler
              </button>

              <button
                onClick={() => setPortal('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer relative ${
                  portal === 'admin'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Admin
                {pendingAdminTasks > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 absolute -top-0.5 -right-0.5 animate-ping" />
                )}
              </button>
            </div>

            {/* Wishlist */}
            <button
              onClick={() => {
                if (portal !== 'customer') setPortal('customer');
                // Scroll to customer dashboard or open wishlist
                setActivePolicyModal(null);
              }}
              className="relative p-2 text-stone-600 hover:text-rose-600 hover:bg-stone-50 rounded-full transition-colors cursor-pointer"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-2 rounded-full text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartTotalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-stone-900">
                    {cartTotalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-bold">Cart</span>
            </button>

            {/* User Profile / Portal Switch Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 p-1.5 text-stone-700 hover:bg-stone-100 rounded-full border border-stone-200 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-xs font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {profileDropdownOpen && (
                <div
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="text-xs text-stone-400 font-medium">Logged in as</p>
                    <p className="text-sm font-bold text-stone-900 truncate">{currentUser.name}</p>
                    <span className="inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                      {currentUser.role}
                    </span>
                  </div>

                  <div className="py-1">
                    <div className="px-3 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                      Switch Active Portal
                    </div>
                    <button
                      onClick={() => {
                        setPortal('customer');
                        setProfileDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-stone-50 cursor-pointer ${
                        portal === 'customer' ? 'font-bold text-rose-600 bg-rose-50/50' : 'text-stone-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-rose-500" />
                        Customer Storefront
                      </span>
                      {portal === 'customer' && <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />}
                    </button>

                    <button
                      onClick={() => {
                        setPortal('wholesaler');
                        setProfileDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-stone-50 cursor-pointer ${
                        portal === 'wholesaler' ? 'font-bold text-amber-600 bg-amber-50/50' : 'text-stone-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-amber-600" />
                        Wholesaler Portal
                      </span>
                      {portal === 'wholesaler' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                    </button>

                    <button
                      onClick={() => {
                        setPortal('admin');
                        setProfileDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-stone-50 cursor-pointer ${
                        portal === 'admin' ? 'font-bold text-indigo-600 bg-indigo-50/50' : 'text-stone-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        Admin Portal
                      </span>
                      {portal === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  </div>

                  <div className="border-t border-stone-100 pt-1">
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-stone-400" />
                      Switch Role / Accounts
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Category Navigation Bar (Visible in Customer Storefront) */}
        {portal === 'customer' && (
          <nav className="border-t border-stone-100 py-2.5 flex items-center justify-between overflow-x-auto no-scrollbar text-xs font-semibold text-stone-600 gap-6">
            <div className="flex items-center gap-6 shrink-0">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`transition-colors whitespace-nowrap cursor-pointer pb-1 relative ${
                    selectedDepartment === dept
                      ? 'text-rose-600 font-bold border-b-2 border-rose-600'
                      : 'hover:text-stone-900'
                  }`}
                >
                  {dept === 'All' ? 'All Clothing' : `${dept}'s Clothing`}
                </button>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-5 text-stone-500 shrink-0 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                ★ 10-Day Easy Returns on Clothing
              </span>
              <span className="text-stone-400">•</span>
              <span>Fast Dispatch via BlueDart & Delhivery</span>
              <span className="text-stone-400">•</span>
              <span>Cash on Delivery Available</span>
            </div>
          </nav>
        )}
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 px-4 pt-3 pb-6 space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search garments..."
              className="w-full bg-stone-100 text-stone-900 text-sm pl-10 pr-4 py-2 rounded-lg border border-stone-200"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
            <button
              onClick={() => {
                setPortal('customer');
                setMobileMenuOpen(false);
              }}
              className={`p-2 rounded-lg border ${
                portal === 'customer' ? 'bg-rose-50 border-rose-400 text-rose-700' : 'bg-stone-50 text-stone-700'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => {
                setPortal('wholesaler');
                setMobileMenuOpen(false);
              }}
              className={`p-2 rounded-lg border ${
                portal === 'wholesaler' ? 'bg-amber-50 border-amber-400 text-amber-700' : 'bg-stone-50 text-stone-700'
              }`}
            >
              Wholesaler
            </button>
            <button
              onClick={() => {
                setPortal('admin');
                setMobileMenuOpen(false);
              }}
              className={`p-2 rounded-lg border ${
                portal === 'admin' ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'bg-stone-50 text-stone-700'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
