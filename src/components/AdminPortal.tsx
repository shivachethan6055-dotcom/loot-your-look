import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Package,
  ShoppingBag,
  IndianRupee,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Search,
  ExternalLink,
  Lock,
  Layers,
  Sparkles,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  updateWholesalerStatus,
  updateProductStatus,
  getGoogleSheetsLogs,
} from '../services/storage';
import {
  validateClothingProduct,
  PROHIBITED_CATEGORIES,
  PROHIBITED_KEYWORDS,
} from '../services/clothingValidation';

export const AdminPortal: React.FC = () => {
  const {
    wholesalers,
    products,
    orders,
    settlements,
    setIsGoogleSheetsModalOpen,
    googleUser,
    addToast,
  } = useApp();

  const [adminTab, setAdminTab] = useState<'kpis' | 'wholesalers' | 'catalog' | 'orders' | 'compliance_tester' | 'sheets'>('kpis');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedWholesalerToReject, setSelectedWholesalerToReject] = useState<string | null>(null);

  // Compliance Policy Tester State
  const [testTitle, setTestTitle] = useState('Sports Running Shoes Lightweight Breathable');
  const [testCategory, setTestCategory] = useState('Shoes & Footwear');
  const [testFabric, setTestFabric] = useState('Mesh & Rubber');
  const [testResult, setTestResult] = useState<any>(null);

  // Financial calculations
  const totalGMV = orders.reduce((acc, o) => acc + (o.paymentStatus === 'PAID' ? o.totalAmount : 0), 0);
  const totalMarketplaceCommission = orders.reduce((acc, o) => {
    if (o.paymentStatus !== 'PAID') return acc;
    return acc + o.sellerOrders.reduce((soAcc, so) => soAcc + so.commissionAmount, 0);
  }, 0);

  const pendingWholesalers = wholesalers.filter((w) => w.status === 'PENDING');
  const approvedWholesalers = wholesalers.filter((w) => w.status === 'APPROVED');
  const pendingProducts = products.filter((p) => p.status === 'PENDING_APPROVAL');

  const sheetsLogs = getGoogleSheetsLogs();

  const handleApproveWholesaler = (id: string, name: string) => {
    updateWholesalerStatus(id, 'APPROVED');
    addToast(`Approved wholesaler: ${name}. They can now list clothing.`, 'success');
  };

  const handleRejectWholesaler = (id: string) => {
    if (!rejectReason) {
      addToast('Please provide a reason for rejecting the application.', 'error');
      return;
    }
    updateWholesalerStatus(id, 'REJECTED', rejectReason);
    addToast(`Wholesaler application rejected.`, 'info');
    setSelectedWholesalerToReject(null);
    setRejectReason('');
  };

  const handleSuspendWholesaler = (id: string, name: string) => {
    updateWholesalerStatus(id, 'SUSPENDED', 'Policy breach under review');
    addToast(`Suspended ${name}. Products temporarily hidden.`, 'info');
  };

  const runComplianceTest = () => {
    const res = validateClothingProduct({
      title: testTitle,
      description: testTitle,
      category: testCategory,
      fabric: testFabric,
    });
    setTestResult(res);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Header */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Admin Portal
            </span>
            <span className="text-xs font-bold text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-md border border-rose-800">
              Clothing-Only Governance Active
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Marketplace Management & Compliance
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-xl">
            Live monitoring of Indian clothing wholesalers, order split fulfillments, marketplace commission ledger, and Google Sheets sync.
          </p>
        </div>

        {/* Google Sheets Trigger */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setIsGoogleSheetsModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Google Sheets Sync</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-8 overflow-x-auto text-xs font-bold gap-2">
        <button
          onClick={() => setAdminTab('kpis')}
          className={`pb-3 px-4 transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
            adminTab === 'kpis' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Overview & Revenue
        </button>

        <button
          onClick={() => setAdminTab('wholesalers')}
          className={`pb-3 px-4 transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
            adminTab === 'wholesalers' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Wholesaler Approvals ({wholesalers.length})
          {pendingWholesalers.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center">
              {pendingWholesalers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('catalog')}
          className={`pb-3 px-4 transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
            adminTab === 'catalog' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Package className="w-4 h-4" />
          Clothing Catalog ({products.length})
        </button>

        <button
          onClick={() => setAdminTab('orders')}
          className={`pb-3 px-4 transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
            adminTab === 'orders' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Orders Supervision ({orders.length})
        </button>

        <button
          onClick={() => setAdminTab('compliance_tester')}
          className={`pb-3 px-4 transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
            adminTab === 'compliance_tester' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          Clothing-Only Audit Engine
        </button>

        <button
          onClick={() => setAdminTab('sheets')}
          className={`pb-3 px-4 transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
            adminTab === 'sheets' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          Google Sheets Logs
        </button>
      </div>

      {/* Tab 1: KPIs & Financials */}
      {adminTab === 'kpis' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Marketplace GMV
              </span>
              <p className="text-2xl font-black text-stone-900">
                ₹{totalGMV.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> Live Customer Orders
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Platform Commission (10%)
              </span>
              <p className="text-2xl font-black text-emerald-700">
                ₹{totalMarketplaceCommission.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-stone-500">Retained revenue</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Approved Wholesalers
              </span>
              <p className="text-2xl font-black text-stone-900">
                {approvedWholesalers.length} / {wholesalers.length}
              </p>
              <span className="text-[10px] text-amber-700 font-semibold">
                {pendingWholesalers.length} pending verification
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Verified Clothing Garments
              </span>
              <p className="text-2xl font-black text-stone-900">{products.length}</p>
              <span className="text-[10px] text-rose-600 font-bold">100% Non-Clothing Barred</span>
            </div>
          </div>

          {/* Hub Performance Breakdown */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
            <h3 className="font-extrabold text-stone-900 text-base mb-4 flex items-center justify-between">
              <span>Textile Manufacturing Hubs Active in India</span>
              <span className="text-xs font-normal text-stone-500">
                Surat • Tirupur • Jaipur • Ludhiana • Mumbai
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="font-bold text-stone-900 block text-sm">Surat Hub (Gujarat)</span>
                <span className="text-[11px] text-stone-500">Sarees, Silk, Ethnic Brocade</span>
                <p className="font-extrabold text-rose-600 text-base mt-2">₹1,84,500 Sales</p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="font-bold text-stone-900 block text-sm">Tirupur Hub (Tamil Nadu)</span>
                <span className="text-[11px] text-stone-500">Combed Cotton Knitwear & T-Shirts</span>
                <p className="font-extrabold text-rose-600 text-base mt-2">₹2,15,400 Sales</p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="font-bold text-stone-900 block text-sm">Jaipur Hub (Rajasthan)</span>
                <span className="text-[11px] text-stone-500">Handblock Kurtas, Mulmul & Linen</span>
                <p className="font-extrabold text-rose-600 text-base mt-2">₹1,42,000 Sales</p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="font-bold text-stone-900 block text-sm">Ludhiana Hub (Punjab)</span>
                <span className="text-[11px] text-stone-500">Cashmere, Woolens & Jackets</span>
                <p className="font-extrabold text-rose-600 text-base mt-2">₹98,000 Sales</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Wholesaler Approvals */}
      {adminTab === 'wholesalers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-stone-900 text-lg">Wholesaler Network Governance</h2>
              <p className="text-xs text-stone-500">
                Review applicant GSTIN, bank details, and business premises before granting seller privileges.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-700 uppercase font-bold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Business / Hub</th>
                    <th className="py-3 px-4">Contact Person</th>
                    <th className="py-3 px-4">City / State</th>
                    <th className="py-3 px-4">GSTIN</th>
                    <th className="py-3 px-4">Bank Details</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {wholesalers.map((w) => (
                    <tr key={w.id} className="hover:bg-stone-50/50">
                      <td className="py-3 px-4">
                        <p className="font-bold text-stone-900">{w.businessName}</p>
                        <span className="text-[10px] text-stone-400 font-mono">ID: {w.id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-stone-800">{w.contactPerson}</p>
                        <p className="text-[11px] text-stone-400">{w.phone}</p>
                      </td>
                      <td className="py-3 px-4 font-semibold text-stone-800">
                        {w.city}, {w.state}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-stone-800">
                        {w.gstin}
                      </td>
                      <td className="py-3 px-4 text-stone-500 text-[11px]">
                        <p>{w.bankDetails.bankName}</p>
                        <p className="font-mono">{w.bankDetails.ifscCode}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            w.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : w.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {w.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveWholesaler(w.id, w.businessName)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setSelectedWholesalerToReject(w.id)}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {w.status === 'APPROVED' && (
                          <button
                            onClick={() => handleSuspendWholesaler(w.id, w.businessName)}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-bold text-[11px] cursor-pointer"
                          >
                            Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Catalog Audit */}
      {adminTab === 'catalog' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-stone-900 text-lg">Marketplace Catalog Supervision</h2>
              <p className="text-xs text-stone-500">
                Auditing 100% clothing conformance across all approved wholesaler products.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-700 uppercase font-bold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Garment Title</th>
                    <th className="py-3 px-4">Wholesaler Hub</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Fabric</th>
                    <th className="py-3 px-4">Retail (₹)</th>
                    <th className="py-3 px-4">Clothing Verified</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/50">
                      <td className="py-3 px-4 flex items-center gap-2.5">
                        <img
                          src={p.images[0]}
                          alt=""
                          className="w-10 h-12 rounded-lg object-cover border border-stone-200"
                        />
                        <span className="font-bold text-stone-900 max-w-xs truncate">{p.title}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-stone-800">
                        {p.wholesalerBusinessName} ({p.wholesalerCity})
                      </td>
                      <td className="py-3 px-4">{p.category}</td>
                      <td className="py-3 px-4 text-stone-600">{p.fabric}</td>
                      <td className="py-3 px-4 font-black text-stone-900">
                        ₹{p.retailPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> PASS
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-800">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Order Supervision */}
      {adminTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="font-extrabold text-stone-900 text-lg">Parent Orders & Sub-Fulfillments</h2>

          <div className="space-y-4">
            {orders.map((o) => (
              <div
                key={o.id}
                className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs text-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-stone-900 text-sm">
                      {o.orderNumber}
                    </span>
                    <span className="text-stone-500 font-semibold">{o.customerName}</span>
                    <span className="text-stone-400">({o.customerPhone})</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-black text-stone-900 text-sm">
                      ₹{o.totalAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      {o.paymentStatus}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-800">
                      {o.orderStatus}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {o.sellerOrders.map((so) => (
                    <div key={so.id} className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-stone-900">{so.wholesalerName}</span>
                        <span className="font-bold text-emerald-700">
                          Payout: ₹{so.wholesalerPayable.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        {so.items.map((i) => `${i.productTitle} (${i.variantSize} x ${i.quantity})`).join(', ')}
                      </p>
                      <div className="mt-2 text-[10px] text-stone-400 flex justify-between">
                        <span>Courier: {so.courierPartner || 'Pending'}</span>
                        <span>AWB: {so.trackingNumber || 'Pending'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Clothing-Only Audit Tester */}
      {adminTab === 'compliance_tester' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 max-w-2xl mx-auto shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Clothing-Only Policy Verification Engine
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Test how the backend validation blocks prohibited products (shoes, bags, watches, electronics, cosmetics, jewelry).
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Candidate Product Title to Test:
              </label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="e.g. Running Shoes / Leather Handbag / Smart Watch"
                className="w-full p-2.5 rounded-xl border border-stone-200 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Category:</label>
                <select
                  value={testCategory}
                  onChange={(e) => setTestCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-white font-medium"
                >
                  <optgroup label="Prohibited Categories">
                    {PROHIBITED_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        🚫 {c}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Allowed Clothing Categories">
                    <option value="Shirts">Shirts</option>
                    <option value="Sarees">Sarees</option>
                    <option value="Kurtas & Kurtis">Kurtas & Kurtis</option>
                    <option value="T-Shirts">T-Shirts</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Fabric / Material:</label>
                <input
                  type="text"
                  value={testFabric}
                  onChange={(e) => setTestFabric(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 font-medium"
                />
              </div>
            </div>

            <button
              onClick={runComplianceTest}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl cursor-pointer"
            >
              Run Audit Engine Analysis
            </button>

            {testResult && (
              <div
                className={`p-4 rounded-2xl border-2 text-xs space-y-2 ${
                  testResult.isValid
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                    : 'bg-rose-50 border-rose-400 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {testResult.isValid ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ACCEPTED: 100% Compliant Clothing Garment
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-600" />
                      REJECTED: Strict Business Rule Violation
                    </>
                  )}
                </div>

                {!testResult.isValid && (
                  <div className="space-y-1 pl-7">
                    {testResult.errors.map((err: string, i: number) => (
                      <p key={i}>• {err}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Google Sheets Logs */}
      {adminTab === 'sheets' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-stone-900 text-lg">Google Sheets Sync Logs</h2>
              <p className="text-xs text-stone-500">
                Audited exports generated with Google Workspace OAuth integration.
              </p>
            </div>
            <button
              onClick={() => setIsGoogleSheetsModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              New Export
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            {sheetsLogs.length === 0 ? (
              <div className="p-12 text-center text-xs text-stone-500">
                No exports logged yet. Click "Google Sheets Sync" to generate live spreadsheets.
              </div>
            ) : (
              <div className="divide-y divide-stone-100 text-xs">
                {sheetsLogs.map((log, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-stone-50/50">
                    <div>
                      <p className="font-bold text-stone-900 flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        {log.title}
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {log.rowCount} rows • Synced on{' '}
                        {new Date(log.syncedAt).toLocaleString('en-IN')} by {log.exportedBy}
                      </p>
                    </div>

                    <a
                      href={log.sheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-lg flex items-center gap-1.5"
                    >
                      <span>Open Sheet</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {selectedWholesalerToReject && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs">
            <h3 className="font-extrabold text-stone-900 text-base">Reject Wholesaler Application</h3>
            <p className="text-stone-500">
              Provide feedback for the rejection (e.g. Invalid GSTIN or non-clothing business).
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={3}
              className="w-full p-2.5 rounded-xl border border-stone-200"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedWholesalerToReject(null)}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectWholesaler(selectedWholesalerToReject)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
