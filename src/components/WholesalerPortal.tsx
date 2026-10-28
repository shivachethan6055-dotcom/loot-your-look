import React, { useState } from 'react';
import {
  Building2,
  Package,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Truck,
  IndianRupee,
  FileSpreadsheet,
  ShieldCheck,
  MapPin,
  ExternalLink,
  X,
  Search,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  ClothingProduct,
  ProductVariant,
  ClothingDepartment,
  ClothingCategory,
} from '../types';
import {
  saveProduct,
  updateSellerOrderStatus,
  saveWholesaler,
} from '../services/storage';
import {
  validateClothingProduct,
  ALLOWED_CLOTHING_CATEGORIES,
} from '../services/clothingValidation';

export const WholesalerPortal: React.FC = () => {
  const {
    wholesalers,
    activeWholesalerId,
    setActiveWholesalerId,
    activeWholesaler,
    products,
    orders,
    settlements,
    setIsGoogleSheetsModalOpen,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'settlements' | 'register'>('overview');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [fulfillmentModal, setFulfillmentModal] = useState<{
    parentOrderId: string;
    wholesalerId: string;
    currentStatus: string;
  } | null>(null);
  const [courierPartner, setCourierPartner] = useState('Delhivery Surface');
  const [trackingNumber, setTrackingNumber] = useState('');

  // New Product Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDepartment, setNewDepartment] = useState<ClothingDepartment>('Men');
  const [newCategory, setNewCategory] = useState<ClothingCategory>('Shirts');
  const [newFabric, setNewFabric] = useState('100% Combed Cotton');
  const [newCare, setNewCare] = useState('Machine wash cold, tumble dry low');
  const [newRetailPrice, setNewRetailPrice] = useState('899');
  const [newMrp, setNewMrp] = useState('1999');
  const [newWholesaleCost, setNewWholesaleCost] = useState('450');
  const [newImageUrl, setNewImageUrl] = useState(
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80'
  );
  const [formValidationErrors, setFormValidationErrors] = useState<string[]>([]);

  // Wholesaler Registration Form State
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regContactPerson, setRegContactPerson] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regCity, setRegCity] = useState('Surat');
  const [regState, setRegState] = useState('Gujarat');
  const [regPincode, setRegPincode] = useState('395002');
  const [regGstin, setRegGstin] = useState('24AABCS9912K1Z9');
  const [regAccount, setRegAccount] = useState('50200088192314');
  const [regIfsc, setRegIfsc] = useState('HDFC0001024');

  if (!activeWholesaler) return null;

  // Filter items belonging to this specific wholesaler
  const myProducts = products.filter((p) => p.wholesalerId === activeWholesaler.id);
  const mySellerOrders = orders.flatMap((o) =>
    o.sellerOrders
      .filter((so) => so.wholesalerId === activeWholesaler.id)
      .map((so) => ({ ...so, orderNumber: o.orderNumber, createdAt: o.createdAt, shippingAddress: o.shippingAddress }))
  );
  const mySettlements = settlements.filter((s) => s.wholesalerId === activeWholesaler.id);

  // Compute metrics
  const totalStockUnits = myProducts.reduce(
    (acc, p) => acc + p.variants.reduce((vAcc, v) => vAcc + v.stock, 0),
    0
  );
  const totalGrossSales = mySellerOrders.reduce((acc, so) => acc + so.subtotal, 0);
  const totalCommissionPaid = mySellerOrders.reduce((acc, so) => acc + so.commissionAmount, 0);
  const pendingFulfillments = mySellerOrders.filter(
    (so) => so.fulfillmentStatus === 'CONFIRMED' || so.fulfillmentStatus === 'PROCESSING'
  ).length;

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidationErrors([]);

    // 1. STRICT CLOTHING-ONLY VALIDATION
    const validation = validateClothingProduct({
      title: newTitle,
      description: newDescription,
      category: newCategory,
      fabric: newFabric,
    });

    if (!validation.isValid) {
      setFormValidationErrors(validation.errors);
      addToast('Product submission rejected! Non-clothing or prohibited content detected.', 'error');
      return;
    }

    const price = parseFloat(newRetailPrice);
    const mrp = parseFloat(newMrp);
    const cost = parseFloat(newWholesaleCost);

    if (isNaN(price) || isNaN(mrp) || isNaN(cost) || price <= 0) {
      setFormValidationErrors(['Please enter valid numerical prices']);
      return;
    }

    const defaultVariants: ProductVariant[] = [
      { id: 'v_' + Date.now() + '_m', size: 'M', color: 'Standard Color', stock: 25, sku: `SKU-${Date.now()}-M` },
      { id: 'v_' + Date.now() + '_l', size: 'L', color: 'Standard Color', stock: 35, sku: `SKU-${Date.now()}-L` },
      { id: 'v_' + Date.now() + '_xl', size: 'XL', color: 'Standard Color', stock: 15, sku: `SKU-${Date.now()}-XL` },
    ];

    const newProd: ClothingProduct = {
      id: 'cl_' + Date.now(),
      wholesalerId: activeWholesaler.id,
      wholesalerBusinessName: activeWholesaler.businessName,
      wholesalerCity: activeWholesaler.city,
      title: newTitle,
      description: newDescription,
      department: newDepartment,
      category: newCategory,
      fabric: newFabric,
      careInstructions: newCare,
      images: [newImageUrl],
      retailPrice: price,
      mrp: mrp,
      wholesaleCost: cost,
      variants: defaultVariants,
      status: 'APPROVED', // Wholesalers submitting valid clothing get catalog placement
      featured: false,
      trending: true,
      isNewArrival: true,
      rating: 5.0,
      reviewCount: 1,
      createdAt: new Date().toISOString(),
    };

    saveProduct(newProd);
    setIsAddProductOpen(false);
    addToast(`Clothing listing "${newTitle}" created and verified!`, 'success');

    // Reset Form
    setNewTitle('');
    setNewDescription('');
    setFormValidationErrors([]);
  };

  const handleUpdateFulfillment = (newStatus: any) => {
    if (!fulfillmentModal) return;
    updateSellerOrderStatus(
      fulfillmentModal.parentOrderId,
      fulfillmentModal.wholesalerId,
      newStatus,
      courierPartner,
      trackingNumber || 'AWB-' + Math.floor(10000000 + Math.random() * 90000000)
    );
    addToast(`Package updated to ${newStatus}`, 'success');
    setFulfillmentModal(null);
    setTrackingNumber('');
  };

  const handleRegisterNewWholesaler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regBusinessName || !regContactPerson || !regGstin) {
      addToast('Please fill all required wholesaler details', 'error');
      return;
    }

    const newWs = {
      id: 'ws_' + Date.now(),
      userId: 'u_ws_' + Date.now(),
      businessName: regBusinessName,
      contactPerson: regContactPerson,
      email: regEmail,
      phone: regPhone,
      businessAddress: regAddress,
      city: regCity,
      state: regState,
      pincode: regPincode,
      gstin: regGstin.toUpperCase(),
      status: 'PENDING' as const,
      bankDetails: {
        accountHolderName: regBusinessName,
        accountNumber: regAccount,
        ifscCode: regIfsc,
        bankName: 'HDFC Bank',
      },
      commissionRate: 10,
      totalSales: 0,
      totalOrders: 0,
      createdAt: new Date().toISOString(),
    };

    saveWholesaler(newWs);
    setActiveWholesalerId(newWs.id);
    setActiveTab('overview');
    addToast('Wholesaler application submitted! Awaiting Admin review & GSTIN verification.', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Wholesaler Header & Switcher */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Wholesaler Portal
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                activeWholesaler.status === 'APPROVED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              Status: {activeWholesaler.status}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
            {activeWholesaler.businessName}
          </h1>
          <p className="text-xs text-stone-500 mt-1 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            {activeWholesaler.city}, {activeWholesaler.state} • GSTIN: <strong className="text-stone-800 font-mono">{activeWholesaler.gstin}</strong>
          </p>
        </div>

        {/* Quick Wholesaler Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="text-xs">
            <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
              Switch Wholesaler Account:
            </label>
            <select
              value={activeWholesalerId}
              onChange={(e) => setActiveWholesalerId(e.target.value)}
              className="w-full sm:w-64 p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
            >
              {wholesalers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.businessName} ({w.city} - {w.status})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setActiveTab('register')}
            className="px-3.5 py-2 mt-4 sm:mt-0 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors cursor-pointer self-end"
          >
            + Register New Hub
          </button>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex border-b border-stone-200 mb-8 overflow-x-auto text-xs font-bold gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Hub Overview & KPIs
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-4 transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
            activeTab === 'products'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Package className="w-4 h-4" />
          Clothing Catalog ({myProducts.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Truck className="w-4 h-4" />
          Dispatches & Fulfillment ({mySellerOrders.length})
          {pendingFulfillments > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center">
              {pendingFulfillments}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settlements')}
          className={`pb-3 px-4 transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
            activeTab === 'settlements'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <IndianRupee className="w-4 h-4" />
          Payouts & Settlements
        </button>
      </div>

      {/* Tab 1: Overview KPIs */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Total Garment Listings
              </span>
              <p className="text-2xl font-black text-stone-900">{myProducts.length}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">
                100% Verified Clothing Only
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Active Inventory Units
              </span>
              <p className="text-2xl font-black text-stone-900">{totalStockUnits}</p>
              <span className="text-[10px] text-stone-500 font-medium">Across all sizes & colors</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Pending Dispatches
              </span>
              <p className="text-2xl font-black text-amber-600">{pendingFulfillments}</p>
              <span className="text-[10px] text-amber-700 font-medium">Requires courier packing</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Gross Sales Value
              </span>
              <p className="text-2xl font-black text-stone-900">
                ₹{totalGrossSales.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-stone-500 font-medium">
                10% Marketplace Commission Deducted
              </span>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Wholesaler Hub Operations
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold mt-1">
                Ready to expand your apparel catalog?
              </h2>
              <p className="text-xs text-stone-300 mt-1 max-w-xl">
                Add new men's, women's, or kids' clothing. Our automated engine enforces strict clothing compliance to safeguard marketplace trust.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="px-5 py-3 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Add Clothing Listing
              </button>

              <button
                onClick={() => setIsGoogleSheetsModalOpen(true)}
                className="px-4 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl border border-stone-700 flex items-center gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Export Hub Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Products Catalog Management */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-extrabold text-stone-900 text-lg">
                Clothing Listings for {activeWholesaler.businessName}
              </h2>
              <p className="text-xs text-stone-500">
                Rule: Clothing only (Shirts, Sarees, Kurtas, T-Shirts, Dresses, Jeans, etc.)
              </p>
            </div>

            <button
              onClick={() => setIsAddProductOpen(true)}
              className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer self-start"
            >
              <PlusCircle className="w-4 h-4" />
              Add Garment Listing
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-700 uppercase font-bold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Garment</th>
                    <th className="py-3 px-4">Dept / Category</th>
                    <th className="py-3 px-4">Fabric</th>
                    <th className="py-3 px-4">Retail Price</th>
                    <th className="py-3 px-4">Wholesale Cost</th>
                    <th className="py-3 px-4">Stock Units</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {myProducts.map((p) => {
                    const totalUnits = p.variants.reduce((acc, v) => acc + v.stock, 0);
                    return (
                      <tr key={p.id} className="hover:bg-stone-50/50">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={p.images[0]}
                            alt=""
                            className="w-10 h-12 rounded-lg object-cover border border-stone-200"
                          />
                          <div>
                            <p className="font-bold text-stone-900 max-w-xs truncate">{p.title}</p>
                            <span className="text-[10px] text-stone-400">ID: {p.id}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-stone-800">
                          {p.department} • {p.category}
                        </td>
                        <td className="py-3 px-4 text-stone-600">{p.fabric}</td>
                        <td className="py-3 px-4 font-black text-stone-900">
                          ₹{p.retailPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-stone-500 font-mono">
                          ₹{p.wholesaleCost.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 font-bold text-stone-800">
                          {totalUnits} units
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Order Fulfillment */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-stone-900 text-lg">
              Assigned Dispatches for {activeWholesaler.businessName}
            </h2>
            <span className="text-xs text-stone-500">
              Only order items assigned to this wholesaler are displayed
            </span>
          </div>

          {mySellerOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-xs text-stone-500">
              No orders assigned to this wholesaler yet.
            </div>
          ) : (
            mySellerOrders.map((so) => (
              <div
                key={so.id}
                className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200 text-xs">
                  <div>
                    <span className="text-stone-400 font-semibold block text-[10px]">
                      PARENT ORDER
                    </span>
                    <span className="font-mono font-extrabold text-stone-900 text-sm">
                      {so.orderNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-400 font-semibold block text-[10px]">
                      DESTINATION
                    </span>
                    <span className="font-bold text-stone-800">
                      {so.shippingAddress.city}, {so.shippingAddress.state} ({so.shippingAddress.pincode})
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-400 font-semibold block text-[10px]">
                      NET PAYABLE
                    </span>
                    <span className="font-black text-emerald-700 text-sm">
                      ₹{so.wholesalerPayable.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {so.fulfillmentStatus}
                    </span>
                    <button
                      onClick={() =>
                        setFulfillmentModal({
                          parentOrderId: so.parentOrderId,
                          wholesalerId: activeWholesaler.id,
                          currentStatus: so.fulfillmentStatus,
                        })
                      }
                      className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Update Shipping AWB
                    </button>
                  </div>
                </div>

                {/* Items in this sub-order */}
                <div className="space-y-3">
                  {so.items.map((item) => (
                    <div key={item.itemId} className="flex items-center gap-4 text-xs">
                      <img
                        src={item.productImage}
                        alt=""
                        className="w-12 h-14 rounded-lg object-cover border border-stone-200"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-stone-900">{item.productTitle}</p>
                        <p className="text-stone-500 text-[11px]">
                          Size: <strong>{item.variantSize}</strong> | Color: {item.variantColor} | Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="font-bold text-stone-900">
                        ₹{item.totalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Settlements & Payouts */}
      {activeTab === 'settlements' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-extrabold text-stone-900 text-lg">Wholesaler Settlement Ledger</h2>
              <p className="text-xs text-stone-500">
                Fortnightly payouts direct to {activeWholesaler.bankDetails.bankName}
              </p>
            </div>

            <button
              onClick={() => setIsGoogleSheetsModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer self-start"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export Settlements to Google Sheets
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-700 uppercase font-bold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Settlement Cycle</th>
                    <th className="py-3 px-4">Gross Sales</th>
                    <th className="py-3 px-4">10% Platform Commission</th>
                    <th className="py-3 px-4">TCS / Tax (0.5%)</th>
                    <th className="py-3 px-4">Net Payout (₹)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">UTR Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {mySettlements.map((s) => (
                    <tr key={s.id} className="hover:bg-stone-50/50">
                      <td className="py-3 px-4 font-bold text-stone-900">{s.period}</td>
                      <td className="py-3 px-4">₹{s.grossSales.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-stone-500">
                        ₹{s.commissionDeducted.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-stone-500">₹{s.taxDeducted}</td>
                      <td className="py-3 px-4 font-black text-emerald-700">
                        ₹{s.netPayout.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === 'SETTLED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-stone-500 text-[11px]">
                        {s.payoutReference || 'Pending Cycle Close'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Register New Hub */}
      {activeTab === 'register' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 max-w-2xl mx-auto shadow-xs">
          <h2 className="text-xl font-extrabold text-stone-900 mb-2">
            Register New Indian Clothing Wholesaler Hub
          </h2>
          <p className="text-xs text-stone-500 mb-6">
            Subject to business document verification & GSTIN validation by marketplace compliance.
          </p>

          <form onSubmit={handleRegisterNewWholesaler} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Business / Mill Name *</label>
              <input
                type="text"
                required
                value={regBusinessName}
                onChange={(e) => setRegBusinessName(e.target.value)}
                placeholder="e.g. Surat Weaves Private Limited"
                className="w-full p-2.5 rounded-xl border border-stone-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Contact Person *</label>
                <input
                  type="text"
                  required
                  value={regContactPerson}
                  onChange={(e) => setRegContactPerson(e.target.value)}
                  placeholder="Manager / Owner Name"
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">GSTIN (15 Digits) *</label>
                <input
                  type="text"
                  required
                  value={regGstin}
                  onChange={(e) => setRegGstin(e.target.value)}
                  placeholder="24AABCS1429B1Z8"
                  className="w-full p-2.5 rounded-xl border border-stone-200 font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="sales@mill.in"
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 98250 12345"
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Business Address *</label>
              <textarea
                required
                value={regAddress}
                onChange={(e) => setRegAddress(e.target.value)}
                rows={2}
                placeholder="Industrial Area, Textile Market"
                className="w-full p-2.5 rounded-xl border border-stone-200"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={regCity}
                  onChange={(e) => setRegCity(e.target.value)}
                  placeholder="Surat / Tirupur"
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={regState}
                  onChange={(e) => setRegState(e.target.value)}
                  placeholder="Gujarat"
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">PIN Code *</label>
                <input
                  type="text"
                  required
                  value={regPincode}
                  onChange={(e) => setRegPincode(e.target.value)}
                  placeholder="395002"
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-600">
              <p className="font-bold text-stone-800 mb-1">Strict Business Rule Confirmation:</p>
              <p className="text-[11px]">
                By registering, you confirm that you will list <strong>ONLY CLOTHING & APPAREL</strong>. Footwear, bags, jewellery, cosmetics, and electronics will be automatically blocked by our compliance audit.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Submit Wholesaler Application for Approval
            </button>
          </form>
        </div>
      )}

      {/* Add Clothing Listing Modal with Strict Validation */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="font-extrabold text-stone-900 text-lg">
                  Add Clothing Listing
                </h3>
                <p className="text-xs text-rose-600 font-bold">
                  * Strict Rule: Only clothing & garments permitted.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddProductOpen(false);
                  setFormValidationErrors([]);
                }}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Validation Errors Box */}
            {formValidationErrors.length > 0 && (
              <div className="mt-4 p-4 bg-rose-50 border-2 border-rose-400 rounded-2xl text-xs text-rose-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-rose-700">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Submission Rejected by Clothing Compliance Audit:
                </div>
                {formValidationErrors.map((err, i) => (
                  <p key={i} className="pl-6 font-medium">• {err}</p>
                ))}
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Garment Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Pure Cotton Slim Fit Printed Casual Shirt"
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:border-rose-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Department *
                  </label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white font-medium"
                  >
                    <option value="Men">Men's Clothing</option>
                    <option value="Women">Women's Clothing</option>
                    <option value="Kids">Kids' Clothing</option>
                    <option value="Unisex">Unisex Clothing</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Clothing Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white font-medium"
                  >
                    {ALLOWED_CLOTHING_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Fabric Composition (Mandatory for Clothing) *
                </label>
                <input
                  type="text"
                  required
                  value={newFabric}
                  onChange={(e) => setNewFabric(e.target.value)}
                  placeholder="e.g. 100% Super Combed Cotton / Chanderi Silk"
                  className="w-full p-2.5 rounded-xl border border-stone-200 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Description & Styling Notes *
                </label>
                <textarea
                  required
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Detailed tailoring, stitching, neckline, sleeve and hemline specifications..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Retail Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newRetailPrice}
                    onChange={(e) => setNewRetailPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    MRP (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newMrp}
                    onChange={(e) => setNewMrp(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Wholesale Cost (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newWholesaleCost}
                    onChange={(e) => setNewWholesaleCost(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Garment Photography URL *
                </label>
                <input
                  type="url"
                  required
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-mono"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-500 text-[11px]">
                By submitting this listing to <strong>Loot Your Look</strong>, you certify this item is strictly clothing. Prohibited items (shoes, jewellery, bags, electronics) are blocked automatically.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer"
                >
                  Run Compliance Check & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fulfillment Shipping Modal */}
      {fulfillmentModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs">
            <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              Update Courier & Dispatch Status
            </h3>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Courier Partner:</label>
              <select
                value={courierPartner}
                onChange={(e) => setCourierPartner(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-white font-semibold"
              >
                <option value="Delhivery Surface Express">Delhivery Surface Express</option>
                <option value="BlueDart Air Express">BlueDart Air Express</option>
                <option value="DTDC Premium">DTDC Premium</option>
                <option value="Xpressbees Logistics">Xpressbees Logistics</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                AWB / Tracking Number:
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. DLHVY-910294829"
                className="w-full p-2.5 rounded-xl border border-stone-200 font-mono text-xs"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => handleUpdateFulfillment('SHIPPED')}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
              >
                Mark as Dispatched / SHIPPED
              </button>
              <button
                onClick={() => handleUpdateFulfillment('DELIVERED')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
              >
                Confirm Doorstep DELIVERED
              </button>
              <button
                onClick={() => setFulfillmentModal(null)}
                className="w-full py-2 text-stone-500 hover:bg-stone-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
