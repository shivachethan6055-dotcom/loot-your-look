import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Building2,
  FileSpreadsheet,
  Code2,
  Heart,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const {
    setPortal,
    setActivePolicyModal,
    setIsGoogleSheetsModalOpen,
    setSelectedDepartment,
  } = useApp();

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800 text-xs">
      {/* 4 Trust Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-stone-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-stone-800 text-rose-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">Strictly Clothing Only</h4>
              <p className="text-stone-400 mt-1 leading-relaxed">
                100% apparel marketplace. Zero shoes, bags, jewellery, or accessories permitted.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-stone-800 text-amber-500">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">Direct Indian Wholesalers</h4>
              <p className="text-stone-400 mt-1 leading-relaxed">
                Direct from verified textile mills in Surat, Tirupur, Jaipur, Ludhiana & Mumbai.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-stone-800 text-blue-500">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">Express National Shipping</h4>
              <p className="text-stone-400 mt-1 leading-relaxed">
                Fast doorstep dispatch via Delhivery & BlueDart across 19,000+ Indian pincodes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-stone-800 text-emerald-500">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">10-Day Easy Returns</h4>
              <p className="text-stone-400 mt-1 leading-relaxed">
                Hassle-free size exchange and prompt refunds on all unworn clothing items.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-black text-xl text-white tracking-tight">
                Loot Your Look
              </span>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
              Your Style. Your Choice. Your Look. India's dedicated clothing-only marketplace connecting retail customers with verified textile manufacturers and approved clothing wholesalers.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setIsGoogleSheetsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-emerald-400 font-bold text-[11px] cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Google Sheets Sync
              </button>
              <button
                onClick={() => setActivePolicyModal('backend-docs')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold text-[11px] cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5" />
                Spring Boot 3 Specs
              </button>
            </div>
          </div>

          {/* Clothing Categories */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Clothing Departments
            </h4>
            <ul className="space-y-2 text-stone-400 text-xs">
              <li>
                <button
                  onClick={() => {
                    setPortal('customer');
                    setSelectedDepartment('Men');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Men's Clothing (Shirts, Kurtas, T-Shirts)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setPortal('customer');
                    setSelectedDepartment('Women');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Women's Clothing (Sarees, Kurtis, Dresses)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setPortal('customer');
                    setSelectedDepartment('Kids');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Kids' Clothing (Ethnic Wear, Sets)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setPortal('customer');
                    setSelectedDepartment('All');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Seasonal Winterwear & Hoodies
                </button>
              </li>
            </ul>
          </div>

          {/* Portals & Business */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Wholesaler & Portals
            </h4>
            <ul className="space-y-2 text-stone-400 text-xs">
              <li>
                <button
                  onClick={() => setPortal('wholesaler')}
                  className="hover:text-white transition-colors cursor-pointer text-amber-400 font-semibold"
                >
                  Wholesaler Seller Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => setPortal('wholesaler')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Register Wholesale Business
                </button>
              </li>
              <li>
                <button
                  onClick={() => setPortal('admin')}
                  className="hover:text-white transition-colors cursor-pointer text-indigo-400 font-semibold"
                >
                  Marketplace Admin Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicyModal('contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Grievance Officer & Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Consumer Policies (India)
            </h4>
            <ul className="space-y-2 text-stone-400 text-xs">
              <li>
                <button
                  onClick={() => setActivePolicyModal('terms')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicyModal('privacy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Privacy Policy (DPDPA)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicyModal('shipping')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Shipping & Delivery Terms
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicyModal('return')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  10-Day Return & Refund Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicyModal('cancellation')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Order Cancellation
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Compliance */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
        <p>
          © 2026 Loot Your Look Marketplace Private Limited. All rights reserved. Registered under Indian Companies Act.
        </p>
        <p className="flex items-center gap-1">
          Made for Indian Fashion Shoppers & Textile Wholesalers • Verified Clothing Only
        </p>
      </div>
    </footer>
  );
};
