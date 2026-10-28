import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ClothingCatalog } from './components/ClothingCatalog';
import { CustomerDashboard } from './components/CustomerDashboard';
import { WholesalerPortal } from './components/WholesalerPortal';
import { AdminPortal } from './components/AdminPortal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SizeChartModal } from './components/SizeChartModal';
import { GoogleSheetsExportModal } from './components/GoogleSheetsExportModal';
import { PoliciesModal } from './components/PoliciesModal';
import { AuthModal } from './components/AuthModal';
import {
  Package,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Truck,
  RotateCcw,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    portal,
    selectedProductDetail,
    setSelectedProductDetail,
    isSizeChartOpen,
    setIsSizeChartOpen,
    toasts,
    removeToast,
  } = useApp();

  const [customerView, setCustomerView] = useState<'catalog' | 'dashboard'>('catalog');

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-3.5 rounded-2xl shadow-xl border text-xs font-semibold flex items-center justify-between gap-3 pointer-events-auto animate-in slide-in-from-bottom duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-950 text-emerald-100 border-emerald-800'
                : toast.type === 'error'
                ? 'bg-rose-950 text-rose-100 border-rose-800'
                : 'bg-stone-900 text-stone-100 border-stone-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-amber-400 shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Main Header / Navigation */}
      <Navbar />

      {/* Body Area */}
      <main className="flex-1">
        {portal === 'customer' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Customer Storefront Sub-nav: Catalog vs My Orders Dashboard */}
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-stone-200/60">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCustomerView('catalog')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    customerView === 'catalog'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 bg-white border border-stone-200'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Explore Clothing Store
                </button>
                <button
                  onClick={() => setCustomerView('dashboard')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    customerView === 'dashboard'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 bg-white border border-stone-200'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  My Orders & Tracking
                </button>
              </div>

              <span className="text-[11px] text-stone-500 hidden sm:inline">
                Verified Indian Wholesalers: Surat, Tirupur, Jaipur, Ludhiana, Mumbai
              </span>
            </div>

            {customerView === 'catalog' ? <ClothingCatalog /> : <CustomerDashboard />}
          </div>
        )}

        {portal === 'wholesaler' && <WholesalerPortal />}

        {portal === 'admin' && <AdminPortal />}
      </main>

      {/* Modals */}
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <ProductDetailModal
        product={selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
      />
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        category={selectedProductDetail?.category || 'Shirts'}
      />
      <GoogleSheetsExportModal />
      <PoliciesModal />
      <AuthModal />

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
