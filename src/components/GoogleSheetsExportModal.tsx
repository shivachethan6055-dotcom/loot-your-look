import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Building2,
  Package,
  ShoppingBag,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  exportOrdersToGoogleSheets,
  exportSettlementsToGoogleSheets,
  exportCatalogToGoogleSheets,
  ExportResult,
} from '../services/googleSheets';

export const GoogleSheetsExportModal: React.FC = () => {
  const {
    isGoogleSheetsModalOpen,
    setIsGoogleSheetsModalOpen,
    googleUser,
    handleGoogleSignIn,
    handleGoogleSignOut,
    isGoogleConnecting,
    orders,
    settlements,
    products,
    addToast,
  } = useApp();

  const [exportType, setExportType] = useState<'orders' | 'settlements' | 'catalog'>('orders');
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState<ExportResult | null>(null);

  if (!isGoogleSheetsModalOpen) return null;

  const handleRunExport = async () => {
    if (!googleUser) {
      addToast('Please connect your Google account first.', 'error');
      return;
    }

    setIsExporting(true);
    setLastExport(null);

    try {
      let result: ExportResult;
      if (exportType === 'orders') {
        result = await exportOrdersToGoogleSheets(orders, googleUser.email || 'Admin');
      } else if (exportType === 'settlements') {
        result = await exportSettlementsToGoogleSheets(settlements, googleUser.email || 'Admin');
      } else {
        result = await exportCatalogToGoogleSheets(products, googleUser.email || 'Admin');
      }

      setLastExport(result);
      addToast(`Successfully created Google Sheet with ${result.rowCount} rows!`, 'success');
    } catch (err: any) {
      console.error(err);
      addToast(err?.message || 'Failed to export to Google Sheets', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-lg">
                Google Sheets Integration
              </h3>
              <p className="text-xs text-stone-500">
                Official Google Workspace Live Reporting & Audit Sync
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsGoogleSheetsModalOpen(false)}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth State Card */}
        <div className="my-5 p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
          {googleUser ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={googleUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                  alt=""
                  className="w-9 h-9 rounded-full border border-stone-200"
                />
                <div>
                  <p className="font-bold text-stone-900">{googleUser.displayName || 'Authorized User'}</p>
                  <p className="text-stone-500 text-[11px]">{googleUser.email}</p>
                </div>
              </div>
              <button
                onClick={handleGoogleSignOut}
                className="text-stone-500 hover:text-rose-600 font-semibold text-[11px] cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-center sm:text-left">
              <p className="text-stone-600">
                Connect your Google account with permission to create and update live spreadsheets for marketplace orders, wholesaler payouts, and inventory reports.
              </p>

              {/* Official Google Sign-In Styled Button as per Workspace Skill */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isGoogleConnecting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-5 py-2.5 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs rounded-xl border border-stone-300 shadow-xs cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isGoogleConnecting ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Export Selection */}
        <div className="space-y-4 text-xs">
          <label className="font-bold text-stone-800 uppercase tracking-wider block">
            Select Report to Generate:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setExportType('orders')}
              className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                exportType === 'orders'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <ShoppingBag className="w-5 h-5 text-emerald-600 mb-2" />
              <div>
                <p className="font-bold text-stone-900">Orders Ledger</p>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  Multi-wholesaler items, customer addresses & AWBs
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setExportType('settlements')}
              className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                exportType === 'settlements'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <Building2 className="w-5 h-5 text-amber-600 mb-2" />
              <div>
                <p className="font-bold text-stone-900">Wholesaler Payouts</p>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  10% commission, GST & bank UTR references
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setExportType('catalog')}
              className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                exportType === 'catalog'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <Package className="w-5 h-5 text-indigo-600 mb-2" />
              <div>
                <p className="font-bold text-stone-900">Clothing Catalog</p>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  Garments, fabrics, wholesale costs & stock
                </p>
              </div>
            </button>
          </div>

          {/* Export Action */}
          <button
            onClick={handleRunExport}
            disabled={!googleUser || isExporting}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {isExporting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Spreadsheet & Writing Rows...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4" />
                Generate Live Spreadsheet in Google Sheets
              </span>
            )}
          </button>

          {/* Result Banner with direct link */}
          {lastExport && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Spreadsheet Created Successfully!
              </div>
              <p className="text-[11px] text-emerald-700">
                Populated <strong>{lastExport.rowCount} rows</strong> of data with frozen headers in your Google Drive.
              </p>
              <a
                href={lastExport.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs mt-1"
              >
                <span>Open in Google Sheets</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
