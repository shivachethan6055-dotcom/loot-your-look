import React from 'react';
import {
  CheckCircle2,
  Package,
  Building2,
  Calendar,
  MapPin,
  ArrowRight,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OrderSuccessModal: React.FC = () => {
  const {
    lastPlacedOrder,
    setLastPlacedOrder,
    setPortal,
    setIsGoogleSheetsModalOpen,
  } = useApp();

  if (!lastPlacedOrder) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden my-4 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          Order Confirmed & Allocated
        </span>

        <h2 className="text-2xl font-black text-stone-900 mt-2">
          Thank You, {lastPlacedOrder.customerName}!
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Your order{' '}
          <strong className="text-stone-900 font-mono text-sm">{lastPlacedOrder.orderNumber}</strong> has been received by our approved wholesalers.
        </p>

        {/* Order Details Card */}
        <div className="my-6 bg-stone-50 rounded-2xl p-4 text-left border border-stone-200 space-y-3 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-stone-200">
            <span className="text-stone-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              Placed On
            </span>
            <span className="font-bold text-stone-900">
              {new Date(lastPlacedOrder.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-stone-200">
            <span className="text-stone-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              Delivery Location
            </span>
            <span className="font-bold text-stone-900 text-right">
              {lastPlacedOrder.shippingAddress.city}, {lastPlacedOrder.shippingAddress.state} ({lastPlacedOrder.shippingAddress.pincode})
            </span>
          </div>

          <div>
            <span className="text-stone-500 font-semibold block mb-1.5">
              Assigned Wholesaler Dispatches ({lastPlacedOrder.sellerOrders.length}):
            </span>
            <div className="space-y-1.5">
              {lastPlacedOrder.sellerOrders.map((so) => (
                <div key={so.id} className="bg-white p-2.5 rounded-xl border border-stone-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <div>
                      <p className="font-bold text-stone-800 text-[11px]">{so.wholesalerName}</p>
                      <p className="text-[10px] text-stone-400">
                        {so.items.length} garment(s) • Status: <span className="text-emerald-700 font-semibold">{so.fulfillmentStatus}</span>
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-stone-900 text-[11px]">
                    ₹{so.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-1 text-sm font-black text-stone-900">
            <span>Total Paid</span>
            <span className="text-rose-600">₹{lastPlacedOrder.totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => {
              setLastPlacedOrder(null);
              setPortal('customer');
            }}
            className="flex-1 py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>View in My Orders</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setIsGoogleSheetsModalOpen(true);
            }}
            className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-300 flex items-center justify-center gap-1.5 cursor-pointer"
            title="Export this order to Google Sheets"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export to Google Sheets</span>
          </button>
        </div>
      </div>
    </div>
  );
};
